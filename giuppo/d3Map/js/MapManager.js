


var MapManager = function (){
  
  
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
  var g_world;
  var stateGroup = g.append('g');
  var sphere=stateGroup.append("g")
  var land=stateGroup.append("g")
  var boundaries=stateGroup.append("g")
  
  var archesGroup= stateGroup.append("g")
  var heatsGroup= stateGroup.append("g")
  var palette = ['#009933','#669900','#99cc00','#cccc00','#c7dc09','#edf933','#ffcc00', '#ff9933', '#ff6600','#ff5050'];
  
  var line_gen = d3.line()
  .x(function(d){return d[0];})
  .y(function(d){return d[1];});
  
  //Default values
  var year_interval = [1970,2018]
  var country = "France"
  
  var transactions ;
  var linked;
  
  /*
  Load data and draw world map
  */
  var drawMap = function (callback){
    
    
    
    d3.queue()
    .defer(d3.json,"data/world.json")
    //.defer(d3.csv,"data/merged.csv")
    .defer(d3.csv,"data/countries.csv")
    .await(ready)
    
    function ready(error,world,country_locations){
      
      
      g_world=world;
      
      sphere
      .append('path')
      .datum({ type: 'Sphere' })
      .attr('class', 'sphere')
      .attr('d', path);
      
      land
      .append('path')
      .datum(topojson.merge(world, world.objects.countries.geometries))
      .attr('class', 'land')
      .attr('d', path);
      
      boundaries
      .append('path')
      .datum(topojson.mesh(world, world.objects.countries, (a, b) => a !== b))
      .attr('class', 'boundary')
      .attr('d', path);
      
      
      if (typeof callback == "function") 
      callback(); 
      
    }
    
    
    
    
    
  }
  
  function zoomed() {
    g
    .selectAll('path') // To prevent stroke width from scaling
    .attr('transform', d3.event.transform);
    
  }
  
  
  
  var  drawArches = function(){
    
    updateTexts()

    //To reset:
    d3.selectAll("#arches").remove()
    linked=[]
    
    var localGroup = archesGroup.append("g").attr("id","arches")
    console.log("Country ",country, "Interval ",year_interval)
    
    d3.queue()
    .defer(d3.csv,"data/merged.csv")
    .await(ready)
    
    function ready(error,transactions){
      /*
      <<<<    DEBUG ONLY
      */
      
      // console.log("DEBUGGING")
      // transactions=transactions.slice(0,20)
      // country_locations=country_locations.slice(0,20)
      
      
      /*
      >>>>        DEBUG ONLY
      */
      
      //Reset zoom
      resetZoom()
      
      
      for (let i = 0; i < transactions.length; i++) {
        
        const transaction = transactions[i];
        
        var name = transaction.Supplier+"-"+transaction.Recipient 
        
        if(linked.includes(name)){
          continue
        }
        var coo = [ projection([transaction.longS,transaction.latS]),
        projection([transaction.longR,transaction.latR])]
        var yearOrd = parseInt(transaction["Ordered year"].replace(/\(|\)/g,"") )
        var yearDel = parseInt(transaction["Delivered year"].substring(transaction["Delivered year"].length-4, transaction["Delivered year"].length ) )
        
        // console.log(yearOrd,yearDel,year_interval[0] <= yearOrd , yearDel <= year_interval[1] , name.split("-")[0] == country)
        
        if ( (year_interval[0] <= yearOrd || yearOrd==NaN ) 
        && (yearDel <= year_interval[1] || yearDel == NaN)
        && name.split("-")[0] == country ){
          var lin=localGroup.append("path")
          .attr("id","link"+i)
          .data([coo])
          .attr("class", "line")
          //.text(d=>d.name)
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
          
          localGroup.append("text")
          .append("textPath") //append a textPath to the text element
          .attr("class", "archText")
          .attr("xlink:href", "#link"+i) //place the ID of the path here
          .style("text-anchor","middle") //place the text halfway on the arc
          .attr("style","font-size: 50%;")
          .attr("startOffset", "50%")
          .text(name)
          
          linked.push(name) 
          
        }
        
      }
      
    }
  }
  
  
  var setYearInterval = function(yi){
    console.log("set interval to", yi)
    year_interval=yi
  }
  
  var setCountry = function (c){
    console.log("set country to", c)
    country=c
  }
  
  
  /*  
  Draw cloropeth on map (SECOND VIEW)
  */
  var drawHeatMap = function(){
    // land.remove()
    // boundaries.remove()
    resetZoom()
    updateTexts()

    d3.queue()
    .defer(d3.csv,"data/merged.csv")
    .await(ready)
    
    function ready(error,transactions){
      console.log(transactions)
      // Data and color scale
      var data = d3.map();
      var colorScheme = d3.schemeReds[6];
      colorScheme.unshift("#eee")
      var colorScale = d3.scaleThreshold()
      .domain([1, 6, 11, 26, 101, 1001])
      .range(colorScheme);
      
      var grouped = d3
      .nest()
      .key(function(d) { return d.codeR; })
      .rollup(function(v) { return v.length; })
      .entries(transactions.filter(d => d.Supplier==country).filter(d => 
        parseInt( d["Ordered year"].replace(/\(|\)/g,"") ) >= year_interval[0] 
        && parseInt( d["Ordered year"].replace(/\(|\)/g,"") ) <= year_interval[1] ));
      

      for (let i = 0; i < grouped.length; i++) {
        const element = grouped[i];
        data.set(element.key,+element.value)
      }
      console.log(grouped)
      
      // Load external data and boot
      d3.queue()
      .defer(d3.json, "http://enjalot.github.io/wwsd/data/world/world-110m.geojson")
      //.defer(d3.json, "data/world.topojson")
      //.defer(d3.csv, "data/mooc-countries.csv", function(d) { data.set(d.code, +d.total); })
      .await(ready2);
      
      function ready2(error,topo) {
        if (error) throw error;
        console.log(g_world)
        // Draw the map
        
        heatsGroup.append("g")
        .attr("class", "heatmap")
        .attr("id", "heatmap")
        .selectAll("path")
        .data(topo.features)
        .enter().append("path")
        .attr("fill", function (d){
          // Pull data for this country
          d.total = data.get(d.id) || 0;
          // Set the color
          return colorScale(d.total);
        })
        .attr("d", path)
        .append("title")
        .text(d => `${d.properties.name}
        ${data.has(d.id) ? data.get(d.id) : "N/A"}`);
        
        
        
        // Legend
        var g = heatsGroup.append("g")
        .attr("class", "legendThreshold")
        .attr("id","legendThreshold")
        .attr("transform", "translate(20,20)");
        g.append("text")
        .attr("class", "caption")
        .attr("x", 0)
        .attr("y", -6)
        .text("N. of weapons exchanged");
        var labels = ['0', '1-5', '6-10', '11-25', '26-100', '101-1000', '> 1000'];
        var legend = d3.legendColor()
        .labels(function (d) { return labels[d.i]; })
        .shapePadding(4)
        .scale(colorScale);
        heatsGroup.select(".legendThreshold")
        .call(legend);
        
      }
      
    }
  }
  

  function updateTexts(){
    document.getElementById("curr_country").innerText = country;
    document.getElementById("curr_years").innerText=year_interval[0]+"-"+ year_interval[1];
    
  }
  
  var resetZoom = function(){
    svg.transition()
    .duration(100)
    .call(zoom.transform, d3.zoomIdentity);
  }
  
  return{
    drawMap:drawMap,
    drawArches:drawArches,
    drawHeatMap:drawHeatMap,
    setYearInterval:setYearInterval,
    setCountry:setCountry,
    resetZoom:resetZoom,
  }
}
