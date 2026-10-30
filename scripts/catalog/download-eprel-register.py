import concurrent.futures
import datetime
import json
import math
import time
import urllib.parse
import urllib.request
from pathlib import Path

OUT = Path('.v0/refs/eprel')
OUT.mkdir(parents=True, exist_ok=True)
HEADERS = {'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json', 'Referer': 'https://eprel.ec.europa.eu/'}
FIELDS = ['eprelRegistrationNumber', 'supplierOrTrademark', 'modelIdentifier', 'tyreClass', 'tyreDesignation', 'tyreSection', 'aspectRatio', 'rimDiameter', 'loadCapacityIndex', 'loadCapacityIndex2', 'speedCategorySymbol', 'speedCategorySymbol2', 'loadCapacityIndicator', 'energyClass', 'wetGripClass', 'externalRollingNoiseClass', 'externalRollingNoiseValue', 'severeSnowTyre', 'iceTyre', 'status', 'blocked', 'versionNumber', 'onMarketEndDateTS', 'additionalDetails']
brands = sorted({p['brand'].upper() for batch in json.loads(Path('.v0/refs/verified-tires/catalog-selection.json').read_text()) for p in batch['products']})
checked_at = datetime.datetime.now(datetime.timezone.utc).isoformat()

def page(brand, number):
    url = 'https://eprel.ec.europa.eu/api/products/tyres?' + urllib.parse.urlencode({'supplierOrTrademark': brand, '_page': number, '_limit': 100})
    for attempt in range(2):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=HEADERS), timeout=30) as response:
                data = json.load(response)
            if not isinstance(data.get('hits'), list) or not isinstance(data.get('size'), int):
                raise ValueError('Invalid EPREL response')
            return {'total': data['size'], 'records': [{k: hit.get(k) for k in FIELDS} for hit in data['hits']]}
        except Exception:
            if attempt:
                raise
            time.sleep(2)

def harvest(brand):
    first = page(brand, 1)
    records = first['records']
    for number in range(2, math.ceil(first['total'] / 100) + 1):
        data = page(brand, number)
        if data['total'] != first['total']:
            raise ValueError(f'{brand}: register changed during pagination')
        records.extend(data['records'])
    if len(records) != first['total']:
        raise ValueError(f'{brand}: incomplete pagination {len(records)}/{first["total"]}')
    result = {'brand': brand, 'checkedAt': checked_at, 'total': first['total'], 'records': records}
    (OUT / f'{brand.lower().replace(" ", "-")}.json').write_text(json.dumps(result))
    print(json.dumps({'brand': brand, 'records': len(records)}), flush=True)
    return result

results = []
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
    for result in executor.map(harvest, brands):
        results.append(result)

records = {}
for result in results:
    for record in result['records']:
        key = record['eprelRegistrationNumber']
        if not key:
            raise ValueError('Missing registration number')
        previous = records.get(key)
        if not previous or (record.get('versionNumber') or 0) > (previous.get('versionNumber') or 0):
            records[key] = record
(OUT / 'register.json').write_text(json.dumps({'checkedAt': checked_at, 'brands': brands, 'counts': {b['brand']: b['total'] for b in results}, 'records': list(records.values())}))
print(json.dumps({'complete': True, 'brands': len(brands), 'records': len(records)}), flush=True)
