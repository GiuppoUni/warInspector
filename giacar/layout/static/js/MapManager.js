


var MapManager = function (){
  
  
  const map_section=d3v4.select('#mapCont')
  .select('tr')
  .select('tr > td')

  const instr = "You can zoom in/out and move using the mouse."

  const width = map_section.node().getBoundingClientRect().width;
  const height = map_section.node().getBoundingClientRect().height;
  
  const projection = d3v4.geoMercator()
  .translate([width / 2, height / 2])
  .scale((width - 1) / 2 / Math.PI);
  
  const path = d3v4.geoPath()
  .projection(projection);
  
  const zoom = d3v4.zoom()
  .scaleExtent([1, 8])
  .on('zoom', zoomed);
  
  const svg = map_section
  .append('svg')
  .attr("id","map")
  .attr('width', width-5)
  .attr('height', height);
  	
  $( "#map" ).after( "<div id='mapInstr'><h6 class='instr'> You can zoom in/out and move using the mouse.    </h6></div>" );
  
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
  
  var line_gen = d3v4.line()
  .x(function(d){return d[0];})
  .y(function(d){return d[1];});
  
  //Default values
  var year_interval = [2016,2018]
  var country = "France"
  var g_country_locations;
  var transactions ;
  var linked;
  var circle;
  
 
  
  function zoomed() {
    g
    .selectAll('path') // To prevent stroke width from scaling
    .attr('transform', d3v4.event.transform);
    if(circle != undefined)
      circle.attr('transform', d3v4.event.transform);
    d3v4.selectAll("textPath").attr('transform', d3v4.event.transform)
    
  }
  
  
  
  
  /*  
  Draw cloropleth on map (SECOND VIEW)
  */
  var drawHeatMap = function(){
    // land.remove()
    // boundaries.remove()
    resetZoom()
    updateTexts()
      
    sphere
      .append('path')
      .datum({ type: 'Sphere' })
      .attr('class', 'sphere')
      .attr('d', path);
      
    
    d3v4.queue()
    .defer(d3v4.csv,"static/data/merged.csv")
    .defer(d3v4.json, "http://enjalot.github.io/wwsd/data/world/world-110m.geojson")
    .await(ready)
    
    function ready(error,transactions,topo){
      console.log(transactions)
      // Data and color scale
      var data = d3v4.map();
      
      
      var grouped = d3v4
      .nest()
      .key(function(d) { return d.codeR; })
      //.rollup(function(v) { return v.length; })
      .rollup(function(v) { return d3v4.sum(v, function(d) { return d["Delivered num."].replace(/\(|\)/g,""); }) })
      .entries(transactions.filter(d => d.Supplier==country).filter(d => 
        parseInt( d["Ordered year"].replace(/\(|\)/g,"") ) >= year_interval[0] 
        && parseInt( d["Ordered year"].replace(/\(|\)/g,"") ) <= year_interval[1] ));
        
        
        const max_from_grouped=Math.max.apply(Math, grouped.map(function(o) { return o.value; }))
        
        // .range(colorScheme);
        console.log("Max_from_grouped",max_from_grouped)
        max_from_grouped==-Infinity?1000:max_from_grouped
        var colorScale = d3v4.scaleThreshold()
        .domain([ 1,10,100,1000,10000,100000])
        .range( ["#c7e9c0", "#a1d99b", "#74c476", "#31a354", "#006d2c", "#002c09"] )
        
        
        for (let i = 0; i < grouped.length; i++) {
          const element = grouped[i];
          data.set(element.key,+element.value)
        }
        console.log(grouped)
        
        
        console.log(g_world)
        // Draw the map
        
        var hm=heatsGroup.append("g")
        .attr("class", "heatmap")
        .attr("id", "heatmap")
        .selectAll("path")
        .data(topo.features)
        .enter().append("path")
        .attr("fill", function (d){
          // Pull data for this country
          d.total = data.get(d.id) || 0;
          // Set the color
          return d.total==0?"#696969":colorScale(d.total);
        })
        .attr("d", path)
        .append("title")
        .text(d => `${d.properties.name}
        ${data.has(d.id) ? data.get(d.id) : "N/A"}`);
        
        
        
        // Legend
        var lgnd = heatsGroup.append("g")
        .attr("class", "legendThreshold")
        .attr("id","legendThreshold")
        .attr("transform", "translate(20,20)");
        
        lgnd.append("text")
        .attr('class', 'title')
            .attr('id', 'arrows-title')
            .attr("fill","white")
            .attr("stroke","black")
            .attr("stroke-width","0.5")
            .attr('x', width / 2 + 10)
            .attr('y', 10)
            .attr('text-anchor', 'middle')
        .text("N. of weapons "+ country+" delivered to nation during " + year_interval[0]+"-"+year_interval[1]);
        
        var labels = ['>=	 1', ">= 10",">= 100", ">= 1000",">= 10000",">= 100000"];
        var legend = d3v4.legendColor()
        .labels(function (d) { return labels[d.i]; })
        .shapePadding(4)
        .scale(colorScale);
        
        heatsGroup.select(".legendThreshold")
        .call(legend);
        
        
        
      }
    }
    
    
    function updateTexts(){
      document.getElementById("curr_country").innerText = "Supplier: " + country;
      document.getElementById("curr_years").innerText="Years:\n"+ year_interval[0]+"-"+ year_interval[1];
      document.getElementById("curr_flag").src="static/icons/flag-icons/png/"+country+".png";
      d3v4.select("#curr_flag").attr("width","70px")
    }
    
    var resetZoom = function(){
      svg.transition()
      .duration(100)
      .call(zoom.transform, d3v4.zoomIdentity);
    }
    
  var setYearInterval = function(yi){
    console.log("set interval to", yi)
    year_interval=yi
  }
  
  var setCountry = function (c){
    console.log("set country to", c)
    country=c
  }
  
  var getCountry = function(){
    return country
  }
  var getYearsInterval = function(){
    return year_interval
  }
  
    return{
      drawHeatMap:drawHeatMap,

      getYearsInterval:getYearsInterval,
      setYearInterval:setYearInterval,

      getCountry:getCountry,
      setCountry:setCountry,
      
      resetZoom:resetZoom,
      
    }
  }
