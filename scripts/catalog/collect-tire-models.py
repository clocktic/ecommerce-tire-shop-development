"""Discover exact model-name intersections; never invent availability or sales ranks."""
import concurrent.futures
import json
import re
from pathlib import Path
from tire_sources import fetch, links, normalized

BRANDS = ['Michelin', 'Continental', 'Pirelli', 'Bridgestone', 'Goodyear', 'Hankook', 'Yokohama', 'Falken', 'Toyo', 'Kumho', 'Nexen', 'Dunlop', 'Firestone', 'BFGoodrich', 'Nokian']
OUT = Path('.v0/refs/verified-tires')


def discover(brand):
    key = brand.lower()
    us_key = {'bfgoodrich': 'bf-goodrich', 'nokian': 'nokian'}.get(key, key) + '-tires'
    eu_key = {'bfgoodrich': 'bf-goodrich', 'nokian': 'nokian'}.get(key, key)
    us_url = f'https://www.prioritytire.com/by-brand/{us_key}'
    eu_url = f'https://www.centralepneus.be/pneu-auto/{eu_key}/'
    us = fetch(us_url)
    eu = fetch(eu_url)
    us_links = links(us)
    for page in sorted(set(u for u in us_links if re.fullmatch(rf'/c/by-brand/{re.escape(us_key)}/page/\d+', u))):
        us_links.extend(links(fetch('https://www.prioritytire.com' + page)))
    us_models = {}
    for link in us_links:
        match = re.fullmatch(rf'/by-brand/{re.escape(us_key)}/([^/?#]+)', link)
        if match:
            us_models.setdefault(normalized(match[1]), link)
    eu_models = {}
    for link in links(eu):
        match = re.fullmatch(rf'/pneu-auto/{re.escape(eu_key)}/([^/?#]+)/?', link)
        if match:
            eu_models.setdefault(normalized(match[1]), link)
    common = []
    for key, url in us_models.items():
        if key in eu_models:
            common.append({'brand': brand, 'modelKey': key, 'usUrl': 'https://www.prioritytire.com' + url, 'euUrl': 'https://www.centralepneus.be' + eu_models[key]})
    return {'brand': brand, 'usModels': len(us_models), 'euModels': len(eu_models), 'models': common, 'ranking': 'Source listing order, not verified sales ranking', 'otherReferences': {'distri-auto.be': 'pending model-level verification', 'allebanden365.be': 'pending model-level verification', 'tirerack.com': 'pending model-level verification'}}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    rows = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        jobs = {pool.submit(discover, brand): brand for brand in BRANDS}
        for future in concurrent.futures.as_completed(jobs):
            brand = jobs[future]
            try:
                row = future.result()
            except Exception as exc:
                row = {'brand': brand, 'models': [], 'error': str(exc)}
            rows.append(row)
            (OUT / 'models.json').write_text(json.dumps(rows, indent=2))
            print(brand, 'US', row.get('usModels'), 'EU', row.get('euModels'), 'exact matches', len(row['models']), row.get('error', ''), flush=True)
    print('Total exact matches', sum(len(r['models']) for r in rows), flush=True)


if __name__ == '__main__':
    main()
