"""Read public catalogue pages with bounded requests and resumable local caching."""
import hashlib
import html
import json
import re
import urllib.request
from pathlib import Path

CACHE = Path('/tmp/tire-source-cache')
HEADERS = {'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html,application/json', 'Referer': 'https://eprel.ec.europa.eu/'}


def fetch(url):
    CACHE.mkdir(parents=True, exist_ok=True)
    path = CACHE / (hashlib.sha256(url.encode()).hexdigest() + '.txt')
    if path.exists():
        return path.read_text()
    with urllib.request.urlopen(urllib.request.Request(url, headers=HEADERS), timeout=25) as response:
        text = response.read().decode('utf-8', 'replace')
    if 'CrowdSec Captcha' in text or ('Just a moment' in text and len(text) < 20000):
        raise ValueError('Source returned a challenge instead of a catalogue')
    path.write_text(text)
    return text


def json_blocks(text):
    result = []
    for attrs, body in re.findall(r'<script\b([^>]*)>(.*?)</script>', text, re.S):
        if 'application/ld+json' in attrs or '__NEXT_DATA__' in attrs:
            try:
                result.append(json.loads(html.unescape(body) if '&quot;' in body else body))
            except json.JSONDecodeError:
                continue
    return result


def plain(text):
    text = re.sub(r'<(script|style)\b[^>]*>.*?</\1>', '', text, flags=re.S)
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', text))).strip()


def links(text):
    return list(dict.fromkeys(html.unescape(u) for u in re.findall(r'href=[\"\x27]([^\"\x27]+)', text)))


def slug(text):
    return re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')


def normalized(text):
    return re.sub(r'[^a-z0-9]', '', text.lower())


def brand_key(text):
    key = normalized(text)
    return {'nokiantyres': 'nokian'}.get(key, key)
