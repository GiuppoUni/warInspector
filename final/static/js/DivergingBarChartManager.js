var DiverginhBarChartManager = function() {
    var margin = { top: 40, right: 50, bottom: 60, left: 70 };

    var width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;


    // Config
    var cfg = {
        labelMargin: 5,
        xAxisMargin: 10,
        legendRightMargin: 0
    }

    var drawChart = function() {

        $("#diverging-svg").remove()
        var svg = d3v4.select("#diverging-card").append("svg")
            .attr("id", "diverging-svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        var x = d3v4.scaleBand()
            .range([0, width])
            .padding(0.1);

        var colour = d3v4.scaleSequential(d3v4.interpolatePRGn);
        var colorRed = d3v4.scaleThreshold()
            .domain([1, 10, 100, 1000, 10000, 100000])
            .range(["#ffbaba", "#ff7b7b", "#ff5252", "#b72626", "#8e0505", "#620000"])

        var y = d3v4.scaleLinear()
            .range([height / 2, 0])
        var yDown = d3v4.scaleLinear()
            .range([height, height / 2])

        function parse(d) {
            d.rank = +d.rank;
            d.annual_growth = +d.annual_growth;
            return d;
        }

        var legend = svg.append("g")
            .attr("class", "legend");

        legend.append("text")
            .attr("x", width - cfg.legendRightMargin)
            .attr("text-anchor", "end")
            .text("Import vs Export")
            .attr("class", "text-legend")
            .attr("fill", "white")


        legend.append("text")
            .attr("x", width - cfg.legendRightMargin)
            .attr("y", 20)
            .attr("text-anchor", "end")
            .style("opacity", 0.5)
            .text("Summed on selected countries")
            .attr("class", "text-legend")
            .attr("fill", "white")

        d3v4.csv("static/data/merged.csv", parse, function(error, data) {
            if (error) throw error;

            data_structure = new Map();


            for (let i = 0; i < data.length; i++) {
                var row = data[i];

                //if (DEBUG) console.log(row);

                // Take the ordered and delivered data is in the interval
                var yearOrd = stripYear(row["Ordered year"]);
                var yearDel = stripYear(row["Delivered year"]);

                // Check years in the interval and the country
                if (!isNaN(yearOrd) && yearOrd >= years[0] && yearOrd <= years[1] &&
                    !isNaN(yearDel) && yearDel >= years[0] && yearDel <= years[1]) {

                    var num;
                    if (selected_group.includes(row["codeS"])) {
                        // COUNTING SUPPLIED
                        num = stripNum(row["Delivered num."]);
                        sup = row["codeS"]
                        if (yearOrd in data_structure) {
                            // console.log("yet")
                            data_structure[yearOrd]["totalS"] += num
                            if (row["codeS"] in data_structure[yearOrd])
                                data_structure[yearOrd][sup]["exp"] += num
                            else
                                data_structure[yearOrd][sup] = { "exp": num, "imp": 0 }
                        } else {
                            data_structure[yearOrd] = {
                                "totalS": num,
                                "totalR": 0,
                                sup: { "exp": 0, "imp": 0 }
                            };
                        }

                    }
                    if (selected_group.includes(row["codeR"])) {
                        // COUNTING RECEIVED
                        num = stripNum(row["Delivered num."]);
                        rec = row["codeR"]
                        if (yearOrd in data_structure) {
                            // console.log("yet")
                            data_structure[yearOrd]["totalR"] += num
                            if (rec in data_structure[yearOrd])
                                data_structure[yearOrd][rec]["imp"] += num
                            else
                                data_structure[yearOrd][rec] = { "exp": num, "imp": 0 }
                        } else {
                            data_structure[yearOrd] = {
                                "totalS": 0,
                                "totalR": num,
                                rec: { "exp": 0, "imp": 0 }
                            };
                        }
                    }
                }
            }
            // console.log(data_structure)
            // console.log(typeof(data_structure));
            data = data_structure
                // console.log(typeof(data))
            console.log(d3v4.keys(data))



            x.domain(d3v4.keys(data).map(function(d) { return d; }));
            var maxUp = d3v4.max(d3v4.entries(data), function(d) { return d.value["totalS"]; });
            var maxDown = d3v4.max(d3v4.entries(data), function(d) { return d.value["totalR"]; });
            console.log(maxUp, maxDown)
            colour.domain([0, maxUp]);

            y.domain([0, maxUp + 10])
            yDown.domain([maxDown + 10, 0])
                // y.domain([0, 100])
                // yDown.domain([0, 100])

            const yAxisTicks = y.ticks()
                .filter(Number.isInteger);
            const yDownAxisTicks = yDown.ticks()
                .filter(Number.isInteger);
            var yAxis = svg.append('g')
                // svg.append("g")
                //     .attr("class", "y-axis")
                //     .attr("transform", "translate(" + x(0) + ",0)")
                //     .append("line")
                //     .attr("fill", "white")
                //     .attr("y1", 0)
                //     .attr("y2", height);
                .call(d3v4.axisLeft(y)
                    .tickValues(yAxisTicks)
                    .tickFormat(d3v4.format('d')))
            var yDownAxis = svg.append("g")
                .call(d3v4.axisLeft(yDown)
                    .tickValues(yDownAxisTicks)
                    .tickFormat(d3v4.format('d')))

            var xAxis = svg.append("g")
                .attr("class", "x-axis")
                .attr("transform", "translate(0," + (height + cfg.xAxisMargin) + ")")
                .call(d3v4.axisBottom(x).tickSizeOuter(0));

            var bars = svg.append("g")
                .attr("class", "bars")

            // BARRE SUPERIORI
            bars.selectAll("rect")
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
                .style("fill", function(d) {
                    // return colour(d.value["totalS"])
                    return "green"
                });

            // BARRE INFERIORI
            bars.selectAll("rect2")
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
                    return height / 2;
                })
                .style("fill", function(d) {
                    // return colorRed(d.value["totalR"])
                    return "red"
                });

            var tipExp = d3v4.tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0])
                .html(function(d) {
                    return '<strong>Exported: ' + d.value["totalS"] + '</strong>'
                })
            svg.call(tipExp);


            d3v4.selectAll(".div-bars-exp")
                .on('mouseover', d => tipExp.show(d))
                .on('mouseout', tipExp.hide)

            var tipImp = d3v4.tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0])
                .html(function(d) {
                    return '<strong>Imported: ' + d.value["totalR"] + '</strong>';
                })
            svg.call(tipImp);


            d3v4.selectAll(".div-bars-imp")
                .on('mouseover', d => tipImp.show(d))
                .on('mouseout', tipImp.hide)


            var labels = svg.append("g")
                .attr("class", "labels");

            labels.selectAll("text")
                .data(d3v4.entries(data))
                .enter().append("text")
                .attr("class", "bar-label")
                .attr("x", x(0))
                .attr("y", function(d) { return y(d.key) })
                .attr("dx", function(d) {
                    return d.value["totalS"] < 0 ? cfg.labelMargin : -cfg.labelMargin;
                })
                .attr("dy", x.bandwidth())
                .attr("text-anchor", function(d) {
                    return d.value["totalS"] < 0 ? "start" : "end";
                })
                .text(function(d) { return d.key })
                .style("fill", function(d) {
                    if (Array.from(d.value).includes("ITA")) {
                        return "blue";
                    } else
                        return "white"
                });

        });
    }

    return {
        drawChart: drawChart,
    }


    function stripNum(input) {
        if (input == null || input == "")
            return 0;

        // In case of (delivered num.)
        if (input.indexOf("(") >= 0 || input.indexOf(")") >= 0)
            return parseInt(input.replace("(", "").replace(")", ""));

        // Other cases
        return parseInt(input);

    }

    function stripYear(input) {
        if (input == null || input == "")
            return "";

        // In case of not unique delivered year
        if (input.indexOf("-") >= 0)
            return parseInt(input.split("-")[1]);

        // In case of (ordered year)
        if (input.indexOf("(") >= 0 || input.indexOf(")") >= 0)
            return parseInt(input.replace("(", "").replace(")", ""));

        // Other cases
        return parseInt(input);

    }

}