var PcaScatterManager = function() {
    // var country_selected = ["ITA"];
    var firstTimeDot = true;


    var margin = { top: 20, right: 10, bottom: 44, left: 25 },
        width = 400 - margin.left - margin.right,
        height = 290 - margin.top - margin.bottom;

    var greenColorScale = d3v4.scaleThreshold()
        .domain([0, 10, 100, 1000, 10000, 100000])
        .range(colorsExport)
    var greenLabels = ['>=	 1', ">= 10", ">= 100", ">= 1000", ">= 10000", ">= 100000"];


    var redColorScale = d3v4.scaleThreshold()
        .domain([0, 10, 100, 500, 2000, 4000])
        .range(colorsImport)
    var redLabels = ['>=	 1', ">= 10", ">= 100", ">= 500", ">= 2000", ">= 4000"];

    // append the svg object to the body of the page
    var svg = d3v4.select("#pca-col")
        .append("svg")
        // .attr("class", "pca-svg")
        .attr("id", "pca-svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var zoom;

    var x = d3v4.scaleLinear()
        .domain([-1.5, 3.0])
        .range([0, width]);

    var y = d3v4.scaleLinear()
        .domain([-5, 5])
        .range([height, 0]);

    var new_xScale = x
    var new_yScale = y

    var squareLegend;

    var svgTransform;

    var tip = d3v4.tip()
        .attr('class', 'd3-tip2')
        .offset([-10, 0])
        .html(function(d) {

            s = '<div style="text-align:center"> <strong >' + d[3] + '</strong> </div>'

            if ($(":radio[value='IMPORT_TOTAL']").prop("checked"))
                s += "<br> <h6> Imported (TIV): " + d[5] + "</h6>"
            else
                s += "<br> <h6> Exported (TIV): " + d[6] + "</h6>"
            return s
        })

    var drawChart = function(dataset, type) {
        // if (dataset == null) {
        //     $("#pca-svg").remove()
        //     return
        // }
        // // console.log("Drawing pca", dataset, type)
        // id = "#pca-col"
        //     // set the dimensions and margins of the graph


        // Pan and zoom
        zoom = d3v4.zoom()
            .scaleExtent([.5, 20])
            .extent([
                [0, 0],
                [width, height]
            ])
            .on("zoom", zoomed);


        svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .style("fill", "none")
            .style("pointer-events", "all")
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
            .call(zoom);


        //Read the data

        // Add X axis

        var xAxis = d3v4.axisBottom(x)
        var gX = svg.append("g")
            .attr("class", "myXaxis") // Note that here we give a class to the X axis, to be able to call it later and modify it
            .attr("transform", "translate(" + (margin.left) + "," + height + ")")
            .call(xAxis)

        // Add Y axis


        var yAxis = d3v4.axisLeft(y)
        var gY = svg.append("g")
            .attr("transform", "translate(" + (margin.left) + ",0)")
            .attr("class", "myXaxis")
            .attr("id", "pca-y-axis")
            .call(yAxis)

        // Add dots
        console.log("dataset", dataset)
        var scatter = svg.append('g')
            .selectAll("dot")
            .data(dataset)
            .enter()
            .append("circle")
            .attr("class", "pca-dots")
            .attr("id", d => "dot-" + d[2])
            .attr("cx", function(d) {
                // console.log(x(parseFloat(d[0])), parseFloat(d[0]))
                return x(parseFloat(d[0]));
            })
            .attr("cy", function(d) { return y(parseFloat(d[1])); })
            .attr("r", function(d) { return !d[4] ? 3 : 4.5 })
            .style("fill", function(d) {
                // console.log(d[4])

                if ($(":radio[value='IMPORT_TOTAL']").prop("checked"))
                    return redColorScale(d[5])

                else if ($(":radio[value='EXPORT_TOTAL']").prop("checked"))
                    return greenColorScale(d[6])
                else
                    return "white"

                // "#d00101" : "#009344"
                // return "#f6ff00"

            })
            .style("stroke", function(d) {

                if (d[4])
                    return "#f6ff00"
                else
                    return "black"
            })

        .on("click", function(d) {
            callSelected(d[2])
        })


        d3v4.selectAll(".pca-dots")
            .on('mouseover', function(d) { tip.show(d) })
            .on('mouseout', tip.hide)

        svg.call(tip);


        // svg.append("text")
        //     .attr("id", "pca-" + type + "-title")
        //     // .transition()
        //     // .duration(1000)
        //     .text("PCA")
        //     .attr("x", width - 10)
        //     .attr("y", 15)
        //     .style("font-family", "Ubuntu")
        //     .style("font-size", "20px")
        //     .attr("fill", "white")


        // Legend

        svg.append("text")
            .style("fill", "white")
            .attr("id", "pca-lg-t")
            .text("Delivered weapons")
            .attr("transform", "translate(305,120)")
            .style("font-size", "11px")


        var lgnd = svg
            .append("g")
            .attr("class", "legendThreshold")
            .attr("id", "legendThreshold")
            .attr("transform", "translate(320,128)")
            .style("font-size", "10px")



        squareLegend = d3v4.legendColor()
            .labels(function(d) { return redLabels[d.i]; })
            .shapePadding(0.3)
            .scale(redColorScale);

        svg.select(".legendThreshold")
            .call(squareLegend);

        svg.selectAll(".swatch")
            .attr("width", "10")
            .attr("height", "10")


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
            .attr("class", "legendDot")
            .attr("cx", width * 2 / 3 + 25)
            .attr("cy", function(d, i) { return margin.top + i * (size + 5) }) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("r", 3)
            .style("fill", function(d) {
                if (d != "selected") {

                    if ($(":radio[value='IMPORT_TOTAL']").prop("checked"))
                        return colorsImport.slice(-1)[0]

                    else if ($(":radio[value='EXPORT_TOTAL']").prop("checked"))
                        return colorsExport.slice(-1)[0]
                } else
                    return "#f6ff00"
            })

        // Add labels beside legend dots
        svg.selectAll("mylabels")
            .data(allgroups)
            .enter()
            .append("text")
            .attr("class", "legendText")
            .attr("x", width * 2 / 3 + 25 + size * .8)
            .attr("y", function(d, i) { return margin.top + i * (size + 5) }) // 100 is where the first dot appears. 25 is the distance between dots
            .style("fill", function(d) {
                if (d != "selected")
                    return type === "IMP" ? colorsImport.slice(-1)[0] : colorsExport.slice(-1)[0]
                else
                    return "#f6ff00"
            })
            .text(function(d) { return d })
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")

        svg.selectAll(".pca-dots")
            .transition()
            .duration(2000)
            // .delay(function(d, i) { return (i * 3) })
            .attr("cx", function(d) {
                return x(parseFloat(d[0]));
            })
            .attr("cy", function(d) {
                return y(parseFloat(d[1]));
            })

        function zoomed() {
            // create new scale ojects based on event
            new_xScale = d3v4.event.transform.rescaleX(x);
            new_yScale = d3v4.event.transform.rescaleY(y);
            // update axes
            gX.call(xAxis.scale(new_xScale));
            gY.call(yAxis.scale(new_yScale));
            svg.selectAll(".pca-dots")
                // .transition()
                // .duration(50)
                .attr('cx', function(d) { return new_xScale(d[0]) })
                .attr('cy', function(d) { return new_yScale(d[1]) });
        }
    }


    /**********************
     *      //     _      *
     * //     TRANSITIONS *
     *        // _        *
     **********************/

    var transition = function(data) {
        console.log("transitioning")

        greenColorScale.range(colorsExport)
        redColorScale.range(colorsImport)

        svg.selectAll(".pca-dots")
            .data(data)
            .on('mouseover', d => tip.show(d))
            .on('mouseout', tip.hide)
            .transition()
            .duration(2000)
            .style("fill", function(d) {
                // console.log(d[4])
                if ($(":radio[value='IMPORT_TOTAL']").prop("checked"))
                    return redColorScale(d[5])

                else if ($(":radio[value='EXPORT_TOTAL']").prop("checked"))
                    return greenColorScale(d[6])
                else
                    return "white"

                // "#d00101" : "#009344"
                // return "#f6ff00"

            })
            .style("stroke", function(d) {

                if (d[4]) {
                    // console.log(d3v4.select(this), d, true)
                    // pulse(d3v4.select("#dot-" + d[2]), true)
                    return "black"
                } else
                    return "black"
            })
            // .delay(function(d, i) { return (i * 3) })
            .attr("cx", function(d) {
                return new_xScale(d[0]);
            })
            .attr("cy", function(d) {
                return new_yScale(d[1]);
            })
            .attr("r", function(d) { return !d[4] ? 3 : 4.5 })

        // console.log("transitioning")
        svg.selectAll(".legendDot")
            .transition()
            .duration(1000)
            .style("fill", function(d) {
                if (d != "selected") {

                    if ($(":radio[value='IMPORT_TOTAL']").prop("checked"))
                        return colorsImport.slice(-1)[0]

                    else if ($(":radio[value='EXPORT_TOTAL']").prop("checked"))
                        return colorsExport.slice(-1)[0]
                } else
                    return "#f6ff00"
            })

        svg.selectAll(".legendText")
            .transition()
            .duration(1000)
            .style("fill", function(d) {
                if (d != "selected") {

                    if ($(":radio[value='IMPORT_TOTAL']").prop("checked"))
                        return colorsImport.slice(-1)[0]

                    else if ($(":radio[value='EXPORT_TOTAL']").prop("checked"))
                        return colorsExport.slice(-1)[0]
                } else
                    return "#f6ff00"
            })

        d3v4.selectAll(".pca-dots")
            .each(function(d) {
                if (d[4]) {
                    console.log("->", d, d[4])
                    selectCountryTransition(d[2], true)
                }
            })


        if ($(":radio[value='IMPORT_TOTAL']").prop("checked"))
            legendTransition("imp")

        else if ($(":radio[value='EXPORT_TOTAL']").prop("checked"))
            legendTransition("exp")


        // svg.call(tip)


        svg.call(tip);

    }

    var resetZoom = function(type) {
        var idx
        if (type === "IMP")
            idx = 0
        else
            idx = 1;
        // console.log(type, idx, svgs[idx], zooms)
        svg
            .transition()
            .duration(100)
            .call(zoom.transform, d3v4.zoomIdentity);

    }


    var selectCountryTransition = function(country_id, isSelected) {
        if (isSelected) {
            svg.select("#dot-" + country_id)
                .classed("dot-selected", true)
                .transition()
                .duration(1000)
                .style("stroke", function() {
                    // if ($(":radio[value='IMPORT_TOTAL']").prop("checked"))
                    return "#f6ff00"
                        // else
                        //     return "#ff9c00"
                })
                .attr("r", 4.5)

            pulse(svg.select("#dot-" + country_id), true);
        } else {
            svg.select("#dot-" + country_id)
                .classed("dot-selected", false)
                .transition()
                .duration(1000)
                .style("stroke", "black")
                .attr("stroke-width", 1)
                .attr("r", 3.0)
        }
    }



    function pulse(circle, isStarted = false) {
        console.log("pulsing", circle);

        function repeat() {
            if (circle.classed("dot-selected") || isStarted) {
                if (isStarted) {
                    circle.classed("dot-selected", true)
                    isStarted = false //to do just first time
                    circle
                        .style("fill", function(d) {
                            // console.log(d[4])
                            if ($(":radio[value='IMPORT_TOTAL']").prop("checked"))
                                return redColorScale(d[5])

                            else if ($(":radio[value='EXPORT_TOTAL']").prop("checked"))
                                return greenColorScale(d[6])
                            else
                                return "white"

                            // "#d00101" : "#009344"
                            // return "#f6ff00"

                        })
                        .style("stroke", function(d) {

                            if (d[4])
                                return "#f6ff00"
                            else
                                return "black"
                        })

                    // .delay(function(d, i) { return (i * 3) })
                    .attr("cx", function(d) {
                            return new_xScale(d[0]);
                        })
                        .attr("cy", function(d) {
                            return new_yScale(d[1]);
                        })
                        .attr("r", function(d) { return !d[4] ? 3 : 4.5 })


                }
                circle
                    .transition()
                    .duration(500)
                    .delay(2050)
                    .style("stroke", "#f6ff00")
                    .attr("stroke-width", 0)
                    .attr('stroke-opacity', 0)
                    .transition()
                    .duration(500)
                    .attr("stroke-width", 0)
                    .attr('stroke-opacity', 0.5)
                    .transition()
                    .duration(1000)
                    .attr("stroke-width", 30)
                    .attr('stroke-opacity', 0)
                    .ease(d3v4.easeLinear)
                    .on("end", repeat);
            } else {
                circle
                    .transition()
                    .duration(1000)
                    .style("stroke", "black")
                    .style("stroke-width", 1)
                    .attr("r", 3.0)
            }
        }

        repeat();
    }

    function legendTransition(type) {
        if (type == "exp") {
            squareLegend = d3v4.legendColor()
                .labels(function(d) { return greenLabels[d.i]; })
                .shapePadding(0.3)
                .scale(greenColorScale);

            svg.select(".legendThreshold")
                .call(squareLegend)


            svg.selectAll(".swatch")
                .attr("width", "10")
                .attr("height", "10")

        } else {
            squareLegend = d3v4.legendColor()
                .labels(function(d) { return redLabels[d.i]; })
                .shapePadding(0.3)
                .scale(redColorScale);

            svg.select(".legendThreshold")
                .call(squareLegend);

            svg.selectAll(".swatch")
                .attr("width", "10")
                .attr("height", "10")

        }
    }

    return {
        drawChart: drawChart,
        resetZoom: resetZoom,
        transition: transition,
        selectCountryTransition: selectCountryTransition,
        legendTransition: legendTransition,
    }
}