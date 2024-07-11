# storylinemapper/network_analysis/anomaly.py

import networkx as nx

def degree_anomaly(G, threshold=1.5):
    degrees = dict(G.degree())
    mean_degree = sum(degrees.values()) / len(degrees)
    anomalies = [node for node, degree in degrees.items() if degree > mean_degree * threshold]
    return anomalies

def edge_betweenness_anomaly(G, threshold=1.5):
    edge_betweenness = nx.edge_betweenness_centrality(G)
    mean_eb = sum(edge_betweenness.values()) / len(edge_betweenness)
    anomalies = [edge for edge, eb in edge_betweenness.items() if eb > mean_eb * threshold]
    return anomalies

def simple_anomaly_detection(G):
    anomalies = {}
    anomalies['high_degree'] = degree_anomaly(G)
    anomalies['high_betweenness_edges'] = edge_betweenness_anomaly(G)
    return anomalies
