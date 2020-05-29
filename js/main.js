let USRecords, stateRecords, countyRecords;
let text='';
let selectedState = "";
let states = [];
let counties = [];
let statesOptions = countyOptions = "";
let currentState = "None"
let currentCounty = "None"

let USCasesUrl = 'https://raw.githubusercontent.com/nytimes/covid-19-data/master/us.csv';
let stateUrl = 'https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv';
let countiesUrl = "https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv";
let USData, stateData, stateCountyData, countyData;
let USRequest = new XMLHttpRequest();
let stateRequest = new XMLHttpRequest();
let countyRequest = new XMLHttpRequest();
let dailyCaseData = [];
let monthlyCaseData = [];
let weeklyCaseData = [];
USRequest.open("GET",USCasesUrl,true);
USRequest.send();
USRequest.onreadystatechange = function(){
    if(this.readyState == 4 && this.status == 200){

        USRecords = parseNYTData(this.responseText.split('\n'))

        weeklyCases(USRecords);
        generateTable(weeklyCaseData)

    }else{
        console.log("Issue with grabbing us records")
    }
}
stateRequest.open("GET",stateUrl,true);
stateRequest.send();
stateRequest.onreadystatechange = function(){
    if(this.readyState == 4 && this.status == 200){

        stateRecords = parseNYTData(this.responseText.split('\n'))

        createStateList(stateRecords);
        
        // populate states dropdown
        states.forEach(function(state){
            statesOptions += "<option value='"+ state +"'>"+state+"</option>";
        })
        document.getElementById("stateSelect").innerHTML+=statesOptions;

        //grabing data from a single state
        sortByCol(stateRecords,1);
        //giving an inital value to state

    } else {
        document.getElementById("weeklyWashingtonTab").innerHTML="Unable to connect to link";
    }
}
countyRequest.open("GET",countiesUrl,true);
countyRequest.send();
countyRequest.onreadystatechange = function(){
    if(this.readyState == 4 && this.status == 200){

        countyRecords = parseNYTData(this.responseText.split('\n'))
        //sorting by state
        sortByCol(countyRecords, colIndex=2);
    }
}

/******************************************************/

function stateChange(){
    select = document.getElementById("stateSelect");
    selectedState = getSelectedOption(select).value
    if(currentState != selectedState){
        countyOptions = "<option value='None'>None</option>"
        currentState = selectedState;
        if(selectedState != "None"){
            //grabbing generic cases for a single state
            stateData = filterByState(stateRecords,currentState,1);
            //grabbing county cases for a single state
            stateCountyData = filterByState(countyRecords,currentState, index=2);
            //creating a county list
            createCountyList();
            //creating dropdown list of counties
            countyOptions = "<option value='None'>None</option>"
            counties.forEach(function(county){
                countyOptions += "<option value='"+ county +"'>"+county+"</option>";
            })
            weeklyCases(stateData);
            generateTable(weeklyCaseData)
        }
        else{
            weeklyCases(USRecords);
            generateTable(weeklyCaseData)
        }
        document.getElementById("countySelect").innerHTML=countyOptions;
    }
}

function countyChange(){
    select = document.getElementById("countySelect");
    selectedCounty = getSelectedOption(select).value
    if(currentCounty != selectedCounty){
        if(selectedCounty != "None"){
            currentCounty = selectedCounty;
            //sort by county
            sortByCol(stateCountyData, colIndex=1);
            //grabs data for specific county
            countyData = filterByCounty(stateCountyData,selectedCounty);

            weeklyCases(countyData);
            generateTable(weeklyCaseData)
        }else{
            weeklyCases(stateData);
            generateTable(weeklyCaseData)
        }
    }
}

/******************************************************/
function parseNYTData(rawData){
        
    rawData.splice(0, 1) // remove header row
    for(let i = 0; i < rawData.length; i++) {
        rawData[i]=rawData[i].split(',');
    }
    return rawData
}

function createStateList(stateData) {

    states = []
    stateData.forEach(function(rec) {
        if(states.indexOf(rec[1]) == -1) {
            states.push(rec[1]);
        }
    });
    states.sort();
};
function createCountyList(){
    
    counties = []
    stateCountyData.forEach(function(rec) {
        countyRec=rec[1]
        if(countyRec !='Unknown'){
            if(counties.indexOf(countyRec) == -1) {
                counties.push(countyRec);
            }
        }
    });
    counties.sort();
}
function filterByState(arr,term, index = 1){
    // filter data by state or county
    regionRecords = []
    foundTerm = false
    arr.forEach(function(line){
        if (line[index].indexOf(term) > -1){
            regionRecords.push(line)
            if(foundTerm == false){foundTerm = true}

        }else if(foundTerm == true){ //because the function is pre-sorted by region there is no need to search every line
            return;
        }
    })
    console.log('regionRecords', regionRecords);
    return regionRecords;
}
function filterByCounty(arr,term){
    // filter data by state or county
    regionRecords = []
    foundTerm = false
    arr.forEach(function(line){
        if (line[1].indexOf(term) > -1){
            regionRecords.push(line)
            if(foundTerm == false){foundTerm = true}

        }else if(foundTerm == true){ //because the function is pre-sorted by region there is no need to search every line
            return;//have to use return instead of break for forEach function
        }
    })
    console.log('regionRecords', regionRecords);
    return regionRecords;
}
function sortByCol(arr, colIndex=1){
    arr.sort(function (a, b) {
        a = a[colIndex]
        b = b[colIndex]
        return (a === b) ? 0 : (a < b) ? -1 : 1
    })
}

function getSelectedOption(sel) {
    var opt;
    for ( var i = 0, len = sel.options.length; i < len; i++ ) {
        opt = sel.options[i];
        if ( opt.selected === true ) {
            console.log(sel.options.length)
            break;
        }
    }
    return opt;
}

function dailyCases(regionData){

    let caseColIndex = regionData[0].length-2;
    let previousCases = 0;
    let currentCases = regionData[0][caseColIndex];

    for(let i=0; i<regionData.length;i++){
        previousCases = currentCases;
        currentCases = regionData[i][caseColIndex];
        dailyCaseData.push([currentCases,currentCases-previousCases]); //[cases, case increase from day to day]
    }
    return;
}

function weeklyCases(regionData){ //note: figure out why the intial case is on saturday instead of sunday
    // returns [[total cases, new weekly cases],...]
    weeklyCaseData = []
    let caseColIndex = regionData[0].length-2;
    let previousCases = 0;
    let currentCases = 0;
    let startDay;
    for(let k = 0; k < 7; k++){ //finds the first saturday of the data set 
        if(new Date(regionData[k][0]).getDay() == 6){
            currentCases = regionData[k][caseColIndex];
            startDay = k;
            break;
        }
    }

    for(let i=startDay; i<regionData.length;i+=7){//grab weekly cases for every last day of a week
        previousCases = currentCases;
        currentCases = regionData[i][caseColIndex];
        weeklyCaseData.push([currentCases,currentCases-previousCases]);
    }
    return;
}

function monthlyCases(regionData){

    let caseColIndex = regionData[0].length-2;
    let previousCases = 0;
    let currentCases = regionData[0][caseColIndex];
    let month = regionData[0][0].substr(0,7)

    for(let i=0; i<regionData.length;i++){
        if(regionData[i][0].includes(month) === false){//grabs case data at the end of each month
            month = regionData[i-1][0].substr(0,7)
            previousCases = currentCases;
            currentCases = regionData[i][caseColIndex];
            monthlyCaseData.push([currentCases,currentCases-previousCases]);
        }
    }
    return;
}
function generateTable(caseData){
    let tableText = "<table style='width: 300px;'>";

    caseData.forEach(function(line){
        tableText += "<tr><td>"+line[0]+"</td><td>"+line[1]+"</td></tr>";
    });

    tableText+="</table>";
    document.getElementById("weeklyWashingtonTab").innerHTML=tableText;
}