function callResetBubble() {
    bcm.resetBubbleZoom()
}

function mainBubble() {
    bcm = BubblesChartManager()
}

var BubblesChartManager = function() {
    var margin = { top: 40, right: 150, bottom: 60, left: 30 },
        width = 1700 - margin.left - margin.right,
        height = 700 - margin.top - margin.bottom;

    var zoom;
    // append the svg object to the body of the page
    var svg = d3.select("#bubblesChart-container")
        .append("svg")
        .style("background-color", "rgb(20, 20, 20)")
        .attr("class", "rounded shadow")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("id", "bubblesSVG")
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    //Read the data
    d3.queue()
        .defer(d3.csv, "https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/4_ThreeNum.csv")
        .defer(d3.csv, "static/data/df_exp_clean.csv")
        .defer(d3.csv, "static/data/df_imp_clean.csv")
        .await(ready)

    function ready(error, data, exp, imp) {

        // Pan and zoom
        zoom = d3.zoom()
            .scaleExtent([.5, 20])
            .extent([
                [0, 0],
                [width, height]
            ])
            .on("zoom", zoomed);
        // ---------------------------//
        //       AXIS  AND SCALE      //
        // ---------------------------//
        var k = height / width,
            x0 = [0, 50000],
            y0 = [35, 90]
            // Add X axis
        var x = d3.scaleLinear()
            .domain(x0)
            .range([0, width]);

        var gridX = d3.axisBottom(x).tickSize(-width)
            .tickFormat("")
        var ggX = svg.append("g")
            .attr("class", "grid")
            .attr("transform", "translate(0," + height + ")")
            .call(gridX);

        var xAxis = d3.axisBottom(x)
        var gX = svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .attr("class", "axis axis--x")
            .call(xAxis);

        // Add X axis label:
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", width)
            .attr("y", height + 50)
            .style("fill", "white")
            .text("Gdp per Capita");

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([35, 90])
            .range([height, 0]);
        var gridY = d3.axisLeft(y).tickSize(-width)
            .tickFormat("")
        var ggY = svg.append("g")
            .attr("class", "grid")
            .call(gridY);
        var yAxis = d3.axisLeft(y).ticks(12 * width / height)

        // var brush = d3.brush().extent([
        //         [0, 0],
        //         [width, height]
        //     ]).on("end", brushended),
        //     idleTimeout,
        //     idleDelay = 350;

        var gY = svg.append("g")
            .attr("class", "axis axis--y")
            .call(yAxis)

        // Add Y axis label:
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", 0)
            .attr("y", -20)
            .style("fill", "white")
            .text("Life expectancy")
            .attr("text-anchor", "start")

        // Add a scale for bubble size
        var z = d3.scaleSqrt()
            .domain([200000, 1310000000])
            .range([2, 30]);

        // Add a scale for bubble color
        var myColor = d3.scaleOrdinal()
            .domain(["Asia", "Europe", "Americas", "Africa", "Oceania"])
            .range(d3.schemeSet1);


        // ---------------------------//
        //      TOOLTIP               //
        // ---------------------------//

        // -1- Create a tooltip div that is hidden by default:
        var tooltip = d3.select("#bubblesChart-container")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "black")
            .style("border-radius", "5px")
            .style("padding", "10px")
            .style("color", "white")

        // -2- Create 3 functions to show / update (when mouse move but stay on same circle) / hide the tooltip
        var showTooltip = function(d) {
            tooltip
                .transition()
                .duration(200)
            tooltip
                .style("opacity", 1)
                .html("Country: " + d.country)
                .style("left", (d3.mouse(this)[0] + 30) + "px")
                .style("top", (d3.mouse(this)[1] + 30) + "px")
        }
        var moveTooltip = function(d) {
            tooltip
                .style("left", (d3.mouse(this)[0] + 30) + "px")
                .style("top", (d3.mouse(this)[1] + 30) + "px")
        }
        var hideTooltip = function(d) {
            tooltip
                .transition()
                .duration(200)
                .style("opacity", 0)
        }


        // ---------------------------//
        //       HIGHLIGHT GROUP      //
        // ---------------------------//

        // What to do when one group is hovered
        var highlight = function(d) {
            // reduce opacity of all groups
            d3.selectAll(".bubbles").style("opacity", .05)
                // expect the one that is hovered
            d3.selectAll("." + d).style("opacity", 1)
        }

        // And when it is not hovered anymore
        var noHighlight = function(d) {
            d3.selectAll(".bubbles").style("opacity", 1)
        }


        // ---------------------------//
        //       CIRCLES              //
        // ---------------------------//




        svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .style("fill", "none")
            .style("pointer-events", "all")
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
            .call(zoom);

        var expNested = d3.nest()
            .key(function(d) {
                return d.code3
            })
            .entries(exp)

        var impNested = d3.nest()
            .key(function(d) {
                return d.code3
            })
            .entries(imp)

        // console.log(nested)
        var scatter = svg
            .append('g')
            .selectAll("dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", function(d) { return "bubbles " + d.continent })
            .attr("cx", function(d) { return x(d.gdpPercap); })
            .attr("cy", function(d) { return y(d.lifeExp); })
            .attr("r", function(d) {


                // return z(d.pop);
            })
            .style("fill", function(d) { return myColor(d.continent); })
            // -3- Trigger the functions for hover
            .on("mouseover", showTooltip)
            .on("mousemove", moveTooltip)
            .on("mouseleave", hideTooltip)




        // ---------------------------//
        //       LEGEND              //
        // ---------------------------//
        function heightCircles(d) { return height - 230 - z(d) }
        // Add legend: circles
        var valuesToShow = [10000000, 100000000, 1000000000]
        var xCircle = width + 55
        var xLabel = width + 85
        svg
            .selectAll("legend")
            .data(valuesToShow)
            .enter()
            .append("circle")
            .attr("cx", xCircle)
            .attr("cy", function(d) { return heightCircles(d) })
            .attr("r", function(d) { return z(d) })
            .style("fill", "none")
            .attr("stroke", "white")

        // Add legend: segments
        svg
            .selectAll("legend")
            .data(valuesToShow)
            .enter()
            .append("line")
            .attr('x1', function(d) { return xCircle + z(d) })
            .attr('x2', xLabel)
            .attr('y1', function(d) { return heightCircles(d) })
            .attr('y2', function(d) { return heightCircles(d) })
            .attr('stroke', 'white')
            .style('stroke-dasharray', ('2,2'))

        // Add legend: labels
        svg
            .selectAll("legend")
            .data(valuesToShow)
            .enter()
            .append("text")
            .attr('x', xLabel)
            .attr('y', function(d) { return height - 228 - (z(d) * 1.5) })
            .text(function(d) { return d / 1000000 })
            .style("font-size", 10)
            .attr('alignment-baseline', 'middle')
            .attr('stroke', 'white')


        // Legend title
        svg.append("text")
            .attr('x', xCircle + 7)
            .attr("y", height - 235 + 30)
            .text("Population (M)")
            .style("fill", "white")
            .attr("text-anchor", "middle")

        // Add one dot in the legend for each name.
        var size = 20
        var allgroups = ["Asia", "Europe", "Americas", "Africa", "Oceania"]
        svg.selectAll("myrect")
            .data(allgroups)
            .enter()
            .append("circle")
            .attr("cx", width + 35)
            .attr("cy", function(d, i) { return 450 + i * (size + 5) }) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("r", 7)
            .style("fill", function(d) { return myColor(d) })
            .on("mouseover", highlight)
            .on("mouseleave", noHighlight)

        // Add labels beside legend dots
        svg.selectAll("mylabels")
            .data(allgroups)
            .enter()
            .append("text")
            .attr("x", width + 35 + size * .8)
            .attr("y", function(d, i) { return 450 + i * (size + 5) }) // 100 is where the first dot appears. 25 is the distance between dots
            .style("fill", function(d) { return myColor(d) })
            .text(function(d) { return d })
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
            .on("mouseover", highlight)
            .on("mouseleave", noHighlight);

        /********
         * ZOOM *
         ********/

        // scatter.append("g")
        //     .attr("class", "brush")
        //     .call(brush);

        // function brushended() {

        //     var s = d3.event.selection;
        //     if (!s) {
        //         if (!idleTimeout) return idleTimeout = setTimeout(idled, idleDelay);
        //         x.domain(d3.extent(data, function(d) {
        //             return d.gdpPercap;
        //         })).nice();
        //         y.domain(d3.extent(data, function(d) {
        //             return d.lifeExp;
        //         })).nice();
        //     } else {
        //         x.domain([s[0][0], s[1][0]].map(x.invert, x));
        //         y.domain([s[1][1], s[0][1]].map(y.invert, y));
        //         scatter.select(".brush").call(brush.move, null);
        //     }
        //     zoom();
        // }

        // function idled() {
        //     idleTimeout = null;
        // }

        // function zoom() {

        //     var t = scatter.transition().duration(750);
        //     svg.select("#axis--x").transition(t).call(xAxis);
        //     svg.select("#axis--y").transition(t).call(yAxis);
        //     scatter.selectAll("circle").transition(t)

        //     .attr("cx", function(d) { return x(d.gdpPercap); })
        //         .attr("cy", function(d) { return y(d.lifeExp); });
        // }




        function zoomed() {
            // create new scale ojects based on event
            var new_xScale = d3.event.transform.rescaleX(x);
            var new_yScale = d3.event.transform.rescaleY(y);
            // update axes
            gX.call(xAxis.scale(new_xScale));
            ggX.call(gridX.scale(new_xScale));
            gY.call(yAxis.scale(new_yScale));
            ggY.call(gridY.scale(new_yScale));
            scatter.data(data)

            .attr('cx', function(d) { return new_xScale(d.gdpPercap) })
                .attr('cy', function(d) { return new_yScale(d.lifeExp) });
        }
    }

    var resetBubbleZoom = function() {
        svg.transition()
            .duration(100)
            .call(zoom.transform, d3.zoomIdentity);


    }


    $(function() {
        $('#bubbleSwitch').change(function() {
            // console.log($(this).prop('checked'))
            if ($(this).prop('checked')) {
                //Importers
            } else {
                //exporters
            }
        })
    })

    var changeMode = function(cb) {
        alert(cb.prop('checked'))
    }

    return {
        resetBubbleZoom: resetBubbleZoom,
        changeMode: changeMode,
    }


}