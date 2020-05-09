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
    var holdUpper=document.getElementsByClassName("hold_dropdowns_layout_cells")
    var holdTop=document.getElementsByClassName("top_banner_layout_rows")[0].children[1]
    
    holdUpper[0].appendChild(document.getElementById("selection"));
    holdUpper[1].appendChild(document.getElementById("curr_data"));
    holdUpper[2].appendChild(document.getElementById("sipriImage"));
    
    holdTop.appendChild(document.getElementById("description"))
    
    
    var csec=d3v4.select("#chart-section").select('tr')
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
    
    // d3v4.selectAll(".arches").remove()
    const str = but.src        
    const cur_name_country=str.substring(str.lastIndexOf("/") + 1, str.lastIndexOf(".")).replace("%20"," ")
    mm.setCountry( cur_name_country  )
    if(document.getElementById("arches")!=null ){ 
        mm.drawArches()
    }
    else{
        
        d3v4.selectAll("#heatmap").remove()
        d3v4.selectAll("#legendThreshold").remove()
        d3v4.selectAll(".legendCells").remove()
        
        mm.drawHeatMap()
    }
    cm.updateCountry(cur_name_country)
    getDataFromPost();
    console.log("Clicked",str.substring(str.lastIndexOf("/") + 1, str.lastIndexOf(".")).replace("%20"," ") )  
}

/*
Called on selection change
*/
function changeView(value){
    console.log("Changed selection")
    if(value=="Cloropleth view"){
        d3v4.selectAll("#arches").remove()
        mm.drawHeatMap()
    }
    else if(value=="Arrows view"){
        d3v4.selectAll(".heatmap").remove()
        d3v4.selectAll(".legendThreshold").remove()
        mm.drawArches()
    }
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
    
    d3v4.json( url )
    .post(data, function(error, root) {
        //if (error) throw error;
        
        //   partition.nodes(root);
        //   x.domain([0, root.value]).nice();
        //down(root, 0);
        if(error!=null){
            console.log("Error: ",error)
        }
        else if (root!=null){
            console.log("Data: ",root)
            // if(root[0]!=null)
            // country_selected=root[0]
            // if(root[1]!=null)
            // years[0]=parseInt( root[1] )
            // if(root[2]!=null)
            // years[1]=parseInt( root[2] )
            
            // console.log(root[3])
            
            script_str = root[3]
            .substring(root[3].indexOf("<div id"),root[3].length ) 
            
           // console.log(script_str)
            
            $("div[id*='fig']").remove();            
            
            $('body').append(script_str);
            // document.getElementById("mdsSpace").insertAdjacentHTML( 'beforeend', root[3]);
            
            
            
        }
    });
}
function postSubmitted(){
    alert("Post successfull")
}
