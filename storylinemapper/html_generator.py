import json
import os

def load_css(style: str) -> str:
    path = os.path.join(os.path.dirname(__file__), "styles", style + ".css")
    with open(path, "r") as file:
        return file.read()

def load_js(script: str, json_data: str, show_actions: bool, width: int, height: int, design_options: bool) -> str:
    path = os.path.join(os.path.dirname(__file__), "d3", script + ".js")
    with open(path, "r") as file:
        js_code = file.read()
    js_code = js_code.replace("{json_data}", json_data).replace("{show_actions}", str(show_actions).lower()).replace("{width}", str(width)).replace("{height}", str(height))
    if design_options:
        js_code += """
        // Add filters and design options
        function filterNodes() {
            // Implement node filtering logic
        }

        function updateDesign() {
            // Implement design update logic
        }

        function exportNetwork() {
            // Implement export logic
            const svg = document.querySelector("svg");
            const serializer = new XMLSerializer();
            const source = serializer.serializeToString(svg);
            const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "network.svg";
            link.click();
        }

        // Add event listeners for filters and design options
        document.getElementById("filter-btn").addEventListener("click", filterNodes);
        document.getElementById("update-design-btn").addEventListener("click", updateDesign);
        document.getElementById("export-btn").addEventListener("click", exportNetwork);
        """
    return js_code

def generate_html(G, partition: dict, community_names: dict, title: str = "Entity Relation Network", style: str = "style1", script: str = "script1", show_actions: bool = False, width: str = "960px", height: str = "600px", design_options: bool = False) -> str:
    nodes = [{"id": node, "size": data["size"], "count": data["size"], "community": partition[node]} for node, data in G.nodes(data=True)]
    links = [{"source": u, "target": v, "actions": data["actions"]} for u, v, data in G.edges(data=True)]
    
    data = {
        "nodes": nodes,
        "links": links,
        "community_names": community_names
    }

    json_data = json.dumps(data)
    css_content = load_css(style)
    js_content = load_js(script, json_data, show_actions, int(width[:-2]), int(height[:-2]), design_options)

    if design_options:
        additional_html = """
        <div>
            <button id="filter-btn">Filter Nodes</button>
            <button id="update-design-btn">Update Design</button>
            <button id="export-btn">Export Network</button>
            <!-- Add more UI elements for filters and design options as needed -->
        </div>
        """
    else:
        additional_html = ""

    html_template = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        {css_content}
    </style>
</head>
<body style="width: {width}; height: {height};">
    {additional_html}
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
