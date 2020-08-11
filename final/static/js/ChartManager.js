var ChartManager = function() {
    // var country_selected = ["ITA"];




    // function 
    var drawChart = function() {

        const margin = 80;

        const width = 400 - 2 * margin;
        const height = 350 - 2 * margin - 10;



        const svg = d3v4.select("#chart-svg");
        const svgContainer = d3v4.select('#chart-container');

        const chart = svg.append('g')
            .attr('transform', `translate(${margin}, ${margin})`);

        //data loading
        d3v4.queue()
            .defer(d3v4.csv, 'static/data/merged.csv')
            .await(ready)


        function ready(error, merged) {

            if (DEBUG) console.log(merged);

            data_structure = new Map();

            if (DEBUG) console.log(merged.length);

            for (let i = 0; i < merged.length; i++) {
                var row = merged[i];

                //if (DEBUG) console.log(row);

                // Take the ordered and delivered data is in the interval
                var yearOrd = stripYear(row["Ordered year"]);
                var yearDel = stripYear(row["Delivered year"]);

                //if (DEBUG) console.log(yearOrd, " ", yearDel)

                // Check years in the interval and the country
                if (!isNaN(yearOrd) && yearOrd >= years[0] && yearOrd <= years[1] &&
                    !isNaN(yearDel) && yearDel >= years[0] && yearDel <= years[1] &&
                    selected_group.includes(row["codeS"])) {

                    var num = stripNum(row["Delivered num."]);

                    //if (DEBUG) console.log(num)

                    if (data_structure.has(yearOrd))
                        data_structure.set(yearOrd, data_structure.get(yearOrd) + num);
                    else
                        data_structure.set(yearOrd, num);

                }

            }

            if (DEBUG) console.log(data_structure);

            // Compute the max value and list of years in order to put in the scale
            var max_value = 0;

            function computeMax(value, key, map) {
                if (value > max_value) max_value = value;
            }
            data_structure.forEach(computeMax);

            var list_db = [];
            const it = data_structure.entries();
            for (let el = it.next(); !el.done; el = it.next())
                list_db.push(el.value);

            var list_years = [];
            for (let i = years[0]; i <= years[1]; i++)
                list_years.push(i);


            const xScale = d3v4.scaleBand()
                .range([0, width])
                .domain(list_years)
                .paddingInner(0.4)

            const yScale = d3v4.scaleLinear()
                .range([height, 0])
                .domain([0, max_value]);

            // vertical grid lines
            // const makeXLines = () => d3v4.axisBottom()
            //                              .scale(xScale)

            const makeYLines = () => d3v4.axisLeft()
                .scale(yScale)

            chart.append('g')
                .attr("class", "xticks")
                .attr('transform', `translate(0, ${height})`)
                .call(d3v4.axisBottom(xScale))
                .selectAll("text")
                .attr("transform", "rotate(-45)")
                .style("text-anchor", "end");

            const yAxisTicks = yScale.ticks()
                .filter(Number.isInteger);

            chart.append('g')
                .call(d3v4.axisLeft(yScale)
                    .tickValues(yAxisTicks)
                    .tickFormat(d3v4.format('d'))
                );

            // vertical grid lines
            // chart.append('g')
            //   .attr('class', 'grid')
            //   .attr('transform', `translate(0, ${height})`)
            //   .call(makeXLines()
            //     .tickSize(-height, 0, 0)
            //     .tickFormat('')
            //   )

            chart.append('g')
                .attr('class', 'grid')
                .call(makeYLines()
                    .tickSize(-width, 0, 0)
                    .tickValues(yAxisTicks)
                    .tickFormat('')
                )

            const barGroups = chart.selectAll()
                .data(list_db)
                .enter()
                .append('g')

            barGroups
                .append('rect')
                .attr('class', 'bar')
                .attr('x', (g) => xScale(g[0]))
                .attr('y', (g) => yScale(g[1]))
                .attr('height', (g) => height - yScale(g[1]))
                .attr('width', xScale.bandwidth())
                .attr("fill", "#d00101")
                .on('mouseenter', function(actual, i) {
                    d3v4.selectAll('.value')
                        .attr('opacity', 0)

                    d3v4.select(this)
                        .transition()
                        .duration(300)
                        .attr('opacity', 0.6)
                        .attr('x', (g) => xScale(g[0]) - 5)
                        .attr('width', xScale.bandwidth() + 10)

                    const y = yScale(actual[1]);

                    line = chart.append('line')
                        .attr('id', 'limit')
                        .attr('x1', 0)
                        .attr('y1', y)
                        .attr('x2', width)
                        .attr('y2', y)

                    barGroups.append('text')
                        .attr('class', 'divergence')
                        .attr('x', (g) => xScale(g[0]) + xScale.bandwidth() / 2)
                        .attr('y', (g) => yScale(g[1]) - 10)
                        .attr('fill', 'white')
                        .attr('text-anchor', 'middle')
                        .text((g, idx) => {
                            const divergence = (g[1] - actual[1]).toFixed(0)

                            let text = ''
                            if (divergence > 0) text += '+';
                            text += `${divergence}`

                            return idx !== i ? text : '';
                        })

                })
                .on('mouseleave', function() {
                    d3v4.selectAll('.value')
                        .attr('opacity', 1)

                    d3v4.select(this)
                        .transition()
                        .duration(300)
                        .attr('opacity', 1)
                        .attr('x', (g) => xScale(g[0]))
                        .attr('width', xScale.bandwidth())

                    chart.selectAll('#limit').remove()
                    chart.selectAll('.divergence').remove()
                })

            barGroups
                .append('text')
                .attr('class', 'value')
                .attr('x', (g) => xScale(g[0]) + xScale.bandwidth() / 2)
                .attr('y', (g) => yScale(g[1]) - 10)
                .attr('text-anchor', 'middle')
                .text((g) => `${g[1]}`)

            svg
                .append('text')
                .attr('class', 'label')
                .attr('x', -(height / 2) - margin)
                .attr('y', margin / 2.4)
                .attr('transform', 'rotate(-90)')
                .attr('text-anchor', 'middle')
                .text('Supplied units')

            svg.append('text')
                .attr('class', 'label')
                .attr('x', width / 2 + margin)
                .attr('y', height + margin * 1.7)
                .attr('text-anchor', 'middle')
                .attr('transform', 'rotate(45)')
                .text('Years')

            svg.append('text')
                .attr("fill", "yellow")
                .attr("stroke", "black")
                .attr("stroke-width", "0.5")
                .attr('x', width / 2 + 60)
                .attr('y', 30)
                .attr('text-anchor', 'middle')
                .classed("title", true)
                // .text('Units supplied by ' + country_selected +
                .text('Units supplied by selected' +
                    ' from ' + years[0] + ' to ' + years[1])

            // svg.append('text')
            //     .attr('class', 'source')
            //     .attr('x', width - margin / 2)
            //     .attr('y', height + margin * 1.7)
            //     .attr('text-anchor', 'start')
            //     .text('Source: Sipri (www.sipri.org)')


        }

    }

    // function 
    var drawChartRec = function() {
        const margin = 80;
        const width = 400 - 2 * margin;
        const height = 350 - 2 * margin - 10;



        const svg = d3v4.select("#chart-svg-rec");
        const svgContainer = d3v4.select('#chart-container-rec');

        const chart = svg.append('g')
            .attr('transform', `translate(${margin}, ${margin})`);

        //data loading
        d3v4.queue()
            .defer(d3v4.csv, 'static/data/merged.csv')
            .await(ready)


        function ready(error, merged) {

            if (DEBUG) console.log(merged);

            data_structure = new Map();

            if (DEBUG) console.log(merged.length);

            for (let i = 0; i < merged.length; i++) {
                var row = merged[i];

                //if (DEBUG) console.log(row);

                // Take the ordered and delivered data is in the interval
                var yearOrd = stripYear(row["Ordered year"]);
                var yearDel = stripYear(row["Delivered year"]);

                //if (DEBUG) console.log(yearOrd, " ", yearDel)

                // Check years in the interval and the country
                if (!isNaN(yearOrd) && yearOrd >= years[0] && yearOrd <= years[1] &&
                    !isNaN(yearDel) && yearDel >= years[0] && yearDel <= years[1] &&
                    selected_group.includes(row["codeR"])) {

                    var num = stripNum(row["Delivered num."]);

                    //if (DEBUG) console.log(num)

                    if (data_structure.has(yearOrd))
                        data_structure.set(yearOrd, data_structure.get(yearOrd) + num);
                    else
                        data_structure.set(yearOrd, num);

                }

            }

            if (DEBUG) console.log(data_structure);

            // Compute the max value and list of years in order to put in the scale
            var max_value = 0;

            function computeMax(value, key, map) {
                if (value > max_value) max_value = value;
            }
            data_structure.forEach(computeMax);

            var list_db = [];
            const it = data_structure.entries();
            for (let el = it.next(); !el.done; el = it.next())
                list_db.push(el.value);

            var list_years = [];
            for (let i = years[0]; i <= years[1]; i++)
                list_years.push(i);


            const xScale = d3v4.scaleBand()
                .range([0, width])
                .domain(list_years)
                .paddingInner(0.4)

            const yScale = d3v4.scaleLinear()
                .range([height, 0])
                .domain([0, max_value]);

            // vertical grid lines
            // const makeXLines = () => d3v4.axisBottom()
            //                              .scale(xScale)

            const makeYLines = () => d3v4.axisLeft()
                .scale(yScale)

            chart.append('g')
                .attr('transform', `translate(0, ${height})`)
                .call(d3v4.axisBottom(xScale))
                .selectAll("text")
                .attr("transform", "rotate(-45)")
                .style("text-anchor", "end");

            const yAxisTicks = yScale.ticks()
                .filter(Number.isInteger);

            chart.append('g')
                .call(d3v4.axisLeft(yScale)
                    .tickValues(yAxisTicks)
                    .tickFormat(d3v4.format('d'))
                );

            // vertical grid lines
            // chart.append('g')
            //   .attr('class', 'grid')
            //   .attr('transform', `translate(0, ${height})`)
            //   .call(makeXLines()
            //     .tickSize(-height, 0, 0)
            //     .tickFormat('')
            //   )

            chart.append('g')
                .attr('class', 'grid')
                .call(makeYLines()
                    .tickSize(-width, 0, 0)
                    .tickValues(yAxisTicks)
                    .tickFormat('')
                )

            const barGroups = chart.selectAll()
                .data(list_db)
                .enter()
                .append('g')

            barGroups
                .append('rect')
                .attr('class', 'bar')
                .attr('x', (g) => xScale(g[0]))
                .attr('y', (g) => yScale(g[1]))
                .attr('height', (g) => height - yScale(g[1]))
                .attr('width', xScale.bandwidth())
                .attr("fill", "#009344")
                .on('mouseenter', function(actual, i) {
                    d3v4.selectAll('.value')
                        .attr('opacity', 0)

                    d3v4.select(this)
                        .transition()
                        .duration(300)
                        .attr('opacity', 0.6)
                        .attr('x', (g) => xScale(g[0]) - 5)
                        .attr('width', xScale.bandwidth() + 10)

                    const y = yScale(actual[1]);

                    line = chart.append('line')
                        .attr('id', 'limit')
                        .attr('x1', 0)
                        .attr('y1', y)
                        .attr('x2', width)
                        .attr('y2', y)

                    barGroups.append('text')
                        .attr('class', 'divergence')
                        .attr('x', (g) => xScale(g[0]) + xScale.bandwidth() / 2)
                        .attr('y', (g) => yScale(g[1]) - 10)
                        .attr('fill', 'white')
                        .attr('text-anchor', 'middle')
                        .text((g, idx) => {
                            const divergence = (g[1] - actual[1]).toFixed(0)

                            let text = ''
                            if (divergence > 0) text += '+';
                            text += `${divergence}`

                            return idx !== i ? text : '';
                        })

                })
                .on('mouseleave', function() {
                    d3v4.selectAll('.value')
                        .attr('opacity', 1)

                    d3v4.select(this)
                        .transition()
                        .duration(300)
                        .attr('opacity', 1)
                        .attr('x', (g) => xScale(g[0]))
                        .attr('width', xScale.bandwidth())

                    chart.selectAll('#limit').remove()
                    chart.selectAll('.divergence').remove()
                })

            barGroups
                .append('text')
                .attr('class', 'value')
                .attr('x', (g) => xScale(g[0]) + xScale.bandwidth() / 2)
                .attr('y', (g) => yScale(g[1]) - 10)
                .attr('text-anchor', 'middle')
                .text((g) => `${g[1]}`)

            svg
                .append('text')
                .attr('class', 'label')
                .attr('x', -(height / 2) - margin)
                .attr('y', margin / 2.4)
                .attr('transform', 'rotate(-90)')
                .attr('text-anchor', 'middle')
                .text('Received units')

            svg.append('text')
                .attr('class', 'label')
                .attr('x', width / 2 + margin)
                .attr('y', height + margin * 1.7)
                .attr('text-anchor', 'middle')
                .text('Years')

            svg.append('text')
                .attr("fill", "yellow")
                .attr("stroke", "black")
                .attr("stroke-width", "0.5")
                .attr('x', width / 2 + 60)
                .attr('y', 30)
                .attr('text-anchor', 'middle')
                .classed("title", true)
                // .text('Units supplied by ' + country_selected +
                .text('Units received from selected' +
                    ' from ' + years[0] + ' to ' + years[1])

            // svg.append('text')
            //     .attr('class', 'source')
            //     .attr('x', width - margin / 2)
            //     .attr('y', height + margin * 1.7)
            //     .attr('text-anchor', 'start')
            //     .text('Source: Sipri (www.sipri.org)')


        }

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

    function stripNum(input) {
        if (input == null || input == "")
            return 0;

        // In case of (delivered num.)
        if (input.indexOf("(") >= 0 || input.indexOf(")") >= 0)
            return parseInt(input.replace("(", "").replace(")", ""));

        // Other cases
        return parseInt(input);

    }

    function update() {
        d3v4.select('#chart-svg').remove()
        $('#chart-container').append('<svg id="chart-svg"></svg>')
        d3v4.select('#chart-svg-rec').remove()
        $('#chart-container-rec').append('<svg id="chart-svg-rec"></svg>')
        drawChart()
        drawChartRec()
    }

    var updateYearsInterval = function(yi) {
        years = yi
        update()
    }

    var updateCountry = function(c) {

        update()
    }

    return {
        drawChart: drawChart,
        drawChartRec: drawChartRec,
        updateYearsInterval: updateYearsInterval,
        updateCountry: updateCountry
    }
}