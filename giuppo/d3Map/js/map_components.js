
// const map_components_section=d3.select('#map')
// .select('tr')
// .select('tr > td')


function drawSlider(){
    var div = document.getElementById("map_slider");                       // Create a <p> node
    var map_component_section = document.getElementById("map")
    .childNodes[0].childNodes[1];
    console.log(map_component_section)
    map_component_section.appendChild(div);                                          // Append the text to <p>
    
    var dataTime = d3.range(0, 49).map(function(d) {
        return new Date(1970 + d, 1, 1);
      });
    
    
    // Range
    var sliderRange = d3
    .sliderLeft()
    .min(d3.min(dataTime))
    .max(d3.max(dataTime))
    .step(1000 * 60 * 60 * 24 * 365)
    .height(600)
    .tickFormat(d3.timeFormat('%Y'))
    .tickValues(dataTime)
    .default([new Date(2016, 1, 1),new Date(2018, 1, 1)])
    .fill('#2196f3')
    .on('onchange', val => {
        //d3.select('p#value-time').text(d3.timeFormat('%Y')(val));
        d3.select('p#value-range').text(val.map( d3.timeFormat('%Y') ).join('-'));
        year_interval = val.map( d3.timeFormat('%Y') ).map( s => parseInt(s));
    });
    
    var gRange = d3
    .select('div#slider-range')
    .append('svg')
    .attr('width', 100)
    .attr('height', 400)
    .append('g')
    .attr('transform', 'translate(60,30)');
    
    gRange.call(sliderRange);
    
    d3.select('p#value-range').text(
        sliderRange
        .value()
        .map( d3.timeFormat('%Y') )
        .join('-')
        );
        
        
    }