const data = {json_data};

const showActions = {show_actions};
const width = window.innerWidth;
const height = window.innerHeight;
console.log("Data:", data);
console.log("Width:", width);
console.log("Height:", height);
console.log("Show Actions:", showActions);

// Create SVG
const svg = d3.select("body")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

console.log("SVG element created");

// Add a marker for arrowheads
svg.append("defs").append("marker")
    .attr("id", "arrowhead")
    .attr("viewBox", "-0 -5 10 10")
    .attr("refX", 13)
    .attr("refY", 0)
    .attr("orient", "auto")
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("xoverflow", "visible")
    .append("svg:path")
    .attr("d", "M 0,-5 L 10 ,0 L 0,5")
    .attr("fill", "#999")
    .style("stroke", "none");

console.log("Arrowhead marker added");

// Color scale for communities
const color = d3.scaleOrdinal(d3.schemeCategory10);

// Create community centers
const communities = d3.groups(data.nodes, d => d.community)
    .map(([, nodes]) => ({
        id: nodes[0].community,
        nodes: nodes,
        x: d3.mean(nodes, n => n.x),
        y: d3.mean(nodes, n => n.y)
    }));

// Add community labels
const communityLabels = svg.append("g")
    .attr("class", "community-labels")
    .selectAll("text")
    .data(communities)
    .enter()
    .append("text")
    .attr("class", "community-label")
    .attr("x", d => d.x)
    .attr("y", d => d.y)
    .attr("dy", -10)
    .text(d => data.community_names[d.id])
    .style("font-size", "12px") // Smaller font size
    .style("font-weight", "normal")
    .style("fill", "#999") // Less prominent color
    .style("opacity", 0.7); // Less prominent opacity

console.log("Community labels added");

// Simulation
const simulation = d3.forceSimulation(data.nodes)
    .force("link", d3.forceLink(data.links).id(d => d.id).distance(200))
    .force("charge", d3.forceManyBody().strength(-30))
    .force("collision", d3.forceCollide().radius(d => d.size * 2 + 5))
    .on("tick", ticked);

console.log("Simulation created");

// Links
const link = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(data.links)
    .enter()
    .append("line")
    .attr("stroke-width", 1) // Reduced stroke width
    .attr("marker-end", "url(#arrowhead)")
    .style("stroke", "#ccc") // Lighter stroke color
    .style("stroke-opacity", 0.6); // Reduced stroke opacity

console.log("Links added");

// Nodes
const node = svg.append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(data.nodes)
    .enter()
    .append("circle")
    .attr("r", d => d.size * 2)
    .attr("fill", d => color(d.community))
    .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

console.log("Nodes added");

// Labels
const label = svg.append("g")
    .attr("class", "labels")
    .selectAll("text")
    .data(data.nodes)
    .enter()
    .append("text")
    .attr("dy", 3)
    .attr("dx", 12)
    .text(d => d.id)
    .style("pointer-events", "none");

console.log("Labels added");

// Tooltips
const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background", "lightsteelblue")
    .style("border", "0px")
    .style("border-radius", "8px")
    .style("padding", "8px")
    .style("pointer-events", "none");

console.log("Tooltip div created");

node.on("mouseover", (event, d) => {
        tooltip
            .style("opacity", 1)
            .html(`${d.id} (Count: ${d.count}, Community: ${d.community})`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px");
    })
    .on("mouseout", () => {
        tooltip.style("opacity", 0);
    });

link.on("mouseover", (event, d) => {
        tooltip
            .style("opacity", 1)
            .html(d.actions)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px");
    })
    .on("mouseout", () => {
        tooltip.style("opacity", 0);
    });

console.log("Tooltip events added");

// Add text to links if showActions is true
if (showActions) {
    svg.append("g")
        .attr("class", "link-labels")
        .selectAll("text")
        .data(data.links)
        .enter()
        .append("text")
        .attr("class", "action-label")
        .attr("text-anchor", "middle")
        .text(d => d.actions);
    console.log("Action labels added");
}

// Simulation tick
function ticked() {
    link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    node
        .attr("cx", d => d.x = Math.max(10, Math.min(width - 10, d.x)))
        .attr("cy", d => d.y = Math.max(10, Math.min(height - 10, d.y)));

    label
        .attr("x", d => d.x)
        .attr("y", d => d.y);

    updateCommunityLabels();
}

console.log("Simulation tick added");

// Drag functions
function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
}

function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}

console.log("Drag functions added");

// Prevent label overlap
const labelSimulation = d3.forceSimulation(data.nodes)
    .force("collide", d3.forceCollide().radius(d => d.size * 2 + 15))
    .on("tick", tickedLabels);

function tickedLabels() {
    label
        .attr("x", d => d.x)
        .attr("y", d => d.y);
}

console.log("Label collision simulation added");

function updateCommunityLabels() {
    communities.forEach(c => {
        c.x = d3.mean(c.nodes, n => n.x);
        c.y = d3.mean(c.nodes, n => n.y);
    });

    communityLabels
        .attr("x", d => d.x)
        .attr("y", d => d.y);
}

console.log("Update community labels added");

// Add filters and design options if present
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

console.log("Added filters and design options");
