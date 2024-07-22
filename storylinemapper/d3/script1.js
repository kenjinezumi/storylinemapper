const data = {json_data};

const showActions = {show_actions};
const width = window.innerWidth;
const height = window.innerHeight - 50; // Adjust height to accommodate the top bar
console.log("Data:", data);
console.log("Width:", width);
console.log("Height:", height);
console.log("Show Actions:", showActions);

// Predefined color sets
const colorSets = [
    ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00", "#ffff33", "#a65628", "#f781bf", "#999999", "#66c2a5"],
    ["#1b9e77", "#d95f02", "#7570b3", "#e7298a", "#66a61e", "#e6ab02", "#a6761d", "#666666", "#a6cee3", "#1f78b4"],
    ["#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462", "#b3de69", "#fccde5", "#d9d9d9", "#bc80bd"],
    ["#d73027", "#fc8d59", "#fee08b", "#d9ef8b", "#91cf60", "#1a9850", "#d73027", "#313695", "#4575b4", "#91bfdb"],
    ["#003f5c", "#58508d", "#bc5090", "#ff6361", "#ffa600", "#d45087", "#f95d6a", "#ff7c43", "#665191", "#a05195"],
    ["#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99", "#e31a1c", "#fdbf6f", "#ff7f00", "#cab2d6", "#6a3d9a"],
    ["#b3e2cd", "#fdcdac", "#cbd5e8", "#f4cae4", "#e6f5c9", "#fff2ae", "#f1e2cc", "#cccccc", "#8c96c6", "#b3cde3"],
    ["#7fc97f", "#beaed4", "#fdc086", "#ffff99", "#386cb0", "#f0027f", "#bf5b17", "#666666", "#99d8c9", "#66c2a4"],
    ["#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99", "#e31a1c", "#fdbf6f", "#ff7f00", "#cab2d6", "#6a3d9a"],
    ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00", "#ffff33", "#a65628", "#f781bf", "#999999", "#66c2a5"]
];

// Create SVG
const svg = d3.select(".main-content")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", '0 0 ' + width + ' ' + height)
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

// Default color set
let currentColorSet = colorSets[0];

// Function to update colors based on selected color set
function updateColors() {
    const colorSetIndex = document.getElementById("color-set").value;
    currentColorSet = colorSets[colorSetIndex];
    updateDesign();
}

// Color scale for communities
const color = d3.scaleOrdinal(currentColorSet);

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
        .on("end", dragended))
    .on("click", highlightNode);

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
    .style("pointer-events", "auto");

console.log("Tooltip div created");

// Info tooltip
const infoTooltip = d3.select("body")
    .append("div")
    .attr("class", "info-tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background", "lightyellow")
    .style("border", "1px solid #ccc")
    .style("border-radius", "8px")
    .style("padding", "8px")
    .style("pointer-events", "none")
    .style("font-size", "10px")
    .style("width", "200px");

function showInfo(event, text) {
    infoTooltip
        .style("opacity", 1)
        .html(text)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 10) + "px");
}

function hideInfo() {
    infoTooltip.style("opacity", 0);
}

node.on("mouseover", (event, d) => {
    if (!d3.select(".tooltip").classed("sticky")) {
        showTooltip(event, d);
    }
})
.on("mouseout", () => {
    if (!d3.select(".tooltip").classed("sticky")) {
        hideTooltip();
    }
});

link.on("mouseover", (event, d) => {
    if (!d3.select(".tooltip").classed("sticky")) {
        tooltip
            .style("opacity", 1)
            .html(d.actions)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px");
    }
})
.on("mouseout", () => {
    if (!d3.select(".tooltip").classed("sticky")) {
        tooltip.style("opacity", 0);
    }
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
    const nodeSize = +document.getElementById("node-size-slider").value;
    const linkWidth = +document.getElementById("link-width-slider").value;

    node.attr("fill", d => currentColorSet[d.community % currentColorSet.length])
        .attr("r", nodeSize);

    link.attr("stroke-width", linkWidth);

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

// Add event listener for filters and design options on hover

document.getElementById("design-btn").addEventListener("mouseover", function() {
    // Create a tooltip element if it doesn't already exist
    let tooltip = document.getElementById("tooltip");
    if (!tooltip) {
        tooltip = document.createElement("div");
        tooltip.id = "tooltip";
        tooltip.style.position = "absolute";
        tooltip.style.background = "lightsteelblue";
        tooltip.style.border = "1px solid #ccc";
        tooltip.style.borderRadius = "8px";
        tooltip.style.padding = "8px";
        tooltip.style.pointerEvents = "none";
        tooltip.style.opacity = 0;
        document.body.appendChild(tooltip);
    }

    // Set the tooltip content
    tooltip.innerHTML = "This is the Design button";

    // Position the tooltip
    tooltip.style.left = (event.pageX + 10) + "px";
    tooltip.style.top = (event.pageY - 10) + "px";
    tooltip.style.opacity = 1;
});

document.getElementById("design-btn").addEventListener("mouseout", function() {
    // Hide the tooltip when mouse leaves
    const tooltip = document.getElementById("tooltip");
    if (tooltip) {
        tooltip.style.opacity = 0;
    }
});

// Add event listener for analysis on hover

document.getElementById("analysis-btn").addEventListener("mouseover", function() {
    // Create a tooltip element if it doesn't already exist
    let tooltip = document.getElementById("tooltip");
    if (!tooltip) {
        tooltip = document.createElement("div");
        tooltip.id = "tooltip";
        tooltip.style.position = "absolute";
        tooltip.style.background = "lightsteelblue";
        tooltip.style.border = "1px solid #ccc";
        tooltip.style.borderRadius = "8px";
        tooltip.style.padding = "8px";
        tooltip.style.pointerEvents = "none";
        tooltip.style.opacity = 0;
        document.body.appendChild(tooltip);
    }

    // Set the tooltip content
    tooltip.innerHTML = "This is the Analysis button";

    // Position the tooltip
    tooltip.style.left = (event.pageX + 10) + "px";
    tooltip.style.top = (event.pageY - 10) + "px";
    tooltip.style.opacity = 1;
});

document.getElementById("analysis-btn").addEventListener("mouseout", function() {
    // Hide the tooltip when mouse leaves
    const tooltip = document.getElementById("tooltip");
    if (tooltip) {
        tooltip.style.opacity = 0;
    }
});

// Add event listener for export on hover

document.getElementById("export-btn").addEventListener("mouseover", function() {
    // Create a tooltip element if it doesn't already exist
    let tooltip = document.getElementById("tooltip");
    if (!tooltip) {
        tooltip = document.createElement("div");
        tooltip.id = "tooltip";
        tooltip.style.position = "absolute";
        tooltip.style.background = "lightsteelblue";
        tooltip.style.border = "1px solid #ccc";
        tooltip.style.borderRadius = "8px";
        tooltip.style.padding = "8px";
        tooltip.style.pointerEvents = "none";
        tooltip.style.opacity = 0;
        document.body.appendChild(tooltip);
    }

    // Set the tooltip content
    tooltip.innerHTML = "This is the Export button";

    // Position the tooltip
    tooltip.style.left = (event.pageX + 10) + "px";
    tooltip.style.top = (event.pageY - 10) + "px";
    tooltip.style.opacity = 1;
});

document.getElementById("export-btn").addEventListener("mouseout", function() {
    // Hide the tooltip when mouse leaves
    const tooltip = document.getElementById("tooltip");
    if (tooltip) {
        tooltip.style.opacity = 0;
    }
});

// Add event listeners for download options
document.getElementById("design-btn").addEventListener("click", function() {
    togglePanel("design-options");
});
document.getElementById("analysis-btn").addEventListener("click", function() {
    togglePanel("analysis-options");
});
document.getElementById("export-btn").addEventListener("click", function() {
    togglePanel("export-options");
});
document.getElementById("highlight-path-btn").addEventListener("click", highlightShortestPath);
document.getElementById("highlight-k-core-btn").addEventListener("click", highlightKCores);
document.getElementById("show-cliques-btn").addEventListener("click", showCliques);

document.getElementById("color-set").addEventListener("change", updateColors);
document.getElementById("node-size-slider").addEventListener("input", updateDesign);
document.getElementById("link-width-slider").addEventListener("input", updateDesign);

console.log("Added filters and design options");

function togglePanel(panelId) {
    const panel = document.getElementById(panelId);
    const isVisible = panel.style.display === "block";
    document.querySelectorAll('.option-panel').forEach(p => p.style.display = "none");
    if (!isVisible) {
        panel.style.display = "block";
    }
}

// Add logic for highlighting shortest path
function highlightShortestPath() {
    const sourceNode = document.getElementById("source-node").value;
    const targetNode = document.getElementById("target-node").value;

    if (!sourceNode || !targetNode) {
        alert("Please specify both source and target nodes.");
        return;
    }

    const shortestPath = findShortestPath(sourceNode, targetNode);
    if (!shortestPath) {
        alert(`No path found between ${sourceNode} and ${targetNode}.`);
        return;
    }

    link.style("stroke", l => shortestPath.includes(l.source.id) && shortestPath.includes(l.target.id) ? "red" : "#ccc")
        .style("stroke-width", l => shortestPath.includes(l.source.id) && shortestPath.includes(l.target.id) ? 2 : 1);
}

function findShortestPath(source, target) {
    const graph = new Map();
    data.nodes.forEach(node => graph.set(node.id, []));
    data.links.forEach(link => {
        graph.get(link.source).push(link.target);
        graph.get(link.target).push(link.source);
    });

    const queue = [source];
    const visited = new Set();
    const predecessor = {};

    while (queue.length > 0) {
        const current = queue.shift();
        if (current === target) {
            const path = [];
            let step = target;
            while (step !== source) {
                path.unshift(step);
                step = predecessor[step];
            }
            path.unshift(source);
            return path;
        }
        graph.get(current).forEach(neighbor => {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                predecessor[neighbor] = current;
                queue.push(neighbor);
            }
        });
    }

    return null;
}

console.log("Shortest path functionality added");

// Highlight node function
function highlightNode(event, d) {
    const selectedCommunity = d.community;
    node.style("opacity", o => o.community === selectedCommunity ? 1 : 0.1);
    link.style("opacity", l => l.source.community === selectedCommunity && l.target.community === selectedCommunity ? 1 : 0.1);
    label.style("opacity", o => o.community === selectedCommunity ? 1 : 0.1);
    showTooltip(event, d);
    d3.select(".tooltip").classed("sticky", true);
}

document.addEventListener("click", function(event) {
    if (!event.target.closest(".nodes circle") && !event.target.closest(".info-icon")) {
        node.style("opacity", 1);
        link.style("opacity", 1);
        label.style("opacity", 1);
        tooltip.style("opacity", 0);
        d3.select(".tooltip").classed("sticky", false);
    }
});

console.log("Highlight node functionality added");

function showTooltip(event, d) {
    tooltip
        .style("opacity", 1)
        .html(`
            <strong>${d.id}</strong><br>
            Count: ${d.count}<br>
            Community: ${d.community}<br>
            Degree Centrality: ${d.degree_centrality.toFixed(4)}<span class="info-icon" id="degree-info" title="Degree Centrality: measures the number of direct connections a node has.">&#x2753;</span><br>
            Betweenness Centrality: ${d.betweenness_centrality.toFixed(4)}<span class="info-icon" id="betweenness-info" title="Betweenness Centrality: indicates how often a node appears on shortest paths between other nodes.">&#x2753;</span><br>
            Closeness Centrality: ${d.closeness_centrality.toFixed(4)}<span class="info-icon" id="closeness-info" title="Closeness Centrality: reflects how close a node is to all other nodes in the network.">&#x2753;</span><br>
            Eigenvector Centrality: ${d.eigenvector_centrality.toFixed(4)}<span class="info-icon" id="eigenvector-info" title="Eigenvector Centrality: measures a node's influence based on the influence of its neighbors.">&#x2753;</span><br>
            Effective Size: ${d.effective_size.toFixed(4)}<span class="info-icon" id="size-info" title="Effective Size: represents the number of non-redundant contacts a node has.">&#x2753;</span>
        `)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 10) + "px");

    // Add event listeners for info icons
    d3.select("#degree-info").on("mouseover", (e) => showInfo(e, "Degree Centrality: measures the number of direct connections a node has."));
    d3.select("#betweenness-info").on("mouseover", (e) => showInfo(e, "Betweenness Centrality: indicates how often a node appears on shortest paths between other nodes."));
    d3.select("#closeness-info").on("mouseover", (e) => showInfo(e, "Closeness Centrality: reflects how close a node is to all other nodes in the network."));
    d3.select("#eigenvector-info").on("mouseover", (e) => showInfo(e, "Eigenvector Centrality: measures a node's influence based on the influence of its neighbors."));
    d3.select("#size-info").on("mouseover", (e) => showInfo(e, "Effective Size: represents the number of non-redundant contacts a node has."));

    d3.selectAll(".info-icon").on("mouseout", hideInfo);
}

function hideTooltip() {
    if (!d3.select(".tooltip").classed("sticky")) {
        tooltip.style("opacity", 0);
    }
}

// Highlight K-cores function
function highlightKCores() {
    const kCores = d3.group(data.nodes, d => d.k_core);
    kCores.forEach((nodes, k) => {
        if (k > 1) {
            nodes.forEach(node => {
                d3.select(`circle[data-id='${node.id}']`)
                    .attr("fill", d3.rgb(color(node.community)).darker(k - 1));
            });
        }
    });
    console.log("K-cores highlighted");
}

// Show Cliques function
function showCliques() {
    const cliques = data.cliques;
    cliques.forEach(clique => {
        clique.forEach(nodeId => {
            d3.select(`circle[data-id='${nodeId}']`)
                .attr("stroke", "red")
                .attr("stroke-width", 2);
        });
    });
    console.log("Cliques shown");
}
