//Global vars
var mcm; 
var mm; 
var cm;
var DEBUG = true;
var years = [2016,2020];
var country_selected = "France";

function main() {
    //Layout movements
    
   getDataFromPost();
    
    

    


    document.body.appendChild(document.getElementById("load-anim"))
    
    mcm = MapComponentsManager();
    mm = MapManager();
    cm = ChartManager();
    
    
    mm.drawCloroExp(); 
    mm.drawCloroImp();

    mcm.drawSlider()
    
    cm.drawChart();

}

//---Helpers
/*
Called on nation icon click
*/
function clickedNation(id){
    var but=document.getElementById(id)
    
    // d3v4.selectAll(".arches").remove()
    const str = but.src        
    const cur_name_country=str.substring(str.lastIndexOf("/") + 1, str.lastIndexOf(".")).replace("%20"," ")
    mm.setCountry( cur_name_country  )
    
        
    d3v4.selectAll("#heatmap").remove()
    d3v4.selectAll("#legendThreshold").remove()
    d3v4.selectAll(".legendCells").remove()
    
    mm.drawCloroExp()
    mm.drawCloroImp()
    
    cm.updateCountry(cur_name_country)
    // getDataFromPost();
    console.log("Clicked",str.substring(str.lastIndexOf("/") + 1, str.lastIndexOf(".")).replace("%20"," ") )  
}





function getDataFromPost(){
    url="/get-data"
    // url+="?country="+country_selected
    // url+="&year1="+years[0]+"&year2="+years[1]
    const obj = {
        "country"  :  country_selected ,
        "year1"   :  years[0] ,
        "year2"      :  years[1]
    }
    const data = JSON.stringify(obj);
    
    $("div[id*='fig']").remove();            
    $("#load-anim").fadeIn()
    d3v4.json( url )
    .post(data, function(error, root) {
        
        if(error!=null){
            console.log("Error: ",error)
        }
        else if (root!=null){
            //console.log("Data: ",root)
                        
            script_str = root[3]
            //.substring(root[3].indexOf("<div id"),root[3].length ) 
            .replace("<style>","")
            .replace("</style>","")
            
            //console.log(script_str)
            
            $("#load-anim").fadeOut()
            
            $('body').append(script_str);
            // document.getElementById("mdsSpace").insertAdjacentHTML( 'beforeend', root[3]);
            
            $("div[id*='fig']").prop("class","mds-fig");            
            
            
        }
    });
}

// function postSubmitted(){
//     alert("Post successfull")
// }
