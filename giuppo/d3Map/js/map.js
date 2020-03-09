function map(){

    const width = window.innerWidth;
    const height = window.innerHeight;

    const projection = d3.geoMercator()
      .translate([width / 2, height / 2])
      .scale((width - 1) / 2 / Math.PI);

    const path = d3.geoPath()
      .projection(projection);

    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on('zoom', zoomed);
    
    const svg = d3.select('body').append('svg')
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



        //   g.selectAll(".trade-line")
        // .data(merged)
        // .enter().append("path")
        // .attr('d', line)
        // .attr("x1",d => projectIfPossible(d,"x","supplier") )
        // .attr("y1",d => projectIfPossible(d,"y","supplier") )
        // .attr("x2",d => projectIfPossible(d,"x","recipient") )
        // .attr("y2",d => projectIfPossible(d,"y","recipient") )
        // .attr('stroke', 'red')
        // .attr("marker-end", "url(\#arrow)" )


        // svg.append("svg:defs")
        // .append("svg:marker")
        // .attr("id", "arrow")
        // .attr("viewBox", "0 0 10 10")
        // .attr("refX", 27)
        // .attr("refY", 5)
        // .attr("markerUnits", "strokeWidth")
        // .attr("markerWidth", 8)
        // .attr("markerHeight", 6)
        // .attr("orient", "auto")
        // .append("svg:path")
        // .attr("d", "M 0 0 L 10 5 L 0 10 z")


        links = [];
        for (let i = 0; i < merged.length; i++) {
            const transaction =merged[i]
            
        
            links.push({
                name: transaction.Supplier+"-"+transaction.Recipient,
                coo:[ projection([transaction.longS,transaction.latS]),
                projection([transaction.longR,transaction.latR])]
            });
        
        }
        console.log(merged.map(d => [d.latS,d.longS, projection(d.longS,d.latS) ] ) )
        console.log(links)
        // Standard enter / update 
        var points=[
            {long:0,lat:0},
            {long:500,lat:500}]

        var line_gen = d3.line()
            .x(function(d){return d.lat;})
            .y(function(d){return d.long;});

        var line_gen2 = d3.line()
        .x(function(d){return d[0];})
        .y(function(d){return d[1];});
        
        i=0
        links.forEach(l => {
            stateGroup.append("path")
            .attr("id","link"+i)
            .data([l.coo])
            .attr("class", "line")
            .text(d=>d.name)
            .attr("style","stroke:rgb(249, 250, 3);stroke-width:20")
            .attr("d", line_gen2 )

            stateGroup.append("text")
            .append("textPath") //append a textPath to the text element
             .attr("xlink:href", "#link"+i) //place the ID of the path here
             .style("text-anchor","middle") //place the text halfway on the arc
             .attr("style","color:red;font-size:300%;")
             .attr("startOffset", "50%")
             .text(l.name)
            console.log(l) 
            
            i++;
        });
        
        
        svg.append("g").append("path")
        .data([links]).enter()
       // .attr("class","trade-line")
       .attr("class", "line")
       .attr("style","stroke:rgb(255,0,0);stroke-width:20")
       .attr("d", line_gen2 )
       

        
    //         .style({ 
    //             fill: 'none',
    //         });

    //     //update
    //     pathArcs.attr({
    //             //d is the points attribute for this path, we'll draw
    //             //  an arc between the points using the arc function
    //             d: path
    //         })
    //         .style({
    //             stroke: '#0000ff',
    //             'stroke-width': '2px'
    //         })
    //         // Uncomment this line to remove the transition
    //         //.call(lineTransition); 

    //     //exit
    //     pathArcs.exit().remove();
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