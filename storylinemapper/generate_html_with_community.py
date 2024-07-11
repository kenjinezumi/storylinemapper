import networkx as nx
import json
from community import run_community_detection
from html_generator import generate_html

def main():
    # Load the network
    G = nx.read_edgelist("network.edgelist", delimiter=" ")

    # Run community detection
    partition = run_community_detection(G, method="louvain")

    # Generate HTML with community detection results
    html_content = generate_html(G, partition)

    # Save the HTML to a file
    with open("output.html", "w") as f:
        f.write(html_content)

if __name__ == "__main__":
    main()
