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

// Default color set
let currentColorSet = colorSets[0];

// Function to update colors based on selected color set
function updateColors() {
    const colorSetIndex = document.getElementById("color-set").value;
    currentColorSet = colorSets[colorSetIndex];
    color.domain(d3.range(currentColorSet.length));
    color.range(currentColorSet);
    updateDesign();
}

// Color scale for communities
const color = d3.scaleOrdinal(currentColorSet);

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
let simulation = d3.forceSimulation(data.nodes);

console.log("Simulation created");

// Links
let link = svg.append("g")
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
let node = svg.append("g")
    .attr("class", "nodes")
    .selectAll("path")
    .data(data.nodes)
    .enter()
    .append("path")
    .attr("d", d3.symbol().type(d3.symbolCircle))
    .attr("fill", d => color(d.community))
    .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended))
    .on("click", highlightNode);

console.log("Nodes added");

// Labels
let label = svg.append("g")
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
        .attr("transform", d => `translate(${d.x},${d.y})`);

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
    const nodeShape = document.getElementById("node-shape-select").value;
    const nodeSizeOption = document.getElementById("node-size-select").value;
    const edgeStyle = document.getElementById("edge-style-select").value;
    const labelOption = document.getElementById("node-label-select").value;
    const linkWidth = document.getElementById("link-width-slider").value;

    let symbolType;
    if (nodeShape === "circle") {
        symbolType = d3.symbolCircle;
    } else if (nodeShape === "square") {
        symbolType = d3.symbolSquare;
    } else if (nodeShape === "triangle") {
        symbolType = d3.symbolTriangle;
    }

    let nodeSizeScale;
    if (nodeSizeOption === "fixed") {
        nodeSizeScale = d3.scaleLinear().domain([1, 10]).range([64, 64]);
    } else if (nodeSizeOption === "degree") {
        nodeSizeScale = d3.scaleLinear().domain(d3.extent(data.nodes, d => d.degree_centrality)).range([16, 256]);
    } else if (nodeSizeOption === "importance") {
        nodeSizeScale = d3.scaleLinear().domain(d3.extent(data.nodes, d => d.importance)).range([16, 256]);
    } else if (nodeSizeOption === "centrality") {
        nodeSizeScale = d3.scaleLinear().domain(d3.extent(data.nodes, d => d.eigenvector_centrality)).range([16, 256]);
    }

    node.attr("d", d3.symbol().type(symbolType).size(d => nodeSizeScale(d.size)));

    if (edgeStyle === "solid") {
        link.style("stroke-dasharray", "none");
    } else if (edgeStyle === "dashed") {
        link.style("stroke-dasharray", "5,5");
    } else if (edgeStyle === "dotted") {
        link.style("stroke-dasharray", "2,2");
    } else if (edgeStyle === "curved") {
        link.attr("d", d => `M${d.source.x},${d.source.y} A${d.distance},${d.distance} 0 0,1 ${d.target.x},${d.target.y}`);
    } else if (edgeStyle === "straight") {
        link.attr("d", d => `M${d.source.x},${d.source.y} L${d.target.x},${d.target.y}`);
    }

    link.style("stroke-width", linkWidth);

    label.style("display", d => {
        if (labelOption === "all") {
            return "block";
        } else if (labelOption === "key" && d.key) {
            return "block";
        } else if (labelOption === "zoom" && d.zoomLevel >= zoomLevel) {
            return "block";
        } else {
            return "none";
        }
    });

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

    tooltip.innerHTML = "This is the Design button";
    tooltip.style.left = (event.pageX + 10) + "px";
    tooltip.style.top = (event.pageY - 10) + "px";
    tooltip.style.opacity = 1;
});

document.getElementById("design-btn").addEventListener("mouseout", function() {
    const tooltip = document.getElementById("tooltip");
    if (tooltip) {
        tooltip.style.opacity = 0;
    }
});

document.getElementById("analysis-btn").addEventListener("mouseover", function() {
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

    tooltip.innerHTML = "This is the Analysis button";
    tooltip.style.left = (event.pageX + 10) + "px";
    tooltip.style.top = (event.pageY - 10) + "px";
    tooltip.style.opacity = 1;
});

document.getElementById("analysis-btn").addEventListener("mouseout", function() {
    const tooltip = document.getElementById("tooltip");
    if (tooltip) {
        tooltip.style.opacity = 0;
    }
});

document.getElementById("export-btn").addEventListener("mouseover", function() {
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

    tooltip.innerHTML = "This is the Export button";
    tooltip.style.left = (event.pageX + 10) + "px";
    tooltip.style.top = (event.pageY - 10) + "px";
    tooltip.style.opacity = 1;
});

document.getElementById("export-btn").addEventListener("mouseout", function() {
    const tooltip = document.getElementById("tooltip");
    if (tooltip) {
        tooltip.style.opacity = 0;
    }
});

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
document.getElementById("layout-select").addEventListener("change", updateLayout);
document.getElementById("node-shape-select").addEventListener("change", updateDesign);
document.getElementById("node-size-select").addEventListener("change", updateDesign);
document.getElementById("node-label-select").addEventListener("change", updateDesign);
document.getElementById("edge-style-select").addEventListener("change", updateDesign);

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
    if (!event.target.closest(".nodes path") && !event.target.closest(".info-icon")) {
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
                d3.select(`path[data-id='${node.id}']`)
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
            d3.select(`path[data-id='${nodeId}']`)
                .attr("stroke", "red")
                .attr("stroke-width", 2);
        });
    });
    console.log("Cliques shown");
}

// Ensure ngraph libraries are loaded before using them
function loadScript(url, callback) {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.onload = callback;
    script.src = url;
    document.head.appendChild(script);
}

function ensureNgraphLibraries(callback) {
    const libraries = [
        { url: "https://unpkg.com/ngraph.graph@1.0.0/dist/ngraph.graph.min.js" },
        { url: "https://unpkg.com/ngraph.forcelayout@1.1.0/dist/ngraph.forcelayout.min.js" },
        { url: "https://unpkg.com/ngraph.yifanhulayout@0.1.1/dist/ngraph.yifanhulayout.min.js" },
        { url: "https://unpkg.com/ngraph.openord@0.0.2/dist/ngraph.openord.min.js" },
        { url: "https://unpkg.com/ngraph.noack@1.1.0/dist/ngraph.noack.min.js" },
        { url: "https://unpkg.com/ngraph.kamada@0.0.1/dist/ngraph.kamada.min.js" },
        { url: "https://unpkg.com/ngraph.gridlayout@1.1.0/dist/ngraph.gridlayout.min.js" },
        { url: "https://unpkg.com/ngraph.randomlayout@0.0.2/dist/ngraph.randomlayout.min.js" },
        { url: "https://unpkg.com/ngraph.isomap@0.1.0/dist/ngraph.isomap.min.js" },
        { url: "https://unpkg.com/ngraph.mds@1.1.0/dist/ngraph.mds.min.js" },
        { url: "https://unpkg.com/ngraph.sugiyama@0.0.3/dist/ngraph.sugiyama.min.js" },
    ];
    let loaded = 0;

    function loadNext() {
        if (loaded >= libraries.length) {
            callback();
        } else {
            loadScript(libraries[loaded].url, function () {
                loaded++;
                loadNext();
            });
        }
    }

    loadNext();
}

// Function to apply layout
function applyNgraphLayout(layoutType) {
    ensureNgraphLibraries(function () {
        const graph = ngraph.graph();

        data.nodes.forEach(node => graph.addNode(node.id));
        data.links.forEach(link => graph.addLink(link.source, link.target));

        let layout;

        switch (layoutType) {
            case "forceatlas2":
                layout = ngraph.forcelayout(graph, { iterationsPerRender: 1 });
                break;
            case "yifanhulayout":
                layout = ngraph.yifanhulayout(graph);
                break;
            case "fruchtermanreingold":
                layout = ngraph.forcelayout(graph);
                break;
            case "openord":
                layout = ngraph.openord(graph);
                break;
            case "noack":
                layout = ngraph.noack(graph);
                break;
            case "kamada":
                layout = ngraph.kamada(graph);
                break;
            case "grid":
                layout = ngraph.gridlayout(graph);
                break;
            case "random":
                layout = ngraph.randomlayout(graph);
                break;
            case "isomap":
                layout = ngraph.isomap(graph);
                break;
            case "mds":
                layout = ngraph.mds(graph);
                break;
            case "sugiyama":
                layout = ngraph.sugiyama(graph);
                break;
        }

        function runLayout() {
            for (let i = 0; i < 10; i++) layout.step();
            data.nodes.forEach(node => {
                const pos = layout.getNodePosition(node.id);
                node.x = pos.x;
                node.y = pos.y;
            });
            ticked();
            if (layout.isStable()) {
                cancelAnimationFrame(runLayout);
            } else {
                requestAnimationFrame(runLayout);
            }
        }

        runLayout();
    });
}

// Function to apply Circular layout
function applyCircularLayout() {
    const radius = Math.min(width, height) / 2 - 50;
    const angleStep = (2 * Math.PI) / data.nodes.length;

    data.nodes.forEach((node, index) => {
        node.x = width / 2 + radius * Math.cos(index * angleStep);
        node.y = height / 2 + radius * Math.sin(index * angleStep);
    });

    ticked();
}

// Function to apply Radial Axis layout
function applyRadialAxisLayout() {
    const radius = Math.min(width, height) / 2 - 50;
    const angleStep = (2 * Math.PI) / data.nodes.length;
    const center = { x: width / 2, y: height / 2 };

    data.nodes.forEach((node, index) => {
        const angle = index * angleStep;
        node.x = center.x + radius * Math.cos(angle);
        node.y = center.y + radius * Math.sin(angle);
    });

    ticked();
}

// Function to apply D3 force layout
function applyD3ForceLayout() {
    simulation
        .force("link", d3.forceLink(data.links).id(d => d.id).distance(200))
        .force("charge", d3.forceManyBody().strength(-30))
        .force("collision", d3.forceCollide().radius(d => d.size * 2 + 5))
        .on("tick", ticked)
        .alpha(1)
        .restart();
}

// Function to update layout
function updateLayout() {
    const layout = document.getElementById("layout-select").value;
    if (layout === "forceatlas2" || layout === "yifanhulayout" || layout === "fruchtermanreingold" || layout === "openord" || layout === "noack" || layout === "kamada" || layout === "grid" || layout === "random" || layout === "isomap" || layout === "mds" || layout === "sugiyama") {
        applyNgraphLayout(layout);
    } else if (layout === "circular") {
        applyCircularLayout();
    } else if (layout === "radialaxis") {
        applyRadialAxisLayout();
    } else {
        applyD3ForceLayout();
    }
}

document.getElementById("layout-select").addEventListener("change", updateLayout);

// Default initialization with D3 force layout
applyD3ForceLayout();
