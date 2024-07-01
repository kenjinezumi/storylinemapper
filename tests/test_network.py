# tests/test_network.py

import unittest
from storylinemapper import extract_entities, extract_relations, generate_network, generate_network_iframe

class TestCharacterNetwork(unittest.TestCase):

    def test_extract_entities(self):
        text = "Alice and Bob went to the market. Alice bought an apple."
        entities = extract_entities(text)
        self.assertIn("Alice", entities)
        self.assertIn("Bob", entities)

    def test_extract_relations(self):
        text = "Alice and Bob went to the market. Alice bought an apple."
        relations = extract_relations(text)
        self.assertIn(("Alice", "Bob"), relations)

    def test_generate_network(self):
        text = "Alice and Bob went to the market. Alice bought an apple."
        G = generate_network(text)
        self.assertTrue(len(G.nodes) > 0)
        self.assertTrue(len(G.edges) > 0)

    def test_generate_network_iframe(self):
        text = "Alice and Bob went to the market. Alice bought an apple."
        G = generate_network(text)
        iframe_html = generate_network_iframe(G)
        self.assertIn("<html>", iframe_html)

if __name__ == "__main__":
    unittest.main()
