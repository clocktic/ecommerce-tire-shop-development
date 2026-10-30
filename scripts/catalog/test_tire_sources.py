import copy
import importlib.util
import json
import unittest
from pathlib import Path
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('collector', Path(__file__).with_name('collect-tire-variants.py'))
collector = importlib.util.module_from_spec(spec)
spec.loader.exec_module(collector)


class CollectorTests(unittest.TestCase):
    def setUp(self):
        self.model = {'brand': 'Michelin', 'modelKey': 'pilotsport4s', 'usUrl': 'https://www.prioritytire.com/example', 'euUrl': 'https://www.centralepneus.be/example'}
        values = {'Section Width': '225', 'Aspect Ratio': '45', 'Rim Diameter': '18', 'Load Index': '95', 'Speed Rating': 'Y', 'Season': 'Summer', 'Run Flat': 'No', 'Load Range': 'XL', 'UTQG': '300AAA'}
        self.variant = {'brand': 'Michelin', 'model': 'Pilot Sport 4S', 'mpn': '12345', 'sku': 'N12345', 'gtin': '086699208965', 'image': ['https://example.org/1.jpg', 'https://example.org/2.jpg'], 'offers': {'price': 200, 'priceCurrency': 'USD'}, 'additionalProperty': [{'name': k, 'value': v} for k, v in values.items()]}

    def collect(self, variants):
        payload = {'@graph': [{'@type': 'ProductGroup', 'hasVariant': variants}]}
        with patch.object(collector, 'fetch', return_value='<script type="application/ld+json">' + json.dumps(payload) + '</script>'):
            return collector.collect(self.model)

    def test_variant_specific_identifiers_and_grades(self):
        other = copy.deepcopy(self.variant)
        other.update(mpn='67890', sku='N67890')
        other['additionalProperty'][-1]['value'] = '500AA'
        rows = self.collect([self.variant, other])['products']
        self.assertEqual(len(rows), 2)
        self.assertEqual(rows[0]['tire']['utqg'], {'treadwear': 300, 'traction': 'AA', 'temperature': 'A'})
        self.assertEqual(rows[1]['tire']['utqg'], {'treadwear': 500, 'traction': 'A', 'temperature': 'A'})
        self.assertNotIn('eu', rows[0]['offers'])
        self.assertEqual(rows[0]['offers']['us']['availability'], 'out_of_stock')
        self.assertEqual(rows[0]['verification']['status'], 'draft')

    def test_missing_utqg_is_not_invented(self):
        self.variant['additionalProperty'].pop()
        self.assertEqual(self.collect([self.variant])['products'], [])

    def test_redirected_model_is_rejected(self):
        self.variant['model'] = 'Pilot Sport 5'
        self.assertEqual(self.collect([self.variant])['products'], [])

    def test_conflicting_article_is_rejected(self):
        other = copy.deepcopy(self.variant)
        other['additionalProperty'][0]['value'] = '245'
        self.assertEqual(self.collect([self.variant, other])['products'], [])

    def test_distinct_images_required(self):
        self.variant['image'] = ['https://example.org/1.jpg'] * 2
        self.assertEqual(self.collect([self.variant])['products'], [])

    def test_gtin_checksum(self):
        self.assertTrue(collector.valid_gtin('086699208965'))
        self.assertFalse(collector.valid_gtin('086699208966'))


if __name__ == '__main__':
    unittest.main()
