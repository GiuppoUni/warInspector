


var MapManager = function (){
  
  
  function drawMap(){
  
  const map_section=d3.select('#map')
  .select('tr')
  .select('tr > td')
  
  const width = map_section.node().getBoundingClientRect().width;
  const height = map_section.node().getBoundingClientRect().height;
  
  const projection = d3.geoMercator()
  .translate([width / 2, height / 2])
  .scale((width - 1) / 2 / Math.PI);
  
  const path = d3.geoPath()
  .projection(projection);
  
  const zoom = d3.zoom()
  .scaleExtent([1, 8])
  .on('zoom', zoomed);
  
  const svg = map_section
  .append('svg')
  .attr('width', width)
  .attr('height', height);
  
  svg.call(zoom);
  
  var g = svg.append('g');
  
  var stateGroup = g.append('g');
  
  
  d3.queue()
  .defer(d3.json,"data/world.json")
  .defer(d3.csv,"data/merged.csv")
  .defer(d3.csv,"data/countries.csv")
  .await(ready)
  
  function ready(error,world,merged,country_locations){
    
    /*
    <<<<    DEBUG ONLY
    */
    
    merged=merged.slice(0,20)
    country_locations=country_locations.slice(0,20)
    
    
    /*
    >>>>        DEBUG ONLY
    */
    
    
    stateGroup.append("g")
    .append('path')
    .datum({ type: 'Sphere' })
    .attr('class', 'sphere')
    .attr('d', path);
    
    stateGroup.append("g")
    .append('path')
    .datum(topojson.merge(world, world.objects.countries.geometries))
    .attr('class', 'land')
    .attr('d', path);
    
    stateGroup.append("g")
    .append('path')
    .datum(topojson.mesh(world, world.objects.countries, (a, b) => a !== b))
    .attr('class', 'boundary')
    .attr('d', path);
    
    
    
    
    links = [];
    for (let i = 0; i < merged.length; i++) {
      const transaction =merged[i]
      
      
      links.push({
        name: transaction.Supplier+"-"+transaction.Recipient,
        coo:[ projection([transaction.longS,transaction.latS]),
        projection([transaction.longR,transaction.latR])],
        yearOrd: parseInt(transaction["Ordered year"].replace(/\(|\)/g,"") ),
        yearDel: parseInt(transaction["Delivered year"].substring(transaction["Delivered year"].length-4, transaction["Delivered year"].length ) )
      });
      
    }
    //console.log(merged.map(d => [d.latS,d.longS, projection(d.longS,d.latS) ] ) )
    console.log(links)
    //console.log(merged)
    
    var line_gen = d3.line()
    .x(function(d){return d[0];})
    .y(function(d){return d[1];});
    
    var archsGroup=stateGroup.append("g")
    archsGroup.attr("id","archs")
    drawArchs()
    function drawArchs(year_interval){
      if (year_interval==undefined){
        year_interval=[1970,2018]}
      
      i=0
      links.forEach(l => {
        
        if ( year_interval[0] <= l.yearOrd 
            && l.yearOrd <= year_interval[1]){

          var lin=archsGroup.append("g").append("path")
          .attr("id","link"+i)
          .data([l.coo])
          .attr("class", "line")
          .text(d=>d.name)
          .attr("style","stroke:rgb(249, 250, 3);stroke-width:2")
          .attr("d", line_gen )
          .attr("marker-end","url(#arrow"+i+")")
          
          svg
          .append('marker')
          .attr('id','arrow'+i)
          .attr( 'viewBox','-0 -5 10 10')
          .attr( 'refX',7)
          .attr( 'refY',0)
          .attr( 'orient','auto')
          .attr( 'markerWidth',4)
          .attr( 'markerHeight',5)
          .attr( 'xoverflow','visible')
          .append('svg:path')
          .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
          .attr('fill', '#ef8b12')
          .style('stroke','none');
          
          g.append("text")
          .append("textPath") //append a textPath to the text element
          .attr("class", "archText")
          .attr("xlink:href", "#link"+i) //place the ID of the path here
          .style("text-anchor","middle") //place the text halfway on the arc
          .attr("style","color:red;font-size: 50%;")
          .attr("startOffset", "50%")
          .text(l.name)
        }
        // console.log(l) 
        
        i++;
      });
      
    }
    
  }
  
  
  
  
  
  function zoomed() {
    g
    .selectAll('path') // To prevent stroke width from scaling
    .attr('transform', d3.event.transform);
    
  }

}

return{
  drawMap:drawMap,
}
}
