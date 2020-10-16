var wea_conf = function() {

    // set the dimensions and margins of the graph
    var margin = {
            top: 10,
            right: 10,
            bottom: 120,
            left: 40
        },
        width = 1000 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var svg2 = d3.select("#scatter_viz")
        .append("svg")
        .attr("id", "scatter_svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")")

    var x;
    var y;
    var heatColor = "red"


    const heatTip = d3.tip()
        .attr('class', 'd3-tip2')
        .offset([-10, 0])
        .html(function(d) {
            // console.log(d)
            return "<b>Model: </b>" + d.key.split(",")[0] + "<br><b>Year: </b>" + d.key.split(",")[1] + "</strong><br><b>Value: </b>" + d.value;
        })

    function drawHeatmap() {



        // append the svg object to the body of the page


        //Read the data
        d3.csv("static/data/merged1990.csv", function(data) {

            filteredModels = data
                .filter(function(d) {
                    return d["Weapon category"] == chosen_category
                })
            if (isFiltered) {
                filteredModels = filteredModels.filter(d => stripYear(d["Delivered year"]) >= years[0] &&
                    stripYear(d["Delivered year"]) <= years[1])

                if (selected_group != [])
                    filteredModels = filteredModels.filter(d => selected_group.includes(d["codeS"]) || selected_group.includes(d["codeR"]))


            }
            modelList = Array.from(new Set(filteredModels.map(function(d) {
                    return d["Weapon model"];
                })))
                // console.log("f0,", filteredModels)


            groupedModels = d3.nest()
                .key(function(d) {
                    return d["Weapon model"] + "," + stripYear(d["Delivered year"]);
                })
                .rollup(function(v) {
                    return d3.sum(v, function(d) {
                        // console.log(parseInt(d["Delivered num."].replace(/\(|\)/g, "")))
                        del = parseInt(d["Delivered num."].replace(/\(|\)/g, ""))
                        return isNaN(del) ? 0 : del;
                    })

                })
                .entries(filteredModels)

            const ordGroup = d3.nest()
                .key(function(d) {
                    return d.key.split(",")[0];
                })
                .rollup(function(v) {
                    return d3.sum(v, function(d) {
                        // console.log(parseInt(d["Delivered num."].replace(/\(|\)/g, "")))
                        del = d.value
                        return isNaN(del) ? 0 : del;
                    })

                })
                .entries(groupedModels).sort(function(x, y) {
                    return d3.descending(x.value, y.value);
                })

            modelList = ordGroup.map(d => d.key)

            console.log("f,", groupedModels)
            savedModelList = modelList
            console.log("drawHeatmap -> modelList", modelList)
                //console.log("groupedModels", groupedModels);



            // Build color scale
            var myColor = d3.scaleLog()
                .clamp(true)
                .range(["white", "red"])
                .domain([10, d3.max(groupedModels, function(d) {
                    return d.value
                })])

            for (let index = 0; index < yearsList.length; index++) {
                var year = yearsList[index];
                // console.log(element)
                // find_wea = element["Weapon model"]
                // find_year = element["Delivered year"]
                for (let k = 0; k < modelList.length; k++) {
                    var weapon = modelList[k];


                    final_string = weapon + "," + year
                    found = false
                    for (let j = 0; j < groupedModels.length; j++) {
                        const g_el = groupedModels[j];
                        if (g_el.key == final_string) {
                            found = true
                        }
                    }
                    if (!found) {
                        // console.log("NOT FOUND")
                        groupedModels.push({
                            "key": final_string,
                            "value": 0
                        });
                    }
                }
            }

            // Build X scales and axis:
            x = d3.scaleBand()
                .range([0, width])
                .domain(modelList)
                .padding(0.01);
            svg2.append("g")
                .attr("id", "x-heat-axis")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x))
                .selectAll("text")
                .style("fill", d => {
                    return d == modelList[0] ? "red" : "white"
                })
                .attr("transform", "rotate(-60)")
                .style("text-anchor", "end");

            savedGrouped = groupedModels
            console.log("ff,", groupedModels)

            instant_chosen_model(modelList[0])

            superFilteredModels = filteredModels.filter(d => d["Weapon model"] == clickedModelChosen)
            tabulate(superFilteredModels, columns, true, false)

            // old_font_size = svg2.select("#x-heat-axis").selectAll(".tick").selectAll("g > text").filter(d => d3.select(d).style("font-size") != "20px").style("font-size")
            // if (old_font_size == null)
            old_font_size = "11px"
            console.log("drawHeatmap", old_font_size)
            svg2.select("#x-heat-axis").selectAll(".tick")
                .on('mouseover', function(d) {
                    // console.log(this)
                    svg2.select("#x-heat-axis").selectAll(".tick").select("g > text")
                        .filter(d => d.text != modelChosen && d.text != clickedModelChosen)
                        .style("font-size", old_font_size)
                        .attr("fill", "white");


                    d3.select(this).style("font-size", "20px")
                    if (d3.select(this).text() != modelChosen) {
                        // d3.select(this).select('g > text').style("fill", "rgba(17,222,222,1)");
                        d3.select(this).select('g > text').style("font-size", "20px").style("fill", "red");
                    }
                    start_timer_chosen_model(d3.select(this).text())

                    oldTick = d3.select(this)
                })
                .on('mouseout', function(d) {
                    svg2.select("#x-heat-axis").selectAll(".tick").select("g > line")
                        .style("stroke", d => d != clickedModelChosen ? "white" : "red");
                    svg2.select("#x-heat-axis").selectAll(".tick").select("g > text")
                        .style("font-size", d => d != clickedModelChosen ? old_font_size : "20px")
                        .style("fill", d => d != clickedModelChosen ? "white" : "red");

                    if (d3.select(this).text() != clickedModelChosen) {
                        start_timer_chosen_model(clickedModelChosen)
                    }
                })
                .on('click', function(d) {
                    svg2.select("#x-heat-axis").selectAll(".tick").select("g > line")
                        .style("stroke", "white");

                    svg2.select("#x-heat-axis").selectAll(".tick").select("g > text")
                        .filter(d => d.text != modelChosen)
                        .style("font-size", old_font_size)
                        .attr("fill", "white");

                    if (d3.select(this).text() != clickedModelChosen) {
                        // d3.select(this).select('g > text').style("fill", "rgba(17,222,222,1)");
                        d3.select(this).select('g > text').style("fill", "red");
                        d3.select(this).style("font-size", "20px")
                        console.log("clicked")
                        start_timer_chosen_model(d3.select(this).text(), "click")
                    }

                })


            // Build Y scales and axis:
            y = d3.scaleBand()
                .range([height, 0])
                .domain(yearsList)
                .padding(0.01);
            svg2.append("g")
                .call(d3.axisLeft(y));


            console.log("gggg", groupedModels)
            svg2.selectAll()
                .data(groupedModels)
                .enter()
                .append("rect")
                .attr("class", "heatSquare")
                .attr("x", function(d) {
                    return x(d.key.split(",")[0])
                })
                .attr("y", function(d) {
                    return y(d.key.split(",")[1])
                })
                .attr("width", x.bandwidth())
                .attr("height", y.bandwidth())
                .style("fill", function(d) {
                    return myColor(parseInt(d.value))
                })




            svg2.call(heatTip);

            svg2.selectAll(".heatSquare")
                .on('mouseover', d => {
                    svg2.select("x-heat-axis").selectAll(".tick")
                        .select('g > line').style("stroke", function(dd) {
                            return dd == d.d.key.split(",")[0] ? "red" : "white"
                        })
                        .select('g > text').style("fill", function(dd) {
                            return dd == d.d.key.split(",")[0] ? "red" : "white"
                        })
                    heatTip.show(d);
                    start_timer_chosen_model(d.key.split(",")[0])
                })
                .on('mouseout', heatTip.hide)

        });
    }


    function heatmapTransition(isFromSelectPicker = false) {

        // console.log("Transition")
        filteredModels = savedDataset
            .filter(function(d) {
                return d["Weapon category"] == chosen_category
            })

        modelList = Array.from(new Set(filteredModels.map(function(d) {
            return d["Weapon model"];
        })))

        if (isFiltered) {
            console.log("ultraFiltered")
            filteredModels = filteredModels.filter(d => stripYear(d["Delivered year"]) >= years[0] &&
                stripYear(d["Delivered year"]) <= years[1])

            if (selected_group != [])
                filteredModels = filteredModels.filter(d => selected_group.includes(d["codeS"]) || selected_group.includes(d["codeR"]))


        }
        groupedModels = d3.nest()
            .key(function(d) {
                return d["Weapon model"] + "," + stripYear(d["Delivered year"]);
            })
            .rollup(function(v) {
                return d3.sum(v, function(d) {
                    // console.log(parseInt(d["Delivered num."].replace(/\(|\)/g, "")))
                    del = parseInt(d["Delivered num."].replace(/\(|\)/g, ""))
                    return isNaN(del) ? 0 : del;
                })

            })
            .entries(filteredModels)
            // console.log("f,", groupedModels)

        for (let index = 0; index < yearsList.length; index++) {
            var year = yearsList[index];
            // console.log(element)
            // find_wea = element["Weapon model"]
            // find_year = element["Delivered year"]
            for (let k = 0; k < modelList.length; k++) {
                var weapon = modelList[k];


                final_string = weapon + "," + year
                found = false
                for (let j = 0; j < groupedModels.length; j++) {
                    const g_el = groupedModels[j];
                    if (g_el.key == final_string) {
                        found = true
                    }
                }
                if (!found) {
                    // console.log("NOT FOUND")
                    groupedModels.push({
                        "key": final_string,
                        "value": 0
                    });
                }
            }
        }

        const ordGroup = d3.nest()
            .key(function(d) {
                return d.key.split(",")[0];
            })
            .rollup(function(v) {
                return d3.sum(v, function(d) {
                    // console.log(parseInt(d["Delivered num."].replace(/\(|\)/g, "")))
                    del = d.value
                    return isNaN(del) ? 0 : del;
                })

            })
            .entries(groupedModels).sort(function(x, y) {
                return d3.descending(x.value, y.value);
            })

        modelList = ordGroup.map(d => d.key)

        savedGrouped = groupedModels

        var myColor = d3.scaleLog()
            .range(["white", heatColor])
            .domain([1, d3.max(groupedModels, function(d) {
                return d.value
            })])

        x.domain(modelList)
        svg2.select("#x-heat-axis")
            .transition()
            .duration(2000)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("fill", d => {
                if (isFromSelectPicker)
                    return d == modelChosen ? "red" : "white"
                else
                    return d == modelList[0] ? "red" : "white"
            })
            .attr("transform", "rotate(-60)")
            .style("text-anchor", "end")

        if (!isFromSelectPicker)
            instant_chosen_model(modelList[0])
        else
            instant_chosen_model(modelChosen)


        // console.log("asd", modelList[0])

        superFilteredModels = filteredModels.filter(d => d["Weapon model"] == clickedModelChosen)
        tabulate(superFilteredModels, columns, true, false)


        svg2.select("#x-heat-axis")
            .selectAll(".tick")
            .on('mouseover', function(d) {
                // console.log(this)
                svg2.select("#x-heat-axis").selectAll(".tick").select("g > line")
                    .style("stroke", "white");
                svg2.select("#x-heat-axis").selectAll(".tick").select("g > text")
                    .filter(d => d.text != modelChosen && d.text != clickedModelChosen)
                    .style("font-size", old_font_size)
                    .attr("fill", "white");


                d3.select(this).style("font-size", "20px")
                if (d3.select(this).text() != modelChosen) {
                    // d3.select(this).select('g > text').style("fill",
                    // "rgba(17,222,222,1)");
                    d3.select(this).select('g > line').style("stroke", "red");

                    d3.select(this).select('g > text').style("font-size", "20px").style("fill", "red");
                }
                start_timer_chosen_model(d3.select(this).text())
                oldTick = d3.select(this)
            })
            .on('mouseout', function(d) {
                svg2.select("#x-heat-axis").selectAll(".tick").select("g > line")
                    .style("stroke", d => d != clickedModelChosen ? "white" : "red");

                svg2.select("#x-heat-axis").selectAll(".tick").select("g > text")
                    .style("font-size", d => d != clickedModelChosen ? old_font_size : "20px")
                    .style("fill", d => d != clickedModelChosen ? "white" : "red");

                if (d3.select(this).text() != clickedModelChosen) {
                    start_timer_chosen_model(clickedModelChosen)
                }
            })
            .on('click', function(d) {
                svg2.select("#x-heat-axis").selectAll(".tick").select("g > line")
                    .attr("fill", "white");
                svg2.select("#x-heat-axis").selectAll(".tick").select("g > text")
                    .filter(d => d.text != modelChosen)
                    .style("font-size", old_font_size)
                    .attr("fill", "white");

                if (d3.select(this).text() != clickedModelChosen) {
                    // d3.select(this).select('g > text').style("fill", "rgba(17,222,222,1)");
                    d3.select(this).select('g > line').style("stroke", "red");
                    d3.select(this).select('g > text').style("fill", "red");
                    d3.select(this).style("font-size", "20px")
                    start_timer_chosen_model(d3.select(this).text(), "click")

                }
            })



        var u = svg2.selectAll(".heatSquare")
            .data(groupedModels)
        u
            .enter()
            .append("rect") // Add a new circle for each new elements
            .merge(u) // get the already existing elements as well
            .transition()
            .duration(2000)
            .attr("class", "heatSquare")
            .attr("x", function(d) {
                return x(d.key.split(",")[0])
            })
            .attr("y", function(d) {
                return y(d.key.split(",")[1])
            })
            .attr("width", x.bandwidth())
            .attr("height", y.bandwidth())
            .style("fill", function(d) {
                console.log("asd", parseInt(d.value))
                return myColor(parseInt(d.value))
            })

        u.exit()
            .transition() // and apply changes to all of them
            .duration(2000)
            .style("opacity", 0)
            .remove()

        u.on('mouseover', d => {
                start_timer_chosen_model(d.key.split(",")[0]);
                heatTip.show(d)
            })
            .on('mouseout', heatTip.hide)




    }



    function instant_chosen_model(d) {
        d3.select("#line-header")
            .text("Num. exchanged for model: ")
            .append("span")
            .text("\u00A0" + d).style("color", "red");
        svg2.selectAll(".tick").selectAll("g > line").style("stroke", dd => dd == d ? "red" : "white")
        svg2.selectAll(".tick").selectAll("g > text").attr("fill", dd => dd == d ? "red" : "white").style("font-size", dd => dd == d ? "20px" : old_font_size)
            // .text("Model traded values: " + d)
        if (sliderTimer != undefined)
            clearTimeout(sliderTimer)
        if (d != modelChosen) {
            clickedModelChosen = d
            modelChosen = d;
            $("#selectModel").val(d)
            $("#selectModel").selectpicker("refresh");
            // console.log(d);
            wl.drawChart()

        }
    }


    function start_timer_chosen_model(d, type = "nonClick") {
        d3.select("#line-header")
            .text("Num. exchanged of model: ")
            .append("span")
            .text("\u00A0" + d).style("color", "red");
        // .text("Model traded values: " + d)
        if (sliderTimer != undefined)
            clearTimeout(sliderTimer)
        if (type == "click") {
            if (d != clickedModelChosen) {
                svg2.selectAll(".tick").selectAll("g > line").style("stroke", dd => dd == d ? "red" : "white")
                svg2.selectAll(".tick").selectAll("g > text").attr("fill", dd => dd == d ? "red" : "white")
                sliderTimer = setTimeout(function() {

                    modelChosen = d;
                    clickedModelChosen = d
                    $("#selectModel").val(d)
                    $("#selectModel").selectpicker("refresh");
                    // console.log(d);
                    wl.drawChart()

                }, 250);
            }
        } else {
            if (d != modelChosen) {

                sliderTimer = setTimeout(function() {

                    modelChosen = d;
                    // $("#selectModel").val(d)
                    // console.log(d);
                    wl.drawChart()
                }, 250);

            }

        }
        superFilteredModels = filteredModels.filter(d => d["Weapon model"] == clickedModelChosen)
        tabulate(superFilteredModels, columns, true, false)

    }

    function chosen_category_model(cat, model) {
        chosen_category = cat
        modelChosen = model
        d3.selectAll(".bar-rect").style("fill", d => d.key == chosen_category ? "orange" : "#69b3a2")
        d3.select("#bar-" + cat).style("fill", "orange")
        d3.select("#scatter_title").text("Weapons by model: ")
            .append("span")
            .text("\u00A0" + chosen_category).style("color", "orange")
        d3.select("#x-bar-axis").selectAll(".tick")
            .select('g > line')
            .style("stroke", d => {
                return (d == chosen_category) ? "orange" : "white"
            })

        d3.select("#x-bar-axis").selectAll(".tick")
            .select('g > text')
            .style("fill", d => {
                if (d == chosen_category)
                    return "orange"
                else
                    return "white"
            })

        wc.heatmapTransition(true)

        txt = $("#" + chosen_category.replace(" ", "_") + "_desc").text()
        if (txt == "" || txt == null || txt == undefined)
            txt = "Not available at the moment."
        $("#weapon_description").html(txt)
        d3.select("#weapon_desc_head").text("Weapon description: ")
            .append("span")
            .text("\u00A0" + chosen_category).style("color", "orange")
        start_timer_chosen_model(model, "click")

        superFilteredModels = filteredModels.filter(d => d["Weapon model"] == model)
        tabulate(superFilteredModels, columns, true, false)
    }


    function chosen_category_only(cat) {

        chosen_category = cat
        d3.selectAll(".bar-rect").style("fill", d => d.key == chosen_category ? "orange" : "#69b3a2")
        d3.select("#bar-" + cat).style("fill", "orange")
        d3.select("#scatter_title").text("Weapons by model: ")
            .append("span")
            .text("\u00A0" + chosen_category).style("color", "orange")
        d3.select("#x-bar-axis").selectAll(".tick")
            .select('g > line')
            .style("stroke", d => {
                return (d == chosen_category) ? "orange" : "white"
            })

        d3.select("#x-bar-axis").selectAll(".tick")
            .select('g > text')
            .style("fill", d => {
                if (d == chosen_category)
                    return "orange"
                else
                    return "white"
            })

        heatmapTransition(false)

        txt = $("#" + chosen_category.replace(" ", "_") + "_desc").text()
        if (txt == "" || txt == null || txt == undefined)
            txt = "Not available at the moment."
        $("#weapon_description").html(txt)
        d3.select("#weapon_desc_head").text("Weapon description: ")
            .append("span")
            .text("\u00A0" + chosen_category).style("color", "orange")

    }

    return {
        drawHeatmap: drawHeatmap,
        heatmapTransition: heatmapTransition,
        chosen_category_model: chosen_category_model,
        start_timer_chosen_model: start_timer_chosen_model,
        instant_chosen_model: instant_chosen_model,
        chosen_category_only: chosen_category_only,
    };

}