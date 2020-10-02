//Global vars
var DEBUG = false;

var mcm;
var mm;
var cm;
var rm;
var pcam;
var bcm;
var dbcm;
var wbcm;

const isos = { 'Europe multi-state': 'ZZZ', 'European Union**': 'ZZZ', 'European Union': 'ZZZ', '(multiple sellers)': 'ZYY', 'Unknown recipient(s)': 'ZXY', 'Unknown supplier(s)': 'ZXX', 'Unknown country': 'ZYX', 'Sint Maarten': 'ZKY', 'Canary Islands': 'ZKK', 'Libya GNC': 'LBY', 'NTC (Libya)*': 'LBY', 'Huthi rebels (Yemen)*': 'YEM', 'South Sudan': 'SDN', 'Hamas (Palestine)*': 'PSE', 'PRC (Israel/Palestine)*': 'PSE', 'PIJ (Israel/Palestine)*': 'PSE', 'Ukraine Rebels*': 'UKR', 'Hezbollah (Lebanon)*': 'LBN', 'Syria rebels*': 'SYR', 'PKK (Turkey)*': 'TUR', 'OSCE**': 'OSC', 'United Nations**': 'ONU', 'United Nations': 'ONU', 'NATO**': 'NAT', 'Nato': 'NAT', 'Andorra': 'AND', 'UAE': 'ARE', 'United Arab Emirates': 'ARE', 'Afghanistan': 'AFG', 'Mujahedin (Afghanistan)*': 'AFG', 'Antigua and Barbuda': 'ATG', 'Antigua & Barbuda': 'ATG', 'Anguilla': 'AIA', 'Albania': 'ALB', 'Armenia': 'ARM', 'Netherlands Antilles': 'ANN', 'Angola': 'AGO', 'Antarctica': 'ATA', 'Argentina': 'ARG', 'American Samoa': 'ASM', 'Austria': 'AUT', 'Australia': 'AUS', 'Aruba': 'ABW', 'Azerbaijan': 'AZE', 'BosniaHerzegovina': 'BIH', 'Bosnia-Herzegovina': 'BIH', 'Bosnia and Herzegovina': 'BIH', 'Barbados': 'BRB', 'Bangladesh': 'BGD', 'Belgium': 'BEL', 'Burkina Faso': 'BFA', 'Bulgaria': 'BGR', 'Bahrain': 'BHR', 'Burundi': 'BDI', 'Benin': 'BEN', 'Bermuda': 'BMU', 'Brunei': 'BRN', 'Bolivia': 'BOL', 'Brazil': 'BRA', 'Bahamas': 'BHS', 'Bhutan': 'BTN', 'Bouvet Island': 'BVT', 'Botswana': 'BWA', 'Belarus': 'BLR', 'Belize': 'BLZ', 'Canada': 'CAN', 'Cocos [Keeling] Islands': 'CCK', 'DRCongo': 'COD', 'Congo [DRC]': 'COD', 'Congo': 'COD', 'DR Congo': 'COD', 'Central African Republic': 'CAF', 'Congo [Republic]': 'COG', 'Switzerland': 'CHE', "Côte d'Ivoire": 'CIV', "Cote d'Ivoire": 'CIV', 'Cote dIvoire': 'CIV', 'Cook Islands': 'COK', 'Chile': 'CHL', 'Cameroon': 'CMR', 'China': 'CHN', 'Tibet': 'CHN', 'Colombia': 'COL', 'Costa Rica': 'CRI', 'Cuba': 'CUB', 'Anti-Castro rebels (Cuba)*': 'CUB', 'Cape Verde': 'CPV', 'Christmas Island': 'CXR', 'Cyprus': 'CYP', 'Czechia': 'CZE', 'Czech Republic': 'CZE', 'Czechoslovakia': 'CZE', 'Germany': 'DEU', 'East Germany (GDR)': 'DEU', 'Djibouti': 'DJI', 'Denmark': 'DNK', 'Dominica': 'DMA', 'Dominican Republic': 'DOM', 'Algeria': 'DZA', 'Ecuador': 'ECU', 'Estonia': 'EST', 'Egypt': 'EGY', 'Western Sahara': 'ESH', 'Eritrea': 'ERI', 'Spain': 'ESP', 'African Union': 'ETH', 'African Union**': 'ETH', 'Ethiopia': 'ETH', 'Finland': 'FIN', 'Fiji': 'FJI', 'Falkland Islands [Islas Malvinas]': 'FLK', 'Micronesia': 'FSM', 'Faroe Islands': 'FRO', 'France': 'FRA', 'Gabon': 'GAB', 'United Kingdom': 'GBR', 'Wales': 'GBR', 'England': 'GBR', 'Scotland': 'GBR', 'Falkland Islands': 'GBR', 'Grenada': 'GRD', 'Georgia': 'GEO', 'French Guiana': 'GUF', 'Guernsey': 'GGY', 'Ghana': 'GHA', 'Gibraltar': 'GIB', 'Greenland': 'GRL', 'Gambia': 'GMB', 'Guinea': 'GIN', 'Guadeloupe': 'GLP', 'Equatorial Guinea': 'GNQ', 'Greece': 'GRC', 'South Georgia and the South Sandwich Islands': 'SGS', 'Guatemala': 'GTM', 'Armas (Guatemala)*': 'GTM', 'Guam': 'GUM', 'Guinea-Bissau': 'GNB', 'Guyana': 'GUY', 'Gaza Strip': 'GZE', 'Hong Kong': 'HKG', 'Heard Island and McDonald Islands': 'HMD', 'Honduras': 'HND', 'Croatia': 'HRV', 'Haiti': 'HTI', 'Hungary': 'HUN', 'Indonesia': 'IDN', 'Ireland': 'IRL', 'Israel': 'ISR', 'Isle of Man': 'IMN', 'India': 'IND', 'British Indian Ocean Territory': 'IOT', 'Iraq': 'IRQ', 'Iran': 'IRN', 'Iceland': 'ISL', 'Italy': 'ITA', 'Jersey': 'JEY', 'Jamaica': 'JAM', 'Jordan': 'JOR', 'Japan': 'JPN', 'Kenya': 'KEN', 'Kyrgyzstan': 'KGZ', 'Cambodia': 'KHM', 'Kiribati': 'KIR', 'Comoros': 'COM', 'Saint Kitts and Nevis': 'KNA', 'North Korea': 'PRK', 'South Korea': 'KOR', 'Kuwait': 'KWT', 'Cayman Islands': 'CYM', 'Kazakhstan': 'KAZ', 'Laos': 'LAO', 'Lebanon': 'LBN', 'Amal (Lebanon)*': 'LBN', 'Saint Lucia': 'LCA', 'Liechtenstein': 'LIE', 'Sri Lanka': 'LKA', 'Liberia': 'LBR', 'Lesotho': 'LSO', 'Lithuania': 'LTU', 'Luxembourg': 'LUX', 'Latvia': 'LVA', 'Libya': 'LBY', 'Libya HoR': 'LBY', 'Morocco': 'MAR', 'Monaco': 'MCO', 'Moldova': 'MDA', 'Montenegro': 'MNE', 'Madagascar': 'MDG', 'Marshall Islands': 'MHL', 'Macedonia': 'MKD', 'Macedonia [FYROM]': 'MKD', 'Mali': 'MLI', 'Myanmar': 'MMR', 'Myanmar [Burma]': 'MMR', 'Mongolia': 'MNG', 'Macau': 'MAC', 'Northern Mariana Islands': 'MNP', 'Martinique': 'MTQ', 'Mauritania': 'MRT', 'Montserrat': 'MSR', 'Malta': 'MLT', 'Mauritius': 'MUS', 'Maldives': 'MDV', 'Malawi': 'MWI', 'Mexico': 'MEX', 'Malaysia': 'MYS', 'Mozambique': 'MOZ', 'Namibia': 'NAM', 'New Caledonia': 'NCL', 'Niger': 'NER', 'Norfolk Island': 'NFK', 'Nigeria': 'NGA', 'Biafra': 'NGA', 'Nicaragua': 'NIC', 'Netherlands': 'NLD', 'Norway': 'NOR', 'Nepal': 'NPL', 'Nauru': 'NRU', 'Niue': 'NIU', 'New Zealand': 'NZL', 'Oman': 'OMN', 'Panama': 'PAN', 'Peru': 'PER', 'French Polynesia': 'PYF', 'Papua New Guinea': 'PNG', 'Philippines': 'PHL', 'Pakistan': 'PAK', 'Poland': 'POL', 'Saint Pierre and Miquelon': 'SPM', 'Pitcairn Islands': 'PCN', 'Puerto Rico': 'PRI', 'Palestine': 'PSE', 'Palestinian Territories': 'PSE', 'Portugal': 'PRT', 'Palau': 'PLW', 'Paraguay': 'PRY', 'Qatar': 'QAT', 'Réunion': 'REU', 'Romania': 'ROU', 'Serbia': 'SRB', 'Yugoslavia': 'SRB', 'Russia': 'RUS', 'Soviet Union': 'RUS', 'Rwanda': 'RWA', 'Saudi Arabia': 'SAU', 'Solomon Islands': 'SLB', 'Seychelles': 'SYC', 'Sudan': 'SDN', 'Sweden': 'SWE', 'Singapore': 'SGP', 'Saint Helena': 'SHN', 'Slovenia': 'SVN', 'Svalbard and Jan Mayen': 'SJM', 'Slovakia': 'SVK', 'Sierra Leone': 'SLE', 'San Marino': 'SMR', 'Senegal': 'SEN', 'Somalia': 'SOM', 'Somaliland': 'SOM', 'Suriname': 'SUR', 'São Tomé and Príncipe': 'STP', 'El Salvador': 'SLV', 'FMLN (El Salvador)*': 'SLV', 'Syria': 'SYR', 'Swaziland': 'SWZ', 'Turks and Caicos Islands': 'TCA', 'Turks And Caicos Islands': 'TCA', 'Chad': 'TCD', 'French Southern Territories': 'ATF', 'Togo': 'TGO', 'Thailand': 'THA', 'Tajikistan': 'TJK', 'Tokelau': 'TKL', 'Timor-Leste': 'TLS', 'East Timor': 'TLS', 'Turkmenistan': 'TKM', 'Tunisia': 'TUN', 'Tonga': 'TON', 'Turkey': 'TUR', 'Trinidad and Tobago': 'TTO', 'Trinidad & Tobago': 'TTO', 'Tuvalu': 'TUV', 'Taiwan': 'TWN', 'Tanzania': 'TZA', 'Ukraine': 'UKR', 'Uganda': 'UGA', 'United States': 'USA', 'Hawaii': 'USA', 'Uruguay': 'URY', 'Uzbekistan': 'UZB', 'Vatican City': 'VAT', 'Saint Vincent and the Grenadines': 'VCT', 'Venezuela': 'VEN', 'British Virgin Islands': 'VGB', 'U.S. Virgin Islands': 'VIR', 'Vietnam': 'VNM', 'Viet Nam': 'VNM', 'South Vietnam': 'VNM', 'Vanuatu': 'VUT', 'Wallis and Futuna': 'WLF', 'Samoa': 'WSM', 'Kosovo': 'XKX', 'Yemen': 'YEM', 'North Yemen': 'YEM', 'South Yemen': 'YEM', 'Mayotte': 'MYT', 'South Africa': 'ZAF', 'ANC (South Africa)*': 'ZAF', 'Zambia': 'ZMB', 'Zimbabwe': 'ZWE', 'Cabo Verde': 'CPV', 'Southern rebels (Yemen)*': 'YEM', 'LTTE (Sri Lanka)*': 'LKA', 'MTA (Myanmar)*': 'MMR', 'United Wa State (Myanmar)*': 'MMR', 'Khmer Rouge (Cambodia)*': 'KHM', 'SNA (Somalia)*': 'SOM', 'UIC (Somalia)*': 'SOM', 'Houthi rebels (Yemen)*': 'YEM', 'SLA (Lebanon)*': 'LBN', 'LF (Lebanon)*': 'LBN', 'Darfur rebels (Sudan)*': 'SDN', 'Northern Alliance (Afghanistan)*': 'AFG', 'Northern Cyprus': 'CYP', 'Eswatini': 'SWZ', 'RUF (Sierra Leone)*': 'SLE', 'Regional Security System**': 'ATG', 'LRA (Uganda)*': 'UGA', 'NLA (Macedonia)*': 'MKD', 'Unknown rebel group*': 'ZZZ' }
const allCountriesAlpha3 = ['', 'ZZZ', 'ZZZ', 'ZZZ', 'ZYY', 'ZXY', 'ZXX', 'ZYX', 'ZKY', 'ZKK', 'LBY', 'LBY', 'YEM', 'SDN', 'PSE', 'PSE', 'PSE', 'UKR', 'LBN', 'SYR', 'TUR', 'OSC', 'ONU', 'ONU', 'NAT', 'NAT', 'AND', 'ARE', 'ARE', 'AFG', 'AFG', 'ATG', 'ATG', 'AIA', 'ALB', 'ARM', 'ANN', 'AGO', 'ATA', 'ARG', 'ASM', 'AUT', 'AUS', 'ABW', 'AZE', 'BIH', 'BIH', 'BIH', 'BRB', 'BGD', 'BEL', 'BFA', 'BGR', 'BHR', 'BDI', 'BEN', 'BMU', 'BRN', 'BOL', 'BRA', 'BHS', 'BTN', 'BVT', 'BWA', 'BLR', 'BLZ', 'CAN', 'CCK', 'COD', 'COD', 'COD', 'COD', 'CAF', 'CAF', 'COG', 'CHE', 'CIV', 'CIV', 'CIV', 'COK', 'CHL', 'CMR', 'CHN', 'CHN', 'COL', 'CRI', 'CUB', 'CUB', 'CPV', 'CXR', 'CYP', 'CZE', 'CZE', 'CZE', 'DEU', 'DEU', 'DEU', 'DJI', 'DNK', 'DMA', 'DOM', 'DZA', 'ECU', 'EST', 'EGY', 'ESH', 'ERI', 'ESP', 'ETH', 'ETH', 'ETH', 'FIN', 'FJI', 'FLK', 'FSM', 'FRO', 'FRA', 'GAB', 'GBR', 'GBR', 'GBR', 'GBR', 'GBR', 'GRD', 'GEO', 'GUF', 'GGY', 'GHA', 'GIB', 'GRL', 'GMB', 'GIN', 'GLP', 'GNQ', 'GRC', 'SGS', 'GTM', 'GTM', 'GUM', 'GNB', 'GUY', 'GZE', 'HKG', 'HMD', 'HND', 'HRV', 'HTI', 'HUN', 'IDN', 'IRL', 'ISR', 'IMN', 'IND', 'IOT', 'IRQ', 'IRN', 'ISL', 'ITA', 'JEY', 'JAM', 'JOR', 'JPN', 'KEN', 'KGZ', 'KHM', 'KIR', 'COM', 'KNA', 'PRK', 'KOR', 'KWT', 'CYM', 'KAZ', 'LAO', 'LBN', 'LBN', 'LCA', 'LIE', 'LKA', 'LBR', 'LSO', 'LTU', 'LUX', 'LVA', 'LBY', 'LBY', 'MAR', 'MCO', 'MDA', 'MNE', 'MDG', 'MHL', 'MKD', 'MKD', 'MLI', 'MMR', 'MMR', 'MNG', 'MAC', 'MNP', 'MTQ', 'MRT', 'MSR', 'MLT', 'MUS', 'MDV', 'MWI', 'MEX', 'MYS', 'MOZ', 'NAM', 'NCL', 'NER', 'NFK', 'NGA', 'NGA', 'NIC', 'NLD', 'NOR', 'NPL', 'NRU', 'NIU', 'NZL', 'OMN', 'PAN', 'PER', 'PYF', 'PNG', 'PHL', 'PAK', 'POL', 'SPM', 'PCN', 'PRI', 'PSE', 'PSE', 'PRT', 'PLW', 'PRY', 'QAT', 'REU', 'ROU', 'SRB', 'SRB', 'RUS', 'RUS', 'RWA', 'SAU', 'SLB', 'SYC', 'SDN', 'SWE', 'SGP', 'SHN', 'SVN', 'SJM', 'SVK', 'SLE', 'SMR', 'SEN', 'SOM', 'SOM', 'SUR', 'STP', 'SLV', 'SLV', 'SYR', 'SWZ', 'TCA', 'TCA', 'TCD', 'ATF', 'TGO', 'THA', 'TJK', 'TKL', 'TLS', 'TLS', 'TKM', 'TUN', 'TON', 'TUR', 'TTO', 'TTO', 'TUV', 'TWN', 'TZA', 'UKR', 'UGA', 'USA', 'USA', 'URY', 'UZB', 'VAT', 'VCT', 'VEN', 'VGB', 'VIR', 'VNM', 'VNM', 'VNM', 'VUT', 'WLF', 'WSM', 'XKX', 'YEM', 'YEM', 'YEM', 'MYT', 'ZAF', 'ZAF', 'ZMB', 'ZWE']
const risky = []
var years = [2016, 2018];
var selected_group = ["ITA"]
var pca_features = ['IMPORT_TOTAL', "EXPORT_TOTAL", 'ARMY_TOTAL', 'REF_TOTAL', 'GDP_TOTAL', 'POP_TOTAL']

var synchro_mode = true

var oldStatesClicked;

var savedTransactions;

function main() {
    // $(function() {
    //     $('select').selectpicker();
    // });

    //Layout movements

    // var gear = document.getElementsByClassName('myGearIcon')[0];

    // gear.style.cursor = 'pointer';
    // gear.onclick = function() {
    //     openRightMenu();
    // };

    mcm = MapComponentsManager();
    dbcm = DivergingBarChartManager();
    mm = MapManager();
    pcam = PcaScatterManager();


    getDataFromPost(false);

    mcm.drawSlider()

    mm.drawCloroExp();

    // cm = ChartManager();

    dbcm.drawChart();

    // rm = RankRaceManager();
    wbcm = weaponsBarChartManager();
    wbcm.drawChart();


    // cm.drawChart();
    // cm.drawChartRec();

    // drawCircular()

    $(".bs-select-all").remove()
    $(".bs-deselect-all").on('click', function() {
        // alert("ALL DESELECTED");
        resetSelect()
        updateCircular()
    });


    document.querySelectorAll('.bs-select-all').forEach(function(a) {
        a.remove()
    })

    $("#selectNation").val("ITA")
    oldStatesClicked = selected_group
}



// function hi() { alert("hi" + $("#selectNation").val()) }
//---Helpers
/*
Called on nation text from select-picker click
*/
function clickedNation() {

    ids = String($("#selectNation").val())
        // console.log("Clicked nation " + ids)

    pieces = ids.split(/[\s,]+/)
    let a = new Set(pieces);
    let b = new Set(selected_group);
    let a_minus_b = [
        [...a].filter(x => !b.has(x))
    ];

    console.log("id", a_minus_b[0][0], a, b)
    if (a_minus_b[0][0] != undefined) {
        mm.selected(a_minus_b[0][0])
    } else {
        a = new Set(oldStatesClicked)
        b = new Set(pieces);
        a_minus_b = [
            [...a].filter(x => !b.has(x))
        ];
        console.log(a_minus_b)
        mm.selected(a_minus_b[0][0])

    }
    // d3v4.selectAll(".heatmap").remove()
    // d3v4.selectAll(".legendThreshold").remove()
    // d3v4.selectAll(".legendCells").remove()

    // mm.drawCloroExp()
    // mm.drawCloroImp()


    // $(".bs-select-all").on('click', function() {
    //     // alert("ALL SELECTED");
    //     selectAllCountries()
    // });

}

var arr = new Array();
$('.selectpicker').on('change', function() {
    $(this).find("option").each(function() {
        if ($(this).is(":selected")) {
            id = $(this).attr("value");
            if (arr.indexOf(id) == -1) {
                arr.push(id);
            }
        } else {
            id = $(this).attr("value");
            arr = jQuery.grep(arr, function(value) {
                return value != id;
            });
        }
    });

    if (arr.length > 0)
        alert("Last selected id : " + arr[arr.length - 1]);

});


function getDataFromPost(isCreated) {
    url = "/get-data"
        // url+="?country="+country_selected
        // url+="&year1="+years[0]+"&year2="+years[1]
    const obj = {
        "country": selected_group,
        "year1": years[0],
        "year2": years[1],
        "features": pca_features
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
                if (!isCreated) {
                    pcam.drawChart(root[3][0], "IMP")
                    isCreated = true
                }
                // console.log("calling pca")
                pcam.transition(root[3][0])
                    // pcam.drawBasicChart(root[3], "IMP")
                    // pcam.drawBasicChart(root[4], "EXP")

                d3v4.json("/get-news")
                    .post(data, function(error, root) {
                        document.getElementById("floatBarsG").remove()
                        $('#alert-data').html(root[1]).fadeIn("slow")

                        // document.getElementById("alert-data").innerHTML = root[1]
                        document.getElementById("alert").innerHTML += "<br>" + root[0]
                        root[2].split(",").forEach(d => {
                            d = d.replaceAll(/^ |'|\[|\]/g, '');;
                            console.log("news from", d)
                            risky.push(getCountryIsoByName(d))
                        })
                        $('.myCheckBox2').each(function() {
                            this.disabled = false;
                        });
                        // boxAlert = '<div class="checkBoxShowAlerts">\
                        // <input type="checkbox" class="myCheckBox" id="cbAlert" name="alert checkbox" value="alert" checked="false" onclick="showAlertClick(this);">\
                        // <label style="font-size:10px" for="cbAlert"> Show on map</label>\
                        // </div>'
                        // document.getElementById("spanAlert").innerHTML += " " + boxAlert
                    })



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

    // mm.drawCloroExp()
    // mm.drawCloroImp()
    dbcm.drawChart()
    pcam.drawChart()

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

function openRightMenu() {
    document.getElementById("rightMenu").style.display = "block";
}

function closeRightMenu() {
    document.getElementById("rightMenu").style.display = "none";
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

// Handler PCA checkboxes
function handleClick(cb) {
    // console.log(cb)
    // alert("Clicked, new value = " + cb.value);

    if (!cb.checked) {

        // remove element

        const index = pca_features.indexOf(cb.value);
        if (index > -1) {
            pca_features.splice(index, 1);
        }
    } else {
        pca_features.push(cb.value)
    }
    getDataFromPost(true)
    checkMinFeaturesPCA()
}

function handleRadioClick(rb) {
    if (rb.id = "cbImp") {
        toRemove = "EXPORT_TOTAL"

    } else if (rb.id = "cbExp") {
        toRemove = "IMPORT_TOTAL"
    } else {
        throw Error
    }
    // REMOVE THE OTHER
    const index = pca_features.indexOf(toRemove);
    if (index > -1) {
        pca_features.splice(index, 1);
    }
    //INSERT INTO IT
    if (!pca_features.includes(rb.value))
        pca_features.push(rb.value)
    getDataFromPost(true)

}

function checkMinFeaturesPCA() {

    if (pca_features.length <= 3) {
        $('.myCheckBox').each(function() {
            if (this.checked)
                this.disabled = true;
        });
    } else {
        $('.myCheckBox').each(function() {
            if (this.disabled)
                this.disabled = false;
        });
    }
}


function callSelected(id) {
    mm.selected(id)

}

function transitionDivBarChart(dataTransitions) { dbcm.transitionSlider(dataTransitions) }

function stripYear(input) {
    if (input == null || input == "")
        return "";

    // In case of not unique delivered year
    if (input.indexOf("-") >= 0)
        return parseInt(input.split("-")[1]);

    // In case of (ordered year)
    if (input.indexOf("(") >= 0 || input.indexOf(")") >= 0)
        return parseInt(input.replace("(", "").replace(")", ""));

    // Other cases
    return parseInt(input);

}

function showWarsClick(cb) {
    if (cb.value == "imp") {
        if (!cb.checked)
            mm.toggleCircles("off", "imp")
        else
            mm.toggleCircles("on", "imp")
    } else {
        if (!cb.checked)
            mm.toggleCircles("off", "exp")
        else
            mm.toggleCircles("on", "exp")
    }
}

function showAlertClick(cb) {
    if (cb.value == "imp") {
        if (!cb.checked)
            mm.toggleRisky("off", "imp")
        else
            mm.toggleRisky("on", "imp")
    } else {
        if (!cb.checked)
            mm.toggleRisky("off", "exp")
        else
            mm.toggleRisky("on", "exp")
    }
}


function stripNum(input) {
    if (input == null || input == "")
        return 0;

    // In case of (delivered num.)
    if (input.indexOf("(") >= 0 || input.indexOf(")") >= 0)
        return parseInt(input.replace("(", "").replace(")", ""));

    // Other cases
    return parseInt(input);

}

function stripYear(input) {
    if (input == null || input == "")
        return -1;

    // In case of not unique delivered year
    if (input.indexOf("-") >= 0)
        return parseInt(input.split("-")[1]);

    // In case of (ordered year)
    // if (input.indexOf("(") >= 0 || input.indexOf(")") >= 0)

    // Other cases
    return parseInt(input.replace("(", "").replace(")", ""));

}

function getCountryIsoByName(name) {
    return isos[name];
}