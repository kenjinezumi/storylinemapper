const data = {json_data};
const width = {width};
const height = {height};
const showActions = {show_actions};

console.log("Data:", data);
console.log("Width:", width);
console.log("Height:", height);
console.log("Show Actions:", showActions);

// Create SVG
const svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
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
    .style("stroke","none");

console.log("Arrowhead marker added");

// Simulation
const simulation = d3.forceSimulation(data.nodes)
    .force("link", d3.forceLink(data.links).id(d => d.id).distance(200))
    .force("charge", d3.forceManyBody().strength(-300))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collision", d3.forceCollide().radius(50));

console.log("Simulation created");

// Links
const link = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(data.links)
    .enter()
    .append("line")
    .attr("stroke-width", 2)
    .attr("marker-end", "url(#arrowhead)")
    .style("stroke", "#999");

console.log("Links added");

// Nodes
const node = svg.append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(data.nodes)
    .enter()
    .append("circle")
    .attr("r", 10)
    .attr("fill", "#69b3a2")
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
            .html(d.id)
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
simulation.on("tick", () => {
    link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);

    label
        .attr("x", d => d.x)
        .attr("y", d => d.y);

    if (showActions) {
        svg.selectAll(".action-label")
            .attr("x", d => (d.source.x + d.target.x) / 2)
            .attr("y", d => (d.source.y + d.target.y) / 2);
    }
});

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