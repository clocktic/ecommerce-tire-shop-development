"""Export selected model/size coverage together with two downloaded photos per model."""
import argparse
import csv
import io
import json
import zipfile
from pathlib import Path

SOURCE = Path('.v0/refs/verified-tires')


def csv_text(rows):
    out = io.StringIO(newline='')
    writer = csv.DictWriter(out, fieldnames=list(rows[0]))
    writer.writeheader()
    writer.writerows(rows)
    return '\ufeff' + out.getvalue()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    selected = json.loads((SOURCE / 'catalog-selection.json').read_text())
    coverage = json.loads((SOURCE / 'catalog-coverage.json').read_text())
    models, articles = [], []
    photo_files = set()
    for batch in selected:
        products = batch['products']
        sizes = sorted({(p['tire']['width'], p['tire']['aspect'], p['tire']['rim']) for p in products})
        photos = batch['modelPhotos']
        models.append({'brand': batch['model']['brand'], 'model': products[0]['tire']['model'], 'sizes': len(sizes), 'articles': len(products), 'sourceVariants': batch['sourceVariants'], 'supportedVariantCoverage': f'{len(products)}/{batch["sourceVariants"]}', 'sizeList': '; '.join(f'{w}/{a} R{r}' for w, a, r in sizes), 'photo1': photos[0]['file'], 'photo2': photos[1]['file'], 'usReference': batch['model']['usUrl'], 'euModelReference': batch['model'].get('euUrl') or 'Pending', 'publication': 'Draft; reference, rights, pricing and stock checks pending'})
        photo_files.update(p['file'] for p in photos)
        for p in products:
            t = p['tire']
            q = t.get('utqg')
            articles.append({'brand': p['brand'], 'model': t['model'], 'articleId': p['id'], 'mpn': p['mpn'], 'gtin': p.get('gtin', ''), 'size': f'{t["width"]}/{t["aspect"]} R{t["rim"]}', 'loadIndex': t['loadIndex'], 'speedRating': t['speedRating'], 'XL': t['extraLoad'], 'runFlat': t['runFlat'], 'season': t['season'], 'UTQG': f'{q["treadwear"]} {q["traction"]} {q["temperature"]}' if q else 'Winter applicability pending', 'referencePriceUSD': p['verification']['referencePrice']['amountCents'] / 100, 'referenceAvailability': p['verification'].get('referenceAvailability', ''), 'pending': '; '.join(p['verification']['pending'])})
    if not models:
        raise ValueError('No complete brand selection to export')
    args.output.with_suffix('.csv').write_text(csv_text([row for row in coverage['coverage'] if row['targetMet']]), encoding='utf-8')
    with zipfile.ZipFile(args.output, 'w', zipfile.ZIP_DEFLATED) as archive:
        for filename in ['catalog-selection.json', 'catalog-coverage.json', 'expanded-models.json']:
            archive.write(SOURCE / filename, filename)
        archive.writestr('models.csv', csv_text(models))
        archive.writestr('sizes-and-articles.csv', csv_text(articles))
        archive.writestr('brand-coverage.csv', csv_text(coverage['coverage']))
        for filename in sorted(photo_files):
            file = SOURCE / filename
            if not file.resolve().is_relative_to((SOURCE / 'photos').resolve()):
                raise ValueError('Invalid photo path')
            archive.write(file, filename)
    with zipfile.ZipFile(args.output) as archive:
        if archive.testzip() is not None:
            raise ValueError('Archive integrity check failed')
    print(json.dumps({**coverage['summary'], 'archiveBytes': args.output.stat().st_size, 'archivePhotos': len(photo_files)}))


if __name__ == '__main__':
    main()
