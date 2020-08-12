//Global vars
var DEBUG = false;

var mcm;
var mm;
var cm;
var rm;
var pcam;
var bcm;

var years = [2016, 2018];
var country_selected = "Italy";
var selected_group = ["ITA"]

var synchro_mode = true
allCountriesAlpha3 = ['', 'ZZZ', 'ZZZ', 'ZZZ', 'ZYY', 'ZXY', 'ZXX', 'ZYX', 'ZKY', 'ZKK', 'LBY', 'LBY', 'YEM', 'SDN', 'PSE', 'PSE', 'PSE', 'UKR', 'LBN', 'SYR', 'TUR', 'OSC', 'ONU', 'ONU', 'NAT', 'NAT', 'AND', 'ARE', 'ARE', 'AFG', 'AFG', 'ATG', 'ATG', 'AIA', 'ALB', 'ARM', 'ANN', 'AGO', 'ATA', 'ARG', 'ASM', 'AUT', 'AUS', 'ABW', 'AZE', 'BIH', 'BIH', 'BIH', 'BRB', 'BGD', 'BEL', 'BFA', 'BGR', 'BHR', 'BDI', 'BEN', 'BMU', 'BRN', 'BOL', 'BRA', 'BHS', 'BTN', 'BVT', 'BWA', 'BLR', 'BLZ', 'CAN', 'CCK', 'COD', 'COD', 'COD', 'COD', 'CAF', 'CAF', 'COG', 'CHE', 'CIV', 'CIV', 'CIV', 'COK', 'CHL', 'CMR', 'CHN', 'CHN', 'COL', 'CRI', 'CUB', 'CUB', 'CPV', 'CXR', 'CYP', 'CZE', 'CZE', 'CZE', 'DEU', 'DEU', 'DEU', 'DJI', 'DNK', 'DMA', 'DOM', 'DZA', 'ECU', 'EST', 'EGY', 'ESH', 'ERI', 'ESP', 'ETH', 'ETH', 'ETH', 'FIN', 'FJI', 'FLK', 'FSM', 'FRO', 'FRA', 'GAB', 'GBR', 'GBR', 'GBR', 'GBR', 'GBR', 'GRD', 'GEO', 'GUF', 'GGY', 'GHA', 'GIB', 'GRL', 'GMB', 'GIN', 'GLP', 'GNQ', 'GRC', 'SGS', 'GTM', 'GTM', 'GUM', 'GNB', 'GUY', 'GZE', 'HKG', 'HMD', 'HND', 'HRV', 'HTI', 'HUN', 'IDN', 'IRL', 'ISR', 'IMN', 'IND', 'IOT', 'IRQ', 'IRN', 'ISL', 'ITA', 'JEY', 'JAM', 'JOR', 'JPN', 'KEN', 'KGZ', 'KHM', 'KIR', 'COM', 'KNA', 'PRK', 'KOR', 'KWT', 'CYM', 'KAZ', 'LAO', 'LBN', 'LBN', 'LCA', 'LIE', 'LKA', 'LBR', 'LSO', 'LTU', 'LUX', 'LVA', 'LBY', 'LBY', 'MAR', 'MCO', 'MDA', 'MNE', 'MDG', 'MHL', 'MKD', 'MKD', 'MLI', 'MMR', 'MMR', 'MNG', 'MAC', 'MNP', 'MTQ', 'MRT', 'MSR', 'MLT', 'MUS', 'MDV', 'MWI', 'MEX', 'MYS', 'MOZ', 'NAM', 'NCL', 'NER', 'NFK', 'NGA', 'NGA', 'NIC', 'NLD', 'NOR', 'NPL', 'NRU', 'NIU', 'NZL', 'OMN', 'PAN', 'PER', 'PYF', 'PNG', 'PHL', 'PAK', 'POL', 'SPM', 'PCN', 'PRI', 'PSE', 'PSE', 'PRT', 'PLW', 'PRY', 'QAT', 'REU', 'ROU', 'SRB', 'SRB', 'RUS', 'RUS', 'RWA', 'SAU', 'SLB', 'SYC', 'SDN', 'SWE', 'SGP', 'SHN', 'SVN', 'SJM', 'SVK', 'SLE', 'SMR', 'SEN', 'SOM', 'SOM', 'SUR', 'STP', 'SLV', 'SLV', 'SYR', 'SWZ', 'TCA', 'TCA', 'TCD', 'ATF', 'TGO', 'THA', 'TJK', 'TKL', 'TLS', 'TLS', 'TKM', 'TUN', 'TON', 'TUR', 'TTO', 'TTO', 'TUV', 'TWN', 'TZA', 'UKR', 'UGA', 'USA', 'USA', 'URY', 'UZB', 'VAT', 'VCT', 'VEN', 'VGB', 'VIR', 'VNM', 'VNM', 'VNM', 'VUT', 'WLF', 'WSM', 'XKX', 'YEM', 'YEM', 'YEM', 'MYT', 'ZAF', 'ZAF', 'ZMB', 'ZWE']

function main() {
    // $(function() {
    //     $('select').selectpicker();
    // });

    //Layout movements

    getDataFromPost();


    mcm = MapComponentsManager();
    mm = MapManager();
    cm = ChartManager();
    pcam = PcaScatterManager();
    // rm = RankRaceManager();

    mm.drawCloroExp();
    mm.drawCloroImp();

    mcm.drawSlider()

    cm.drawChart();
    cm.drawChartRec();

    drawCircular()


}



// function hi() { alert("hi" + $("#selectNation").val()) }
//---Helpers
/*
Called on nation icon click
*/

function clickedNation() {
    ids = String($("#selectNation").val())
        // console.log("Clicked nation " + ids)

    pieces = ids.split(/[\s,]+/)
    id = pieces.pop()
    mm.selected(id)
    d3v4.selectAll(".heatmap").remove()
    d3v4.selectAll(".legendThreshold").remove()
    d3v4.selectAll(".legendCells").remove()

    mm.drawCloroExp()
    mm.drawCloroImp()

    // $(".bs-select-all").on('click', function() {
    //     // alert("ALL SELECTED");
    //     selectAllCountries()
    // });

}



function getDataFromPost() {
    url = "/get-data"
        // url+="?country="+country_selected
        // url+="&year1="+years[0]+"&year2="+years[1]
    const obj = {
        "country": selected_group,
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
                $('.pca-svg').remove()

                // console.log("Data: ", root)

                // script_str1 = root[3]
                // script_str1 = script_str1.replace('d3v4.scaleLinear', 'd3v4.scale.linear()')

                // script_str2 = root[4]


                // //console.log(script_str2)


                // $('#pca-import-col').append(script_str1);
                // $('#pca-export-col').append(script_str2);

                // // document.getElementById("mdsSpace").insertAdjacentHTML( 'beforeend', root[3]);

                // $("div[id*='fig']").prop("class", "pca-fig");

                $(".lds-facebook").fadeOut()

                pcam.drawChart(root[3][0], "IMP")
                pcam.drawChart(root[4][0], "EXP")

                // pcam.drawBasicChart(root[3], "IMP")
                // pcam.drawBasicChart(root[4], "EXP")

            }
        });
}

function callResetZoom() {
    mm.resetZoom();
}

function resetSelect() {
    selected_group = []
    $("[id$='-line']").remove();

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

function selectAllCountries() {
    d3v4.selectAll("path[id^=country]")
        .classed('selected', true);
}

function callResetRace() {
    rm.reset()
}

function callStopRace() {
    rm.stop()
}

function toggler() {
    window.scrollTo(0, 0);
}

$(document).ready(function() {
    var trigger = $('.hamburger'),
        overlay = $('.overlay'),
        isClosed = false;

    trigger.click(function() {
        hamburger_cross();
    });

    function hamburger_cross() {

        if (isClosed == true) {
            overlay.hide();
            trigger.removeClass('is-open');
            trigger.addClass('is-closed');
            isClosed = false;
        } else {
            overlay.show();
            trigger.removeClass('is-closed');
            trigger.addClass('is-open');
            isClosed = true;
        }
    }

    $('[data-toggle="offcanvas"]').click(function() {
        $('#wrapper').toggleClass('toggled');
    });

});

function callUpdateGeneralInfo() {
    mm.updateGeneralInfo()
}

function callResetPCAZoom(type) {
    pcam.resetZoom(type)
}