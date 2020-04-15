//Global vars
var mcm; 
var mm; 
var cm;
var DEBUG = true;

function main() {
    //Layout movements
    var holdUpper=document.getElementsByClassName("hold_dropdowns_layout_cells")
    var holdTop=document.getElementsByClassName("top_banner_layout_rows")[0].children[1]
    
    
    holdUpper[0].appendChild(document.getElementById("selection"));
    holdUpper[1].appendChild(document.getElementById("curr_data"));
    holdUpper[2].appendChild(document.getElementById("sipriImage"));

    holdTop.appendChild(document.getElementById("description"))
    

    var csec=d3.select("#chart-section").select('tr')
    .select('tr > td').node()
  
    csec.appendChild(document.getElementById("charts-div") )
    $('#title').html("Hello World");

    mcm = MapComponentsManager();
    mm = MapManager();
    cm = ChartManager();
    
    mm.drawMap(mm.drawArches);
    
    mcm.drawSlider()

    cm.drawChart();
}

//---Helpers
/*
    Called on nation icon click
*/
function clickedNation(id){
    var but=document.getElementById(id)
    
    // d3.selectAll(".arches").remove()
    const str = but.src        
    const cur_name_country=str.substring(str.lastIndexOf("/") + 1, str.lastIndexOf(".")).replace("%20"," ")
    mm.setCountry( cur_name_country  )
    if(document.getElementById("arches")!=null ){ 
        mm.drawArches()
    }
    else{

        d3.selectAll("#heatmap").remove()
        d3.selectAll("#legendThreshold").remove()
        d3.selectAll(".legendCells").remove()

        mm.drawHeatMap()
    }
    cm.updateCountry(cur_name_country)
    console.log("Clicked",str.substring(str.lastIndexOf("/") + 1, str.lastIndexOf(".")).replace("%20"," ") )  
}

/*
    Called on selection change
*/
function changeView(value){
    console.log("Changed selection")
    if(value=="Cloropleth view"){
        d3.selectAll("#arches").remove()
        mm.drawHeatMap()
    }
    else if(value=="Arrows view"){
        d3.selectAll(".heatmap").remove()
        d3.selectAll(".legendThreshold").remove()
        mm.drawArches()
    }
}

