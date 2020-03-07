function main() {
    var margin = { top:50, left: 50, right: 50, bottom: 50},
    height = 400 - margin.top - margin.bottom,
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
    .defer(d3.csv,"data/capitals.csv")
    .defer(d3.csv,"data/table_2010-2018.csv")
    .await(ready)
    
    //We need to do a projection from round globe to screen flat map
    var projection = d3.geoMercator()
    .translate([ width/2 , height/2 ])
    .scale(100) //the bigger the closer

    var path = d3.geoPath()
        .projection(projection) //create a path using the projection
        
    function ready(error,data,capitals,table){
        console.log(data)
        console.log(capitals)

        // Extract countries from 
        
        var countries = topojson.feature(data, data.objects.countries ).features
        
        console.log(countries)
        console.log(table)
        
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
                console.log(false)
            }
            
        })
    }
    
}