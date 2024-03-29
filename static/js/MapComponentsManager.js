// const map_components_section=d3v4.select('#map')
// .select('tr')
// .select('tr > td')

var MapComponentsManager = function() {

    var sliderTimer;
    var margin_top = 25
    var margin_left = 360;
    var drawSlider = function() {

            // var countries_slider = document.getElementById("country_slider");
            // map_component_section.appendChild(countries_slider);                                          // Append the text to <p>


            /* 
            Range
            */

            var dataTime = d3v4.range(0, 30).map(function(d) {
                return new Date(1990 + d, 1, 1);
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
                .default([new Date(2016, 1, 1), new Date(2018, 1, 1)])
                .fill('#FFD300')
                .on('onchange', val => {
                    //d3v4.select('p#value-time').text(d3v4.timeFormat('%Y')(val));


                    var year_interval = val.map(d3v4.timeFormat('%Y')).map(s => parseInt(s));
                    mm.setYearInterval(year_interval)
                    if (sliderTimer != undefined)
                        clearTimeout(sliderTimer)
                    sliderTimer = setTimeout(function() {
                        // cm.updateYearsInterval(year_interval)
                        updateOnSliderChange()

                    }, 250);


                });



            var gRange = d3v4
                .select('div#slider-range')
                .append('svg')
                .attr("id", "svg-slider")
                .attr('width', 1500)
                .attr('height', 80)
                .append('g')
                .attr("id", "g-slider")
                .attr('transform', 'translate(' + margin_left + "," + margin_top + ')');

            gRange.call(sliderRange);





        }
        /*
            Called on years slider change
        */
    function updateOnSliderChange() {
        // d3v4.selectAll(".arches").remove()

        // d3v4.selectAll(".heatmap").remove()
        // d3v4.selectAll(".legendThreshold").remove()
        // d3v4.selectAll(".legendCells").remove()
        // mm.drawCloroExp()
        mm.sliderTransition()
            // mm.drawCloroImp()

        getDataFromPost(true)
        callUpdateGeneralInfo()
            // dbcm.drawChart()

        // $("#weapons-svg").remove();
        // wbcm.drawChart();
    }





    return {
        drawSlider: drawSlider,
        updateOnSliderChange: updateOnSliderChange,


    };

}