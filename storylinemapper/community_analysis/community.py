# community.py

import networkx as nx
import community as community_louvain
from infomap import Infomap
import itertools
import spacy
from collections import Counter
from typing import List, Tuple

# Load the spaCy model
nlp = spacy.load("en_core_web_sm")

def extract_entities(text: str) -> List[str]:
    """Extract entities from text"""
    doc = nlp(text)
    entities = [ent.text for ent in doc.ents if ent.label_ in ["PERSON", "ORG"]]
    return entities

def extract_relations(text: str) -> List[Tuple[str, str, str]]:
    """Extract relations between entities from text"""
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

def build_network_from_text(text: str) -> nx.Graph:
    """Build a networkx graph from text"""
    relations = extract_relations(text)
    G = nx.Graph()
    entity_counts = {}

    for entity1, entity2, actions in relations:
        if G.has_edge(entity1, entity2):
            G[entity1][entity2]['actions'] += f", {actions}"
        else:
            G.add_edge(entity1, entity2, actions=actions)

        # Count occurrences for size
        entity_counts[entity1] = entity_counts.get(entity1, 0) + 1
        entity_counts[entity2] = entity_counts.get(entity2, 0) + 1

    for node in G.nodes():
        G.nodes[node]['size'] = entity_counts[node]

    return G

def louvain_method(G: nx.Graph) -> dict:
    """Apply Louvain method for community detection"""
    partition = community_louvain.best_partition(G)
    return partition

def infomap_method(G: nx.Graph) -> dict:
    """Apply Infomap method for community detection"""
    im = Infomap()
    for edge in G.edges():
        im.addLink(*edge)
    im.run()
    partition = {node: im.cluster(node) for node in G.nodes()}
    return partition

def girvan_newman_method(G: nx.Graph, k: int) -> dict:
    """Apply Girvan-Newman method for community detection"""
    comp = nx.algorithms.community.centrality.girvan_newman(G)
    limited = itertools.takewhile(lambda c: len(c) <= k, comp)
    for communities in limited:
        partition = {node: cid for cid, community in enumerate(communities) for node in community}
    return partition

def label_propagation_method(G: nx.Graph) -> dict:
    """Apply Label Propagation method for community detection"""
    communities = nx.algorithms.community.label_propagation_communities(G)
    partition = {node: cid for cid, community in enumerate(communities) for node in community}
    return partition

def asyn_fluidc_method(G: nx.Graph, k: int) -> dict:
    """Apply Asynchronous Fluid Communities method for community detection"""
    communities = nx.algorithms.community.asyn_fluidc(G, k)
    partition = {node: cid for cid, community in enumerate(communities) for node in community}
    return partition

def run_community_detection(G: nx.Graph, method: str, **kwargs) -> dict:
    """Run specified community detection method on the graph"""
    if method == "louvain":
        return louvain_method(G)
    elif method == "infomap":
        return infomap_method(G)
    elif method == "girvan_newman":
        k = kwargs.get("k", 5)
        return girvan_newman_method(G, k)
    elif method == "label_propagation":
        return label_propagation_method(G)
    elif method == "asyn_fluidc":
        k = kwargs.get("k", 5)
        return asyn_fluidc_method(G, k)
    else:
        raise ValueError(f"Unsupported method: {method}")

def name_communities(G: nx.Graph, partition: dict) -> dict:
    """Name communities based on most common entities or words in each community"""
    community_texts = {}
    for node, community in partition.items():
        if community not in community_texts:
            community_texts[community] = []
        community_texts[community].append(node)

    community_names = {}
    for community, nodes in community_texts.items():
        words = [word for node in nodes for word in node.split()]
        most_common_words = Counter(words).most_common()
        community_name = " ".join([word for word, count in most_common_words[:3]])
        community_names[community] = community_name

    return community_names
