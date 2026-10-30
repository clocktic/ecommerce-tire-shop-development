"""Link evidence by valid GTIN, never by size or model name alone. Does not publish products."""
import argparse
import collections
import datetime
import json
import re
from pathlib import Path
from tire_sources import normalized

OUT = Path('.v0/refs/verified-tires')


def gtin_key(value):
    if not isinstance(value, str) or not re.fullmatch(r'(?:\d{8}|\d{12,14})', value) or not value.strip('0'):
        return None
    digits = [int(c) for c in value]
    check = sum(d * (3 if i % 2 == 0 else 1) for i, d in enumerate(reversed(digits[:-1])))
    if (check + digits[-1]) % 10:
        return None
    return value.zfill(14)


def disagreements(product, record):
    tire = product['tire']
    errors = []
    for us, eu, label in [(product['brand'], record.get('supplierOrTrademark'), 'brand'), (tire.get('model'), record.get('commercialName'), 'model')]:
        if not us or not eu or normalized(us) != normalized(eu):
            errors.append(label)
    for us, eu in [('width', 'tyreSection'), ('aspect', 'aspectRatio'), ('rim', 'rimDiameter'), ('loadIndex', 'loadCapacityIndex'), ('speedRating', 'speedCategorySymbol')]:
        if str(tire.get(us)) != str(record.get(eu)):
            errors.append(us)
    load = record.get('loadCapacityIndicator')
    if load not in ['XL', 'SL', 'RF']:
        errors.append('unknown EU load capacity indicator')
    elif bool(tire.get('extraLoad')) != (load in ['XL', 'RF']):
        errors.append('extraLoad')
    mobility = record.get('unrestrictedMobility')
    if isinstance(mobility, bool) and mobility != tire.get('runFlat'):
        errors.append('runFlat')
    if not re.fullmatch(r'[A-E]', str(record.get('energyClass', ''))) or not re.fullmatch(r'[A-E]', str(record.get('wetGripClass', ''))):
        errors.append('EU efficiency/grip label')
    if record.get('externalRollingNoiseClass') not in ['A', 'B', 'C'] or not isinstance(record.get('externalRollingNoiseValue'), (int, float)) or not 40 <= record['externalRollingNoiseValue'] <= 100:
        errors.append('EU noise label')
    today = datetime.date.today()
    for key, future in [('onMarketStartDate', True), ('onMarketEndDate', False)]:
        value = record.get(key)
        if value:
            try:
                date = datetime.date(*value)
                if (future and date > today) or (not future and date <= today):
                    errors.append(key)
            except (TypeError, ValueError):
                errors.append('invalid ' + key)
    return errors


def match_products(products, registry):
    index = collections.defaultdict(dict)
    for record in registry:
        key = gtin_key(record.get('gtinIdentifier'))
        if key:
            reg = str(record['eprelRegistrationNumber'])
            previous = index[key].get(reg)
            if previous is None or (record.get('versionNumber') or 0) > (previous.get('versionNumber') or 0):
                index[key][reg] = record
            elif record.get('versionNumber') == previous.get('versionNumber') and record != previous:
                index[key][reg] = {**previous, '_conflictingSnapshots': True}
    matches, rejected, unmatched = [], [], []
    for product in products:
        key = gtin_key(product.get('gtin'))
        candidates = list(index.get(key, {}).values()) if key else []
        base = {'productId': product['id'], 'brand': product['brand'], 'model': product['tire']['model'], 'mpn': product['mpn'], 'gtin': product.get('gtin')}
        if not candidates:
            unmatched.append({**base, 'reason': 'No exact valid GTIN in scanned EU records' if key else 'No valid US GTIN'})
            continue
        if len(candidates) > 1:
            rejected.append({**base, 'reason': 'Ambiguous GTIN: multiple EPREL registrations', 'registrations': [r['eprelRegistrationNumber'] for r in candidates]})
            continue
        record = candidates[0]
        if record.get('_conflictingSnapshots'):
            rejected.append({**base, 'reason': 'Conflicting snapshots of the same EPREL version', 'registration': record['eprelRegistrationNumber']})
            continue
        issues = disagreements(product, record)
        if issues:
            rejected.append({**base, 'reason': 'Technical fields disagree or cannot be validated', 'fields': issues, 'registration': record['eprelRegistrationNumber']})
            continue
        pending = ['Additional agreed retailer references', 'EU-specific retail offer, identifiers and photos', 'Direct EPREL record recheck before publication']
        if not isinstance(record.get('unrestrictedMobility'), bool):
            pending.append('EU run-flat status is not specified')
        pending.append('Original-equipment marking comparison')
        matches.append({**base, 'status': 'identifier-and-specifications-match', 'publicationReady': False, 'pending': pending, 'usSources': product['verification']['sources'], 'usTire': product['tire'], 'euRecord': record})
    return {'matches': matches, 'rejected': rejected, 'unmatched': unmatched}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--directory', type=Path, default=OUT)
    args = parser.parse_args()
    us = json.loads((args.directory / 'us-variants.json').read_text())
    eu = json.loads((args.directory / 'eu-registry.json').read_text())
    products = list({p['id']: p for row in us for p in row['products']}.values())
    registry = [r for row in eu for r in row['records']]
    result = match_products(products, registry)
    result['scope'] = 'Exact trade-item evidence only. Different regional GTINs do not disqualify a shared model or prove absence from the EU market. EU retail articles must still be collected independently.'
    result['generatedAt'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    result['summary'] = {'usCandidates': len(products), 'euRecords': len(registry), 'exactMatches': len(result['matches']), 'rejectedMatches': len(result['rejected']), 'unmatched': len(result['unmatched']), 'publicationReady': 0}
    result['registryCoverage'] = [{k: row.get(k) for k in ['brand', 'scannedRecords', 'totalRegistryRecords', 'scanComplete', 'error']} for row in eu]
    (args.directory / 'crosswalk.json').write_text(json.dumps(result, ensure_ascii=False, indent=2))
    print(json.dumps(result['summary']))


if __name__ == '__main__':
    main()
