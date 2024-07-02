# storylinemapper/network.py

import networkx as nx
from typing import List, Tuple
import spacy
import json
import os

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
    for entity1, entity2, actions in relations:
        if G.has_edge(entity1, entity2):
            G[entity1][entity2]['actions'] += f", {actions}"
        else:
            G.add_edge(entity1, entity2, actions=actions)
    return G

def load_css(style: str) -> str:
    path = os.path.join(os.path.dirname(__file__), "styles", style + ".css")
    with open(path, "r") as file:
        return file.read()

def load_js(script: str, json_data: str, show_actions: bool) -> str:
    path = os.path.join(os.path.dirname(__file__), "d3", script + ".js")
    with open(path, "r") as file:
        js_code = file.read()
    return js_code.replace("{json_data}", json_data).replace("{show_actions}", str(show_actions).lower())

def generate_network_iframe(G: nx.Graph, title: str = "Entity Relation Network", style: str = "style1", script: str = "script1", show_actions: bool = False) -> str:
    nodes = [{"id": node} for node in G.nodes()]
    links = [{"source": u, "target": v, "actions": data["actions"]} for u, v, data in G.edges(data=True)]
    
    data = {
        "nodes": nodes,
        "links": links
    }

    json_data = json.dumps(data)
    css_content = load_css(style)
    js_content = load_js(script, json_data, show_actions)

    html_template = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        {css_content}
    </style>
</head>
<body>
    <script src="https://d3js.org/d3.v6.min.js"></script>
    <script>
        {js_content}
    </script>
</body>
</html>
    """
    return html_template
