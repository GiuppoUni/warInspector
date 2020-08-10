// set the dimensions and margins of the graph
var margin = {
        top: 70,
        right: 0,
        bottom: 0,
        left: 0
    },
    width = 400 - margin.left - margin.right,
    height = 270 - margin.top - margin.bottom,
    innerRadius = 30,
    outerRadius = Math.min(width, height) / 2; // the outerRadius goes from the middle of the SVG area to the border

// append the svg object
var svg = d3v4.select("#circular_viz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + (width / 2 + margin.left) + "," + (height / 2 + margin.top) + ")");

// d3v4.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/7_OneCatOneNum.csv", function(data) {

d3v4.csv("static/data/army-dimensions-clean.csv", function(data) {
    var headers = d3v4.keys(data[0]);
    const cols = data.columns.filter(function(d) {
        return parseInt(d) >= years[0] && parseInt(d) <= years[1] || d == "Country Name" || d == "Country Code";
    });
    // console.log("COLUMNS", columns)

    totals = {};

    newData = data.map(function(d) {
        kk = ""
        kn = ""
        sum = 0
        toBeSkipped = false
        cols.forEach(function(k) {
            if (k !== "Country Code" && k !== "Country Name") {
                // E' un anno
                sum += parseFloat(d[k]) || 0
            } else if (k === "Country Code") {
                if (allCountriesAlpha3.includes(d[k]))
                    kk = d[k]
                else
                    toBeSkipped = true
            } else if (k === "Country Name") {
                kn = d[k]
            }

        });
        if (toBeSkipped) avg = 0
        else
            avg = sum / (cols.length - 2)
            // console.log(kk, avg)
        return [kk, avg, kn]
    });

    // console.log(newData)

    data = newData.sort(function(a, b) {
        return d3v4.descending(+a[1], +b[1]);
    }).slice(0, 20);
    // if (DEBUG) 
    console.log(data)

    /************************************************************************************************************
     * NOW YOU HAVE DATA TO BE PLOTTED, FORMAT : 
     * ...
     * [ COUNTRY CODE, VALUE AVG ARMY FOR RANGE OF YEARS , COUNTRY NAME ]
     * ...*
     ************************************************************************************************************/

    // Scales
    var x = d3v4.scaleBand()
        .range([0, 2 * Math.PI]) // X axis goes from 0 to 2pi = all around the circle. If I stop at 1Pi, it will be around a half circle
        .align(0) // This does nothing
        .domain(data.map(function(d) {
            return d[2];
        })); // The domain of the X axis is the list of states.
    var y = d3v4.scaleRadial()
        .range([innerRadius, outerRadius]) // Domain will be define later.
        .domain([0, 14000]); // Domain of Y is from 0 to the max seen in the data

    // Add the bars
    svg.append("g")
        .selectAll("path")
        .data(data)
        .enter()
        .append("path")
        .attr("class", "circ-bar")
        .attr("fill", function(d) {
            if (selected_group.includes(d[0]))
                return "#d2d918"
            else
                return "#69b3a2"
        })
        .attr("d", d3v4.arc() // imagine your doing a part of a donut plot
            .innerRadius(innerRadius)
            .outerRadius(function(d) {
                return (y(d[1]) * 0.1);
            })
            .startAngle(function(d) {
                return x(d[2]);
            })
            .endAngle(function(d) {
                return x(d[2]) + x.bandwidth();
            })
            .padAngle(0.01)
            .padRadius(innerRadius))
    var tip = d3v4.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {

            return '<strong>' + d[2] + '</strong><br/><strong>' + Math.round(d[1]) + '</strong>';
        })
    svg.call(tip);

    d3v4.selectAll(".circ-bar")
        .on('mouseover', d => tip.show(d))
        .on('mouseout', tip.hide)

    // Add the labels
    svg.append("g")
        .selectAll("g")
        .data(data)
        .enter()
        .append("g")
        .attr("text-anchor", function(d) {
            return (x(d[2]) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start";
        })
        .attr("transform", function(d) {
            return "rotate(" + ((x(d[2]) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")" + "translate(" + ((y(d[1]) * 0.1) + 10) + ",0)";
        })
        .append("text")
        .attr("fill", "white")
        .text(function(d) {
            return (d[0])
        })
        .attr("transform", function(d) {
            return (x(d[2]) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "rotate(180)" : "rotate(0)";
        })
        .style("font-size", "11px")
        .attr("alignment-baseline", "middle")

});