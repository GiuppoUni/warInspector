var MapManager = function() {


    //Default values

    const imp_section = d3v4.select('#map-imp-col')
    const exp_section = d3v4.select('#map-exp-col')
    const instr = "You can zoom in/out and move using the mouse."
    const elem = document.getElementById('transaction_table');

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

    var cntInvImp;
    var cntInvExp;

    // var z = d3v4.scaleSqrt()
    //     .domain([0, 7])
    //     .range([5, 35]);
    function zz(d) {
        d = parseInt(d)
        return 5 + d * (5)
            // if (d == 1)
            //     return 10
            // else if (d == 2)
            //     return 15
            // else if (d == 3)
            //     return 20

    }

    var legend;
    var legendImp;

    var redScale = d3v4.scaleThreshold()
        .domain([1, 10, 100, 1000, 10000, 100000])
        .range(colorsImport)

    var greenScale = d3v4.scaleThreshold()
        .domain([1, 10, 100, 1000, 10000, 100000])
        .range(colorsExport)


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

    var selectedCircle = 6
    var selectedCircle2 = 6

    var tipConflict = d3v4.tip()
        .attr('class', 'd3-tip2')
        .offset([-10, 0])
        .html(function(d) {
            // console.log(d.mag)
            return '<div class="tip-map">' + d.states + "</br>" + d.description + '<br/>' + d.begin +
                "-" + d.end + "</div>";
        });

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
        // var heatsGroup = stateGroup.append("g")

    var svgTransform;
    var svgStroke;

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
        var cntInvImp = []
        var cntInvExp = []

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
            .defer(d3v4.json, "https://enjalot.github.io/wwsd/data/world/world-110m.geojson")
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
            wars = allWars.filter(d => filterWar(d)).filter(d => parseInt(d.mag) <= selectedCircle);
            // console.log("ready -> wars", wars)

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
                .attr("class", "title-exp")
                .text(function(d) {
                    if (data.has(d.id))
                        cntInvExp.push(d.properties.name)
                    return `To ${d.properties.name}
        ${data.has(d.id) ? data.get(d.id) : "0"}`
                });



            // Legend
            var lgnd = svg
                .append("g")
                .attr("class", "legendThreshold")
                .attr("id", "legendThreshold")
                .attr("transform", "translate(20,20)")
                .append("text")
                .text("Delivered units")
                .attr("fill", "white")
                .attr("transform", "translate(-5,-4)");

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
            legend = d3v4.legendColor()
                .labels(function(d) { return labels[d.i]; })
                .shapePadding(4)
                .scale(greenScale);

            svg.select(".legendThreshold")
                .call(legend);


            // WARS DOTS NOW

            $("#numConfExp").text(wars.length)
            var sumMagExp = 0;
            wars.forEach(d => sumMagExp += parseInt(d.mag))
            $("#sumMagExp").text(sumMagExp)

            svg
                .selectAll(".war-dot.exp")
                .data(wars)
                .enter()
                .append("circle")
                .attr("class", "war-dot exp")
                .attr("cx", function(d) { return projection([d.lon, d.lat])[0] })
                .attr("cy", function(d) { return projection([d.lon, d.lat])[1] })
                // .attr("transform", function(d) {
                //     return "translate(" + projection(d.coordinates) + ")";
                // })
                .attr("r", function(d) {
                    // if (d.states == "Cameroon")
                    //     console.log("-->", d3v4.select(this))
                    return zz(d.mag)
                })
                .attr("transform", svgTransform)
                .style("stroke-width", 1.5 / svgStroke + "px")
                // return zz(wars[index].mag);
                .style("fill", "white")
                .style("stroke", "black")
                .style("opacity", .5)
                .on('mouseover', function(d) {

                    // console.log(d3v4.select(this).attr("r"));
                    tipConflict.show(d)
                })
                .on('mouseout', tipConflict.hide)

            svg.call(tipConflict);


            // // land.remove()
            // // boundaries.remove()
            // resetZoom()


            //
            //
            //
            /**********************
             * // DRAW IMPORT NOW *
             **********************/
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
                .attr("class", "title-imp")
                .text(d => {
                    if (data.has(d.id))
                        cntInvImp.push(d.properties.name)
                    return `From ${d.properties.name}
                    ${data.has(d.id) ? data.get(d.id) : "0"}`
                });



            // Legend
            var lgnd = svg2.append("g")
                .attr("class", "legendThreshold")
                .attr("id", "legendThreshold2")
                .attr("transform", "translate(20,20)")
                .append("text")
                .text("Delivered units")
                .attr("fill", "white")
                .attr("transform", "translate(-5,-4)");

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
            legendImp = d3v4.legendColor()
                .labels(function(d) { return labels[d.i]; })
                .shapePadding(4)
                .scale(redScale);

            svg2.select(".legendThreshold")
                .call(legendImp);

            $("#numConfImp").text(wars.length)
            var sumMagImp = 0;
            wars.forEach(d => sumMagImp += parseInt(d.mag))
            $("#sumMagImp").text(sumMagImp)

            svg2
                .selectAll(".war-dot.imp")
                .data(wars)
                .enter()
                .append("circle")
                .attr("class", function(d) { return "war-dot imp" })
                .attr("cx", function(d) { return projection([d.lon, d.lat])[0] })
                .attr("cy", function(d) { return projection([d.lon, d.lat])[1] })
                // .attr("transform", function(d) {
                //     return "translate(" + projection(d.coordinates) + ")";
                // })
                .attr("r", function(d) { return zz(d.mag) })
                // return zz(wars[index].mag);
                .style("fill", "white")
                .style("stroke", "black")
                .style("opacity", .5)
                .on('mouseover', function(d) {
                    tipConflict.show(d)
                })
                .on('mouseout', tipConflict.hide)

            svg2.call(tipConflict);



            //LEGEND CIRCLES EXP
            const valuesToShow = [6, 3, 1]
            const xCircle = 55
            const xLabel = 53

            function heightCircles(d) { return height + 90 - 230 - (zz(d)) }
            svg
                .selectAll("legend")
                .data(valuesToShow)
                .enter()
                .append("circle")
                .attr("class", "circleLegend")
                .attr("cx", xCircle)
                .attr("cy", function(d, i) { return heightCircles(d) })
                .attr("r", function(d) { return zz(d) })
                .style("fill", "transparent")
                .style("stroke", d => d == selectedCircle ? "yellow" : "white")
                .style("stroke-width", "2px")
                .on("mouseover", function(d) {
                    d3v4.select(this).style("stroke", "yellow")
                        // console.log("in")

                })
                .on("mouseout", function(d) {
                    if (selectedCircle != d) {
                        d3v4.select(this).style("stroke", "white")
                            // console.log("out")
                    }
                })
                .on("click", function(d) {
                    var oldMag = selectedCircle
                    if (selectedCircle !== d) {
                        selectedCircle = d
                        svg.selectAll(".circleLegend").filter("circle").style("stroke", "white")
                        d3v4.select(this).style("stroke", "yellow")
                        transitionCircles(oldMag, "exp")
                    } else {

                    }
                    console.log(selectedCircle)
                })
            svg
                .selectAll("legend")
                .data(valuesToShow)
                .enter()
                .append("text")
                .attr("class", "circleLegend")
                .attr('x', xLabel)
                .attr('y', function(d) { return height - 147 - (zz(d) * 2) })
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
                .attr("r", function(d) { return zz(d) })
                .style("fill", "transparent")
                .style("stroke", d => d == selectedCircle2 ? "yellow" : "white")
                .style("stroke-width", "2px")
                .on("mouseover", function(d) {
                    d3v4.select(this).style("stroke", "yellow")
                        // console.log("in")

                })
                .on("mouseout", function(d) {
                    if (selectedCircle2 != d) {
                        d3v4.select(this).style("stroke", "white")
                            // console.log("out")
                    }
                })
                .on("click", function(d) {
                    var oldMag = selectedCircle2
                    if (selectedCircle2 !== d) {
                        selectedCircle2 = d
                        svg2.selectAll(".circleLegend").filter("circle").style("stroke", "white")
                        d3v4.select(this).style("stroke", "yellow")
                        transitionCircles(oldMag, "imp")
                    } else {

                    }
                    console.log(selectedCircle2)
                })

            svg2
                .selectAll("legend")
                .data(valuesToShow)
                .enter()
                .append("text")
                .attr("class", "circleLegend")
                .attr('x', xLabel)
                .attr('y', function(d) { return height - 147 - (zz(d) * 2) })
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

            $("#cntInvolvedExp").text(cntInvExp.join(", "))
            $("#cntInvolvedImp").text(cntInvImp.join(", "))



            svg.transition()
                .duration(100)
                .call(zoom.transform, svgTransform);

            svg2.transition()
                .duration(100)
                .call(zoom.transform, svgTransform);

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

        $("#selectNation").val(selected_group)
        $('.selectpicker').selectpicker('refresh')
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
                        console.log(data[1], country_id)
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
            <td class="col-xs-3">' + average(gdps) + " USD" + '</td>\
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

    // function stopped() {
    //     if (d3v4.event.defaultPrevented) d3v4.event.stopPropagation();
    // }


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

        greenScale.range(colorsExport)
        redScale.range(colorsImport)



        cntInvExp = []
        cntInvImp = []

        var impData = d3v4.map();

        // CALL TRANSACTION ON DIV BAR CHART
        transitionDivBarChart(savedTransactions)
        var filteredTransationsImp = savedTransactions
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
        svg2.selectAll

        d3v4.selectAll(".title-imp")
            .text(function(d) {
                if (impData.has(d.id))
                    cntInvImp.push(d.properties.name)
                return `To ${d.properties.name}
${impData.has(d.id) ? impData.get(d.id) : "0"}`
            });

        // FOR EXPORT MAP
        var expData = d3v4.map()
        var filteredTransactionsExp = savedTransactions.filter(d => selected_group.includes(d.codeS)).filter(d =>
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

        d3v4.selectAll(".title-exp")
            .text(function(d) {
                if (expData.has(d.id))
                    cntInvExp.push(d.properties.name)
                return `From ${d.properties.name}
${expData.has(d.id) ? expData.get(d.id) : "0"}`
            });



        wars = savedWars.filter(d => filterWar(d)).filter(d => parseInt(d.mag) <= selectedCircle);
        console.log("w", wars);
        tabulate(filteredTransactionsExp, columns, true, false);
        tabulate(filteredTransationsImp, columns, false, true)
        $("#numConfExp").text(wars.length)

        var u = svg.selectAll(".war-dot.exp")
            .data(wars)
        u
            .enter()
            .append("circle") // Add a new circle for each new elements
            // .merge(u) // get the already existing elements as well
            .on('mouseover', function(d) {
                // console.log(d3v4.select(this).attr("r"), d.mag, zz(d.mag),
                //     d.lon, d.lat, projection([d.lon, d.lat])[0], projection([d.lon, d.lat])[1], d3v4.select(this).attr("cx"))
                // d3v4.select(this).attr("r", zz(d.mag))
                tipConflict.show(d)
            })
            .on('mouseout', tipConflict.hide)
            .transition()
            .duration(1000)
            .attr("transform", svgTransform)
            .attr("class", "war-dot exp")
            .attr("cx", function(d) { return projection([d.lon, d.lat])[0] })
            .attr("cy", function(d) { return projection([d.lon, d.lat])[1] })
            .attr("r", function(d) { return zz(d.mag) })
            .style("fill", "white")
            .style("stroke", "black")
            .style("stroke-width", 1.5 / svgStroke + "px")
            .style("opacity", .5)


        u.exit()
            .transition() // and apply changes to all of them
            .duration(1000)
            .style("opacity", 0)
            .remove()

        $("#numConfExp").text(wars.length)
        var sumMagExp = 0;
        wars.forEach(d => sumMagExp += parseInt(d.mag))
        $("#sumMagExp").text(sumMagExp)

        wars = savedWars.filter(d => filterWar(d)).filter(d => parseInt(d.mag) <= selectedCircle2);
        $("#numConfImp").text(wars.length)

        var u2 = svg2.selectAll(".war-dot.imp")
            .data(wars)
        u2.enter()
            .append("circle") // Add a new circle for each new element
            // .merge(u2) // get the already existing elements as well
            .on('mouseover', function(d) {
                // console.log(d3v4.select(this).attr("r"), d.mag, zz(d.mag),
                //     d.lon, d.lat, projection([d.lon, d.lat])[0], projection([d.lon, d.lat])[1], d3v4.select(this).attr("cx"))
                // d3v4.select(this).attr("r", zz(d.mag))
                tipConflict.show(d)
            })
            .on('mouseout', tipConflict.hide)
            .transition()
            .duration(1000)
            .attr("class", "war-dot imp")
            .attr("cx", function(d) { return projection([d.lon, d.lat])[0] })
            .attr("cy", function(d) { return projection([d.lon, d.lat])[1] })
            .attr("r", function(d) { return zz(d.mag) })
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

        $("#numConfImp").text(wars.length)
        var sumMagImp = 0;
        wars.forEach(d => sumMagImp += parseInt(d.mag))
        $("#sumMagImp").text(sumMagImp)


        // If less group in the new dataset, I delete the ones not in use anymore
        $("#cntInvolvedExp").text(cntInvExp.join(", "))
        $("#cntInvolvedImp").text(cntInvImp.join(", "))

        d3v4.selectAll(".war-dot")
            .on('mouseover', function(d) {
                // console.log(d3v4.select(this).attr("r"), d.mag, zz(d.mag))
                // d3v4.select(this).attr("r", zz(d.mag))
                tipConflict.show(d)
            })
            .on('mouseout', tipConflict.hide)
            .attr("r", function(d) { return zz(d.mag) })
            .attr("transform", svgTransform)
            .style("stroke-width", 1.5 / svgStroke + "px")
            .style("fill", "white")
            .style("stroke", "black")
            .style("opacity", .5)

        svg.call(tipConflict);
        svg2.call(tipConflict);

        svg.transition()
            .duration(1000)
            .call(zoom.transform, svgTransform);
        svg2.transition()
            .duration(1000)
            .call(zoom.transform, svgTransform);
    }


    function transitionCircles(oldMag, type) {
        console.log("Transition circles")
        const tranWars = savedWars.filter(d => filterWar(d))
            .filter(d => (parseInt(d.mag) <= (type == "exp" ? selectedCircle : selectedCircle2)))
        console.log(tranWars)
        var u;
        if (type === "exp") {

            u = svg.selectAll(".war-dot.exp")
                .data(tranWars)

            $("#numConfExp").text(tranWars.length)
            var sumMagExp = 0;
            tranWars.forEach(d => sumMagExp += parseInt(d.mag))
            $("#sumMagExp").text(sumMagExp)

            $("#numConfExp").text(tranWars.length)

        } else {


            u = svg2.selectAll(".war-dot.imp").filter("circle")
                .data(tranWars)
            $("#numConfImp").text(tranWars.length)
            var sumMagImp = 0;
            tranWars.forEach(d => sumMagImp += parseInt(d.mag))
            $("#sumMagImp").text(sumMagImp)
            $("#numConfImp").text(tranWars.length)
        }



        var uu = u.enter()
            .append("circle") // Add a new circle for each new element
            // if (oldMag < (type == "exp" ? selectedCircle : selectedCircle2))
            .on('mouseover', function(d) {
                // console.log(d3v4.select(this).attr("r"), d.mag, zz(d.mag),
                //     d.lon, d.lat, projection([d.lon, d.lat])[0], projection([d.lon, d.lat])[1], d3v4.select(this).attr("cx"))
                // d3v4.select(this).attr("r", zz(d.mag))
                tipConflict.show(d)
            })
            .on('mouseout', tipConflict.hide)
            .merge(u)
            .transition()
            // uu.transition()
            .duration(1000)
            .attr("class", "war-dot " + (type == "exp" ? "exp" : "imp"))
            .attr("cx", function(d) { return projection([d.lon, d.lat])[0] })
            .attr("cy", function(d) { return projection([d.lon, d.lat])[1] })
            .attr("r", function(d) { return zz(d.mag) })
            .attr("transform", svgTransform)
            .style("stroke-width", 1.5 / svgStroke + "px")
            .style("fill", "white")
            .style("stroke", "black")
            .style("opacity", .5)



        u.exit()
            .transition() // and apply changes to all of them
            .duration(1000)
            .style("opacity", 0)
            .remove()

        svg.call(tipConflict);
        svg2.call(tipConflict);


        // u
        //     .attr("cx", function(d) { return projection([d.lon, d.lat])[0] })
        //     .attr("cy", function(d) { return projection([d.lon, d.lat])[1] })
        //     .attr("r", function(d) { return zz(d.mag) })



        // d3v4.selectAll(".war-dot")
        //     .on('mouseover', function(d) {
        //         // console.log(d3v4.select(this).attr("r"), d.mag, zz(d.mag),
        //         //     d.lon, d.lat, projection([d.lon, d.lat])[0], projection([d.lon, d.lat])[1], d3v4.select(this).attr("cx"))
        //         // d3v4.select(this).attr("r", zz(d.mag))
        //         tipConflict.show(d)
        //     })
        //     .on('mouseout', tipConflict.hide)


        svg.transition()
            .duration(1000)
            .call(zoom.transform, svgTransform);
        svg2.transition()
            .duration(1000)
            .call(zoom.transform, svgTransform);


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
        cntInvImp = [];
        cntInvExp = [];
        redScale = d3v4.scaleThreshold()
            .domain([1, 10, 100, 1000, 10000, 100000])
            .range(colorsImport)

        greenScale = d3v4.scaleThreshold()
            .domain([1, 10, 100, 1000, 10000, 100000])
            .range(colorsExport)

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

            d3v4.selectAll(".title-imp")
                .text(function(d) {
                    if (impData.has(d.id))
                        cntInvImp.push(d.properties.name)
                    return `To ${d.properties.name}
    ${impData.has(d.id) ? impData.get(d.id) : "0"}`
                });

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

            d3v4.selectAll(".title-exp")
                .text(function(d) {
                    if (expData.has(d.id))
                        cntInvExp.push(d.properties.name)
                    return `From ${d.properties.name}
    ${expData.has(d.id) ? expData.get(d.id) : "0"}`
                });

            tabulate(filteredTransactionsExp, columns, true, false)
            tabulate(filteredTransationsImp, columns, false, true)
            $("#cntInvolvedExp").text(cntInvExp.join(", "))
            $("#cntInvolvedImp").text(cntInvImp.join(", "))
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

    // var toggleRisky = function(status, type) {
    //     if (type == "exp") {
    //         if (status == "on") {
    //             risky.forEach(d => {
    //                 if (d != undefined) {
    //                     // add overlay path
    //                     s = svg.select("#c-exp-" + d)
    //                     console.log("asddassd", s, d)
    //                     svg.append("path")
    //                         .attr("class", "exp-overlay")
    //                         .attr("d", function(dd) { return s.attr("d") })
    //                         .fill("url(#circles-7)")


    //                 }
    //             })

    //         } else {}

    //     } else {
    //         if (status == "on") {
    //             svg2.selectAll(".war-dot.imp")
    //                 .transition().duration(1000)
    //                 .style("opacity", status == "on" ? .5 : 0)
    //             svg2
    //                 .selectAll(".circleLegend")
    //                 .transition().duration(1000)
    //                 .style("opacity", status == "on" ? 1 : 0)
    //                 .attr("pointer-events", status == "on" ? "auto" : "none")
    //         } else {

    //         }
    //     }

    // }





    var tabulate = function(data, columns, redraw = false, append = false) {
        redcolor = "#d00101"
        greencolor = "#009344"
        yellowcolor = "#f6ff00"

        if (redraw) {
            d3v4.selectAll(".tableTrans").transition().delay(1000).remove()
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
            elem.scrollTop = elem.scrollHeight;


        }

        return table;
    }

    function legendTransition() {
        legendImp.scale(redScale)

        svg2.select(".legendThreshold")
            .call(legendImp)

        legend.scale(greenScale)
        svg.select(".legendThreshold")
            .call(legend)


    }

    return {
        drawCloroExp: drawCloroExp,
        // drawCloroImp: drawCloroImp,
        sliderTransition: sliderTransition,
        legendTransition: legendTransition,
        selectedTransition: selectedTransition,
        getYearsInterval: getYearsInterval,
        setYearInterval: setYearInterval,

        updateGeneralInfo: updateGeneralInfo,

        getCountry: getCountry,
        setCountry: setCountry,

        resetZoom: resetZoom,
        selected: selected,
        toggleCircles: toggleCircles,
        // toggleRisky: toggleRisky,

    }
}