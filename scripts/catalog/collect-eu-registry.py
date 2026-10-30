"""Collect technical evidence, not market offers, from the official EU register."""
import argparse
import concurrent.futures
import json
import urllib.parse
from pathlib import Path
from tire_sources import fetch, normalized

OUT = Path('.v0/refs/verified-tires')
FIELDS = ['eprelRegistrationNumber', 'versionNumber', 'lastVersion', 'modelIdentifier', 'supplierOrTrademark', 'sizeDesignation', 'tyreDesignation', 'tyreSection', 'aspectRatio', 'rimDiameter', 'loadCapacityIndex', 'speedCategorySymbol', 'loadCapacityIndicator', 'energyClass', 'wetGripClass', 'externalRollingNoiseClass', 'externalRollingNoiseValue', 'severeSnowTyre', 'iceTyre', 'onMarketStartDate', 'onMarketEndDate']


def harvest(row, max_pages):
    brand = {'Nokian': 'NOKIAN TYRES', 'BFGoodrich': 'BFGOODRICH'}.get(row['brand'], row['brand'].upper())
    wanted = {m['modelKey'] for m in row['models']}
    records = {}
    seen = 0
    total = 0
    page = 1
    while page <= max_pages:
        params = urllib.parse.urlencode({'supplierOrTrademark': brand, 'tyreClass': 'C1', '_page': page, '_limit': 100})
        response = json.loads(fetch('https://eprel.ec.europa.eu/api/products/tyres?' + params))
        hits = response.get('hits', [])
        total = response.get('size', 0)
        if response.get('offset') != (page - 1) * 100:
            raise ValueError('Unexpected EPREL pagination; refusing duplicate or skipped pages')
        seen += len(hits)
        for hit in hits:
            details = hit.get('additionalDetails') or {}
            if hit.get('status') != 'PUBLISHED' or normalized(details.get('commercialName') or '') not in wanted:
                continue
            item = {k: hit.get(k) for k in FIELDS}
            item['commercialName'] = details['commercialName']
            item['gtinIdentifier'] = details.get('gtinIdentifier')
            item['originalEquipmentMarking'] = details.get('originalEquipmentMarking')
            item['unrestrictedMobility'] = details.get('unrestrictedMobility')
            reg = str(item['eprelRegistrationNumber'])
            item['sourceUrl'] = f'https://eprel.ec.europa.eu/screen/product/tyres/{reg}'
            item['pending'] = ['Verify latest registration version', 'Retail article/GTIN match', 'Variant-specific retailer listing, images and store offer']
            old = records.get(reg)
            if old is None or (item.get('versionNumber') or 0) > (old.get('versionNumber') or 0):
                records[reg] = item
        if not hits or seen >= total:
            break
        page += 1
    return {'brand': row['brand'], 'totalRegistryRecords': total, 'scannedRecords': seen, 'scanComplete': seen >= total, 'records': list(records.values())}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--pages', type=int, default=1000)
    parser.add_argument('--selection', type=Path)
    parser.add_argument('--output', type=Path, default=OUT / 'eu-registry.json')
    args = parser.parse_args()
    if args.pages < 1:
        parser.error('--pages must be positive')
    if args.selection:
        by_brand = {}
        for batch in json.loads(args.selection.read_text()):
            brand = batch['model']['brand']
            models = by_brand.setdefault(brand, {})
            for product in batch['products']:
                key = normalized(product['tire']['model'])
                models[key] = {'modelKey': key}
        rows = [{'brand': brand, 'models': list(models.values())} for brand, models in by_brand.items()]
    else:
        rows = [r for r in json.loads((OUT / 'models.json').read_text()) if r['models']]
    results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        jobs = {pool.submit(harvest, row, args.pages): row['brand'] for row in rows}
        for future in concurrent.futures.as_completed(jobs):
            brand = jobs[future]
            try:
                result = future.result()
            except Exception as exc:
                result = {'brand': brand, 'records': [], 'error': str(exc)}
            results.append(result)
            temporary = args.output.with_suffix('.tmp')
            temporary.write_text(json.dumps(results, ensure_ascii=False))
            temporary.replace(args.output)
            print(brand, 'matches', len(result['records']), 'scanned', result.get('scannedRecords'), result.get('error', ''), flush=True)


if __name__ == '__main__':
    main()
