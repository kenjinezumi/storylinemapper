# storylinemapper/network_analysis/structural_hole.py

import networkx as nx

def bridges(G):
    return list(nx.bridges(G))

def local_bridges(G):
    # Returns the local bridges as a list of tuples (node1, node2)
    return list(nx.local_bridges(G))

def structural_holes(G):
    return nx.effective_size(G)
