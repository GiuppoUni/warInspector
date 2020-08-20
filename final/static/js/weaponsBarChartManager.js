var weaponsBarChartManager = function() {

    var drawChart = function() {
        NUM_CATEGORIES = 15
        chosen_category = ""

        // set the dimensions and margins of the graph
        var margin = {
                top: 10,
                right: 30,
                bottom: 100,
                left: 130
            },
            width = 400 - margin.left - margin.right,
            height = 300 - margin.top - margin.bottom;

        document.body.onload = function() {
            if (chosen_category.includes("/"))
                desc_category = chosen_category.split("/")[1]
            txt = $("#" + desc_category.replace(" ", "_") + "_desc").text()
            $("#weapon_description").html(txt)

        }

        // append the svg object to the body of the page
        var svg = d3v4.select("#weapons_dataviz")
            .append("svg")
            .attr("id", "weapons-svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        // Parse the Data
        d3v4.csv("static/data/merged.csv", function(data) {
                console.log(data)

                //FILTERING DATA
                data = data.filter(d => selected_group.includes(d.codeS) || selected_group.includes(d.codeR)).filter(d =>
                    parseInt(d["Delivered year"].replace(/\(|\)/g, "")) >= years[0] &&
                    parseInt(d["Delivered year"].replace(/\(|\)/g, "")) <= years[1]);

                orderedWeapons = d3v4.nest()
                    .key(function(d) {
                        // if (!cats.includes(d["Weapon category"]))
                        //     cats.push(d["Weapon category"])
                        return d["Weapon category"];
                    })
                    .rollup(function(v) {
                        return d3v4.sum(v, function(d) {
                            return d["Delivered num."].replace("(", "").replace(")", "");
                        })

                    })
                    .entries(data)
                    .sort(function(a, b) {
                        return b.value - a.value;
                    })
                    .slice(0, NUM_CATEGORIES)

                chosen_category = ((orderedWeapons.length > 0) ? orderedWeapons[0]["key"] : null)

                // console.log(orderedWeapons.length)
                console.log(orderedWeapons);

                // X axis
                var x = d3v4.scaleBand()
                    .range([0, width])
                    .domain(orderedWeapons.map(function(d) {
                        return d.key;
                    }))
                    .padding(0.2);

                svg.append("g")
                    .attr("class", "wtext")
                    .attr("transform", "translate(0," + height + ")")
                    .call(d3v4.axisBottom(x))
                    .selectAll("text")
                    .attr("transform", "translate(-10,0)rotate(-45)")
                    .style("text-anchor", "end")

                var imageTip = d3v4.tip()
                    .attr('class', 'd3v4-tip')
                    .offset([-10, 0])
                    .html(function(d) {

                        return '<img alt="weapon img" src="static/icons/categories/' + d + '.jpeg" width="70" height="70" />';
                    })

                svg.call(imageTip);


                svg.selectAll(".tick")
                    .on('mouseover', function(d) {
                        // console.log(this)

                        d3v4.select(this).style("font-size", "20px")
                        if (d3v4.select(this).text() != chosen_category)
                            d3v4.select(this).select('g > text').style("fill", "rgba(17,222,222,1)");

                        imageTip.show(d)
                    })
                    .on('mouseout', function(d) {

                        d3v4.select(this).style("font-size", "14px")
                        if (d3v4.select(this).text() != chosen_category)
                            d3v4.select(this).select('g > text').style("fill", "white");
                        else
                            d3v4.select(this).select('g > text').style("fill", "red");

                        imageTip.hide(d)
                    })
                    .on("click", function() {
                        //alert("click")
                        svg.selectAll(".tick")
                            .filter(function() {
                                return d3v4.select(this).text() == chosen_category
                            })
                            .select('g > text')
                            .style("fill", "white")

                        desc_category = d3v4.select(this).text()

                        // $("#scatter_title").html("Weapons by model: " + chosen_category)

                        // d3v4.select("#scatter_svg").remove()
                        // drawScatter()
                        // console.log("Plot recomputed")

                        if (desc_category.includes("/"))
                            desc_category = desc_category.split("/")[1]

                        txt = $("#" + desc_category.replace(" ", "_") + "_desc").text()
                        if (txt == "" || txt == null || txt == undefined)
                            txt = "Not available at the moment."
                        $("#weapon_header").html("Weapon Description: " + "<h7 style='color:red'> &nbsp" + desc_category + "</h7>")
                        $("#weapon_description").html(txt)

                    })
                var tip = d3v4.tip()
                    .attr('class', 'd3v4-tip')
                    .offset([-10, 0])
                    .html(function(d) {
                        return "<strong style='color:white'>Ordered:</strong> <span style='color:red'>" + d.value + "</span>";
                    })


                svg.call(tip);

                svg.selectAll(".tick")
                    .filter(function() {
                        return d3v4.select(this).text() == chosen_category
                    })
                    .select('g > text')
                    .style("fill", "red")

                $("#scatter_title").html("Weapons by model: " + chosen_category)
                $("#barchart_title").html("Weapons requests by top " + NUM_CATEGORIES + " categories")
                if (chosen_category.includes("/"))
                    chosen_category = chosen_category.split("/")[1]
                txt = $("#" + chosen_category.replace(" ", "_") + "_desc").text()
                if (txt == "" || txt == null || txt == undefined)
                    txt = "Not available at the moment."
                $("#weapon_header").html("Weapon Description: " + "<h7 style='color:red'> &nbsp" + chosen_category + "</h7>")
                $("#weapon_description").html(txt)


                // Add Y axis
                var y = d3v4.scaleLinear()
                    .domain([0, 2000])
                    .range([height, 0]);
                svg.append("g")
                    .call(d3v4.axisLeft(y));

                // Bars
                svg.selectAll("mybar")
                    .data(orderedWeapons)
                    .enter()
                    .append("rect")
                    .attr("x", function(d) {
                        return x(d.key);
                    })
                    .attr("width", x.bandwidth())
                    .attr("fill", "#69b3a2")
                    // no bar at the beginning thus:
                    .attr("height", function(d) {
                        return height - y(0);
                    }) // always equal to 0
                    .attr("y", function(d) {
                        return y(0);
                    })
                    .on('mouseover', tip.show)
                    .on('mouseout', tip.hide)

                // Animation
                svg.selectAll("rect")
                    .transition()
                    .duration(800)
                    .attr("y", function(d) {

                        return !isNaN(d.value) ? y(d.value) : 0;
                    })
                    .attr("height", function(d) {
                        return !isNaN(d.value) ? height - y(d.value) : height;
                    })
                    .delay(function(d, i) {
                        // console.log(i);
                        return (i * 100)
                    })

            })
            /***********
             * SCATTER *
             ***********/

        function drawScatter() {
            // set the dimensions and margins of the graph
            var margin = {
                    top: 10,
                    right: 30,
                    bottom: 130,
                    left: 60
                },
                width = 700 - margin.left - margin.right,
                height = 370 - margin.top - margin.bottom;
            // append the svg object to the body of the page
            var svg = d3v4.select("#scatter_viz")
                .append("svg")
                .attr("id", "scatter_svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")")

            //Read the data
            d3v4.csv("static/data/merged.csv", function(data) {
                filteredModels = data
                    .filter(function(d) {
                        return d["Weapon category"] == chosen_category
                    })

                modelList = Array.from(new Set(filteredModels.map(function(d) {
                    return d["Weapon model"];
                })))

                //console.log("Debug")
                //console.log(filteredModels)


                // Add X axis
                var x = d3v4.scaleBand()
                    .domain([0, 0])
                    .range([0, width]);
                svg.append("g")
                    .attr("class", "myXaxis") // Note that here we give a class to the X axis, to be able to call it later and modify it
                    .attr("transform", "translate(0," + height + ")")
                    .call(d3v4.axisBottom(x))
                    .attr("opacity", "0")

                // Add Y axis
                var y = d3v4.scaleBand()
                    .domain(Array.from(Array(30), (_, i) => i + 1989))
                    .range([height, 0]);
                svg.append("g")
                    .call(d3v4.axisLeft(y));

                // Add dots
                svg.append('g')
                    .selectAll("dot")
                    .data(filteredModels)
                    .enter()
                    .append("circle")
                    .attr("cx", function(d) {
                        return x(d["Weapon model"]);
                    })
                    .attr("cy", function(d) {
                        return y(parseInt(d["Ordered year"].replace("(", "").replace(")", "")));
                    })
                    .attr("r", 1.5)
                    .style("fill", "#69b3a2")

                // new X axis
                x.domain(modelList)
                svg.select(".myXaxis")
                    .transition()
                    .duration(2000)
                    .attr("opacity", "1")
                    .call(d3v4.axisBottom(x))
                    .selectAll("text")
                    .attr("transform", "translate(-10,0)rotate(-50)")
                    .style("text-anchor", "end")

                svg.selectAll("circle")
                    .transition()
                    .delay(function(d, i) {
                        return (i * 3)
                    })
                    .duration(2000)
                    .attr("cx", function(d) {
                        return x(d["Weapon model"]);
                    })
                    .attr("cy", function(d) {
                        return y(parseInt(d["Ordered year"].replace("(", "").replace(")", "")));
                    })
            })
        }
    }
    return {
        drawChart: drawChart,
    }
}