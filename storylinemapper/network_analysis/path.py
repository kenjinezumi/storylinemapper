# storylinemapper/network_analysis/path.py

import networkx as nx

def shortest_path(G, source, target):
    try:
        path = nx.shortest_path(G, source=source, target=target)
        return path
    except nx.NetworkXNoPath:
        return None

def all_pairs_shortest_path(G):
    return dict(nx.all_pairs_shortest_path(G))

def average_shortest_path_length(G):
    return nx.average_shortest_path_length(G)

def diameter(G):
    return nx.diameter(G)
