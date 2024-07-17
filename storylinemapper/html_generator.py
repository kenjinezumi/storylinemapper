import json
import os
from storylinemapper.network_analysis.metrics import calculate_all_metrics

def load_css(style: str) -> str:
    path = os.path.join(os.path.dirname(__file__), "styles", style + ".css")
    with open(path, "r") as file:
        return file.read()

def load_js(script: str, json_data: str, show_actions: bool, width: int, height: int, design_options: bool, metrics: dict) -> str:
    path = os.path.join(os.path.dirname(__file__), "d3", script + ".js")
    with open(path, "r") as file:
        js_code = file.read()
    js_code = js_code.replace("{json_data}", json_data).replace("{show_actions}", str(show_actions).lower()).replace("{width}", str(width)).replace("{height}", str(height))
    if design_options:
        metrics_json = json.dumps(metrics)
        js_code += f"""
        const metrics = {metrics_json};
        console.log("Metrics:", metrics);

        // Add metrics display logic
        function displayMetrics() {{
            const metricsDiv = document.getElementById("metrics");
            metricsDiv.innerHTML = "<h3>Network Metrics</h3>";
            for (const [key, value] of Object.entries(metrics)) {{
                metricsDiv.innerHTML += `<p><strong>${{key}}:</strong> ${{JSON.stringify(value)}}</p>`;
            }}
        }}
        
        // displayMetrics(); // Commented out to not display all metrics
        """
    return js_code

def generate_html(G, partition: dict, community_names: dict, title: str = "Entity Relation Network", style: str = "style1", script: str = "script1", show_actions: bool = False, width: str = "960px", height: str = "600px", design_options: bool = False) -> str:
    metrics = calculate_all_metrics(G)
    nodes = [{"id": node, "size": data["size"], "count": data["size"], "community": partition[node],
              "degree_centrality": metrics["degree_centrality"].get(node, 0),
              "betweenness_centrality": metrics["betweenness_centrality"].get(node, 0),
              "closeness_centrality": metrics["closeness_centrality"].get(node, 0),
              "eigenvector_centrality": metrics["eigenvector_centrality"].get(node, 0),
              "effective_size": metrics["effective_size"].get(node, 0)} for node, data in G.nodes(data=True)]
    links = [{"source": u, "target": v, "actions": data["actions"]} for u, v, data in G.edges(data=True)]
    
    data = {
        "nodes": nodes,
        "links": links,
        "community_names": community_names
    }

    json_data = json.dumps(data)
    css_content = load_css(style)

    if design_options:
        js_content = load_js(script, json_data, show_actions, int(width[:-2]), int(height[:-2]), design_options, metrics)
        community_options = "\n".join([f'<option value="{community}">{name}</option>' for community, name in community_names.items()])
        additional_html = f"""
        <div class="top-bar">
            <button class="icon-button" id="design-btn" title="Design"><i class="material-icons">brush</i></button>
            <button class="icon-button" id="analysis-btn" title="Analysis"><i class="material-icons">analytics</i></button>
            <button class="icon-button" id="export-btn" title="Export"><i class="material-icons">save_alt</i></button>
        </div>
        <div class="option-panel" id="design-options">
            <h4>Design</h4>
            <input type="color" id="node-color-picker" value="#69b3a2"> Node Color
            <input type="range" id="node-size-slider" min="1" max="20" value="10"> Node Size
            <input type="range" id="link-width-slider" min="1" max="10" value="1"> Link Width
        </div>
        <div class="option-panel" id="analysis-options">
            <h4>Analysis</h4>
            <button id="anomaly-detection-btn">Anomaly Detection</button>
            <button id="show-cliques-btn">Show Cliques</button>
            <button id="highlight-k-core-btn">Highlight K-cores</button>
            <input type="text" id="source-node" placeholder="Source Node">
            <input type="text" id="target-node" placeholder="Target Node">
            <button id="highlight-path-btn">Highlight Shortest Path</button>
        </div>
        <div class="option-panel" id="export-options">
            <h4>Export</h4>
            <button id="export-svg-btn">Export as SVG</button>
            <button id="export-png-btn">Export as PNG</button>
        </div>
        <div id="metrics"></div>
        """
    else:
        js_content = load_js(script, json_data, show_actions, int(width[:-2]), int(height[:-2]), design_options, {})
        additional_html = ""

    html_template = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css" rel="stylesheet">
    <style>
        {css_content}
        body {{
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            height: 100vh;
        }}
        .top-bar {{
            display: flex;
            justify-content: space-around;
            align-items: center;
            background-color: #333;
            color: white;
            padding: 10px;
            height: 50px;
            flex-shrink: 0;
        }}
        .icon-button {{
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 24px;
        }}
        .option-panel {{
            display: none;
            background: white;
            border: 1px solid #ccc;
            padding: 10px;
            position: absolute;
            top: 50px;
            z-index: 1001;
        }}
        .main-content {{
            flex-grow: 1;
            position: relative;
        }}
        svg {{
            width: 100%;
            height: 100%;
        }}
    </style>
</head>
<body>
    {additional_html}
    <div class="main-content">
        <script src="https://d3js.org/d3.v6.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script>
        <script>
            console.log('Data: {json_data}');
            console.log('Show Actions: {show_actions}');
            {js_content}
        </script>
    </div>
</body>
</html>
"""

    print("Generated HTML:", html_template)  # Add this line for debugging
    return html_template
