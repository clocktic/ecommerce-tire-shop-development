"""Collect source-backed drafts; publication is deliberately a separate approval gate."""
import argparse
import concurrent.futures
import datetime
import json
import re
from pathlib import Path
from tire_sources import brand_key, fetch, json_blocks, normalized, plain, slug

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
    model_images = list(dict.fromkeys(url for v in group.get('hasVariant', []) if normalized(str(v.get('model', ''))) == model['modelKey'] and brand_key(str(v.get('brand', ''))) == brand_key(model['brand']) for url in (v.get('image') if isinstance(v.get('image'), list) else []) if isinstance(url, str) and url.startswith('https://')))
    products, skipped = [], []
    for v in group.get('hasVariant', []):
        attrs = {a['name']: str(a['value']) for a in v.get('additionalProperty', []) if 'name' in a and 'value' in a}
        match = re.fullmatch(r'(\d{2,3})\s*(AA|A|B|C)\s*(A|B|C)', attrs.get('UTQG', ''))
        source_images = v.get('image') or []
        images = list(dict.fromkeys(u for u in source_images if isinstance(u, str) and u.startswith('https://'))) if isinstance(source_images, list) else []
        used_model_gallery = len(images) < 2
        if used_model_gallery:
            images = list(dict.fromkeys(images + model_images))
        offer = v.get('offers') or {}
        try:
            width, aspect, rim, load = (int(attrs[k]) for k in ['Section Width', 'Aspect Ratio', 'Rim Diameter', 'Load Index'])
            price = round(float(offer['price']) * 100)
            season = {'Summer': 'summer', 'Winter': 'winter', 'All Season': 'all-season', 'All Weather': 'all-season'}[attrs['Season']]
            missing_winter_grade = season == 'winter' and attrs.get('UTQG', '').strip().upper() in ['', 'N/A', 'NONE', '-', 'NOT AVAILABLE']
            assert (match or missing_winter_grade) and v.get('mpn') and v.get('sku') and len(images) >= 2
            assert 100 <= width <= 405 and 20 <= aspect <= 90 and 13 <= rim <= 30 and 50 <= load <= 130
            assert price > 0 and offer.get('priceCurrency') == 'USD'
            assert re.fullmatch(r'[A-Z]', attrs['Speed Rating'])
            assert attrs.get('Run Flat') in ['Yes', 'No']
        except (KeyError, TypeError, ValueError, AssertionError):
            skipped.append({'sku': v.get('sku'), 'name': v.get('name'), 'reason': 'Missing or unsupported size, UTQG, identifiers, season, price, run-flat status or gallery'})
            continue
        utqg_text = f'UTQG: {match[1]} {match[2]} {match[3]}' if match else 'UTQG not supplied by the reference; applicability to this winter article requires confirmation'
        model_name = v.get('model')
        if not model_name or normalized(model_name) != model['modelKey'] or brand_key(str(v.get('brand', ''))) != brand_key(model['brand']):
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
            'description': f'{model["brand"]} {model_name} in size {size}. Designed for {attrs.get("Vehicle Type", "passenger").lower()} applications, with {attrs.get("Tire Type", "road").lower()} classification in the reference catalogue. {utqg_text}. Load range: {attrs.get("Load Range", "not specified")}. Run-flat: {attrs["Run Flat"]}. Confirm size, load, speed and any OE requirements against the vehicle placard before fitting. {warranty_text} Warranty eligibility depends on the country of sale and manufacturer conditions; the reference retailer’s returns and delivery promises are not our store policies.',
            'highlights': [f'{size}', utqg_text, attrs.get('Tire Type', 'Road tire')],
            'specs': specs, 'offers': {'us': {'priceCents': price, 'availability': 'out_of_stock'}},
            'tire': {'model': model_name, 'width': width, 'aspect': aspect, 'rim': rim, 'loadIndex': load, 'speedRating': attrs['Speed Rating'], 'season': season, 'extraLoad': attrs.get('Load Range') == 'XL', 'runFlat': attrs['Run Flat'] == 'Yes'},
            'source': 'verified-tire-drafts-v1',
            'verification': {'status': 'draft', 'checkedAt': TODAY, 'sources': [model['usUrl'], model.get('euUrl'), offer.get('url')], 'pending': ['Remaining agreed reference sites', 'Store pricing and stock approval', 'Photo rights and local image download'], 'referencePrice': {'amountCents': price, 'currency': 'USD'}, 'referenceAvailability': offer.get('availability'), 'modelKey': model['modelKey']},
        }
        product['verification']['sources'] = [url for url in product['verification']['sources'] if url]
        if used_model_gallery:
            product['verification']['photoScope'] = 'Model representative; not a guarantee of article-specific sidewall markings'
        if match:
            product['tire']['utqg'] = {'treadwear': int(match[1]), 'traction': match[2], 'temperature': match[3]}
        else:
            product['verification']['utqgStatus'] = 'winter-applicability-pending'
            product['verification']['pending'].append('Confirm UTQG applicability for this winter article; no grade has been invented')
        if not model.get('euUrl'):
            product['verification']['pending'].append('EU model and regional article confirmation')
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
    parser = argparse.ArgumentParser()
    parser.add_argument('--models-file', type=Path, default=OUT / 'models.json')
    parser.add_argument('--output', type=Path, default=OUT / 'us-variants.json')
    parser.add_argument('--include-regional-candidates', action='store_true')
    parser.add_argument('--brand')
    args = parser.parse_args()
    rows = json.loads(args.models_file.read_text())
    models = []
    for row in rows:
        selected = {m['modelKey']: m for m in row['models']}
        if args.include_regional_candidates:
            for model in row.get('usCandidates', []):
                if len(selected) >= max(30, len(row['models'])):
                    break
                selected.setdefault(model['modelKey'], model)
        if not args.brand or row['brand'] == args.brand:
            models.extend(selected.values())
    results = [r for r in json.loads(args.output.read_text()) if r['model']['brand'] != args.brand] if args.brand and args.output.exists() else []
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        jobs = {pool.submit(collect, model): model for model in models}
        for future in concurrent.futures.as_completed(jobs):
            model = jobs[future]
            try:
                result = future.result()
            except Exception as exc:
                result = {'model': model, 'products': [], 'error': str(exc)}
            results.append(result)
            args.output.write_text(json.dumps(results, ensure_ascii=False))
            print(model['brand'], model['modelKey'], len(result['products']), result.get('error', ''), flush=True)
    print('Drafts', sum(len(r['products']) for r in results), 'model rows', len(results), 'processed', len(models), flush=True)


if __name__ == '__main__':
    main()
