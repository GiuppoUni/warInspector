function main() {
    var margin = { top:50, left: 50, right: 50, bottom: 50},
    height = 460 - margin.top - margin.bottom,
    width = 800 - margin.left - margin.right;
    

    const zoom = d3.zoom()
    .scaleExtent([1, 8])
    .on('zoom', zoomed);


    var svg = d3.select("#map")
    .append("svg")
    .attr("height", height + margin.top + margin.bottom)
    .attr("width", width + margin.left + margin.right)
    .append("g")
    .attr("transform","translate("+margin.left+","+margin.top+")");
    
    svg.call(zoom);
    const g= svg.append("g")    
    /*
    Read geojson kind file
    */            
    d3.queue()
    .defer(d3.json,"data/world.topojson")
    .defer(d3.csv,"data/merged.csv")
    .defer(d3.csv,"data/countries.csv")
    .await(ready)
    
    //We need to do a projection from round globe to screen flat map
    var projection = d3.geoMercator()
    .translate([ width/2 , height/2 ])
    .scale(100) //the bigger the closer
    
    var path = d3.geoPath()
    .projection(projection) //create a path using the projection
    
    function ready(error,data,merged,country_locations){
        //console.log(data)
        //console.log(countries)
        
        // Extract countries from 
        
        var countries = topojson.feature(data, data.objects.countries ).features
        
        /*
        Draw all countries on map
        */
        g.selectAll(".country")
        .data(countries)
        .enter().append("path")
        .attr("class","country")
        .attr("d",path) //d = list of coordinates to draw a shape
        .on('click',function(d){
            c=d3.select(this)
            if(!c.classed("selected"))
            //Add the class selected 
            c.classed("selected", true)
            else{
                //Remove the class selected
                c.classed("selected", false)
            }
            
        })
        
        /*
        <<<<    DEBUG ONLY
        */
        
        merged=merged.slice(0,20)
        country_locations=country_locations.slice(0,20)
        
        involved=[]
        
        /*
        >>>>        DEBUG ONLY
        */
        
        
        
        /*
        Save only the involved countries
        */
        for (const entry in merged) {
            if( !Math.trunc(entry.latS)  in involved && !Math.trunc(entry.longS) in involved )
            involved.append([Math.trunc(entry.latS),Math.trunc(entry.longS)])
            
            if( !Math.trunc(entry.latR)  in involved && !Math.trunc(entry.longR) in involved )
            involved.append([Math.trunc(entry.latR),Math.trunc(entry.longR)])
            
        }
        /*
        Draw icons with flag for suppliers and recipients
        */
        
        g.selectAll(".countries-icons")
        .data(country_locations)
        //.filter( d => { console.log(d);return [Math.trunc(d.latitude),Math.trunc(d.longitude)] in involved  } )
        .enter().append("image")
        //.text(function(d)  { return d.name})
        .attr("width",16)
        .attr("height",16)
        .attr("xlink:href",function(d){ return "../icons/flag-icons/png/"+d.name+".png";        })
        .attr("x",function(d){
            
            var coords = projection([d.longitude,d.latitude])
            return coords[0];
        })
        .attr("y",function(d){
            var coords = projection([d.longitude,d.latitude])
            return coords[1];
        })
        
        
        
        /*
        Draw lines from suppliers to recipients
        */
        //console.log(merged)
        // const curve = d3.line().curve(d3.curveNatural);
        
        g.selectAll(".trade-line")
        .data(merged)
        .enter().append("line")
        .attr("x1",d => projectIfPossible(d,"x","supplier") )
        .attr("y1",d => projectIfPossible(d,"y","supplier") )
        .attr("x2",d => projectIfPossible(d,"x","recipient") )
        .attr("y2",d => projectIfPossible(d,"y","recipient") )
        .attr('stroke', 'red')
        .attr("marker-end", "url(\#arrow)" )
        
        svg.append("svg:defs")
        .append("svg:marker")
        .attr("id", "arrow")
        .attr("viewBox", "0 0 10 10")
        .attr("refX", 27)
        .attr("refY", 5)
        .attr("markerUnits", "strokeWidth")
        .attr("markerWidth", 8)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("svg:path")
        .attr("d", "M 0 0 L 10 5 L 0 10 z")
        
    }
    function projectIfPossible(d,axis,subject){
        //if(!isNumeric(d.latS) || !isNumeric(d.longS) || !isNumeric(d.latR) || !isNumeric(d.longR) )
        ret=0
        if(subject=="supplier"){
            if(axis=="x"){
                ret = projection([parseFloat(d.latS),parseFloat(d.longS)])[0]
            }
            else{
                ret = projection([parseFloat(d.latS),parseFloat(d.longS)])[1]
            }
        }
        else if (subject=="recipient"){
            if(axis=="x"){
                ret = projection([parseFloat(d.latR),parseFloat(d.longR)])[0]
            }
            else{
                ret = projection([parseFloat(d.latR),parseFloat(d.longR)])[1]
            }
        }
        ret=Math.trunc(ret)
        if(isNaN(ret)){
            console.log( "NAN!:",d.latS,d.longS,d.latR,d.longR )    
            ret=0
        }
        return ret
        
    }
 
    function zoomed() {
        g
          .selectAll('path') // To prevent stroke width from scaling
          .attr('transform', d3.event.transform);
      }

}



// Helper
function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}


