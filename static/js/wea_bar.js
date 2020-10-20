var wea_bar = function() {

    //GLOBALS
    // set the dimensions and margins of the graph
    var margin = {
        top: 40,
        right: 15,
        bottom: 100,
        left: 50
    }
    var width = 350 - margin.left - margin.right
    var height = 500 - margin.top - margin.bottom;

    var orderedWeapons;
    var saved_local_ordered;
    var svg
    var x;
    var y;
    var fixedScale = true;



    var imageTip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {

            return '<img alt="weapon img" src="static/icons/categories/' + d + '.jpeg" width="70" height="70" />';
        })

    document.body.onload = function() {
        txt = $("#" + chosen_category.replace(/ /g, "_").replace(/\//g, "_") + "_desc").text()
        $("#weapon_description").html(txt)
        d3.select("#weapon_desc_head").text("Weapon description: ")
            .append("span")
            .text("\u00A0" + chosen_category).style("color", "orange")
    }

    function drawBar() {
        // append the svg object to the body of the page
        svg = d3.select("#my_dataviz")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", -38)
            .attr("y", -8)
            .style("fill", "white")
            .text("Weapon units")
            .style("font-size", "11px")
            .attr("text-anchor", "start")
            // Parse the Data
        d3.csv("static/data/merged1990.csv", function(data) {
            savedDataset = data;
            // console.log(data)
            orderedWeapons = d3.nest()
                .key(function(d) {
                    // if (!cats.includes(d["Weapon category"]))
                    //     cats.push(d["Weapon category"])
                    return d["Weapon category"];
                })
                .rollup(function(v) {
                    return d3.sum(v, function(d) {
                        //return d.Ordered;
                        return parseInt(d.Ordered.replace(/\(|\)/g, ""));
                    })

                })
                .entries(data)
                .sort(function(a, b) {
                    return b.value - a.value;
                })
                .slice(0, NUM_CATEGORIES)

            chosen_category = ((orderedWeapons.length > 0) ? orderedWeapons[0]["key"] : null)


            // console.log(orderedWeapons.length)
            console.log("ORD", data);

            // X axis
            x = d3.scaleBand()
                .range([0, width])
                .domain(orderedWeapons.map(function(d) {
                    return d.key;
                }))
                .padding(0.2);

            svg.append("g")
                .attr("id", "x-bar-axis")
                .attr("class", "wtext")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x))
                .selectAll("text")
                .attr("transform", "translate(-10,0)rotate(-60)")
                .style("text-anchor", "end")


            svg.call(imageTip);


            svg.select("#x-bar-axis").selectAll(".tick")
                .select("g > text")
                .on('mouseover', function(d) {
                    // console.log(this)

                    mouseOverText(this)
                        // .style("fill", "orange");

                    imageTip.show(d)
                })
                .on('mouseout', function(d) {

                    mouseOutText(this, d)
                })
                .on("click", function() {
                    //alert("click")
                    clickText(this)
                })
            var tip = d3.tip()
                .attr('class', 'd3-tip2')
                .offset([-10, 0])
                .html(function(d) {
                    return "<strong>Ordered:</strong> <span style='color:red'>" + d.value + "</span>";
                })


            svg.call(tip);

            svg.selectAll(".tick").select("g > text")
                .filter(function() {
                    return d3.select(this).text() == chosen_category
                })
                .style("fill", "orange")

            d3.select("#scatter_title").text("Models in category: ")
                .append("span")
                .text("\u00A0" + chosen_category).style("color", "orange")
            $("#barchart_title").html("Weapons requests by top " + NUM_CATEGORIES + " categories")

            txt = $("#" + chosen_category.replace(/ /g, "_").replace(/\//g, "_") + "_desc").text()
            if (txt == "" || txt == null || txt == undefined)
                txt = "Not available at the moment."
            $("#weapon_description").html(txt)


            // Add Y axis
            y = d3.scaleLinear()
                //.domain([0, 80000])
                .domain([0, orderedWeapons[0].value + 100000])
                .range([height, 0]);
            svg.append("g")
                .attr("id", "y-bar-axis")
                .call(d3.axisLeft(y));

            // Bars
            bs = svg.selectAll("mybar")
                .data(orderedWeapons)
                .enter()
                .append("rect")
                .attr("class", "bar-rect")
                .attr("id", d => "bar-" + d.key.replace(/ /g, "_").replace(/\//g, "_"))
                .attr("x", function(d) {
                    return x(d.key);
                })
                .attr("width", x.bandwidth())
                .attr("fill", dd => {
                    if (dd.key == orderedWeapons[0].key) {
                        return "orange"
                    } else
                        return "#69b3a2"

                })
                // no bar at the beginning thus:
                .attr("height", function(d) {
                    return height - y(0);
                }) // always equal to 0
                .attr("y", function(d) {
                    return y(0);
                })

            // prev_rect = d3.select("#bar-" + orderedWeapons[0].key)

            svg.selectAll(".bar-rect").on('mouseover', tip.show)
                .on('mouseout', tip.hide)
                .on("click", function(d) {
                    // if (prev_rect)
                    //     prev_rect.attr("fill", "#69b3a2")
                    chosen_category = d.key

                    svg.selectAll("rect").style("fill", "#69b3a2")
                    d3.select("#scatter_title").text("Weapons by model: ")
                        .append("span")
                        .text("\u00A0" + chosen_category).style("color", "orange")
                    console.log(d3.select(this))
                    d3.select(this).style("fill", "orange")
                    svg.select("#x-bar-axis").selectAll(".tick")
                        .select('g > line')
                        .style("stroke", d => {
                            return (d == chosen_category) ? "orange" : "white"
                        })

                    svg.select("#x-bar-axis").selectAll(".tick")
                        .select('g > text')
                        .style("fill", d => {
                            if (d == chosen_category)
                                return "orange"
                            else
                                return "white"

                        })
                    txt = $("#" + chosen_category.replace(/ /g, "_").replace(/\//g, "_") + "_desc").text()
                    if (txt == "" || txt == null || txt == undefined)
                        txt = "Not available at the moment."
                    $("#weapon_description").html(txt)
                    d3.select("#weapon_desc_head").text("Weapon description: ")
                        .append("span")
                        .text("\u00A0" + chosen_category).style("color", "orange")

                    wc.heatmapTransition()

                })

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
    }



    function transitionBar() {
        var local_data = savedDataset
        var local_ordered = orderedWeapons

        if (isFiltered) {
            local_data = local_data.filter(d => stripYear(d["Delivered year"]) >= years[0] &&
                stripYear(d["Delivered year"]) <= years[1])

            if (selected_group != [])
                local_data = local_data.filter(d => selected_group.includes(d["codeS"]) || selected_group.includes(d["codeR"]))


            console.log("transitioned", local_data)

            local_ordered = d3.nest()
                .key(function(d) {
                    // if (!cats.includes(d["Weapon category"]))
                    //     cats.push(d["Weapon category"])
                    return d["Weapon category"];
                })
                .rollup(function(v) {
                    return d3.sum(v, function(d) {
                        //return d.Ordered;
                        return parseInt(d.Ordered.replace(/\(|\)/g, ""));
                    })

                })
                .entries(local_data)
                .sort(function(a, b) {
                    return b.value - a.value;
                })
                .slice(0, NUM_CATEGORIES)





        }
        // console.log("=>", local_ordered)
        x.range([0, width])
            .domain(local_ordered.map(function(d) {
                return d.key;
            })).padding(0.2);



        saved_local_ordered = local_ordered

        wc.chosen_category_only(local_ordered[0].key)

        if (fixedScale && saved_local_ordered != undefined)
            y.domain([0, orderedWeapons[0].value + 100000])
        else
            y.domain([0, d3.max(saved_local_ordered, function(d) { return d.value })])

        svg.select("#y-bar-axis")
            .transition()
            .duration(1000)
            .call(d3.axisLeft(y))


        var u = svg.selectAll(".bar-rect")
            .data(local_ordered)

        u
            .transition()
            .delay(100)
            .duration(1000)
            .attr("class", "bar-rect")
            .attr("id", d => "bar-" + d.key.replace(/ /g, "_").replace(/\//g, "_"))
            .attr("x", function(d) {
                return x(d.key);
            })
            .attr("width", x.bandwidth())
            .style("fill", dd => {
                if (dd.key == local_ordered[0].key) {
                    console.log("filling", local_ordered[0], dd)

                    return "orange"
                } else
                    return "#69b3a2"

            })

        .attr("y", function(d) {
                return !isNaN(d.value) ? y(d.value) : 0;
            })
            .attr("height", function(d) {
                // console.log(d.value)
                return !isNaN(d.value) ? height - y(d.value) : height;
            })

        u
            .exit()
            .transition() // and apply changes to all of them
            .duration(1000)
            .style("opacity", 0)
            .remove()

        svg.selectAll(".wtext")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-60)")
            .style("text-anchor", "end")

        svg.selectAll(".tick")
            .select('g > text')
            .style("fill", function() {
                if (d3.select(this).text() == chosen_category)
                    return "orange"
                else
                    return "white"
            })
            .on('mouseover', function(d) {
                // console.log(this)

                mouseOverText(this)
                    // .style("fill", "orange");

                imageTip.show(d)
            })
            .on('mouseout', function(d) {

                mouseOutText(this, d)
            })
            .on("click", function() {
                //alert("click")
                clickText(this)
            })

        svg.selectAll(".tick")
            .select('g > line')
            .style("stroke", function() {
                if (d3.select(this).text() == chosen_category)
                    return "orange"
                else
                    return "white"
            })

    }



    function clickText(questo) {

        svg.selectAll(".tick")

        .select('g > text')
            .style("fill", "white")

        svg.selectAll(".tick")

        .select('g > line')
            .style("stroke", "white")

        d3.selectAll(".bar-rect").style("fill", "#69b3a2")
        chosen_category = d3.select(questo).text()

        d3.select(questo).style("fill", "orange")
            // console.log(svg.select(questo))
            // svg.select(questo.parentNode)
            //     .select('g > line')
            //     .style("stroke", "orange")


        d3.select("#scatter_title").text("Models in category: ")
            .append("span")
            .text("\u00A0" + chosen_category).style("color", "orange")
            // d3.select("#scatter_svg").remove()
            //drawScatter()

        d3.select("#bar-" + chosen_category.replace(/ /g, "_").replace(/\//g, "_")).style("fill", "orange")
        wc.heatmapTransition()
        console.log("Plot recomputed")

        console.log(chosen_category)
        txt = $("#" + chosen_category.replace(/ /g, "_").replace(/\//g, "_") + "_desc").text()
        if (txt == "" || txt == null || txt == undefined)
            txt = "Not available at the moment."
        $("#weapon_description").html(txt)
        d3.select("#weapon_desc_head").text("Weapon description: ")
            .append("span")
            .text("\u00A0" + chosen_category).style("color", "orange")

    }

    function mouseOverText(questo) {
        d3.select(questo).style("font-size", "20px")
        if (d3.select(questo).text() != chosen_category) {
            d3.select(questo.parentNode).select('g > line')
                .style("stroke", "rgba(17,222,222,1)");

            d3.select(questo)
                .style("fill", "rgba(17,222,222,1)");
        }
    }

    function mouseOutText(questo, d) {

        d3.select(questo).style("font-size", "14px")
        if (d3.select(questo).text() != chosen_category) {
            d3.select(questo).select('g > line').style("stroke", "white");
            d3.select(questo).style("fill", "white");
        } else {
            d3.select(questo.parentNode).select('g > line').style("stroke", "orange");
            d3.select(questo).style("fill", "orange");
        }
        imageTip.hide(d)
    }


    function changeScale() {
        fixedScale = !fixedScale
            // console.log(d3.max(saved_local_ordered, function(d) { return d.value }))
        transitionBar()
    }

    return {
        drawBar: drawBar,
        transitionBar: transitionBar,
        changeScale: changeScale,
    };

}