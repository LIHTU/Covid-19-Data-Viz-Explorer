let USRecords, stateRecords, countyRecords;
let states = counties = [];
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
        console.log("Issue with grabbing US records")
    }
}
stateRequest.open("GET",stateUrl,true);
stateRequest.send();
stateRequest.onreadystatechange = function(){
    if(this.readyState == 4 && this.status == 200){

        stateRecords = parseNYTData(this.responseText.split('\n'))

        states = createOptionList(stateRecords,1);
        
        // populate states dropdown
        states.forEach(function(state){
            statesOptions += "<option value='"+ state +"'>"+state+"</option>";
        })
        document.getElementById("stateSelect").innerHTML+=statesOptions;

        //grabing data from a single state
        sortByCol(stateRecords,1);

    } else {
        console.log("Issue with grabbing state records")
    }
}
countyRequest.open("GET",countiesUrl,true);
countyRequest.send();
countyRequest.onreadystatechange = function(){
    if(this.readyState == 4 && this.status == 200){

        countyRecords = parseNYTData(this.responseText.split('\n'))
        //sorting by state
        sortByCol(countyRecords, colIndex=2);
    }else {
        console.log("Issue with grabbing county records")
    }
}

/******************************************************/

function stateChange(){
    select = document.getElementById("stateSelect");
    selectedState = getSelectedOption(select).value
    if(currentState != selectedState){
        //giving an inital value to state
        countyOptions = "<option value='None'>None</option>"
        currentState = selectedState;
        if(selectedState != "None"){
            //grabbing generic cases for a single state
            stateData = filterByTerm(stateRecords,currentState);
            //grabbing county cases for a single state
            stateCountyData = filterByTerm(countyRecords,currentState, index=2);
            //creating a county list
            counties = createOptionList(stateCountyData,1);
            //creating dropdown list of counties
            counties.forEach(function(county){
                countyOptions += "<option value='"+ county +"'>"+county+"</option>";
            })
            weeklyCases(stateData);
            generateTable(weeklyCaseData)
        }
        else{// display generic US data when no state is selected
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
            countyData = filterByTerm(stateCountyData,selectedCounty);

            weeklyCases(countyData);
            generateTable(weeklyCaseData)
        }else{// display state only data when no county is selected
            weeklyCases(stateData);
            generateTable(weeklyCaseData)
        }
    }
}

/******************************************************/
function parseNYTData(rawData){
    
    rawData.splice(0, 1) // remove header row

    for(let i = 0; i < rawData.length; i++) { // store each word separated by , as a separate string
        rawData[i]=rawData[i].split(',');
    }
    return rawData
}

function createOptionList(data, index){
    
    optionList = []
    data.forEach(function(rec) {
        ref=rec[index]
        if(ref !='Unknown'){
            if(optionList.indexOf(ref) == -1) {
                optionList.push(ref);
            }
        }
    });
    return optionList.sort();
}

function filterByTerm(arr,term, index = 1){
    // filter data by state or county
    records = []
    foundTerm = false
    arr.forEach(function(line){
        if (line[index].indexOf(term) > -1){
            records.push(line)
            if(foundTerm == false){foundTerm = true}

        }else if(foundTerm == true){ //because the function is pre-sorted by region there is no need to search every line
            return;//have to use return instead of break for forEach function
        }
    })
    return records;
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
    document.getElementById("weeklyTable").innerHTML=tableText;
}