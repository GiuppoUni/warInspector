function main() {
    var margin = { top:50, left: 50, right: 50, bottom: 50},
    height = 460 - margin.top - margin.bottom,
    width = 800 - margin.left - margin.right;
    
    var svg = d3.select("#map")
    .append("svg")
    .attr("height", height + margin.top + margin.bottom)
    .attr("width", width + margin.left + margin.right)
    .append("g")
    .attr("transform","translate("+margin.left+","+margin.top+")");
    
    
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
        svg.selectAll(".country")
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
            Draw icons with flag for suppliers and recipients
        */
        
        // svg.selectAll(".countries-icons")
        // .data(country_locations)
        // .enter().append("image")
        // .text(function(d)  { return d.name})
        // .attr("width",16)
        // .attr("height",16)
        // .attr("xlink:href",function(d){ return "../icons/flag-icons/png/"+d.name+".png";        })
        // .attr("x",function(d){
            
        //     var coords = projection([d.longitude,d.latitude])
        //     return coords[0];
        // })
        // .attr("y",function(d){
        //     var coords = projection([d.longitude,d.latitude])
        //     return coords[1];
        // })
        
        for (const trade in merged) {
            svg.select("trade-icon")
            .data(trade)
            .enter()
            .append("image")
            .text(function(d)  { return d[0] })
        }


        /*
        Draw lines from suppliers to recipients
        */
        //console.log(merged)
        // const curve = d3.line().curve(d3.curveNatural);
    
        svg.selectAll(".trade-line")
        .data(merged)
        .enter().append("line")
        .attr("x1",d => projectIfPossible(d,"x","supplier") )
        .attr("y1",d => projectIfPossible(d,"y","supplier") )
        .attr("x2",d => projectIfPossible(d,"x","recipient") )
        .attr("y2",d => projectIfPossible(d,"y","recipient") )
        .attr('id', 'arrow')
        .attr('refX', refX)
        .attr('refY', refY)
        .attr('markerWidth', markerBoxWidth)
        .attr('markerHeight', markerBoxHeight)
        .attr('orient', 'auto-start-reverse')
        .append('path')
        .attr('d', d3.line()(arrowPoints))
        .attr('stroke', 'black'); 
        
    }
    function projectIfPossible(d,axis,subject){
        
        console.log(d.latS)
        if (isNumeric(d.latS) && isNumeric(d.longS) && isNumeric(d.latR) && isNumeric(d.longR)){
            if(subject=="supplier"){
            if(axis=="x"){
                return projection([d.latS,d.longS])[0]}
            else{
                return projection([d.latS,d.longS])[1]}
            }
            else{
            if(axis=="x"){
                return projection([d.latR,d.longR])[0]}
            else{
                return projection([d.latR,d.longR])[1]}
            }
        }
        return projection([0,0])[0]
    }
    
}


// Helper
function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}


