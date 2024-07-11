# storylinemapper/network_analysis/subgraph.py

import networkx as nx

def find_cliques(G):
    return list(nx.find_cliques(G))

def k_core(G, k):
    return nx.k_core(G, k=k)

def k_shell(G, k):
    return nx.k_shell(G, k=k)

def connected_components(G):
    return list(nx.connected_components(G))
