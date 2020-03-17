//Global vars
var mcm; 
var mm; 

function main() {
    document.getElementsByClassName("hold_dropdowns_layout_cells")[0]
        .appendChild(document.getElementById("selection"));
    mcm = MapComponentsManager();
    mm = MapManager();
    
    mcm.drawSlider()
    mm.drawMap(mm.drawArches);
}

//Helpers
function clickedNation(id){
    var but=document.getElementById(id)
    
    // d3.selectAll(".arches").remove()
    const str = but.src        
    mm.setCountry( str.substring(str.lastIndexOf("/") + 1, str.lastIndexOf(".")).replace("%20"," ") )
    mm.drawArches()
    
    console.log("Clicked",str.substring(str.lastIndexOf("/") + 1, str.lastIndexOf(".")).replace("%20"," ") )  
}

function changeView(value){
    console.log("Changed selection")
    if(value=="Circles view"){
        d3.select("svg").remove()
        mm = MapManager();
        mm.drawMap(mm.drawCircles())
    }
    else if(value=="Arrows view"){
        mm = MapManager();
        mm.drawMap(mm.drawArches)
    }
}