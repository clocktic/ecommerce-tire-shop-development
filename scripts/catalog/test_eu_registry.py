import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('registry', Path(__file__).with_name('collect-eu-registry.py'))
registry = importlib.util.module_from_spec(spec)
spec.loader.exec_module(registry)


class RegistryTests(unittest.TestCase):
    def test_selection_uses_actual_models_and_preserves_other_output(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            selection = root / 'selection.json'
            original = root / 'eu-registry.json'
            output = root / 'new.json'
            original.write_text('original')
            selection.write_text(json.dumps([{'model': {'brand': 'Nokian', 'modelKey': 'unusedslug'}, 'products': [{'tire': {'model': 'Hakkapeliitta R5'}}, {'tire': {'model': 'Hakkapeliitta R5'}}]}]))
            def harvest(row, pages):
                self.assertEqual(row, {'brand': 'Nokian', 'models': [{'modelKey': 'hakkapeliittar5'}]})
                return {'brand': row['brand'], 'records': [], 'scannedRecords': 0, 'scanComplete': True}
            with patch('sys.argv', ['collect', '--selection', str(selection), '--output', str(output)]), patch.object(registry, 'harvest', side_effect=harvest), patch('builtins.print'):
                registry.main()
            self.assertEqual(original.read_text(), 'original')
            self.assertTrue(json.loads(output.read_text())[0]['scanComplete'])
            self.assertFalse(output.with_suffix('.tmp').exists())

    def test_invalid_pagination_fails_closed(self):
        with patch.object(registry, 'fetch', return_value=json.dumps({'hits': [], 'size': 10, 'offset': 100})):
            with self.assertRaises(ValueError):
                registry.harvest({'brand': 'Michelin', 'models': []}, 1)

    def test_page_limit_does_not_claim_complete_scan(self):
        response = {'hits': [{'status': 'DRAFT'}], 'size': 101, 'offset': 0}
        with patch.object(registry, 'fetch', return_value=json.dumps(response)):
            result = registry.harvest({'brand': 'Michelin', 'models': []}, 1)
        self.assertFalse(result['scanComplete'])
        self.assertEqual(result['records'], [])

    def test_names_are_exact_not_fuzzy(self):
        hits = [{'status': 'PUBLISHED', 'eprelRegistrationNumber': 1, 'additionalDetails': {'commercialName': 'Pilot Sport 4S'}}, {'status': 'PUBLISHED', 'eprelRegistrationNumber': 2, 'additionalDetails': {'commercialName': 'Pilot Sport 4'}}]
        with patch.object(registry, 'fetch', return_value=json.dumps({'hits': hits, 'size': 2, 'offset': 0})):
            result = registry.harvest({'brand': 'Michelin', 'models': [{'modelKey': 'pilotsport4s'}]}, 1)
        self.assertEqual([r['eprelRegistrationNumber'] for r in result['records']], [1])
        self.assertTrue(result['scanComplete'])


if __name__ == '__main__':
    unittest.main()
