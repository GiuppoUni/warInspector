var BubblesChartManager = function() {
    var margin = { top: 40, right: 150, bottom: 60, left: 30 },
        width = 350 - margin.left - margin.right,
        height = 420 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3v4.select("#bubblesChart-container")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("id", "bubblesSVG")
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    //Read the data
    d3v4.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/4_ThreeNum.csv", function(data) {

        // ---------------------------//
        //       AXIS  AND SCALE      //
        // ---------------------------//

        // Add X axis
        var x = d3v4.scaleLinear()
            .domain([0, 45000])
            .range([0, width]);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3v4.axisBottom(x).ticks(3));

        // Add X axis label:
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", width)
            .attr("y", height + 50)
            .text("Gdp per Capita");

        // Add Y axis
        var y = d3v4.scaleLinear()
            .domain([35, 90])
            .range([height, 0]);
        svg.append("g")
            .call(d3v4.axisLeft(y));

        // Add Y axis label:
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", 0)
            .attr("y", -20)
            .text("Life expectancy")
            .attr("text-anchor", "start")

        // Add a scale for bubble size
        var z = d3v4.scaleSqrt()
            .domain([200000, 1310000000])
            .range([2, 30]);

        // Add a scale for bubble color
        var myColor = d3v4.scaleOrdinal()
            .domain(["Asia", "Europe", "Americas", "Africa", "Oceania"])
            .range(d3v4.schemeSet1);


        // ---------------------------//
        //      TOOLTIP               //
        // ---------------------------//

        // -1- Create a tooltip div that is hidden by default:
        var tooltip = d3v4.select("#bubblesChart-container")
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
                .style("left", (d3v4.mouse(this)[0] + 30) + "px")
                .style("top", (d3v4.mouse(this)[1] + 30) + "px")
        }
        var moveTooltip = function(d) {
            tooltip
                .style("left", (d3v4.mouse(this)[0] + 30) + "px")
                .style("top", (d3v4.mouse(this)[1] + 30) + "px")
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
            d3v4.selectAll(".bubbles").style("opacity", .05)
                // expect the one that is hovered
            d3v4.selectAll("." + d).style("opacity", 1)
        }

        // And when it is not hovered anymore
        var noHighlight = function(d) {
            d3v4.selectAll(".bubbles").style("opacity", 1)
        }


        // ---------------------------//
        //       CIRCLES              //
        // ---------------------------//

        // Add dots
        svg.append('g')
            .selectAll("dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", function(d) { return "bubbles " + d.continent })
            .attr("cx", function(d) { return x(d.gdpPercap); })
            .attr("cy", function(d) { return y(d.lifeExp); })
            .attr("r", function(d) { return z(d.pop); })
            .style("fill", function(d) { return myColor(d.continent); })
            // -3- Trigger the functions for hover
            .on("mouseover", showTooltip)
            .on("mousemove", moveTooltip)
            .on("mouseleave", hideTooltip)



        // ---------------------------//
        //       LEGEND              //
        // ---------------------------//

        // Add legend: circles
        var valuesToShow = [10000000, 100000000, 1000000000]
        var xCircle = 390
        var xLabel = 440
        svg
            .selectAll("legend")
            .data(valuesToShow)
            .enter()
            .append("circle")
            .attr("cx", xCircle)
            .attr("cy", function(d) { return height - 100 - z(d) })
            .attr("r", function(d) { return z(d) })
            .style("fill", "none")
            .attr("stroke", "black")

        // Add legend: segments
        svg
            .selectAll("legend")
            .data(valuesToShow)
            .enter()
            .append("line")
            .attr('x1', function(d) { return xCircle + z(d) })
            .attr('x2', xLabel)
            .attr('y1', function(d) { return height - 100 - z(d) })
            .attr('y2', function(d) { return height - 100 - z(d) })
            .attr('stroke', 'black')
            .style('stroke-dasharray', ('2,2'))

        // Add legend: labels
        svg
            .selectAll("legend")
            .data(valuesToShow)
            .enter()
            .append("text")
            .attr('x', xLabel)
            .attr('y', function(d) { return height - 100 - z(d) })
            .text(function(d) { return d / 1000000 })
            .style("font-size", 10)
            .attr('alignment-baseline', 'middle')

        // Legend title
        svg.append("text")
            .attr('x', xCircle)
            .attr("y", height - 100 + 30)
            .text("Population (M)")
            .attr("text-anchor", "middle")

        // Add one dot in the legend for each name.
        var size = 20
        var allgroups = ["Asia", "Europe", "Americas", "Africa", "Oceania"]
        svg.selectAll("myrect")
            .data(allgroups)
            .enter()
            .append("circle")
            .attr("cx", 390)
            .attr("cy", function(d, i) { return 10 + i * (size + 5) }) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("r", 7)
            .style("fill", function(d) { return myColor(d) })
            .on("mouseover", highlight)
            .on("mouseleave", noHighlight)

        // Add labels beside legend dots
        svg.selectAll("mylabels")
            .data(allgroups)
            .enter()
            .append("text")
            .attr("x", 390 + size * .8)
            .attr("y", function(d, i) { return i * (size + 5) + (size / 2) }) // 100 is where the first dot appears. 25 is the distance between dots
            .style("fill", function(d) { return myColor(d) })
            .text(function(d) { return d })
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")
            .on("mouseover", highlight)
            .on("mouseleave", noHighlight)
    })
    return {}
}