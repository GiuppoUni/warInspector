var DEBUG = true;
var cm;

function main() {
    insertCountriesToSelectBox("../data/countries.html")
    country_selected = "";

    cm = ChartManager();
    cm.drawChart();
}

function insertCountriesToSelectBox(file) {
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if(rawFile.readyState === 4) {
            if(rawFile.status === 200 || rawFile.status == 0) {
                var country_list = rawFile.responseText.split('\n');
                
                if (DEBUG) console.log(country_list);

                for(var i=0; i<country_list.length;i++)
                    $('#country-selection').append('<option value="' + country_list[i] + '">' + country_list[i] + '</option>')
            }
        }
    }
    rawFile.send(null);
}