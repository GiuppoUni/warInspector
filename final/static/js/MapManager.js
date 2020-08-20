var MapManager = function() {


    //Default values

    const imp_section = d3v4.select('#map-imp-col')
    const exp_section = d3v4.select('#map-exp-col')
    const instr = "You can zoom in/out and move using the mouse."

    const width = 700;
    const height = 360;

    const projection = d3v4.geoMercator()
        .translate([width / 2, height / 2])
        .scale((width - 1) / 2 / Math.PI);

    const path = d3v4.geoPath()
        .projection(projection);

    const zoom = d3v4.zoom()
        .scaleExtent([1, 8])
        .on('zoom', zoomed);


    var redScale = d3v4.scaleThreshold()
        .domain([1, 10, 100, 1000, 10000, 100000])
        .range(["#ffbaba", "#ff7b7b", "#ff5252", "#b72626", "#8e0505", "#620000"])

    var greenScale = d3v4.scaleThreshold()
        .domain([1, 10, 100, 1000, 10000, 100000])
        .range(["#c7e9c0", "#a1d99b", "#74c476", "#31a354", "#006d2c", "#002c09"])


    // IMPORT map
    const svg2 = imp_section
        .append('svg')
        .attr("id", "map2")
        .attr('width', width - 5)
        .attr('height', height)
        .attr("class", "rounded shadow");

    $("#map2").after("<div id='mapInstr'><h6 class='instr'> You can zoom in/out and move using the mouse.    </h6></div>");
    svg2.call(zoom);

    var g_imp = svg2.append('g');
    var stateGroup_imp = g_imp.append('g');
    var sphere_imp = stateGroup_imp.append("g")
    var heatsGroup_imp = stateGroup_imp.append("g")

    //EXPORT map
    const svg = exp_section
        .append('svg')
        .attr("id", "map")
        .attr('width', width - 5)
        .attr('height', height)
        .attr("class", "rounded shadow");

    $("#map").after("<div id='mapInstr'><h6 class='instr'> You can zoom in/out and move using the mouse.    </h6></div>");

    svg.call(zoom);

    var g = svg.append('g');
    var stateGroup = g.append('g');
    var sphere = stateGroup.append("g")
    var heatsGroup = stateGroup.append("g")









    /*  
    Draw cloropleth on map  EXPORT
    */
    var drawCloroExp = function() {
        // land.remove()
        // boundaries.remove()
        resetZoom()

        sphere
            .append('path')
            .datum({ type: 'Sphere' })
            .attr('class', 'sphere')
            .attr('d', path);


        d3v4.queue()
            .defer(d3v4.csv, "static/data/merged.csv")
            .defer(d3v4.json, "http://enjalot.github.io/wwsd/data/world/world-110m.geojson")
            .await(ready)

        function ready(error, transactions, topo) {
            if (DEBUG) console.log("MERGED:", transactions)
                // Data and color scale
            var data = d3v4.map();


            var grouped = d3v4
                .nest()
                .key(function(d) { return d.codeR; })
                //.rollup(function(v) { return v.length; })
                .rollup(function(v) { return d3v4.sum(v, function(d) { return d["Delivered num."].replace(/\(|\)/g, ""); }) })
                .entries(transactions.filter(d => selected_group.includes(d.codeS)).filter(d =>
                    parseInt(d["Delivered year"].replace(/\(|\)/g, "")) >= years[0] &&
                    parseInt(d["Delivered year"].replace(/\(|\)/g, "")) <= years[1]));


            const max_from_grouped = Math.max.apply(Math, grouped.map(function(o) { return o.value; }))

            // .range(colorScheme);
            if (DEBUG) console.log("Max_from_grouped", max_from_grouped)
            max_from_grouped == -Infinity ? 1000 : max_from_grouped


            for (let i = 0; i < grouped.length; i++) {
                const element = grouped[i];
                data.set(element.key, +element.value)
            }



            hm = svg.append("g")
                .attr("class", "heatmap")
                .attr("id", "heatmap")
                .selectAll("path")
                .data(topo.features)
                .enter().append("path")
                .attr("fill", function(d) {
                    // Pull data for this country
                    d.total = data.get(d.id) || 0;
                    // Set the color
                    return d.total == 0 ? "#696969" : greenScale(d.total);
                })
                .attr("d", path)
                .attr("class", "country exp")
                .classed("selected", function(d) { return selected_group.includes(d.id) })
                .on('click', selected)
                .attr("id", d => "c-exp-" + d.id)
                .append("title")
                .text(d => `To ${d.properties.name}
        ${data.has(d.id) ? data.get(d.id) : "0"}`);



            // Legend
            var lgnd = svg.append("g")
                .attr("class", "legendThreshold")
                .attr("id", "legendThreshold")
                .attr("transform", "translate(20,20)");

            // lgnd.append("text")
            //     .attr('class', 'title')
            //     .attr('id', 'arrows-title')
            //     .attr("fill", "white")
            //     .attr("stroke", "black")
            //     .attr("stroke-width", "0.5")
            //     .attr('x', width / 2 + 10)
            //     .attr('y', 10)
            //     .attr('text-anchor', 'middle')
            //     .text("Weapon units " + country_selected + " EXPORTED to nation during " + years[0] + "-" + years[1]);

            var labels = ['>=	 1', ">= 10", ">= 100", ">= 1000", ">= 10000", ">= 100000"];
            var legend = d3v4.legendColor()
                .labels(function(d) { return labels[d.i]; })
                .shapePadding(4)
                .scale(greenScale);

            svg.select(".legendThreshold")
                .call(legend);


        }
    }


    // DRAW IMPORT 
    var drawCloroImp = function() {
        // land.remove()
        // boundaries.remove()
        resetZoom()

        sphere_imp
            .append('path')
            .datum({ type: 'Sphere' })
            .attr('class', 'sphere')
            .attr('d', path);


        d3v4.queue()
            .defer(d3v4.csv, "static/data/merged.csv")
            .defer(d3v4.json, "http://enjalot.github.io/wwsd/data/world/world-110m.geojson")
            .defer(d3v4.csv, "static/data/conflictsMerged2.csv")
            .await(ready)

        function ready(error, transactions, topo, wars) {
            // Data and color scale
            var data = d3v4.map();


            var grouped = d3v4
                .nest()
                .key(function(d) { return d.codeS; })
                //.rollup(function(v) { return v.length; })
                .rollup(function(v) { return d3v4.sum(v, function(d) { return d["Delivered num."].replace(/\(|\)/g, ""); }) })
                .entries(transactions.filter(d => selected_group.includes(d.codeR)).filter(d =>
                    parseInt(d["Delivered year"].replace(/\(|\)/g, "")) >= years[0] &&
                    parseInt(d["Delivered year"].replace(/\(|\)/g, "")) <= years[1]));
            for (let i = 0; i < grouped.length; i++) {
                const element = grouped[i];
                data.set(element.key, +element.value)
            }
            console.log(wars)
            wars = wars.filter(d =>
                parseInt(d.begin.replace(/\(|\)/g, "")) >= years[0] &&
                parseInt(d.end.replace(/\(|\)/g, "")) <= years[1]);


            const max_from_grouped = Math.max.apply(Math, grouped.map(function(o) { return o.value; }))

            // .range(colorScheme);
            if (DEBUG) console.log("IMP: Max_from_grouped", max_from_grouped)
            max_from_grouped == -Infinity ? 1000 : max_from_grouped




            if (DEBUG) console.log("IMP:", grouped)



            var hm = svg2.append("g")
                .attr("class", "heatmap")
                .attr("id", "heatmap2")
                .selectAll("path2")
                .data(topo.features)
                .enter().append("path")
                .attr("fill", function(d) {
                    // Pull data for this country
                    d.total = data.get(d.id) || 0;
                    // Set the color
                    if (redScale == undefined)
                        console.error("undefined here")
                    return d.total == 0 ? "#696969" : redScale(d.total);
                })
                .attr("d", path)
                .attr("class", "country imp")
                .classed("selected", function(d) { return selected_group.includes(d.id) })
                .on('click', selected)
                .attr("id", d => "c-imp-" + d.id)
                .append("title")
                .text(d => `From ${d.properties.name}
            ${data.has(d.id) ? data.get(d.id) : "N/A"}`);



            // Legend
            var lgnd = svg2.append("g")
                .attr("class", "legendThreshold")
                .attr("id", "legendThreshold2")
                .attr("transform", "translate(20,20)");

            // lgnd.append("text")
            //     .attr('class', 'title')
            //     .attr('id', 'arrows-title2')
            //     .attr("fill", "white")
            //     .attr("stroke", "black")
            //     .attr("stroke-width", "0.5")
            //     .attr('x', width / 2 + 10)
            //     .attr('y', 10)
            //     .attr('text-anchor', 'middle')
            //     .text("Weapon units " + country_selected + " IMPORTED to nation during " + years[0] + "-" + years[1]);

            var labels = ['>=	 1', ">= 10", ">= 100", ">= 1000", ">= 10000", ">= 100000"];
            var legend = d3v4.legendColor()
                .labels(function(d) { return labels[d.i]; })
                .shapePadding(4)
                .scale(redScale);

            svg2.select(".legendThreshold")
                .call(legend);

            var z = d3v4.scaleSqrt()
                .domain([1, 6])
                .range([10, 30]);

            for (index = 0; index < wars.length; index++) {
                isos = wars[index].iso.split(";")
                lats = wars[index].lats.split(";")
                lons = wars[index].lons.split(";")
                mag = wars[index].mag
                for (let j = 0; j < isos.length; j++) {

                    // TODO SONO SBALLATE
                    // console.log(lons, lats)

                    // console.log(isos[j], projection([lons[j], lats]), isos.length)

                    lon = lons[j]
                    lat = lats[j]

                    if (projection(lon, lat).includes(NaN))
                        console.log(lon, lat)

                    heatsGroup_imp
                        .append('g')
                        .data([wars[index]])
                        .append("circle")
                        .attr("class", function(d) { return "war-dot" })
                        .attr("cx", projection(lon, lat)[0])
                        .attr("cy", projection(lon, lat)[1])
                        .attr("r", z(mag))
                        // return z(wars[index].mag);
                        .style("fill", "white")
                        .style("stroke", "black")
                        .style("opacity", .5)

                }


            }
            var tip = d3v4.tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0])
                .html(function(d) {
                    return '<div class="tip-map">' + d.states + "</br>" + d.description + '<br/>' + d.begin +
                        "-" + d.end + "</div>";
                })
            heatsGroup_imp.call(tip);

            d3v4.selectAll(".war-dot")
                .on('mouseover', d => tip.show(d))
                .on('mouseout', tip.hide)





        }
    }





    function zoomed() {
        svg
            .selectAll('.country') // To prevent stroke width from scaling
            .attr('transform', d3v4.event.transform)
            .style("stroke-width", 1.5 / d3v4.event.transform.k + "px");

        svg2
            .selectAll('.country') // To prevent stroke width from scaling
            .attr('transform', d3v4.event.transform)
            .style("stroke-width", 1.5 / d3v4.event.transform.k + "px");

        // heatsGroup_imp
        //     .selectAll('.war-dot') // To prevent stroke width from scaling
        //     .attr('transform', d3v4.event.transform)
        //     .style("r", function() {

        //         return d3v4.select(this).attr("r") / d3v4.event.transform.k + "px"
        //     });



        // svg.on("dblclick.zoom", null)

        // svg2.on("dblclick.zoom", null)



        d3v4.selectAll(".selected").style("stroke-width", 3.0 / d3v4.event.transform.k + "px");
        d3v4.selectAll("textPath").attr('transform', d3v4.event.transform)
    }



    function selected(country_id = null) {
        el = null
        if (country_id == null) {
            alert("Error passing country")
        } else if (typeof country_id === 'string' || country_id instanceof String) {
            // FROM SEARCH BAR
            // country_id = country_id.trim()
            el = d3v4.selectAll("#c-imp-" + country_id)
            if (el === undefined) {
                alert("Country" + country_id + " not found")
                return
            }
        } else {
            // FROM CLICK ON MAP
            el = d3v4.select(this)
            country_id = el.data()[0].id
        }

        // Country is SELECTED
        if (!el.classed("selected")) {
            selected_group.push(country_id)
            d3v4.selectAll("#c-imp-" + country_id)
                // .transition()
                // .duration(400)
                .classed('selected', true);
            d3v4.selectAll("#c-exp-" + country_id)
                // .transition()
                // .duration(400)
                .classed('selected', true);



            // Add in table the entry
            // ...

            updateGeneralInfo(country_id)



            // Country is DESELECTED
        } else {
            $('#' + country_id + "-line").remove();

            const index = selected_group.indexOf(el.data()[0].id);
            if (index > -1) {
                selected_group.splice(index, 1);
            }

            d3v4.selectAll("#c-imp-" + el.data()[0].id)
                .classed('selected', false);
            d3v4.selectAll("#c-exp-" + el.data()[0].id)
                .classed('selected', false);

        }


        // d3v4.selectAll(".heatmap").remove()
        // d3v4.selectAll(".legendThreshold").remove()
        // d3v4.selectAll(".legendCells").remove()

        //mm.drawCloroExp()
        //mm.drawCloroImp()
        mm.selectedTransition()
            // dbcm.drawChart();

        // updateCircular()
        getDataFromPost(true)


    }


    function updateGeneralInfo(country_id = "") {

        countries = selected_group
        if (country_id != "")
            countries = [country_id]


        countries.forEach(country_id => {

            var country_name;
            $.ajax({
                type: "GET",
                url: "static/data/pop.csv",
                dataType: "text",
                success: function(data) { processData1(data, country_id, years); }
            });

            function processData1(allText, country_id, years) {
                var allTextLines = allText.split(/\r\n|\n/);
                var headers = allTextLines[0].split(',');
                var lines = [];
                var pops = [];
                for (var i = 1; i < allTextLines.length; i++) {
                    var data = allTextLines[i].split(',');
                    if (data.length == headers.length) {

                        if (data[1] == country_id) {
                            country_name = data[0]
                            for (var j = years[0] - 1958; j <= years[1] - 1958; j++) {
                                // tarr.push(headers[j] + ":" + data[j]);
                                pops.push(data[j])
                            }
                            // pop = data[]
                            // lines.push(tarr);
                            // console.log("POP:", pops, "YEARS", years)
                        }
                    }
                }

                // console.log(lines)

                $.ajax({
                    type: "GET",
                    url: "static/data/gdp.csv",
                    dataType: "text",
                    success: function(data) { processData2(data, country_id, years, pops); }
                });

                function processData2(allText, country_id, years, pops) {
                    var allTextLines = allText.split(/\r\n|\n/);
                    var headers = allTextLines[0].split(',');
                    var lines = [];
                    var gdps = [];

                    for (var i = 1; i < allTextLines.length; i++) {
                        var data = allTextLines[i].split(',');
                        if (data.length == headers.length) {


                            if (data[1] == country_id) {
                                for (var j = years[0] - 1987; j <= years[1] - 1987; j++) {
                                    // tarr.push(headers[j] + ":" + data[j]);
                                    gdps.push(data[j])
                                }
                                // pop = data[]
                                // lines.push(tarr);
                                // console.log("GDP:", gdps, "YEARS", years)
                            }
                        }
                    }

                    $.ajax({
                        type: "GET",
                        url: "static/data/army-dimensions-clean.csv",
                        dataType: "text",
                        success: function(data) { processData3(data, country_id, years, pops, gdps); }
                    });

                    function processData3(allText, country_id, years, pops, gdps) {
                        var allTextLines = allText.split(/\r\n|\n/);
                        var headers = allTextLines[0].split(',');
                        var lines = [];
                        var armies = [];

                        for (var i = 1; i < allTextLines.length; i++) {
                            var data = allTextLines[i].split(',');
                            if (data.length == headers.length) {


                                if (data[1] == country_id) {
                                    for (var j = years[0] - 1987; j <= years[1] - 1987; j++) {
                                        // tarr.push(headers[j] + ":" + data[j]);
                                        if (data[j] != "")
                                            armies.push(data[j])
                                    }
                                    // pop = data[]
                                    // lines.push(tarr);
                                    if (DEBUG) console.log("arm:", armies, "YEARS", years)
                                }
                            }
                        }

                        $("#" + country_id + "-line").remove()
                        var newRowContent = '<tr id="' + country_id + '-line">\
            <td class="col-xs-1">' + country_name + " (" + country_id + ')</td>\
            <td class="col-xs-3">' + average(gdps) + '</td>\
            <td class="col-xs-3">' + average(pops) + '</td>\
            <td class="col-xs-3">' + average(armies) + '</td>\
            </tr>'
                        $("tbody").append(newRowContent);


                    }


                }
            }
        });
    }

    function average(arr) {

        var sum = 0;
        // console.log(arr)

        for (var i = 0; i < arr.length; i++) {
            sum += parseFloat(arr[i], 10); //don't forget to add the base
        }
        // console.log(sum)
        return Math.round(sum / arr.length);

    }

    function stopped() {
        if (d3v4.event.defaultPrevented) d3v4.event.stopPropagation();
    }


    var resetZoom = function() {
        svg.transition()
            .duration(100)
            .call(zoom.transform, d3v4.zoomIdentity);

        svg2.transition()
            .duration(100)
            .call(zoom.transform, d3v4.zoomIdentity);

    }

    var setYearInterval = function(yi) {
        console.log("set interval to", yi)
        years = yi
    }

    var setCountry = function(c) {
        console.log("set country to", c)
        country = c
    }

    var getCountry = function() {
        return country
    }
    var getYearsInterval = function() {
        return years
    }


    var sliderTransition = function() {

        var impData = d3v4.map();
        d3v4.queue()
            .defer(d3v4.csv, "static/data/merged.csv")
            .await(ready)

        function ready(error, transactions) {

            // CALL TRANSACTION ON DIV BAR CHART
            transitionDivBarChart(transactions)


            // FOR IMPORT MAP
            var impData = d3v4.map()
            var groupedImp = d3v4
                .nest()
                .key(function(d) { return d.codeS; })
                //.rollup(function(v) { return v.length; })
                .rollup(function(v) { return d3v4.sum(v, function(d) { return d["Delivered num."].replace(/\(|\)/g, ""); }) })
                .entries(transactions.filter(d => selected_group.includes(d.codeR)).filter(d =>
                    parseInt(d["Delivered year"].replace(/\(|\)/g, "")) >= years[0] &&
                    parseInt(d["Delivered year"].replace(/\(|\)/g, "")) <= years[1]));
            for (let i = 0; i < groupedImp.length; i++) {
                const element = groupedImp[i];
                impData.set(element.key, +element.value)
            }
            svg2.selectAll(".country.imp")
                .transition()
                .duration(2000)
                .attr("fill", function(d) {
                    // Pull data for this country
                    d.total = impData.get(d.id) || 0;
                    // console.log("TOTAL", d.total)
                    // Set the color
                    return d.total == 0 ? "#696969" : redScale(d.total);
                })

            // FOR EXPORT MAP
            var expData = d3v4.map()
            var groupedExp = d3v4
                .nest()
                .key(function(d) { return d.codeR; })
                //.rollup(function(v) { return v.length; })
                .rollup(function(v) { return d3v4.sum(v, function(d) { return d["Delivered num."].replace(/\(|\)/g, ""); }) })
                .entries(transactions.filter(d => selected_group.includes(d.codeS)).filter(d =>
                    parseInt(d["Delivered year"].replace(/\(|\)/g, "")) >= years[0] &&
                    parseInt(d["Delivered year"].replace(/\(|\)/g, "")) <= years[1]));

            for (let i = 0; i < groupedExp.length; i++) {
                const element = groupedExp[i];
                expData.set(element.key, +element.value)
            }

            svg.selectAll(".country.exp")
                .transition()
                .duration(1000)
                .attr("fill", function(d) {
                    // Pull data for this country
                    d.total = expData.get(d.id) || 0;
                    // Set the color
                    return d.total == 0 ? "#696969" : greenScale(d.total);
                })

        }
    }


    var selectedTransition = function() {

        var impData = d3v4.map();
        d3v4.queue()
            .defer(d3v4.csv, "static/data/merged.csv")
            .await(ready)

        function ready(error, transactions) {

            var impData = d3v4.map()
            var groupedImp = d3v4
                .nest()
                .key(function(d) { return d.codeS; })
                //.rollup(function(v) { return v.length; })
                .rollup(function(v) { return d3v4.sum(v, function(d) { return d["Delivered num."].replace(/\(|\)/g, ""); }) })
                .entries(transactions.filter(d => selected_group.includes(d.codeR)).filter(d =>
                    parseInt(d["Delivered year"].replace(/\(|\)/g, "")) >= years[0] &&
                    parseInt(d["Delivered year"].replace(/\(|\)/g, "")) <= years[1]));
            for (let i = 0; i < groupedImp.length; i++) {
                const element = groupedImp[i];
                impData.set(element.key, +element.value)
            }
            svg2.selectAll(".country.imp")
                .transition()
                .duration(2000)
                .attr("fill", function(d) {
                    // Pull data for this country
                    d.total = impData.get(d.id) || 0;
                    // console.log("TOTAL", d.total)
                    // Set the color
                    return d.total == 0 ? "#696969" : redScale(d.total);
                })


            var expData = d3v4.map()
            var groupedExp = d3v4
                .nest()
                .key(function(d) { return d.codeR; })
                //.rollup(function(v) { return v.length; })
                .rollup(function(v) { return d3v4.sum(v, function(d) { return d["Delivered num."].replace(/\(|\)/g, ""); }) })
                .entries(transactions.filter(d => selected_group.includes(d.codeS)).filter(d =>
                    parseInt(d["Delivered year"].replace(/\(|\)/g, "")) >= years[0] &&
                    parseInt(d["Delivered year"].replace(/\(|\)/g, "")) <= years[1]));

            for (let i = 0; i < groupedExp.length; i++) {
                const element = groupedExp[i];
                expData.set(element.key, +element.value)
            }

            svg.selectAll(".country.exp")
                .transition()
                .duration(1000)
                .attr("fill", function(d) {
                    // Pull data for this country
                    d.total = expData.get(d.id) || 0;
                    // Set the color
                    return d.total == 0 ? "#696969" : greenScale(d.total);
                })
        }
    }


    return {
        drawCloroExp: drawCloroExp,
        drawCloroImp: drawCloroImp,
        sliderTransition: sliderTransition,
        selectedTransition: selectedTransition,
        getYearsInterval: getYearsInterval,
        setYearInterval: setYearInterval,

        updateGeneralInfo: updateGeneralInfo,

        getCountry: getCountry,
        setCountry: setCountry,

        resetZoom: resetZoom,
        selected: selected,
    }
}