
// const map_components_section=d3.select('#map')
// .select('tr')
// .select('tr > td')

var MapComponentsManager= function(){

    var sliderTimer;
    var drawSlider=function (){
        var div = document.getElementById("map_slider");                       // Create a <p> node
        var map_component_section = document.getElementById("map")
        .childNodes[0].childNodes[1];
        map_component_section.appendChild(div);                                          // Append the text to <p>
        
        // var countries_slider = document.getElementById("country_slider");
        // map_component_section.appendChild(countries_slider);                                          // Append the text to <p>
        
        
        /* 
        Range
        */
        
        var dataTime = d3.range(0, 49).map(function(d) {
            return new Date(1970 + d, 1, 1);
        });
        
        
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
            var year_interval = val.map( d3.timeFormat('%Y') ).map( s => parseInt(s));
            mm.setYearInterval(year_interval)
            if(sliderTimer!=undefined)
                clearTimeout(sliderTimer)
            sliderTimer = setTimeout(function(){ update() }, 250);
            
            
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
            
            
            /* 
            Step
            */
            
            // data = ["Gino","Er","Grilli"]
            // var sliderStep = d3
            // .sliderLeft()
            // .min(data[0])
            // .max(data[data.length-1])
            // .width(300)
            // .tickFormat(d3.format('.2%'))
            // .ticks(5)
            // .step(0.005)
            // .default(0.015)
            // .on('onchange', val => {
            //     d3.select('p#value-step').text(val);
            // });
            
            // var gStep = d3
            // .select('div#slider-step')
            // .append('svg')
            // .attr('width', 100)
            // .attr('height', 400)
            // .append('g')
            // .attr('transform', 'translate(60,30)');
            
            // gStep.call(sliderStep);
            
            // d3.select('p#value-step').text( (sliderStep.value()) );
            
            
            
            
        }
        /*
            Called on years slider change
        */
        function update() {
            // d3.selectAll(".arches").remove()
            if(document.getElementById("arches")!=null ){ 
                d3.selectAll("#arches").remove()
                mm.drawArches()
            }
            else{
                d3.selectAll(".arches").remove()
                d3.selectAll(".heatmap").remove()
                
                mm.drawHeatMap()
            }
        }
        
        
        
        return {
            drawSlider:drawSlider,
            
            
        };
        
    }