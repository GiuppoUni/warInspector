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

    var z = d3v4.scaleSqrt()
        .domain([1, 6])
        .range([10, 30]);


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

    var svgTransform;
    var svgStroke;
    var svgRadius;

    var savedWars;


    const columns = ["Supplier",
        "Recipient", "Ordered", "Weapon model", "Weapon category",
        "Ordered year", "Delivered year", "Delivered num.", "Comments",
        // "latS", "longS", "codeS", "latR", "longR", "codeR"
    ]

    var savedTransactions;


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
            .defer(d3v4.csv, "static/data/merged1990.csv")
            .defer(d3v4.json, "http://enjalot.github.io/wwsd/data/world/world-110m.geojson")
            .defer(d3v4.csv, "static/data/conflictsMerged3.csv")
            .await(ready)

        function ready(error, transactions, topo, allWars) {
            savedTransactions = transactions

            if (DEBUG) console.log("MERGED:", transactions)
                // Data and color scale
            var data = d3v4.map();


            filteredTransactionsExp = transactions.filter(d => selected_group.includes(d.codeS)).filter(d =>
                stripYear(d["Delivered year"]) >= years[0] &&
                stripYear(d["Delivered year"]) <= years[1])
            var grouped = d3v4
                .nest()
                .key(function(d) { return d.codeR; })
                //.rollup(function(v) { return v.length; })
                .rollup(function(v) { return d3v4.sum(v, function(d) { return d["Delivered num."].replace(/\(|\)/g, ""); }) })
                .entries(filteredTransactionsExp);



            tabulate(filteredTransactionsExp, columns, true, false)


            savedWars = allWars
            wars = allWars.filter(d => filterWar(d));


            // const max_from_grouped = Math.max.apply(Math, grouped.map(function(o) { return o.value; }))

            // .range(colorScheme);
            // if (DEBUG) console.log("Max_from_grouped", max_from_grouped)
            // max_from_grouped == -Infinity ? 1000 : max_from_grouped


            for (let i = 0; i < grouped.length; i++) {
                const element = grouped[i];
                data.set(element.key, +element.value)
            }



            var hm = svg.append("g")
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


            // WARS DOTS NOW


            svg
                .selectAll("expWarDots")
                .data(wars)
                .enter()
                .append("circle")
                .attr("class", function(d) { return "war-dot exp" })
                .attr("cx", function(d) { return projection([d.lon, d.lat])[0] })
                .attr("cy", function(d) { return projection([d.lon, d.lat])[1] })
                // .attr("transform", function(d) {
                //     return "translate(" + projection(d.coordinates) + ")";
                // })
                .attr("r", d =>
                    z(d.mag))
                // return z(wars[index].mag);
                .style("fill", "white")
                .style("stroke", "black")
                .style("opacity", .5)

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


            // // land.remove()
            // // boundaries.remove()
            // resetZoom()


            //
            //
            //
            // DRAW IMPORT NOW
            //
            ////
            //
            ////
            //
            //
            sphere_imp
                .append('path')
                .datum({ type: 'Sphere' })
                .attr('class', 'sphere')
                .attr('d', path);


            // Data and color scale
            var data = d3v4.map();

            var filteredTransactionsImp = transactions.filter(d => selected_group.includes(d.codeR)).filter(d =>
                stripYear(d["Delivered year"]) >= years[0] &&
                stripYear(d["Delivered year"]) <= years[1])

            var grouped = d3v4
                .nest()
                .key(function(d) { return d.codeS; })
                //.rollup(function(v) { return v.length; })
                .rollup(function(v) { return d3v4.sum(v, function(d) { return d["Delivered num."].replace(/\(|\)/g, ""); }) })
                .entries(filteredTransactionsImp);

            tabulate(filteredTransactionsImp, columns, false, true)

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



            var hm2 = svg2.append("g")
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
                .text(d => {
                    `From ${d.properties.name}
            ${data.has(d.id) ? data.get(d.id) : "N/A"}`
                });



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

            wars = savedWars.filter(d => filterWar(d));

            svg2
                .selectAll(".war-dot.imp")
                .data(wars)
                .enter()
                .append("circle")
                .attr("class", function(d) { return "war-dot imp" })
                .attr("cx", d => projection([d.lon, d.lat])[0])
                .attr("cy", d => projection([d.lon, d.lat])[1])
                // .attr("transform", function(d) {
                //     return "translate(" + projection(d.coordinates) + ")";
                // })
                .attr("r", d => z(d.mag))
                // return z(wars[index].mag);
                .style("fill", "white")
                .style("stroke", "black")
                .style("opacity", .5)

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


            //LEGEND CIRCLES EXP
            const valuesToShow = [1, 3, 6]
            const xCircle = 55
            const xLabel = 53

            function heightCircles(d) { return height + 90 - 230 - (z(d)) }
            svg
                .selectAll("legend")
                .data(valuesToShow)
                .enter()
                .append("circle")
                .attr("class", "circleLegend")
                .attr("cx", xCircle)
                .attr("cy", function(d, i) { return heightCircles(d) })
                .attr("r", function(d) { return z(d) })
                .style("fill", "none")
                .attr("stroke", "white")
            svg
                .selectAll("legend")
                .data(valuesToShow)
                .enter()
                .append("text")
                .attr("class", "circleLegend")
                .attr('x', xLabel)
                .attr('y', function(d) { return height - 147 - (z(d) * 2) })
                .text(function(d) { return d })
                .style("font-size", 10)
                .attr('alignment-baseline', 'middle')
                .attr('stroke', 'white')


            // Legend title
            svg.append("text")
                .attr('x', xCircle + 3)
                .attr("y", height - 155 + 30)
                .text("Conflict")
                .attr("class", "circleLegend")
                .style("font-size", 12)
                .style("fill", "white")
                .attr("text-anchor", "middle")

            svg.append("text")
                .attr('x', xCircle + 3)
                .attr("y", height - 155 + 40)
                .attr("class", "circleLegend")
                .text("magnitude")
                .style("font-size", 12)
                .style("fill", "white")
                .attr("text-anchor", "middle")

            //LEGEND CIRCLES IMP
            svg2
                .selectAll("legend")
                .data(valuesToShow)
                .enter()
                .append("circle")
                .attr("class", "circleLegend")
                .attr("cx", xCircle)
                .attr("cy", function(d, i) { return heightCircles(d) })
                .attr("r", function(d) { return z(d) })
                .style("fill", "none")
                .attr("stroke", "white")
            svg2
                .selectAll("legend")
                .data(valuesToShow)
                .enter()
                .append("text")
                .attr("class", "circleLegend")
                .attr('x', xLabel)
                .attr('y', function(d) { return height - 147 - (z(d) * 2) })
                .text(function(d) { return d })
                .style("font-size", 10)
                .attr('alignment-baseline', 'middle')
                .attr('stroke', 'white')


            // Legend title
            svg2.append("text")
                .attr("class", "circleLegend")
                .attr('x', xCircle + 3)
                .attr("y", height - 155 + 30)
                .text("Conflict")
                .style("font-size", 12)
                .style("fill", "white")
                .attr("text-anchor", "middle")

            svg2
                .append("text")
                .attr("class", "circleLegend")
                .attr('x', xCircle + 3)
                .attr("y", height - 155 + 40)
                .text("magnitude")
                .style("font-size", 12)
                .style("fill", "white")
                .attr("text-anchor", "middle")


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

        svg2
            .selectAll('.war-dot.imp') // To prevent stroke width from scaling
            .attr('transform', d3v4.event.transform)
            .style("stroke-width", 1.5 / d3v4.event.transform.k + "px")
            .style("r", function() {
                return d3v4.select(this).attr("r") / d3v4.event.transform.k + "px"
            });

        svg
            .selectAll('.war-dot.exp') // To prevent stroke width from scaling
            .attr('transform', d3v4.event.transform)
            .style("stroke-width", 1.5 / d3v4.event.transform.k + "px")
            .style("r", function() {
                return d3v4.select(this).attr("r") / d3v4.event.transform.k + "px"
            });


        svgTransform = d3v4.event.transform
        svgStroke = d3v4.event.transform.k

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

        isSelected = false
        el = null
        if (country_id == null) {
            alert("Error passing country")
        } else if (typeof country_id === 'string' || country_id instanceof String) {
            // FROM SEARCH BAR
            // country_id = country_id.trim()
            el = d3v4.selectAll("#c-imp-" + country_id)
        } else {
            // FROM CLICK ON MAP
            el = d3v4.select(this)
            country_id = el.data()[0].id
                // console.log(country_id)
        }
        if (el == undefined || el === null) {
            alert("Country" + country_id + " not found")
            return
        }

        // Country is SELECTED
        if (!el.classed("selected")) {
            isSelected = true
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
            isSelected = false
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
        oldStatesClicked = selected_group

        // d3v4.selectAll(".heatmap").remove()
        // d3v4.selectAll(".legendThreshold").remove()
        // d3v4.selectAll(".legendCells").remove()

        //mm.drawCloroExp()
        //mm.drawCloroImp()
        mm.selectedTransition()
            // dbcm.drawChart();
        wbcm.applyTransition();
        // updateCircular()
        // getDataFromPost(true)
        // pcam.selectCountry(country_id)
        pcam.selectCountryTransition(country_id, isSelected)
        dbcm.transitionSlider(savedTransactions)
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
            <td class="col-xs-1" style="color:yellow">' + country_name + " (" + country_id + ')</td>\
            <td class="col-xs-3">' + average(gdps) + '</td>\
            <td class="col-xs-3">' + average(pops) + '</td>\
            <td class="col-xs-3">' + average(armies) + '</td>\
            </tr>'
                        $("#tablePIL>tbody").append(newRowContent);


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
            .defer(d3v4.csv, "static/data/merged1990.csv")
            .await(ready)

        function ready(error, transactions) {

            // CALL TRANSACTION ON DIV BAR CHART
            transitionDivBarChart(transactions)
            var filteredTransationsImp = transactions
                // .forEach(d => console.log("fil", selected_group.includes(d.codeR), d.codeR))
                .filter(d => selected_group.includes(d.codeR))
                // .map(d => {
                //     console.log( stripYear(d["Delivered year"]));

            // })
            .filter(d => stripYear(d["Delivered year"]) >= years[0] &&
                stripYear(d["Delivered year"]) <= years[1]
            )

            console.log("sad", filteredTransationsImp)


            // FOR IMPORT MAP
            var impData = d3v4.map()
            var groupedImp = d3v4
                .nest()
                .key(function(d) { return d.codeS; })
                //.rollup(function(v) { return v.length; })
                .rollup(function(v) { return d3v4.sum(v, function(d) { return d["Delivered num."].replace(/\(|\)/g, ""); }) })
                .entries(filteredTransationsImp);
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
            var filteredTransactionsExp = transactions.filter(d => selected_group.includes(d.codeS)).filter(d =>
                stripYear(d["Delivered year"]) >= years[0] &&
                stripYear(d["Delivered year"]) <= years[1])
            var groupedExp = d3v4
                .nest()
                .key(function(d) { return d.codeR; })
                //.rollup(function(v) { return v.length; })
                .rollup(function(v) { return d3v4.sum(v, function(d) { return d["Delivered num."].replace(/\(|\)/g, ""); }) })
                .entries(filteredTransactionsExp);

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



            wars = savedWars.filter(d => filterWar(d));
            console.log("w", wars);
            tabulate(filteredTransactionsExp, columns, true, false);
            tabulate(filteredTransationsImp, columns, false, true)

            var u = svg.selectAll(".war-dot.exp")
                .data(wars)
            u
                .enter()
                .append("circle") // Add a new circle for each new elements
                .merge(u) // get the already existing elements as well
                .transition()
                .duration(1000)
                .attr("transform", svgTransform)
                .attr("class", "war-dot exp")
                .attr("cx", d => projection([d.lon, d.lat])[0])
                .attr("cy", d => projection([d.lon, d.lat])[1])
                .attr("r", d => z(d.mag))
                .style("fill", "white")
                .style("stroke", "black")
                .style("stroke-width", 1.5 / svgStroke + "px")
                .style("opacity", .5)


            u.exit()
                .transition() // and apply changes to all of them
                .duration(1000)
                .style("opacity", 0)
                .remove()


            var u2 = svg2.selectAll(".war-dot.imp")
                .data(wars)
            u2.enter()
                .append("circle") // Add a new circle for each new element
                .merge(u2) // get the already existing elements as well
                .transition()
                .duration(1000)
                .attr("class", "war-dot imp")
                .attr("cx", d => projection([d.lon, d.lat])[0])
                .attr("cy", d => projection([d.lon, d.lat])[1])
                .attr("r", d => z(d.mag))
                .attr("transform", svgTransform)
                .style("stroke-width", 1.5 / svgStroke + "px")
                .style("fill", "white")
                .style("stroke", "black")
                .style("opacity", .5)

            u2.exit()
                .transition() // and apply changes to all of them
                .duration(1000)
                .style("opacity", 0)
                .remove()


        }

        // If less group in the new dataset, I delete the ones not in use anymore

    }




    function filterWar(d) {
        start = d.begin
        if (start != "*")
            start = parseInt(d.begin.replace("+", ""))
        end = d.end
        if (end != "*")
            end = parseInt(d.end.replace("+", ""))

        return (start <= years[1] && start >= years[0]) || (end <= years[1] && end >= years[0]) ||
            (start <= years[0] && end >= years[1]) ||
            (start == "*" && end <= years[1] && end >= years[0]) || (end == "*" && start <= years[1] && start >= years[0])
    }



    var selectedTransition = function() {

        var impData = d3v4.map();
        d3v4.queue()
            .defer(d3v4.csv, "static/data/merged1990.csv")
            .await(ready)

        function ready(error, transactions) {

            var impData = d3v4.map()

            var filteredTransationsImp = transactions.filter(d => selected_group.includes(d.codeR)).filter(d =>
                stripYear(d["Delivered year"]) >= years[0] &&
                stripYear(d["Delivered year"]) <= years[1])
            var groupedImp = d3v4
                .nest()
                .key(function(d) { return d.codeS; })
                //.rollup(function(v) { return v.length; })
                .rollup(function(v) { return d3v4.sum(v, function(d) { return d["Delivered num."].replace(/\(|\)/g, ""); }) })
                .entries(filteredTransationsImp);
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

            var filteredTransactionsExp = transactions.filter(d => selected_group.includes(d.codeS)).filter(d =>
                stripYear(d["Delivered year"]) >= years[0] &&
                stripYear(d["Delivered year"]) <= years[1])

            var expData = d3v4.map()
            var groupedExp = d3v4
                .nest()
                .key(function(d) { return d.codeR; })
                //.rollup(function(v) { return v.length; })
                .rollup(function(v) { return d3v4.sum(v, function(d) { return d["Delivered num."].replace(/\(|\)/g, ""); }) })
                .entries(filteredTransactionsExp);

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

            tabulate(filteredTransactionsExp, columns, true, false)
            tabulate(filteredTransationsImp, columns, false, true)

        }
    }

    var toggleCircles = function(status, type) {
        if (type == "exp") {
            svg
                .selectAll(".war-dot.exp")
                .transition().duration(1000)
                .style("opacity", status == "on" ? .5 : 0)
                .attr("pointer-events", status == "on" ? "auto" : "none")
            svg
                .selectAll(".circleLegend")
                .transition().duration(1000)
                .style("opacity", status == "on" ? 1 : 0)

        } else {
            svg2
                .selectAll(".war-dot.imp")
                .transition().duration(1000)
                .style("opacity", status == "on" ? .5 : 0)
            svg2
                .selectAll(".circleLegend")
                .transition().duration(1000)
                .style("opacity", status == "on" ? 1 : 0)
                .attr("pointer-events", status == "on" ? "auto" : "none")

        }

    }

    var selectedWeaponTransition = function() {

    }


    var tabulate = function(data, columns, redraw = false, append = false) {
        redcolor = "#d00101"
        greencolor = "#009344"
        yellowcolor = "#f6ff00"

        if (redraw) {
            d3v4.selectAll(".tableTrans").remove()
        }
        var table = d3v4.select('#transaction_table')
            .append('table')
        table.attr("id", "#tableTransactions")
            .attr("class", "table table-fixed tableTrans")
            .style("color", "white")
        if (!append) {
            var thead = table.append('thead')

            thead.append('tr')
                .selectAll('th')
                .data(columns)
                .enter()
                .append('th')
                .text(function(d) { return d })
        }
        var tbody = table.append('tbody')


        var rows = tbody.selectAll('tr')
            .data(data)
            .enter()
            .append('tr')

        if (!append) {
            var cells = rows.selectAll('td')
                .data(function(row) {
                    return columns.map(function(column) {
                        return { column: column, value: row[column] }
                    })
                })
                .enter()
                .append('td')
                .text(function(d) { return d.value })
                .style("color", function(d) {
                    // console.log(d);
                    if (d.column == "Supplier")
                        return yellowcolor
                    else
                        return "white"
                })
                .style("font-size", 8)
        } else {

            var cells = rows.selectAll('td')
                .data(function(row) {
                    return columns.map(function(column) {
                        return { column: column, value: row[column] }
                    })
                })
                .enter()
                .append('td')
                .text(function(d) { return d.value })
                .style("color", function(d) {
                    // console.log(d);
                    if (d.column == "Recipient")
                        return yellowcolor
                    else
                        return "white"
                })
                .style("font-size", 8)
        }
        return table;
    }

    return {
        drawCloroExp: drawCloroExp,
        // drawCloroImp: drawCloroImp,
        sliderTransition: sliderTransition,
        selectedTransition: selectedTransition,
        getYearsInterval: getYearsInterval,
        setYearInterval: setYearInterval,

        updateGeneralInfo: updateGeneralInfo,

        getCountry: getCountry,
        setCountry: setCountry,

        resetZoom: resetZoom,
        selected: selected,
        toggleCircles: toggleCircles,
    }
}