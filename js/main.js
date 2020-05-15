let datArr;
let text='';
let dailyCaseData = [];
let monthlyCaseData = [];
let weeklyCaseData = [];

let USCasesUrl = 'https://raw.githubusercontent.com/nytimes/covid-19-data/master/us.csv';
let stateUrl = 'https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv';
let countiesUrl = "https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv";
let regionData;

let request = new XMLHttpRequest();
request.open("GET",stateUrl,true);
request.send();
request.onreadystatechange = function(){
    if(this.readyState == 4 && this.status == 200){
        datArr = this.responseText.split('\n');
        console.log('datArr', datArr);
        datArr.splice(0, 1) // remove header row
        for(let i = 0; i < datArr.length; i++){
            datArr[i]=datArr[i].split(',');
        }
        sortByCol(datArr,1);
        regionData = stateParse(datArr,'Washington',1);
        weeklyCases();

        // table code
        let tableText = "<table style='width: 300px;'>";
        weeklyCaseData.forEach(function(line){
            tableText += "<tr><td>"+line[0]+"</td><td>"+line[1]+"</td></tr>";
        });
        tableText+="</table>";
        document.getElementById("weeklyWashingtonTab").innerHTML=tableText;

    } else {
        document.getElementById("weeklyWashington").innerHTML="Unable to connect to link";
    }
}

/******************************************************/

function stateParse(arr,term){
    // filter data by state or county
    regionRecords = []
    foundTerm = false
    arr.forEach(function(line){
        if (line[1].indexOf(term) > -1){
            regionRecords.push(line)
            if(foundTerm == false){foundTerm = true}

        }else if(foundTerm == true){ //because the function is sorted by region there is no need to search every line
            return;
        }
    })
    console.log('regionRecords', regionRecords);
    return regionRecords;
}
function countyParse(arr,term){
    // filter data by state or county
    regionRecords = []
    foundTerm = false
    arr.forEach(function(line){
        if (line[1].indexOf(term) > -1){
            regionRecords.push(line)
            if(foundTerm == false){foundTerm = true}

        }else if(foundTerm == true){ //because the function is sorted by region there is no need to search every line
            return;
        }
    })
    console.log('regionRecords', regionRecords);
    return regionRecords;
}
function sortByCol(arr, colIndex=1){
    arr.sort(sortFunction)
    function sortFunction(a, b) {
        a = a[colIndex]
        b = b[colIndex]
        return (a === b) ? 0 : (a < b) ? -1 : 1
    }
}

function dailyCases(){

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
function weeklyCases(){
    // returns [[total cases, new weekly cases],...]
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

function monthlyCases(){

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



// ui
