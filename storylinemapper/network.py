# storylinemapper/network.py

import networkx as nx
from typing import List, Dict
import matplotlib.pyplot as plt
import spacy

nlp = spacy.load("en_core_web_sm")

def extract_entities(text: str) -> List[str]:
    """
    Extracts a list of named entities from the given text.

    Args:
        text (str): The input text.

    Returns:
        List[str]: A list of named entities.
    """
    doc = nlp(text)
    entities = [ent.text for ent in doc.ents if ent.label_ in ["PERSON", "ORG"]]
    return entities

def extract_relations(text: str) -> List[tuple]:
    """
    Extracts relations between named entities from the given text.

    Args:
        text (str): The input text.

    Returns:
        List[tuple]: A list of tuples representing relations (entity1, entity2).
    """
    doc = nlp(text)
    relations = []
    for sent in doc.sents:
        entities = [ent for ent in sent.ents if ent.label_ in ["PERSON", "ORG"]]
        if len(entities) > 1:
            for i in range(len(entities)):
                for j in range(i + 1, len(entities)):
                    relations.append((entities[i].text, entities[j].text))
    return relations

def generate_network(text: str) -> nx.Graph:
    """
    Generates a network graph of entities based on their relations in the text.

    Args:
        text (str): The input text.

    Returns:
        nx.Graph: A network graph of entities.
    """
    relations = extract_relations(text)
    G = nx.Graph()
    G.add_edges_from(relations)
    return G

def draw_network(G: nx.Graph, title: str = "Entity Relation Network", node_color: str = 'blue', edge_color: str = 'gray', font_size: int = 12) -> None:
    """
    Draws the entity relation network graph.

    Args:
        G (nx.Graph): The network graph to draw.
        title (str): The title of the graph.
        node_color (str): The color of the nodes.
        edge_color (str): The color of the edges.
        font_size (int): The font size of the labels.
    """
    plt.figure(figsize=(10, 8))
    pos = nx.spring_layout(G)
    nx.draw(G, pos, with_labels=True, node_color=node_color, edge_color=edge_color, font_size=font_size)
    plt.title(title)
    plt.show()

def generate_network_iframe(G: nx.Graph, title: str = "Entity Relation Network", node_color: str = 'blue', edge_color: str = 'gray', font_size: int = 12) -> str:
    """
    Generates an HTML iframe for the entity relation network graph.

    Args:
        G (nx.Graph): The network graph to draw.
        title (str): The title of the graph.
        node_color (str): The color of the nodes.
        edge_color (str): The color of the edges.
        font_size (int): The font size of the labels.

    Returns:
        str: HTML iframe containing the graph.
    """
    import plotly.graph_objects as go
    pos = nx.spring_layout(G)
    edge_x = []
    edge_y = []
    for edge in G.edges():
        x0, y0 = pos[edge[0]]
        x1, y1 = pos[edge[1]]
        edge_x.append(x0)
        edge_x.append(x1)
        edge_x.append(None)
        edge_y.append(y0)
        edge_y.append(y1)
        edge_y.append(None)

    edge_trace = go.Scatter(
        x=edge_x, y=edge_y,
        line=dict(width=0.5, color=edge_color),
        hoverinfo='none',
        mode='lines')

    node_x = []
    node_y = []
    for node in G.nodes():
        x, y = pos[node]
        node_x.append(x)
        node_y.append(y)

    node_trace = go.Scatter(
        x=node_x, y=node_y,
        mode='markers+text',
        hoverinfo='text',
        marker=dict(
            color=node_color,
            size=10,
        ),
        text=list(G.nodes()),
        textposition="top center",
        textfont=dict(size=font_size))

    fig = go.Figure(data=[edge_trace, node_trace],
                    layout=go.Layout(
                        title=title,
                        titlefont_size=16,
                        showlegend=False,
                        hovermode='closest',
                        margin=dict(b=20, l=5, r=5, t=40),
                        xaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
                        yaxis=dict(showgrid=False, zeroline=False, showticklabels=False))
                    )

    return fig.to_html(full_html=False)
