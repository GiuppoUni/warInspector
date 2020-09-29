var WeaLine = function() {
    var margin = { top: 10, right: 30, bottom: 50, left: 50 },
        width = 600 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#wea-line-svg")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    var x = d3.scaleBand()
        .range([0, width])
        .domain(Array.from(Array(30), (_, i) => i + 1990))
        .padding(0.01)


    svg.append("g")
        .call(d3.axisBottom(x))
        .attr("transform", "translate(0," + height + ")")
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");;
    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, 10000])
        .range([height, 0])
    svg.append("g")
        .attr("id", "y-line-axis")
        .call(d3.axisLeft(y))


    function drawChart() {
        //Read the data

        // savedGrouped = savedGrouped.slice(0, 10)
        // console.log("befiore", modelChosen, savedGrouped, savedModelList)

        var localSavedGrouped = savedGrouped.filter(d => d.key.split(",")[0] == modelChosen)
        if (localSavedGrouped == [])
            return
        localSavedGrouped = localSavedGrouped.sort(function(a, b) { return d3.descending(a.key.split(",")[1], b.key.split(",")[1]); });

        console.log("after", modelChosen, localSavedGrouped, savedModelList)
        y.domain([0, localSavedGrouped[0].value])
        svg.select("#y-line-axis")
            .transition()
            .duration(2000)
            .call(d3.axisLeft(y))

        if (is_first_draw) {

            // Add the area
            svg.append("path")
                .datum(localSavedGrouped)
                .attr("class", "path-line1")
                .attr("fill", "#69b3a2")
                .attr("fill-opacity", .3)
                .attr("stroke", "none")
                .attr("d", d3.area()
                    .x(function(d) {
                        // console.log(d); 
                        return x(d.key.split(",")[1])
                    })
                    .y0(height)
                    .y1(function(d) { return y(d.value) })
                )

            svg.append("path")
                .datum(localSavedGrouped)
                .attr("class", "path-line2")
                .attr("fill", "none")
                .attr("stroke", "#69b3a2")
                .attr("stroke-width", 4)
                .attr("d", d3.line()
                    .x(function(d) {
                        // console.log(d.key.split(",")[1], d.key.split(",")[0]);
                        return x(d.key.split(",")[1])
                    })
                    .y(function(d) { return y(d.value) })
                )




            // Add the line
            u = svg.selectAll("mycircles")
                .data(localSavedGrouped)
                .enter()
                .append("circle")
                .attr("class", "line-circle")
                .attr("fill", "red")
                .attr("stroke", "none")
                .attr("cx", function(d) { return x(d.key.split(",")[1]) })
                .attr("cy", function(d) { return y(d.value) })
                .attr("r", 3)

            is_first_draw = false;

        } else {
            svg.selectAll(".path-line1")
                .exit()
                .transition() // and apply changes to all of them
                .duration(1000)
                .style("opacity", 0)
                .remove()

            // Add the area
            svg.selectAll(".path-line1")
                .datum(localSavedGrouped)
                .transition() // and apply changes to all of them
                .duration(1000)
                .attr("class", "path-line1")
                .attr("fill", "#69b3a2")
                .attr("fill-opacity", .3)
                .attr("stroke", "none")
                .attr("d", d3.area()
                    .x(function(d) {
                        // console.log(d); 
                        return x(d.key.split(",")[1])
                    })
                    .y0(height)
                    .y1(function(d) { return y(d.value) })
                )

            svg.selectAll(".path-line2")
                .exit()
                .transition() // and apply changes to all of them
                .duration(1000)
                .style("opacity", 0)
                .remove()
                // Add the line
            svg.selectAll(".path-line2")
                .datum(localSavedGrouped)
                .transition() // and apply changes to all of them
                .duration(1000)
                .attr("class", "path-line2")
                .attr("fill", "none")
                .attr("stroke", "#69b3a2")
                .attr("stroke-width", 4)
                .attr("d", d3.line()
                    .x(function(d) {
                        // console.log(d.key.split(",")[1], d.key.split(",")[0]);
                        return x(d.key.split(",")[1])
                    })
                    .y(function(d) { return y(d.value) })
                )


            svg.selectAll(".line-circle")
                .exit()
                .transition() // and apply changes to all of them
                .duration(1000)
                .style("opacity", 0)
                .remove()
                // Add the line
            u = svg.selectAll(".line-circle")
                .data(localSavedGrouped)

            u
                .enter()
                .append("circle") // Add a new circle for each new elements
                .merge(u)
                .transition() // and apply changes to all of them
                .duration(1000)
                .attr("fill", "red")
                .attr("class", "line-circle")
                .attr("stroke", "none")
                .attr("cx", function(d) { return x(d.key.split(",")[1]) })
                .attr("cy", function(d) { return y(d.value) })
                .attr("r", 3)


            // // Add the line
            // u = svg.selectAll("mycircles")
            //     .data(localSavedGrouped)

            // u.enter()
            //     .append("circle")
            //     .merge(u)
            //     .transition()
            //     .duration(3000)
            //     .attr("fill", "red")
            //     .attr("stroke", "none")
            //     .attr("cx", function(d) { return x(d.key.split(",")[1]) })
            //     .attr("cy", function(d) { return y(d.value) })
            //     .attr("r", 3)

        }






    }

    return {
        drawChart: drawChart,
        // resetZoom: resetZoom,
        // transition: transition,
        // selectCountryTransition: selectCountryTransition,
    }
}