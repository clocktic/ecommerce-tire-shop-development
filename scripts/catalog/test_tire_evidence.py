import copy
import importlib.util
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location('matcher', Path(__file__).with_name('match-tire-evidence.py'))
matcher = importlib.util.module_from_spec(spec)
spec.loader.exec_module(matcher)


class EvidenceTests(unittest.TestCase):
    def setUp(self):
        self.product = {'id': 'test', 'brand': 'Michelin', 'mpn': '20896', 'gtin': '086699208965', 'tire': {'model': 'Pilot Sport 4S', 'width': 225, 'aspect': 45, 'rim': 18, 'loadIndex': 95, 'speedRating': 'Y', 'extraLoad': True, 'runFlat': False}, 'verification': {'sources': ['https://example.org/source']}}
        self.record = {'eprelRegistrationNumber': 'test-reg', 'versionNumber': 1, 'supplierOrTrademark': 'Michelin', 'commercialName': 'Pilot Sport 4S', 'modelIdentifier': '20896', 'gtinIdentifier': '0086699208965', 'tyreSection': 225, 'aspectRatio': 45, 'rimDiameter': 18, 'loadCapacityIndex': 95, 'speedCategorySymbol': 'Y', 'loadCapacityIndicator': 'XL', 'unrestrictedMobility': None, 'energyClass': 'C', 'wetGripClass': 'A', 'externalRollingNoiseClass': 'B', 'externalRollingNoiseValue': 71}

    def match(self, records=None):
        return matcher.match_products([self.product], records if records is not None else [self.record])

    def test_upc_and_zero_padded_ean_are_equivalent(self):
        self.assertEqual(matcher.gtin_key(self.product['gtin']), matcher.gtin_key(self.record['gtinIdentifier']))
        result = self.match()['matches'][0]
        self.assertFalse(result['publicationReady'])
        self.assertIn('EU run-flat status is not specified', result['pending'])

    def test_size_and_mpn_alone_do_not_match(self):
        self.record['gtinIdentifier'] = '4019238001785'
        self.assertEqual(self.match()['matches'], [])
        self.assertEqual(len(self.match()['unmatched']), 1)

    def test_invalid_gtin_is_rejected(self):
        self.product['gtin'] = '086699208966'
        self.assertEqual(self.match()['matches'], [])
        self.assertIsNone(matcher.gtin_key('123'))
        self.assertIsNone(matcher.gtin_key(None))

    def test_different_service_description_is_rejected(self):
        self.record['loadCapacityIndex'] = 91
        self.assertIn('loadIndex', self.match()['rejected'][0]['fields'])

    def test_ambiguous_registration_is_not_chosen_arbitrarily(self):
        other = {**self.record, 'eprelRegistrationNumber': 'another-reg'}
        self.assertEqual(self.match([self.record, other])['matches'], [])
        self.assertEqual(len(self.match([self.record, other])['rejected']), 1)

    def test_versions_of_same_registration_do_not_create_ambiguity(self):
        older = {**self.record, 'versionNumber': 0, 'loadCapacityIndex': 91}
        self.assertEqual(len(self.match([self.record, older])['matches']), 1)

    def test_conflicting_same_version_is_rejected(self):
        conflict = {**self.record, 'energyClass': 'D'}
        self.assertEqual(self.match([self.record, conflict])['matches'], [])
        self.assertEqual(len(self.match([self.record, conflict])['rejected']), 1)

    def test_zero_gtin_is_invalid(self):
        self.assertIsNone(matcher.gtin_key('0000000000000'))

    def test_runflat_disagreement_is_rejected(self):
        self.record['unrestrictedMobility'] = True
        self.assertIn('runFlat', self.match()['rejected'][0]['fields'])

    def test_rf_load_indicator_does_not_mean_runflat(self):
        self.record['loadCapacityIndicator'] = 'RF'
        self.record['unrestrictedMobility'] = False
        self.assertEqual(len(self.match()['matches']), 1)

    def test_expired_market_record_is_rejected(self):
        self.record['onMarketEndDate'] = [2020, 1, 1]
        self.assertIn('onMarketEndDate', self.match()['rejected'][0]['fields'])

    def test_different_brand_or_missing_label_rejected(self):
        self.record['supplierOrTrademark'] = 'Pirelli'
        self.record['wetGripClass'] = None
        self.assertEqual(set(self.match()['rejected'][0]['fields']), {'brand', 'EU efficiency/grip label'})


if __name__ == '__main__':
    unittest.main()
