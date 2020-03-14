//Global vars
var mcm; 
var mm; 

function main() {
    mcm = MapComponentsManager();
    mm = MapManager();
    
    mcm.drawSlider()
    mm.drawMap();
}

//Helpers
function clickedNation(id){
    var but=document.getElementById(id)
    
    d3.selectAll(".arches").remove()
    const str = but.src        
    mm.setCountry = str.substring(str.lastIndexOf("/") + 1, str.lastIndexOf("."))
    mm.drawArches()

console.log("Clicked",str.substring(str.lastIndexOf("/") + 1, str.lastIndexOf(".")) )  
}