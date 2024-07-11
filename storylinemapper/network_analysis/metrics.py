# storylinemapper/network_analysis/metrics.py

import networkx as nx
from . import path, centrality, structural_hole, subgraph, anomaly

def calculate_all_metrics(G):
    metrics = {}

    # Path analysis
    metrics['shortest_paths'] = dict(path.all_pairs_shortest_path(G))
    metrics['average_shortest_path_length'] = path.average_shortest_path_length(G)
    metrics['diameter'] = path.diameter(G)

    # Centrality
    metrics['degree_centrality'] = centrality.degree_centrality(G)
    metrics['betweenness_centrality'] = centrality.betweenness_centrality(G)
    metrics['closeness_centrality'] = centrality.closeness_centrality(G)
    metrics['eigenvector_centrality'] = centrality.eigenvector_centrality(G)

    # Structural holes
    metrics['bridges'] = list(structural_hole.bridges(G))
    metrics['local_bridges'] = [(u, v) for u, v, _ in structural_hole.local_bridges(G)]
    metrics['effective_size'] = structural_hole.structural_holes(G)

    # Subgraphs
    metrics['cliques'] = [list(clique) for clique in subgraph.find_cliques(G)]
    metrics['k_cores'] = list(subgraph.k_core(G, k=3).nodes())
    metrics['connected_components'] = [list(component) for component in subgraph.connected_components(G)]

    # Anomaly detection
    metrics['degree_anomaly'] = anomaly.degree_anomaly(G)
    metrics['edge_betweenness_anomaly'] = anomaly.edge_betweenness_anomaly(G)

    return metrics
