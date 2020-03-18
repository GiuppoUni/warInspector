//Global vars
var mcm; 
var mm; 

function main() {
    var holdUpper=document.getElementsByClassName("hold_dropdowns_layout_cells")
    holdUpper[0].appendChild(document.getElementById("selection"));
    holdUpper[1].appendChild(document.getElementById("curr_data"));
    

    mcm = MapComponentsManager();
    mm = MapManager();
    mm.drawMap(mm.drawArches);
    
    mcm.drawSlider()
}

//---Helpers
/*
    Called on nation icon click
*/
function clickedNation(id){
    var but=document.getElementById(id)
    
    // d3.selectAll(".arches").remove()
    const str = but.src        
    mm.setCountry( str.substring(str.lastIndexOf("/") + 1, str.lastIndexOf(".")).replace("%20"," ") )
    if(document.getElementById("arches")!=null ){ 
        mm.drawArches()
    }
    else{

        d3.selectAll("#heatmap").remove()
        d3.selectAll("#legendThreshold").remove()
        d3.selectAll(".legendCells").remove()

        mm.drawHeatMap()
    }
    console.log("Clicked",str.substring(str.lastIndexOf("/") + 1, str.lastIndexOf(".")).replace("%20"," ") )  
}

/*
    Called on selection change
*/
function changeView(value){
    console.log("Changed selection")
    if(value=="Cloropeth view"){
        d3.selectAll("#arches").remove()
        mm.drawHeatMap()
    }
    else if(value=="Arrows view"){
        d3.selectAll(".heatmap").remove()
        d3.selectAll(".legendThreshold").remove()
        mm.drawArches()
    }
}

