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




    // IMPORT map
    const svg2 = imp_section
        .append('svg')
        .attr("id", "map2")
        .attr('width', width - 5)
        .attr('height', height);

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
        .attr('height', height);

    $("#map").after("<div id='mapInstr'><h6 class='instr'> You can zoom in/out and move using the mouse.    </h6></div>");

    svg.call(zoom);

    var g = svg.append('g');
    var stateGroup = g.append('g');
    var sphere = stateGroup.append("g")
    var heatsGroup = stateGroup.append("g")






    function zoomed() {
        g
            .selectAll('path') // To prevent stroke width from scaling
            .attr('transform', d3v4.event.transform);

        g_imp
            .selectAll('path') // To prevent stroke width from scaling
            .attr('transform', d3v4.event.transform);


        g.style("stroke-width", 1.5 / d3v4.event.transform.k + "px");
        // svg.on("dblclick.zoom", null)

        g_imp.style("stroke-width", 1.5 / d3v4.event.transform.k + "px");
        // svg2.on("dblclick.zoom", null)



        d3v4.selectAll(".selected").style("stroke-width", 3.0 / d3v4.event.transform.k + "px");
        d3v4.selectAll("textPath").attr('transform', d3v4.event.transform)
    }




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
            console.log(transactions)
                // Data and color scale
            var data = d3v4.map();


            var grouped = d3v4
                .nest()
                .key(function(d) { return d.codeR; })
                //.rollup(function(v) { return v.length; })
                .rollup(function(v) { return d3v4.sum(v, function(d) { return d["Delivered num."].replace(/\(|\)/g, ""); }) })
                .entries(transactions.filter(d => selected_group.includes(d.codeS)).filter(d =>
                    parseInt(d["Ordered year"].replace(/\(|\)/g, "")) >= years[0] &&
                    parseInt(d["Ordered year"].replace(/\(|\)/g, "")) <= years[1]));


            const max_from_grouped = Math.max.apply(Math, grouped.map(function(o) { return o.value; }))

            // .range(colorScheme);
            console.log("Max_from_grouped", max_from_grouped)
            max_from_grouped == -Infinity ? 1000 : max_from_grouped
            var colorScale = d3v4.scaleThreshold()
                .domain([1, 10, 100, 1000, 10000, 100000])
                .range(["#c7e9c0", "#a1d99b", "#74c476", "#31a354", "#006d2c", "#002c09"])


            for (let i = 0; i < grouped.length; i++) {
                const element = grouped[i];
                data.set(element.key, +element.value)
            }
            console.log(grouped)



            var hm = heatsGroup.append("g")
                .attr("class", "heatmap")
                .attr("id", "heatmap")
                .selectAll("path")
                .data(topo.features)
                .enter().append("path")
                .attr("fill", function(d) {
                    // Pull data for this country
                    d.total = data.get(d.id) || 0;
                    // Set the color
                    return d.total == 0 ? "#696969" : colorScale(d.total);
                })
                .attr("d", path)
                .attr("class", "country")
                .classed("selected", function(d) { return selected_group.includes(d.id) })
                .on('click', selected)
                .attr("id", d => "country" + d.id)
                .append("title")
                .text(d => `${d.properties.name}
        ${data.has(d.id) ? data.get(d.id) : "N/A"}`);



            // Legend
            var lgnd = heatsGroup.append("g")
                .attr("class", "legendThreshold")
                .attr("id", "legendThreshold")
                .attr("transform", "translate(20,20)");

            lgnd.append("text")
                .attr('class', 'title')
                .attr('id', 'arrows-title')
                .attr("fill", "white")
                .attr("stroke", "black")
                .attr("stroke-width", "0.5")
                .attr('x', width / 2 + 10)
                .attr('y', 10)
                .attr('text-anchor', 'middle')
                .text("Weapon units " + country_selected + " EXPORTED to nation during " + years[0] + "-" + years[1]);

            var labels = ['>=	 1', ">= 10", ">= 100", ">= 1000", ">= 10000", ">= 100000"];
            var legend = d3v4.legendColor()
                .labels(function(d) { return labels[d.i]; })
                .shapePadding(4)
                .scale(colorScale);

            heatsGroup.select(".legendThreshold")
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
            .await(ready)

        function ready(error, transactions, topo) {
            console.log(transactions)
                // Data and color scale
            var data = d3v4.map();


            var grouped = d3v4
                .nest()
                .key(function(d) { return d.codeS; })
                //.rollup(function(v) { return v.length; })
                .rollup(function(v) { return d3v4.sum(v, function(d) { return d["Delivered num."].replace(/\(|\)/g, ""); }) })
                .entries(transactions.filter(d => selected_group.includes(d.codeR)).filter(d =>
                    parseInt(d["Ordered year"].replace(/\(|\)/g, "")) >= years[0] &&
                    parseInt(d["Ordered year"].replace(/\(|\)/g, "")) <= years[1]));


            const max_from_grouped = Math.max.apply(Math, grouped.map(function(o) { return o.value; }))

            // .range(colorScheme);
            console.log("IMP: Max_from_grouped", max_from_grouped)
            max_from_grouped == -Infinity ? 1000 : max_from_grouped
            var colorScale = d3v4.scaleThreshold()
                .domain([1, 10, 100, 1000, 10000, 100000])
                .range(["#ffbaba", "#ff7b7b", "#ff5252", "#ff0000", "#a70000"])


            for (let i = 0; i < grouped.length; i++) {
                const element = grouped[i];
                data.set(element.key, +element.value)
            }
            console.log("IMP:", grouped)



            var hm = heatsGroup_imp.append("g")
                .attr("class", "heatmap")
                .attr("id", "heatmap2")
                .selectAll("path")
                .data(topo.features)
                .enter().append("path")
                .attr("fill", function(d) {
                    // Pull data for this country
                    d.total = data.get(d.id) || 0;
                    // Set the color
                    if (colorScale == undefined)
                        console.error("undefined here")
                    return d.total == 0 ? "#696969" : colorScale(d.total);
                })
                .attr("d", path)
                .attr("class", "country")
                .classed("selected", function(d) { return selected_group.includes(d.id) })
                .on('click', selected)
                .attr("id", d => "country" + d.id)
                .append("title")
                .text(d => `${d.properties.name}
        ${data.has(d.id) ? data.get(d.id) : "N/A"}`);



            // Legend
            var lgnd = heatsGroup_imp.append("g")
                .attr("class", "legendThreshold")
                .attr("id", "legendThreshold2")
                .attr("transform", "translate(20,20)");

            lgnd.append("text")
                .attr('class', 'title')
                .attr('id', 'arrows-title2')
                .attr("fill", "white")
                .attr("stroke", "black")
                .attr("stroke-width", "0.5")
                .attr('x', width / 2 + 10)
                .attr('y', 10)
                .attr('text-anchor', 'middle')
                .text("Weapon units " + country_selected + " IMPORTED to nation during " + years[0] + "-" + years[1]);

            var labels = ['>=	 1', ">= 10", ">= 100", ">= 1000", ">= 10000", ">= 100000"];
            var legend = d3v4.legendColor()
                .labels(function(d) { return labels[d.i]; })
                .shapePadding(4)
                .scale(colorScale);

            heatsGroup_imp.select(".legendThreshold")
                .call(legend);



        }
    }


    function selected() {
        el = d3v4.select(this)
        console.log(el.data()[0].id)
        if (!el.classed("selected")) {
            selected_group.push(el.data()[0].id)
            d3v4.selectAll("#country" + el.data()[0].id)
                .classed('selected', true);

        } else {

            const index = selected_group.indexOf(el.data()[0].id);
            if (index > -1) {
                selected_group.splice(index, 1);
            }

            d3v4.selectAll("#country" + el.data()[0].id)
                .classed('selected', false);
        }


        d3v4.selectAll(".heatmap").remove()
        d3v4.selectAll(".legendThreshold").remove()
        d3v4.selectAll(".legendCells").remove()

        mm.drawCloroExp()
        mm.drawCloroImp()

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

    return {
        drawCloroExp: drawCloroExp,
        drawCloroImp: drawCloroImp,
        getYearsInterval: getYearsInterval,
        setYearInterval: setYearInterval,

        getCountry: getCountry,
        setCountry: setCountry,

        resetZoom: resetZoom,

    }
}