//Global vars
var mcm;
var mm;
var cm;
var rm;
var DEBUG = true;
var years = [2016, 2019];
var country_selected = "Italy";
var selected_group = ["ITA"]
var synchro_mode = true

function main() {
    $(function() {
        $('select').selectpicker();
    });
    //Layout movements

    getDataFromPost();


    mcm = MapComponentsManager();
    mm = MapManager();
    cm = ChartManager();
    rm = RankRaceManager();

    mm.drawCloroExp();
    mm.drawCloroImp();

    mcm.drawSlider()

    cm.drawChart();


}

//---Helpers
/*
Called on nation icon click
*/
function clickedNation(id) {
    var but = document.getElementById(id)

    // d3v4.selectAll(".arches").remove()
    const str = but.src
    const cur_name_country = str.substring(str.lastIndexOf("/") + 1, str.lastIndexOf(".")).replace("%20", " ")
        //mm.setCountry( cur_name_country  )


    d3v4.selectAll(".heatmap").remove()
    d3v4.selectAll(".legendThreshold").remove()
    d3v4.selectAll(".legendCells").remove()

    mm.drawCloroExp()
    mm.drawCloroImp()

    cm.updateCountry(cur_name_country)
    country_selected = cur_name_country
    getDataFromPost();
    console.log("Clicked", str.substring(str.lastIndexOf("/") + 1, str.lastIndexOf(".")).replace("%20", " "))
}





function getDataFromPost() {
    url = "/get-data"
        // url+="?country="+country_selected
        // url+="&year1="+years[0]+"&year2="+years[1]
    const obj = {
        "country": country_selected,
        "year1": years[0],
        "year2": years[1]
    }
    const data = JSON.stringify(obj);

    $("div[id*='fig']").remove();
    $(".lds-facebook").fadeIn()
    d3v4.json(url)
        .post(data, function(error, root) {

            if (error != null) {
                console.log("Error: ", error)
            } else if (root != null) {
                //console.log("Data: ",root)

                script_str1 = root[3]

                script_str2 = root[4]


                //console.log(script_str2)

                $(".lds-facebook").fadeOut()

                $('#pca-import-col').append(script_str1);
                $('#pca-export-col').append(script_str2);

                // document.getElementById("mdsSpace").insertAdjacentHTML( 'beforeend', root[3]);

                $("div[id*='fig']").prop("class", "mds-fig");


            }
        });
}

function callResetZoom() {
    mm.resetZoom();
}

function resetSelect() {
    selected_group = []
    d3v4.selectAll(".country").classed("selected", false)

    d3v4.selectAll(".heatmap").remove()
    d3v4.selectAll(".legendThreshold").remove()
    d3v4.selectAll(".legendCells").remove()

    mm.drawCloroExp()
    mm.drawCloroImp()
}
// function postSubmitted(){
//     alert("Post successfull")
// }
function callResetRace() {
    rm.reset()
}

function callStopRace() {
    rm.stop()
}