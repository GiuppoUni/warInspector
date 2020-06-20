
// const map_components_section=d3v4.select('#map')
// .select('tr')
// .select('tr > td')

var MapComponentsManager= function(){

    var sliderTimer;
    var drawSlider=function (){
        var div = document.getElementById("map_slider");                       // Create a <p> node
        var map_component_section = document.body
        map_component_section.appendChild(div);                                          // Append the text to <p>
        
        // var countries_slider = document.getElementById("country_slider");
        // map_component_section.appendChild(countries_slider);                                          // Append the text to <p>
        
        
        /* 
        Range
        */
        
        var dataTime = d3v4.range(0, 30).map(function(d) {
            return new Date(1989 + d, 1, 1);
        });
        
        
        var sliderRange = d3v4
        //.sliderLeft() // Vertical slider
        .sliderBottom() // Orizontal slider
        .min(d3v4.min(dataTime))
        .max(d3v4.max(dataTime))
        .step(1000 * 60 * 60 * 24 * 365)
        .height(350)
        .width(1000) //if orizontal
        .tickFormat(d3v4.timeFormat('%Y'))
        .tickValues(dataTime)
        .default([new Date(2016, 1, 1),new Date(2018, 1, 1)])
        .fill('#FFD300')
        .on('onchange', val => {
            //d3v4.select('p#value-time').text(d3v4.timeFormat('%Y')(val));
            
           
            var year_interval = val.map( d3v4.timeFormat('%Y') ).map( s => parseInt(s));
            mm.setYearInterval(year_interval)
            if(sliderTimer!=undefined)
                clearTimeout(sliderTimer)
            sliderTimer = setTimeout(function(){ 
                update()
                cm.updateYearsInterval(year_interval)
                getDataFromPost() 
            }, 250);
            
            
        });
        
        
        
        var gRange = d3v4
        .select('div#slider-range')
        .append('svg')
        .attr('width', 1500)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(60,30)');
        
        gRange.call(sliderRange);
        
      
            
            
            
        }
        /*
            Called on years slider change
        */
        function update() {
            // d3v4.selectAll(".arches").remove()
            
            d3v4.selectAll(".heatmap").remove()
            d3v4.selectAll(".legendThreshold").remove()
            d3v4.selectAll(".legendCells").remove()
            mm.drawCloroExp()
            mm.drawCloroImp()
            
        }
        
        
        
        return {
            drawSlider:drawSlider,
            
            
        };
        
    }