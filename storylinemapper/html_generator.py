# html_generator.py

import json
import os

def load_css(style: str) -> str:
    path = os.path.join(os.path.dirname(__file__), "styles", style + ".css")
    with open(path, "r") as file:
        return file.read()

def load_js(script: str, json_data: str, show_actions: bool, width: int, height: int) -> str:
    path = os.path.join(os.path.dirname(__file__), "d3", script + ".js")
    with open(path, "r") as file:
        js_code = file.read()
    return js_code.replace("{json_data}", json_data).replace("{show_actions}", str(show_actions).lower()).replace("{width}", str(width)).replace("{height}", str(height))

def generate_html(G, partition: dict, community_names: dict, title: str = "Entity Relation Network", style: str = "style1", script: str = "script1", show_actions: bool = False, width: str = "960px", height: str = "600px") -> str:
    nodes = [{"id": node, "size": data["size"], "count": data["size"], "community": partition[node]} for node, data in G.nodes(data=True)]
    links = [{"source": u, "target": v, "actions": data["actions"]} for u, v, data in G.edges(data=True)]
    
    data = {
        "nodes": nodes,
        "links": links,
        "community_names": community_names
    }

    json_data = json.dumps(data)
    css_content = load_css(style)
    js_content = load_js(script, json_data, show_actions, int(width[:-2]), int(height[:-2]))

    html_template = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        {css_content}
    </style>
</head>
<body  style="width: {width}; height: {height};">
    <div>
        <script src="https://d3js.org/d3.v6.min.js"></script>
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
