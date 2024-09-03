import networkx as nx
from . import path, centrality, structural_hole, subgraph, anomaly
from networkx.algorithms import clique, core, components

def calculate_all_metrics(G):
    metrics = {}

    # Path analysis
    shortest_paths = dict(path.all_pairs_shortest_path(G))
    metrics['shortest_paths'] = shortest_paths

    # Initialize an empty set to store edges that are part of any shortest path
    shortest_path_edges = set()

    # Identify edges in shortest paths
    for source in shortest_paths:
        for target in shortest_paths[source]:
            if source != target:  # Ignore self-loops
                path_edges = list(nx.utils.pairwise(shortest_paths[source][target]))
                shortest_path_edges.update(path_edges)

    # Store shortest path edges in the metrics
    metrics['shortest_path_edges'] = list(shortest_path_edges)

    if nx.is_connected(G):
        metrics['average_shortest_path_length'] = path.average_shortest_path_length(G)
        metrics['diameter'] = path.diameter(G)
    else:
        # Handle disconnected graphs by calculating metrics for each connected component
        components_list = list(components.connected_components(G))
        avg_path_lengths = []
        diameters = []
        for component in components_list:
            subgraph = G.subgraph(component)
            avg_path_lengths.append(nx.average_shortest_path_length(subgraph))
            diameters.append(nx.diameter(subgraph))
        metrics['average_shortest_path_length'] = sum(avg_path_lengths) / len(avg_path_lengths)
        metrics['diameter'] = max(diameters)

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
    metrics['cliques'] = [list(clique) for clique in clique.find_cliques(G)]
    metrics['k_cores'] = list(core.k_core(G, k=3).nodes())
    metrics['connected_components'] = [list(c) for c in components_list]

    # Anomaly detection
    metrics['degree_anomaly'] = anomaly.degree_anomaly(G)
    metrics['edge_betweenness_anomaly'] = anomaly.edge_betweenness_anomaly(G)

    return metrics
