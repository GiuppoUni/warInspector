var DivergingBarChartManager = function() {
    var margin = { top: 20, right: 80, bottom: 40, left: 40 };

    var width = 600 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

    var zoom;


    // Config
    var cfg = {
        labelMargin: 0,
        xAxisMargin: 0,
        legendRightMargin: 0
    }

    var x = d3v4.scaleBand()
        .range([0, width])
        .padding(0.1);


    var y = d3v4
        .scaleLinear()
        .range([height / 2, 0])

    var yDown = d3v4.scaleLinear()
        .range([height, height / 2])

    var gX;
    var gY;
    var gYDown;

    var xAxis;
    var yAxis;
    var YAxisDown;

    var new_xScale = x
    var new_yScale = y
    var new_yScaleDown = yDown

    const my_colors = ["blue", "yellow", "red"]

    var svg = d3v4.select("#diverging-card").append("svg")
        .attr("id", "diverging-svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var tipExp = d3v4.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            return '<strong>Exported: ' + d.value["totalS"] + '</strong>'
        })

    var tipImp = d3v4.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            return '<strong>Imported: ' + d.value["totalR"] + '</strong>';
        })
    var drawChart = function() {

        var colour = d3v4.scaleSequential(d3v4.interpolatePRGn);
        var colorRed = d3v4.scaleThreshold()
            .domain([1, 10, 100, 1000, 10000, 100000])
            .range(["#ffbaba", "#ff7b7b", "#ff5252", "#b72626", "#8e0505", "#620000"])


        function parse(d) {
            d.rank = +d.rank;
            d.annual_growth = +d.annual_growth;
            return d;
        }

        var legend = svg.append("g")
            .attr("class", "legend");

        // legend.append("text")
        //     .attr("x", width - cfg.legendRightMargin)
        //     .attr("text-anchor", "end")
        //     .text("Import vs Export")
        //     .attr("class", "text-legend")
        //     .attr("fill", "white")


        // legend.append("text")
        //     .attr("x", width - cfg.legendRightMargin)
        //     .attr("y", 20)
        //     .attr("text-anchor", "end")
        //     .style("opacity", 0.5)
        //     .text("Summed on selected countries")
        //     .attr("class", "text-legend")
        //     .attr("fill", "white")

        d3v4.csv("static/data/merged1990.csv", parse, function(error, data) {
            if (error) throw error;

            data_structure = new Map();
            exp_for_country = new Map();
            imp_for_country = new Map();


            for (let i = 0; i < data.length; i++) {
                var row = data[i];

                //if (DEBUG) console.log(row);

                // Take the ordered and delivered data is in the interval
                var yearDel = stripYear(row["Delivered year"]);

                // Check years in the interval and the country
                if (!isNaN(yearDel) && yearDel >= years[0] && yearDel <= years[1]) {

                    var num;
                    if (selected_group.includes(row["codeS"])) {
                        // COUNTING SUPPLIED
                        num = stripNum(row["Delivered num."]);
                        sup = row["codeS"]
                        if (yearDel in data_structure) {
                            // console.log("yet")
                            data_structure[yearDel]["totalS"] += num
                            if (row["codeS"] in data_structure[yearDel])
                                data_structure[yearDel][sup]["exp"] += num
                            else
                                data_structure[yearDel][sup] = { "exp": num, "imp": 0 }
                        } else {
                            data_structure[yearDel] = {
                                "totalS": num,
                                "totalR": 0,
                            };
                            data_structure[yearDel][sup] = { "exp": 0, "imp": 0 }

                        }

                    }
                    if (selected_group.includes(row["codeR"])) {
                        // COUNTING RECEIVED
                        num = stripNum(row["Delivered num."]);
                        rec = row["codeR"]
                        if (yearDel in data_structure) {
                            // console.log("yet")
                            data_structure[yearDel]["totalR"] += num
                            if (rec in data_structure[yearDel])
                                data_structure[yearDel][rec]["imp"] += num
                            else
                                data_structure[yearDel][rec] = { "exp": num, "imp": 0 }
                        } else {
                            data_structure[yearDel] = {
                                "totalS": 0,
                                "totalR": num,
                                rec: { "exp": 0, "imp": 0 }
                            };
                            data_structure[yearDel][rec] = { "exp": 0, "imp": 0 }

                        }
                    }
                }
            }

            // console.log(data_structure)
            // console.log(typeof(data_structure));
            data = data_structure
                // console.log(typeof(data))
                // console.log(d3v4.keys(data))


            // d3v4.keys(data).map(function(d) { console.log(d); })
            x.domain(d3v4.keys(data).map(function(d) { return d; }));
            const maxUp = d3v4.max(d3v4.entries(data), function(d) { return d.value["totalS"]; });
            const maxDown = d3v4.max(d3v4.entries(data), function(d) { return d.value["totalR"]; });
            const max = Math.max(maxUp + 100, maxDown + 100)
                // console.log(maxUp, maxDown)
            colour.domain([0, max]);

            svg.append("text")
                .attr("text-anchor", "end")
                .attr("x", -38)
                .attr("y", -8)
                .style("fill", "white")
                .text("Weapon units")
                .style("font-size", "11px")
                .attr("text-anchor", "start")

            y.domain([0, max + 10])
            yDown.domain([max + 10, 0])
                // y.domain([0, 100])
                // yDown.domain([0, 100])

            const yAxisTicks = y.ticks()
                .filter(Number.isInteger);
            const yDownAxisTicks = yDown.ticks()
                .filter(Number.isInteger);
            yAxis = d3v4.axisLeft(y)
                .tickValues(yAxisTicks)
                .tickFormat(d3v4.format('d'))
            gY = svg.append('g')
                .attr("id", "y-div-axis")
                // svg.append("g")
                //     .attr("class", "y-axis")
                //     .attr("transform", "translate(" + x(0) + ",0)")
                //     .append("line")
                //     .attr("fill", "white")
                //     .attr("y1", 0)
                //     .attr("y2", height);
                .call(yAxis)
            yDownAxis = d3v4.axisLeft(yDown)
                .tickValues(yDownAxisTicks)
                .tickFormat(d3v4.format('d'))
            gYDown = svg.append("g")
                .attr("id", "y-down-div-axis")
                .call(yDownAxis)

            xAxis = d3v4.axisBottom(x).tickSizeOuter(0)
            gX = svg.append("g")
                .attr("id", "x-div-axis")
                .attr("transform", "translate(0," + (height + cfg.xAxisMargin) + ")")
                .call(xAxis);

            var bars = svg.append("g")
                .attr("class", "bars")

            // BARRE SUPERIORI
            bars.selectAll("myExpRects")
                .data(d3v4.entries(data))
                .enter().append("rect")
                .attr("class", "div-bars-exp")
                .attr("height", function(d) {
                    return height / 2 - y(d.value["totalS"]);
                })
                .attr("x", function(d) { return x(d.key); })
                .attr("width", x.bandwidth())
                .attr("y", function(d) {
                    return y(d.value["totalS"])
                })
                .style("stroke", "black")

            .style("fill", function(d) {
                    // return colour(d.value["totalS"])
                    return "#007a12"
                })
                // .on('mouseenter', function(actual, i) {
                //     d3v4.selectAll('.value')
                //         .attr('opacity', 0)

            //     d3v4.select(this)
            //         .transition()
            //         .duration(300)
            //         .attr('opacity', 0.6)
            //         .attr('x', d => {
            //             console.log("G", d);
            //             x(d.key) - 5
            //         })
            //         .attr('width', x.bandwidth() + 10)

            //     const yy = y(actual.value["totalR"]);

            //     line = chart.append('line')
            //         .attr('id', 'limit')
            //         .attr('x1', 0)
            //         .attr('y1', yy)
            //         .attr('x2', width)
            //         .attr('y2', yy)

            //     barGroups.append('text')
            //         .attr('class', 'divergence')
            //         .attr('x', (g) => x(g.key) + x.bandwidth() / 2)
            //         .attr('y', (g) => yy(g.value["totalR"]) - 10)
            //         .attr('fill', 'white')
            //         .attr('text-anchor', 'middle')
            //         .text((g, idx) => {
            //             const divergence = (g.value["totalR"] - actual.value["totalR"]).toFixed(0)

            //             let text = ''
            //             if (divergence > 0) text += '+';
            //             text += `${divergence}`

            //             return idx !== i ? text : '';
            //         })

            // })
            // .on('mouseleave', function() {
            //     d3v4.selectAll('.value')
            //         .attr('opacity', 1)

            //     d3v4.select(this)
            //         .transition()
            //         .duration(300)
            //         .attr('opacity', 1)
            //         .attr('x', (g) => x(g[0]))
            //         .attr('width', x.bandwidth())

            //     bars.selectAll('#limit').remove()
            //     bars.selectAll('.divergence').remove()
            // })





            // BARRE INFERIORI
            bars.selectAll("myImpRects")
                .data(d3v4.entries(data))
                .enter().append("rect")
                .attr("class", "div-bars-imp")
                .attr("height", function(d) {
                    // console.log(d.value["totalR"])
                    return yDown(d.value["totalR"]) - height / 2
                })
                .attr("x", function(d) { return x(d.key); })
                .attr("width", x.bandwidth())
                .attr("y", function(d) {
                    return height / 2 + 2;
                })
                .style("stroke", "black")
                .style("fill", function(d) {
                    // return colorRed(d.value["totalR"])
                    return "#7a0000"
                });

            svg.call(tipExp);


            d3v4.selectAll(".div-bars-exp")
                .on('mouseover', d => tipExp.show(d))
                .on('mouseout', tipExp.hide)


            svg.call(tipImp);


            d3v4.selectAll(".div-bars-imp")
                .on('mouseover', d => tipImp.show(d))
                .on('mouseout', tipImp.hide)


            var labels = svg.append("g")
                .attr("class", "labels");




        });

        function zoomed() {
            // create new scale ojects based on event
            // new_xScale = d3v4.event.transform.rescaleX(x);
            new_yScale = d3v4.event.transform.rescaleY(y);

            // update axes
            // gX.call(xAxis.scale(new_xScale));
            gY.call(yAxis.scale(new_yScale));
            gYDown.call(yDownAxis.scale(new_yScale))
            d3v4.selectAll(".div-bars-exp")
                .attr("y", d => new_yScale(d.value["totalS"]))



            d3v4.selectAll(".div-bars-imp")
                .attr('height', function(d) { return new_yScaleDown(d.value["totalR"]) });
        }

        // // Pan and zoom
        // zoom = d3v4.zoom()
        //     .scaleExtent([.5, 20])
        //     .extent([
        //         [0, 0],
        //         [width, height]
        //     ])
        //     .on("zoom", zoomed);

        // svg.append("rect")
        //     .attr("width", width)
        //     .attr("height", height)
        //     .style("fill", "none")
        //     .style("pointer-events", "all")
        //     .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        //     .call(zoom);
    }

    var transitionSlider = function(transactions) {

        // FOR DIV BAR CHART STARTING WITH DATA THEN AXIS THEN BARS
        // NEW DATA

        data_structure = new Map();


        for (let i = 0; i < transactions.length; i++) {
            var row = transactions[i];

            //if (DEBUG) console.log(row);

            // Take the ordered and delivered data is in the interval
            var yearDel = stripYear(row["Delivered year"]);
            // console.log(yearDel)
            // Check years in the interval and the country
            if (!isNaN(yearDel) && yearDel >= years[0] && yearDel <= years[1]) {

                var num;
                if (selected_group.includes(row["codeS"])) {
                    // COUNTING SUPPLIED
                    num = stripNum(row["Delivered num."]);
                    sup = row["codeS"]
                    if (yearDel in data_structure) {
                        // console.log("yet")
                        data_structure[yearDel]["totalS"] += num
                        if (row["codeS"] in data_structure[yearDel])
                            data_structure[yearDel][sup]["exp"] += num
                        else
                            data_structure[yearDel][sup] = { "exp": num, "imp": 0 }
                    } else {
                        data_structure[yearDel] = {
                            "totalS": num,
                            "totalR": 0,
                        };
                        data_structure[yearDel][sup] = { "exp": num, "imp": 0 }
                    }

                }
                if (selected_group.includes(row["codeR"])) {
                    // COUNTING RECEIVED
                    num = stripNum(row["Delivered num."]);
                    rec = row["codeR"]
                    if (yearDel in data_structure) {
                        // console.log("yet")
                        data_structure[yearDel]["totalR"] += num
                        if (rec in data_structure[yearDel])
                            data_structure[yearDel][rec]["imp"] += num
                        else
                            data_structure[yearDel][rec] = { "exp": 0, "imp": num }
                    } else {
                        data_structure[yearDel] = {
                            "totalS": 0,
                            "totalR": num,
                        };
                        data_structure[yearDel][rec] = { "exp": 0, "imp": num }

                    }
                }


            }

        }

        console.log("data", data_structure)
            // data_structure
            // NEW AXIS

        x.domain(d3v4.keys(data_structure).map(function(d) { return d; }));
        const maxUp = d3v4.max(d3v4.entries(data_structure), function(d) { return d.value["totalS"]; });
        const maxDown = d3v4.max(d3v4.entries(data_structure), function(d) { return d.value["totalR"]; });
        const max = Math.max(maxUp + 100, maxDown + 100)
            // console.log(data_structure)
            // console.log(typeof(data_structure));
        console.log("data", d3v4.keys(data_structure).map(function(d) { return d; }))

        function changeAxis(_callback) {
            y.domain([0, max + 10])
            yDown.domain([max + 10, 0])
                // y.domain([0, 100])
                // yDown.domain([0, 100])

            const yAxisTicks = y.ticks()
                .filter(Number.isInteger);
            const yDownAxisTicks = yDown.ticks()
                .filter(Number.isInteger);
            console.log(svg.select('#y-div-axis'))

            svg.select('#y-div-axis')
                .transition()
                .duration(2000)
                .call(d3v4.axisLeft(y)
                    .tickValues(yAxisTicks)
                    .tickFormat(d3v4.format('d')))

            svg.select("#y-down-div-axis")
                .transition()
                .duration(2000)
                .call(d3v4.axisLeft(yDown)
                    .tickValues(yDownAxisTicks)
                    .tickFormat(d3v4.format('d')))

            svg.select("#x-div-axis")
                .transition()
                .duration(2000)
                .attr("transform", "translate(0," + (height + cfg.xAxisMargin) + ")")
                .call(d3v4.axisBottom(x).tickSizeOuter(0))
                .selectAll("text")
                .attr("transform", "translate(-10,0)rotate(-45)")
                .style("text-anchor", "end");

            _callback()
        }

        //Transition on bars
        function addBars(_callback) {



            // BARRE SUPERIORI
            var u = svg.selectAll(".div-bars-exp")
                .data(d3v4.entries(data_structure))

            u.enter().append("rect")
                .merge(u)
                .transition()
                .duration(2000)
                .attr("class", "div-bars-exp")
                .attr("height", function(d) {
                    return height / 2 - y(d.value["totalS"]);
                })
                .attr("x", function(d) { return x(d.key); })
                .attr("width", x.bandwidth())
                .attr("y", function(d) {
                    return y(d.value["totalS"])
                })
                .style("fill", function(d) {
                    // return colour(d.value["totalS"])
                    return "#007a12"
                })
                .style("stroke", function(d) {
                    // return colour(d.value["totalS"])
                    return "black"
                });
            u
                .exit()
                .transition() // and apply changes to all of them
                .duration(1000)
                .style("opacity", 0)
                .remove()

            var u2 = svg.selectAll(".div-bars-imp")
                .data(d3v4.entries(data_structure))

            // BARRE INFERIORI
            u2
                .enter()
                .append("rect")
                .merge(u2)
                .transition()
                .duration(2000)
                .attr("class", "div-bars-imp")
                .attr("height", function(d) {
                    // console.log(d.value["totalR"])
                    return yDown(d.value["totalR"]) - height / 2
                })
                .attr("x", function(d) { return x(d.key); })
                .attr("width", x.bandwidth())
                .attr("y", function(d) {
                    return height / 2 + 2;
                })
                .style("fill", function(d) {
                    // return colorRed(d.value["totalR"])
                    return "#7a0000"
                })
                .style("stroke", function(d) {
                    // return colour(d.value["totalS"])
                    return "black"
                });

            u2
                .exit()
                .transition() // and apply changes to all of them
                .duration(1000)
                .style("opacity", 0)
                .remove()


            emptyBars = svg.append("g")
                .attr("class", "selBars")

            console.log("d", data_structure)


            // _callback()
        }

        function drawSelBars() {

            var selExpTip = d3v4.tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0])
                .html(function(d) {
                    return '<strong>' + d.key + ": " + d.value["exp"] + '</strong>'
                })
            svg.call(selExpTip);

            console.log("drawing sel bars")
            d3v4.entries(data_structure).forEach(

                function(bar) {
                    // Year locked
                    year = bar.key
                    var base = 0
                    var i = 0
                    d3v4.entries(bar.value).forEach(function(d) {
                        if (d.key[0] == d.key[0].toUpperCase()) { // Allora è un paese tipo ITA
                            console.log(year, d)
                            var emptyBar = emptyBars.selectAll("mySelBar")
                                .data([d])
                                .enter()
                                .append("rect")
                                .attr("class", "div-sel-bars-exp")
                                .attr("y", function(dd) {
                                    return y(dd.value["exp"])
                                })
                                .attr("height", function(dd) {
                                    // if (base != 0) {
                                    //     base = height / 2 - (y(dd.value["exp"]))
                                    //     return 0;
                                    // }
                                    var h = height / 2 - (y(dd.value["exp"]) + base);
                                    base = h
                                    console.log("SEL COL", i, dd, h)
                                    return h;
                                })
                                .attr("x", x(year))
                                .attr("width", x.bandwidth())

                            .style("fill", my_colors[i % 3])
                                .style("opacity", 0.5)
                                .style("stroke", "black")
                                // .style("stroke-dasharray", 2.5)

                            emptyBar
                                .on('mouseover', d => selExpTip.show(d))
                                .on('mouseout', selExpTip.hide)
                            i++;
                        }

                    })

                })

            d3v4.selectAll(".div-bars-imp")
                .style("pointer-events", "none")

            d3v4.selectAll(".div-bars-exp")
                .style("pointer-events", "none")

        }

        changeAxis(() => addBars(() => drawSelBars()))
            // changeAxis(() => console.log("1"))
            // addBars(() => console.log("2"))
            // drawSelBars()
    }
    return {
        drawChart: drawChart,
        transitionSlider: transitionSlider,
    }




}