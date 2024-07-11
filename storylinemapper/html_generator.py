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
            const communityFilter = document.getElementById("community-filter").value;
            const excludeNodes = document.getElementById("exclude-nodes").value.split(",").map(d => d.trim());

            node.style("opacity", d => (communityFilter === "all" || d.community === +communityFilter) && !excludeNodes.includes(d.id) ? 1 : 0.1);
            link.style("opacity", d => (communityFilter === "all" || d.source.community === +communityFilter) && (communityFilter === "all" || d.target.community === +communityFilter) && !excludeNodes.includes(d.source.id) && !excludeNodes.includes(d.target.id) ? 1 : 0.1);
            label.style("opacity", d => (communityFilter === "all" || d.community === +communityFilter) && !excludeNodes.includes(d.id) ? 1 : 0.1);
        }

        function updateDesign() {
            const nodeColor = document.getElementById("node-color-picker").value;
            const nodeSize = +document.getElementById("node-size-slider").value;
            const linkWidth = +document.getElementById("link-width-slider").value;
            const forceType = document.getElementById("force-type-selector").value;

            node.attr("fill", nodeColor)
                .attr("r", nodeSize);

            link.attr("stroke-width", linkWidth);

            simulation.force("charge").strength(forceType === "strong" ? -50 : forceType === "weak" ? -10 : -30);
            simulation.alpha(1).restart();
        }

        function exportNetwork(format) {
            const svgElement = document.querySelector("svg");
            const serializer = new XMLSerializer();
            const source = serializer.serializeToString(svgElement);

            if (format === 'svg') {
                const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = "network.svg";
                link.click();
            } else if (format === 'png') {
                const canvas = document.createElement("canvas");
                const context = canvas.getContext("2d");
                const img = new Image();
                img.onload = function() {
                    canvas.width = svgElement.clientWidth;
                    canvas.height = svgElement.clientHeight;
                    context.drawImage(img, 0, 0);
                    const url = canvas.toDataURL("image/png");
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = "network.png";
                    link.click();
                };
                img.src = 'data:image/svg+xml;base64,' + btoa(source);
            }
        }

        // Add event listeners for filters and design options
        document.getElementById("filter-btn").addEventListener("click", filterNodes);
        document.getElementById("update-design-btn").addEventListener("click", updateDesign);
        document.getElementById("export-svg-btn").addEventListener("click", function() { exportNetwork('svg'); });
        document.getElementById("export-png-btn").addEventListener("click", function() { exportNetwork('png'); });
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
        community_options = "\n".join([f'<option value="{community}">{name}</option>' for community, name in community_names.items()])
        additional_html = f"""
        <div>
            <button id="filter-btn">Filter Nodes</button>
            <button id="update-design-btn">Update Design</button>
            <button id="export-svg-btn">Export as SVG</button>
            <button id="export-png-btn">Export as PNG</button>
            <input type="color" id="node-color-picker" value="#69b3a2"> Node Color
            <input type="range" id="node-size-slider" min="1" max="20" value="10"> Node Size
            <input type="range" id="link-width-slider" min="1" max="10" value="1"> Link Width
            <select id="force-type-selector">
                <option value="default">Default Forces</option>
                <option value="strong">Strong Forces</option>
                <option value="weak">Weak Forces</option>
            </select>
            <select id="community-filter">
                <option value="all">All Communities</option>
                {community_options}
            </select>
            <input type="text" id="exclude-nodes" placeholder="Exclude Nodes (comma separated)">
            <input type="text" id="node-comments" placeholder="Add Comment to Node">
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
