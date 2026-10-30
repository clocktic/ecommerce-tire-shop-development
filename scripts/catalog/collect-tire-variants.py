"""Collect source-backed drafts; publication is deliberately a separate approval gate."""
import concurrent.futures
import datetime
import json
import re
from pathlib import Path
from tire_sources import fetch, json_blocks, normalized, plain, slug

OUT = Path('.v0/refs/verified-tires')
TODAY = datetime.datetime.now(datetime.timezone.utc).isoformat()


def valid_gtin(value):
    if not re.fullmatch(r'\d{12,14}', value or ''):
        return False
    digits = [int(c) for c in value]
    return sum(d * (3 if i % 2 == 0 else 1) for i, d in enumerate(reversed(digits[:-1]))) % 10 == (-digits[-1]) % 10


def collect(model):
    groups = [g for block in json_blocks(fetch(model['usUrl'])) if isinstance(block, dict) for g in block.get('@graph', []) if g.get('@type') == 'ProductGroup']
    if not groups:
        raise ValueError('No structured ProductGroup returned')
    group = groups[0]
    products, skipped = [], []
    for v in group.get('hasVariant', []):
        attrs = {a['name']: str(a['value']) for a in v.get('additionalProperty', []) if 'name' in a and 'value' in a}
        match = re.fullmatch(r'(\d{2,3})\s*(AA|A|B|C)\s*(A|B|C)', attrs.get('UTQG', ''))
        source_images = v.get('image') or []
        images = list(dict.fromkeys(u for u in source_images if isinstance(u, str) and u.startswith('https://'))) if isinstance(source_images, list) else []
        offer = v.get('offers') or {}
        try:
            width, aspect, rim, load = (int(attrs[k]) for k in ['Section Width', 'Aspect Ratio', 'Rim Diameter', 'Load Index'])
            price = round(float(offer['price']) * 100)
            season = {'Summer': 'summer', 'Winter': 'winter', 'All Season': 'all-season', 'All Weather': 'all-season'}[attrs['Season']]
            assert match and v.get('mpn') and v.get('sku') and len(images) >= 2
            assert 100 <= width <= 405 and 20 <= aspect <= 90 and 13 <= rim <= 30 and 50 <= load <= 130
            assert price > 0 and offer.get('priceCurrency') == 'USD'
            assert re.fullmatch(r'[A-Z]', attrs['Speed Rating'])
            assert attrs.get('Run Flat') in ['Yes', 'No']
        except (KeyError, TypeError, ValueError, AssertionError):
            skipped.append({'sku': v.get('sku'), 'name': v.get('name'), 'reason': 'Missing or unsupported size, UTQG, identifiers, season, price, run-flat status or gallery'})
            continue
        model_name = v.get('model')
        if not model_name or normalized(model_name) != model['modelKey'] or normalized(str(v.get('brand', ''))) != normalized(model['brand']):
            skipped.append({'sku': v.get('sku'), 'reason': 'Missing or mismatched explicit model/brand'})
            continue
        product_id = 'ref-us-' + slug(model['brand'] + '-' + v['mpn'])
        size = f'{width}/{aspect} R{rim} {load}{attrs["Speed Rating"]}'
        warranty = re.search(r'[^.\n]*\b(?:warranty|warranties)\b[^.\n]*\.', plain(v.get('description', '')), re.I)
        warranty_text = warranty.group(0).strip() if warranty else 'Manufacturer warranty terms for this US-market article have not been independently confirmed.'
        specs = [{'label': k, 'value': value} for k, value in attrs.items() if k != 'Rebate Available' and value not in ['N/A', '', 'None']]
        specs.extend([{'label': 'Manufacturer warranty (US source)', 'value': warranty_text}, {'label': 'Reference checked', 'value': TODAY[:10]}])
        product = {
            'id': product_id, 'slug': product_id, 'category': 'tires', 'brand': model['brand'],
            'name': f'{model_name} {size}' + (' XL' if attrs.get('Load Range') == 'XL' else ''),
            'mpn': str(v['mpn']), 'supplierSku': str(v['sku']), 'images': images[:4],
            'shortDescription': f'{model["brand"]} {model_name}, {size}. {season.capitalize()} tire; specification is specific to manufacturer article {v["mpn"]}.',
            'description': f'{model["brand"]} {model_name} in size {size}. Designed for {attrs.get("Vehicle Type", "passenger").lower()} applications, with {attrs.get("Tire Type", "road").lower()} classification in the reference catalogue. UTQG: {match[1]} {match[2]} {match[3]}. Load range: {attrs.get("Load Range", "not specified")}. Run-flat: {attrs["Run Flat"]}. Confirm size, load, speed and any OE requirements against the vehicle placard before fitting. {warranty_text} Warranty eligibility depends on the country of sale and manufacturer conditions; the reference retailer’s returns and delivery promises are not our store policies.',
            'highlights': [f'{size}', f'UTQG {match[1]} {match[2]} {match[3]}', attrs.get('Tire Type', 'Road tire')],
            'specs': specs, 'offers': {'us': {'priceCents': price, 'availability': 'out_of_stock'}},
            'tire': {'model': model_name, 'width': width, 'aspect': aspect, 'rim': rim, 'loadIndex': load, 'speedRating': attrs['Speed Rating'], 'season': season, 'extraLoad': attrs.get('Load Range') == 'XL', 'runFlat': attrs['Run Flat'] == 'Yes', 'utqg': {'treadwear': int(match[1]), 'traction': match[2], 'temperature': match[3]}},
            'source': 'verified-tire-drafts-v1',
            'verification': {'status': 'draft', 'checkedAt': TODAY, 'sources': [model['usUrl'], model['euUrl'], offer.get('url')], 'pending': ['Remaining agreed reference sites', 'Store pricing and stock approval', 'Photo rights and local image download'], 'referencePrice': {'amountCents': price, 'currency': 'USD'}, 'referenceAvailability': offer.get('availability'), 'modelKey': model['modelKey']},
        }
        gtin = v.get('gtin', '')
        if valid_gtin(gtin):
            product['gtin'] = gtin
        products.append(product)
    unique, conflicts = {}, set()
    for product in products:
        previous = unique.get(product['id'])
        if previous and (previous['tire'] != product['tire'] or previous.get('gtin') != product.get('gtin')):
            conflicts.add(product['id'])
        unique.setdefault(product['id'], product)
    for product_id in conflicts:
        unique.pop(product_id, None)
        skipped.append({'id': product_id, 'reason': 'Conflicting specifications for the same manufacturer article'})
    return {'model': model, 'sourceVariants': len(group.get('hasVariant', [])), 'products': list(unique.values()), 'skipped': skipped}


def main():
    rows = json.loads((OUT / 'models.json').read_text())
    models = [m for row in rows for m in row['models'][:15]]
    results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        jobs = {pool.submit(collect, model): model for model in models}
        for future in concurrent.futures.as_completed(jobs):
            model = jobs[future]
            try:
                result = future.result()
            except Exception as exc:
                result = {'model': model, 'products': [], 'error': str(exc)}
            results.append(result)
            (OUT / 'us-variants.json').write_text(json.dumps(results, ensure_ascii=False))
            print(model['brand'], model['modelKey'], len(result['products']), result.get('error', ''), flush=True)
    print('Drafts', sum(len(r['products']) for r in results), 'models', len(results), flush=True)


if __name__ == '__main__':
    main()
