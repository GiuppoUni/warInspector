var PcaScatterManager = function() {
    // var country_selected = ["ITA"];


    var svgs = [];
    var zooms = [];
    // function 
    var drawChart = function(dataset, type) {
        // console.log("Drawing pca", dataset, type)
        id = ""
        if (type === "IMP")
            id = "#pca-import-col"
        else if (type === "EXP")
            id = "#pca-export-col"
        else
            alert("ERROR from post")

        // set the dimensions and margins of the graph
        var margin = { top: 10, right: 30, bottom: 30, left: 60 },
            width = 300 - margin.left - margin.right,
            height = 290 - margin.top - margin.bottom;
        // append the svg object to the body of the page
        var svg = d3v4.select(id)
            .append("svg")
            .attr("class", "pca-svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")")
        svgs.push(svg)

        // Pan and zoom
        var zoom = d3v4.zoom()
            .scaleExtent([.5, 20])
            .extent([
                [0, 0],
                [width, height]
            ])
            .on("zoom", zoomed);

        zooms.push(zoom)

        svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .style("fill", "none")
            .style("pointer-events", "all")
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
            .call(zoom);


        //Read the data

        // Add X axis
        var x = d3v4.scaleLinear()
            .domain([0, 0])
            .range([0, width]);
        var xAxis = d3v4.axisBottom(x)
        var gX = svg.append("g")
            .attr("class", "myXaxis") // Note that here we give a class to the X axis, to be able to call it later and modify it
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .attr("opacity", "0")

        // Add Y axis
        var y = d3v4.scaleLinear()
            .domain([-5, 5])
            .range([height, 0]);

        var yAxis = d3v4.axisLeft(y)
        var gY = svg.append("g")
            .call(yAxis);

        // Add dots
        var scatter = svg.append('g')
            .selectAll("dot")
            .data(dataset)
            .enter()
            .append("circle")
            .attr("cx", function(d) {
                // console.log(x(parseFloat(d[0])), parseFloat(d[0]))
                return x(parseFloat(d[0]));
            })
            .attr("cy", function(d) { return y(parseFloat(d[1])); })
            .attr("r", function(d) { return !d[4] ? 3 : 4.5 })
            .style("fill", function(d) {
                // console.log(d[4])
                if (d[4] === false)
                    return type === "IMP" ? "#d00101" : "#009344"
                else
                    return "#f6ff00"

            })
            .style("stroke", "black")

        var tip = d3v4.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {

                return '<strong>' + d[3] + '</strong>';
            })
        svg.call(tip);

        d3v4.selectAll("circle")
            .on('mouseover', d => tip.show(d))
            .on('mouseout', tip.hide)

        // new X axis
        x.domain([-5, 5])
        svg.select(".myXaxis")
            .transition()
            .duration(2000)
            .attr("opacity", "1")
            .call(d3v4.axisBottom(x));

        svg.selectAll("circle")
            .transition()
            .delay(function(d, i) { return (i * 3) })
            .duration(2000)
            .attr("cx", function(d) {
                return x(parseFloat(d[0]));
            })
            .attr("cy", function(d) {
                return y(parseFloat(d[1]));
            })

        svg.append("text").transition()
            .attr("id", "pca-" + type + "-title")
            .duration(1000)
            .text("PCA")
            .attr("x", width - 10)
            .attr("y", 15)
            .style("font-family", "Ubuntu")
            .style("font-size", "20px")
            .attr("fill", "white")

        var tipText = d3v4.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
                if (type === "IMP")
                    return '<strong> PCA graph considering for each country: Imported units, Refugees, Army dimensions, Population and GDP </strong>';
                else if (type === "EXP")
                    return '<strong> PCA graph considering for each country: Exported units, Refugees, Army dimensions, Population and GDP </strong>';
                else
                    return "errre"
                console.log("tip")
            })
        svg.call(tipText);

        d3v4.selectAll("#pca-" + type + "-title")
            .on('mouseover', tipText.show)
            .on('mouseout', tipText.hide)


        // Add one dot in the legend for each name.
        var size = 10
        var allgroups = ["selected", "other countries"]
        svg.selectAll("myrect")
            .data(allgroups)
            .enter()
            .append("circle")
            .attr("cx", 0 + 35)
            .attr("cy", function(d, i) { return 0 + i * (size + 5) }) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("r", 3)
            .style("fill", function(d) {
                if (d != "selected")
                    return type === "IMP" ? "#d00101" : "#009344"
                else
                    return "#f6ff00"
            })

        // Add labels beside legend dots
        svg.selectAll("mylabels")
            .data(allgroups)
            .enter()
            .append("text")
            .attr("x", 0 + 35 + size * .8)
            .attr("y", function(d, i) { return 0 + i * (size + 5) }) // 100 is where the first dot appears. 25 is the distance between dots
            .style("fill", function(d) {
                if (d != "selected")
                    return type === "IMP" ? "#d00101" : "#009344"
                else
                    return "#f6ff00"
            })
            .text(function(d) { return d })
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")

        function zoomed() {
            // create new scale ojects based on event
            var new_xScale = d3v4.event.transform.rescaleX(x);
            var new_yScale = d3v4.event.transform.rescaleY(y);
            // update axes
            gX.call(xAxis.scale(new_xScale));
            gY.call(yAxis.scale(new_yScale));
            scatter.data(dataset)

            .attr('cx', function(d) { return new_xScale(d[0]) })
                .attr('cy', function(d) { return new_yScale(d[1]) });
        }
    }


    // function drawBasicChart(data, type) {
    //     id = ""
    //     if (type === "IMP")
    //         id = "#pca-test"
    //     else if (type === "EXP")
    //         id = "#pca-export-col"
    //     else
    //         alert("ERROR from post")

    //     // set the dimensions and margins of the graph
    //     var margin = { top: 10, right: 30, bottom: 30, left: 60 },
    //         width = 460 - margin.left - margin.right,
    //         height = 400 - margin.top - margin.bottom;

    //     // append the svg object to the body of the page
    //     var svg = d3v4.select("#my_dataviz")
    //         .append("svg")
    //         .attr("width", width + margin.left + margin.right)
    //         .attr("height", height + margin.top + margin.bottom)
    //         .append("g")
    //         .attr("transform",
    //             "translate(" + margin.left + "," + margin.top + ")");


    //     // Add X axis
    //     var x = d3v4.scaleLinear()
    //         .domain([-1, 1])
    //         .range([0, width]);
    //     var xAxis = d3v4.axisBottom(x)
    //     var gX = svg.append("g")
    //         .attr("transform", "translate(0," + height + ")")
    //         .call(xAxis);

    //     // Add Y axis
    //     var y = d3v4.scaleLinear()
    //         .domain([-1, 1])
    //         .range([height, 0]);
    //     var yAxis = d3v4.axisLeft(y)
    //     var gY = svg.append("g")
    //         .call(yAxis);

    //     // Add dots
    //     svg.append('g')
    //         .selectAll("dot")
    //         .data(data)
    //         .enter()
    //         .append("circle")
    //         .attr("cx", function(d) { return x(d[0]); })
    //         .attr("cy", function(d) {
    //             return y(d[1]);
    //         })
    //         .attr("r", 3)
    //         .style("fill", type === "IMP" ? "#d00101" : "#009344")
    //         .style("stroke", "black")



    // }

    var resetZoom = function(type) {
        idx = type == "IMP" ? 0 : 1;
        svgs[idx].transition()
            .duration(100)
            .call(zooms[idx].transform, d3v4.zoomIdentity);

    }
    return {
        drawChart: drawChart,
        resetZoom: resetZoom
    }
}