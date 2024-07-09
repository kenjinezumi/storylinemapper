import networkx as nx
from typing import List, Tuple
import spacy

nlp = spacy.load("en_core_web_sm")

def extract_entities(text: str) -> List[str]:
    doc = nlp(text)
    entities = [ent.text for ent in doc.ents if ent.label_ in ["PERSON", "ORG"]]
    return entities

def extract_relations(text: str) -> List[Tuple[str, str, str]]:
    doc = nlp(text)
    relations = []
    for sent in doc.sents:
        entities = [(ent.text, ent.start, ent.end) for ent in sent.ents if ent.label_ in ["PERSON", "ORG"]]
        actions = [token.lemma_ for token in sent if token.pos_ == "VERB"]
        if len(entities) > 1:
            for i in range(len(entities)):
                for j in range(i + 1, len(entities)):
                    relations.append((entities[i][0], entities[j][0], ", ".join(actions)))
    return relations

def generate_network(text: str) -> nx.Graph:
    relations = extract_relations(text)
    G = nx.DiGraph()
    entity_counts = {}

    for entity1, entity2, actions in relations:
        if G.has_edge(entity1, entity2):
            G[entity1][entity2]['actions'] += f", {actions}"
        else:
            G.add_edge(entity1, entity2, actions=actions)
        
        entity_counts[entity1] = entity_counts.get(entity1, 0) + 1
        entity_counts[entity2] = entity_counts.get(entity2, 0) + 1

    for node in G.nodes:
        G.nodes[node]['size'] = entity_counts[node]

    return G
