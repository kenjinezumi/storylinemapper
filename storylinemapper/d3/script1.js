var data = {json_data};

var width = 960,
    height = 600;

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

var simulation = d3.forceSimulation(data.nodes)
    .force("link", d3.forceLink(data.links).id(function(d) { return d.id; }))
    .force("charge", d3.forceManyBody().strength(-200))
    .force("center", d3.forceCenter(width / 2, height / 2));

var link = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(data.links)
    .enter().append("line")
    .attr("class", "link")
    .on("click", function(event, d) {
        d3.selectAll(".link").style("stroke", "#999");
        d3.select(this).style("stroke", "#d62728");
        showTooltip(d, event.pageX, event.pageY, "Actions: " + d.actions);
    })
    .on("mouseover", function(event, d) {
        showTooltip(d, event.pageX, event.pageY, "Actions: " + d.actions);
    })
    .on("mouseout", function(d) {
        hideTooltip();
    });

var node = svg.append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(data.nodes)
    .enter().append("circle")
    .attr("class", "node")
    .attr("r", 5)
    .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended))
    .on("click", function(event, d) {
        d3.selectAll(".node").style("stroke", "#fff");
        d3.select(this).style("stroke", "#d62728");
        showTooltip(d, event.pageX, event.pageY, "Node: " + d.id);
    })
    .on("mouseover", function(event, d) {
        showTooltip(d, event.pageX, event.pageY, "Node: " + d.id);
    })
    .on("mouseout", function(d) {
        hideTooltip();
    });

var labels = svg.append("g")
    .attr("class", "labels")
    .selectAll("text")
    .data(data.nodes)
    .enter().append("text")
    .attr("class", "label")
    .text(function(d) { return d.id; });

if ({show_actions}) {
    link.append("title")
        .text(function(d) { return d.actions; });
}

simulation
    .nodes(data.nodes)
    .on("tick", ticked);

simulation.force("link")
    .links(data.links);

function ticked() {
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });

    labels
        .attr("x", function(d) { return d.x; })
        .attr("y", function(d) { return d.y; });
}

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

function showTooltip(d, x, y, text) {
    var tooltip = d3.select(".tooltip");
    if (tooltip.empty()) {
        tooltip = d3.select("body").append("div").attr("class", "tooltip");
    }
    tooltip.style("left", x + "px")
           .style("top", y + "px")
           .style("opacity", 1)
           .html(text);
}

function hideTooltip() {
    d3.select(".tooltip").style("opacity", 0);
}

d3.select("body").on("click", function(event) {
    if (event.target.tagName !== "circle" && event.target.tagName !== "line") {
        d3.selectAll(".link").style("stroke", "#999");
        d3.selectAll(".node").style("stroke", "#fff");
        hideTooltip();
    }
});
