


var MapManager = function (){


  //Default values
  var year_interval = [2016,2018]
  var country = "France"
  var circle;
  
  const map_section=d3v4.select('#mapCont')
  const instr = "You can zoom in/out and move using the mouse."

  const width = 1080;
  const height = 360;
  
  const projection = d3v4.geoMercator()
  .translate([width / 2, height / 2])
  .scale((width - 1) / 2 / Math.PI);
  
  const path = d3v4.geoPath()
  .projection(projection);
  
  const zoom = d3v4.zoom()
  .scaleExtent([1, 8])
  .on('zoom', zoomed);
  
  //EXPORT map
  const svg = map_section
  .append('svg')
  .attr("id","map")
  .attr('width', width-5)
  .attr('height', height);
  	
  $( "#map" ).after( "<div id='mapInstr'><h6 class='instr'> You can zoom in/out and move using the mouse.    </h6></div>" );
  
  svg.call(zoom);

  var g = svg.append('g');
  var stateGroup = g.append('g');
  var sphere=stateGroup.append("g")

  var heatsGroup= stateGroup.append("g")

  // IMPORT map
  const svg2 = map_section
  .append('svg')
  .attr("id","map2")
  .attr('width', width-5 + 360)
  .attr('height', height);
  	
  $( "#map2" ).after( "<div id='mapInstr'><h6 class='instr'> You can zoom in/out and move using the mouse.    </h6></div>" );
  

  svg2.call(zoom);


  var g_imp = svg2.append('g');
  var stateGroup_imp = g_imp.append('g');
  var sphere_imp =stateGroup_imp.append("g")
  var heatsGroup_imp= stateGroup_imp.append("g")



  
 
  
  function zoomed() {
    g
    .selectAll('path') // To prevent stroke width from scaling
    .attr('transform', d3v4.event.transform);
    g_imp
    .selectAll('path') // To prevent stroke width from scaling
    .attr('transform', d3v4.event.transform);
    if(circle != undefined)
      circle.attr('transform', d3v4.event.transform);
    d3v4.selectAll("textPath").attr('transform', d3v4.event.transform)
    
  }
  
  
  
  
  /*  
  Draw cloropleth on map  EXPORT
  */
  var drawCloroExp = function(){
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
        .text("Weapon units "+ country+" EXPORTED to nation during " + year_interval[0]+"-"+year_interval[1]);
        
        var labels = ['>=	 1', ">= 10",">= 100", ">= 1000",">= 10000",">= 100000"];
        var legend = d3v4.legendColor()
        .labels(function (d) { return labels[d.i]; })
        .shapePadding(4)
        .scale(colorScale);
        
        heatsGroup.select(".legendThreshold")
        .call(legend);
        
        
        
      }
    }
    

    // DRAW IMPORT 
    var drawCloroImp = function(){
    // land.remove()
    // boundaries.remove()
    resetZoom()
    updateTexts()
      
    sphere_imp
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
      .key(function(d) { return d.codeS; })
      //.rollup(function(v) { return v.length; })
      .rollup(function(v) { return d3v4.sum(v, function(d) { return d["Delivered num."].replace(/\(|\)/g,""); }) })
      .entries(transactions.filter(d => d.Recipient==country).filter(d => 
        parseInt( d["Ordered year"].replace(/\(|\)/g,"") ) >= year_interval[0] 
        && parseInt( d["Ordered year"].replace(/\(|\)/g,"") ) <= year_interval[1] ));
        
        
        const max_from_grouped=Math.max.apply(Math, grouped.map(function(o) { return o.value; }))
        
        // .range(colorScheme);
        console.log("Max_from_grouped",max_from_grouped)
        max_from_grouped==-Infinity?1000:max_from_grouped
        var colorScale = d3v4.scaleThreshold()
        .domain([ 1,10,100,1000,10000,100000])
        .range( ["#ffbaba"	,"#ff7b7b"	,"#ff5252"	,"#ff0000"	,"#a70000"	])
        
        
        for (let i = 0; i < grouped.length; i++) {
          const element = grouped[i];
          data.set(element.key,+element.value)
        }
        console.log(grouped)
        
        
        
        var hm=heatsGroup_imp.append("g")
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
        var lgnd = heatsGroup_imp.append("g")
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
        .text("Weapon units "+ country+" IMPORTED to nation during " + year_interval[0]+"-"+year_interval[1]);
        
        var labels = ['>=	 1', ">= 10",">= 100", ">= 1000",">= 10000",">= 100000"];
        var legend = d3v4.legendColor()
        .labels(function (d) { return labels[d.i]; })
        .shapePadding(4)
        .scale(colorScale);
        
        heatsGroup_imp.select(".legendThreshold")
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

      svg2.transition()
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
      drawCloroExp:drawCloroExp,
      drawCloroImp:drawCloroImp,
      getYearsInterval:getYearsInterval,
      setYearInterval:setYearInterval,

      getCountry:getCountry,
      setCountry:setCountry,
      
      resetZoom:resetZoom,
      
    }
  }
