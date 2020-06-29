var RankRaceManager = function() {


    var raceSvg = d3v4.select("#rankRace-container").append("svg")
        .attr("width", 240)
        .attr("height", 150)
        .attr("id", "chart-svg")



    var tickDuration = 2000; //was 500

    var top_n = 3;
    var height = 150;
    var width = 240;

    stopped = false;
    restart = false;

    const margin = {
        top: 80,
        right: 0,
        bottom: 5,
        left: 0
    };

    let barPadding = (height - (margin.bottom + margin.top)) / (top_n * 5);

    let title = raceSvg.append('text')
        .attr('class', 'title')
        .attr('y', 24)
        .html('Export Ranking year by year');

    let subTitle = raceSvg.append("text")
        .attr("class", "subTitle")
        .attr("y", 55)
        .html("Exported, $m");

    // let caption = raceSvg.append('text')
    //     .attr('class', 'caption')
    //     .attr('x', width)
    //     .attr('y', height - 5)
    //     .style('text-anchor', 'end')
    //     .html('Source: Interbrand');

    let year = years[0];

    var ticker;

    var restarter;
    var resumer;

    function onLoad(error, data) {

        //if (error) throw error;

        console.log(data);

        data.forEach(d => {
            d.value = +d.value,
                d.lastValue = +d.lastValue,
                d.value = isNaN(d.value) ? 0 : d.value,
                d.year = +d.year,
                //d.colour = d3v4.hsl(Math.random()*360,0.75,0.75)
                d.colour = d.code3 == "USA" ? "#990A0D" : "#ffffff"
        });

        console.log(data);

        let yearSlice = data.filter(d => d.year == year && !isNaN(d.value))
            .sort((a, b) => Math.abs(b.value - a.value))
            .slice(0, top_n);

        yearSlice.forEach((d, i) => d.rank = i);

        console.log('yearSlice: ', yearSlice)

        let x = d3v4.scaleLinear()
            .domain([0, d3v4.max(yearSlice, d => d.value)])
            .range([margin.left, width - margin.right - 65]);

        let y = d3v4.scaleLinear()
            .domain([top_n, 0])
            .range([height - margin.bottom, margin.top]);

        let xAxis = d3v4.axisTop()
            .scale(x)
            .ticks(width > 500 ? 5 : 2)
            .tickSize(-(height - margin.top - margin.bottom))
            .tickFormat(d => d3v4.format(',')(d));

        raceSvg.append('g')
            .attr('class', 'axis xAxis')
            .attr('transform', `translate(0, ${margin.top})`)
            .call(xAxis)
            .selectAll('.tick line')
            .classed('origin', d => d == 0);

        raceSvg.selectAll('rect.bar')
            .data(yearSlice, d => d.name)
            .enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('x', x(0) + 1)
            .attr('width', d => x(d.value) - x(0) + 1)
            .attr('y', d => y(d.rank) + 5)
            .attr('height', y(1) - y(0) - barPadding)
            .style('fill', d => d.colour);

        raceSvg.selectAll('text.label')
            .data(yearSlice, d => d.name)
            .enter()
            .append('text')
            .attr('class', 'label')
            .attr('x', d => x(d.value) - 8)
            .attr('y', d => y(d.rank) + 5 + ((y(1) - y(0)) / 2) + 1)
            .style('text-anchor', 'end')
            .html(d => d.name);

        raceSvg.selectAll('text.valueLabel')
            .data(yearSlice, d => d.name)
            .enter()
            .append('text')
            .attr('class', 'valueLabel')
            .attr('x', d => x(d.value) + 5)
            .attr('y', d => y(d.rank) + 5 + ((y(1) - y(0)) / 2) + 1)
            .text(d => d3v4.format(',.0f')(d.lastValue));

        let yearText = raceSvg.append('text')
            .attr('class', 'yearText')
            .attr('x', width - margin.right)
            .attr('y', height - 5)
            .style('text-anchor', 'end')
            .html(~~year)
            .call(halo, 0);


        function render(e) {

            restart = false;

            yearSlice = data.filter(d => d.year == year && !isNaN(d.value))
                .sort((a, b) => b.value - a.value)
                .slice(0, top_n);

            yearSlice.forEach((d, i) => d.rank = i);

            //console.log('IntervalYear: ', yearSlice);

            x.domain([0, d3v4.max(yearSlice, d => d.value)]);

            raceSvg.select('.xAxis')
                .transition()
                .duration(tickDuration)
                .ease(d3v4.easeLinear)
                .call(xAxis);

            let bars = raceSvg.selectAll('.bar').data(yearSlice, d => d.name);

            bars
                .enter()
                .append('rect')
                .attr('class', d => `bar ${d.name.replace(/\s/g,'_')}`)
                .attr('x', x(0) + 1)
                .attr('width', d => x(d.value) - x(0) + 1)
                .attr('y', d => y(top_n + 1) + 5)
                .attr('height', y(1) - y(0) - barPadding)
                .style('fill', d => d.colour)
                .transition()
                .duration(tickDuration)
                .ease(d3v4.easeLinear)
                .attr('y', d => y(d.rank) + 5);

            bars
                .transition()
                .duration(tickDuration)
                .ease(d3v4.easeLinear)
                .attr('width', d => x(d.value) - x(0) + 1)
                .attr('y', d => y(d.rank) + 5);

            bars
                .exit()
                .transition()
                .duration(tickDuration)
                .ease(d3v4.easeLinear)
                .attr('width', d => x(d.value) - x(0) + 1)
                .attr('y', d => y(top_n + 1) + 5)
                .remove();

            let labels = raceSvg.selectAll('.label')
                .data(yearSlice, d => d.name);

            labels
                .enter()
                .append('text')
                .attr('class', 'label')
                .attr('x', d => x(d.value) - 8)
                .attr('y', d => y(top_n + 1) + 5 + ((y(1) - y(0)) / 2))
                .style('text-anchor', 'end')
                .html(d => d.name)
                .transition()
                .duration(tickDuration)
                .ease(d3v4.easeLinear)
                .attr('y', d => y(d.rank) + 5 + ((y(1) - y(0)) / 2) + 1);


            labels
                .transition()
                .duration(tickDuration)
                .ease(d3v4.easeLinear)
                .attr('x', d => x(d.value) - 8)
                .attr('y', d => y(d.rank) + 5 + ((y(1) - y(0)) / 2) + 1);

            labels
                .exit()
                .transition()
                .duration(tickDuration)
                .ease(d3v4.easeLinear)
                .attr('x', d => x(d.value) - 8)
                .attr('y', d => y(top_n + 1) + 5)
                .remove();



            let valueLabels = raceSvg.selectAll('.valueLabel').data(yearSlice, d => d.name);

            valueLabels
                .enter()
                .append('text')
                .attr('class', 'valueLabel')
                .attr('x', d => x(d.value) + 5)
                .attr('y', d => y(top_n + 1) + 5)
                .text(d => d3v4.format(',.0f')(d.lastValue))
                .transition()
                .duration(tickDuration)
                .ease(d3v4.easeLinear)
                .attr('y', d => y(d.rank) + 5 + ((y(1) - y(0)) / 2) + 1);

            valueLabels
                .transition()
                .duration(tickDuration)
                .ease(d3v4.easeLinear)
                .attr('x', d => x(d.value) + 5)
                .attr('y', d => y(d.rank) + 5 + ((y(1) - y(0)) / 2) + 1)
                .tween("text", function(d) {
                    var node = this;
                    let i = d3v4.interpolateRound(d.lastValue, d.value);
                    return function(t) {
                        node.textContent = d3v4.format(',')(i(t));
                    };
                });


            valueLabels
                .exit()
                .transition()
                .duration(tickDuration)
                .ease(d3v4.easeLinear)
                .attr('x', d => x(d.value) + 5)
                .attr('y', d => y(top_n + 1) + 5)
                .remove();

            yearText.html(~~year);

            if (year == years[1]) {
                ticker.stop();
            }

            year = d3v4.format('.1f')((+year) + 1); //was 0.1
        }


        ticker = d3v4.interval(
            render, tickDuration);

        restarter = function() {
            ticker.stop()
            ticker.restart(render, tickDuration)
        }

        resumer = function() {
            ticker = d3v4.interval(
                render, tickDuration);

        }

    }

    d3v4.csv('static/data/rk_exp.csv', onLoad);



    const halo = function(text, strokeWidth) {
        text.select(function() { return this.parentNode.insertBefore(this.cloneNode(true), this); })
            .style('fill', 'black')
            .style('stroke', 'yellow')
            .style('stroke-width', strokeWidth)
            .style('stroke-linejoin', 'round')
            .style('opacity', 1);

    }

    function stop() {
        if (stopped)
            resumer()
        else
            ticker.stop();
        stopped = !stopped
    }

    function reset() {
        year = years[0];
        ticker.stop()
        if (restarter != undefined)
            resumer()
    }



    return {
        stop: stop,
        reset: reset,
    }
}