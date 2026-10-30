"""Recheck identifier matches against the direct EPREL record, retaining provenance."""
import argparse
import concurrent.futures
import datetime
import hashlib
import importlib.util
import json
from pathlib import Path
from tire_sources import CACHE, fetch

spec = importlib.util.spec_from_file_location('matcher', Path(__file__).with_name('match-tire-evidence.py'))
matcher = importlib.util.module_from_spec(spec)
spec.loader.exec_module(matcher)
OUT = Path('.v0/refs/verified-tires')


def verify(match):
    registration = str(match['euRecord']['eprelRegistrationNumber'])
    if not registration.isdigit():
        raise ValueError('Invalid registration number')
    url = f'https://eprel.ec.europa.eu/api/products/tyres/{registration}'
    record = json.loads(fetch(url))
    details = record.get('additionalDetails') or {}
    record.update({key: details.get(key) for key in ['commercialName', 'gtinIdentifier', 'unrestrictedMobility', 'originalEquipmentMarking']})
    product = {'brand': match['brand'], 'tire': match['usTire']}
    issues = matcher.disagreements(product, record)
    if str(record.get('eprelRegistrationNumber')) != registration or record.get('status') != 'PUBLISHED' or record.get('blocked') is True:
        issues.append('Record identity/status')
    if matcher.gtin_key(record.get('gtinIdentifier')) != matcher.gtin_key(match['gtin']):
        issues.append('GTIN changed')
    if issues:
        return {'productId': match['productId'], 'error': ', '.join(issues)}
    evidence = {key: record.get(key) for key in match['euRecord'] if key not in ['pending', 'sourceUrl']}
    evidence['sourceUrl'] = match['euRecord']['sourceUrl']
    path = CACHE / (hashlib.sha256(url.encode()).hexdigest() + '.txt')
    checked_at = datetime.datetime.fromtimestamp(path.stat().st_mtime, datetime.timezone.utc).isoformat()
    pending = [p for p in match['pending'] if p != 'Direct EPREL record recheck before publication']
    if record.get('lastVersion') is not True:
        pending.append('Latest-version flag is not affirmed by the EPREL API')
    return {**match, 'euRecord': evidence, 'pending': pending, 'directLookup': {'url': url, 'checkedAt': checked_at, 'status': 'verified-snapshot'}, 'publicationReady': False}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--input', type=Path, default=OUT / 'crosswalk.json')
    parser.add_argument('--output', type=Path, default=OUT / 'verified-crosswalk.json')
    args = parser.parse_args()
    source = json.loads(args.input.read_text())
    verified, failed = [], []
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        jobs = {pool.submit(verify, match): match['productId'] for match in source['matches']}
        for future in concurrent.futures.as_completed(jobs):
            try:
                result = future.result()
            except Exception as exc:
                result = {'productId': jobs[future], 'error': str(exc)}
            (failed if 'error' in result else verified).append(result)
    result = {'matches': sorted(verified, key=lambda row: row['productId']), 'failed': failed, 'summary': {**source['summary'], 'directlyVerified': len(verified), 'directCheckFailed': len(failed)}, 'registryCoverage': source['registryCoverage']}
    args.output.write_text(json.dumps(result, indent=2, ensure_ascii=False))
    print(json.dumps(result['summary']), flush=True)


if __name__ == '__main__':
    main()
