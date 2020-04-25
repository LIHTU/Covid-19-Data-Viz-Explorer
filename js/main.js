let request = new XMLHttpRequest();
let datArr;
let text='';
let dailyCaseData = [];
let monthlyCaseData = [];
let weeklyCaseData = [];

let USCasesUrl = 'https://raw.githubusercontent.com/nytimes/covid-19-data/master/us.csv';
let stateUrl = 'https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv';
let countiesUrl = "https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv";
let regionData;

request.onreadystatechange = function(){
    if(this.readyState == 4 && this.status == 200){
        datArr = this.responseText.split('\n');
        datArr.splice(0, 1)
        for(let i = 0; i < datArr.length; i++)
            datArr[i]=datArr[i].split(',')

        sortByCol(datArr,1)
        regionData = regionSearch(datArr,'Washington',1)
        weeklyNewCases()
        weeklyCaseData.forEach(function(line){
            text+=line+"<br/>"
        })
        document.getElementById("response").innerHTML=text
    }else{
        document.getElementById("response").innerHTML="Unable to connect to link";
    }
}
function regionSearch(arr,term,index){
    newArray = []
    foundTerm = false
    arr.forEach(function(line){
        if (line[index].indexOf(term) > -1){
            newArray.push(line)
            if(foundTerm == false){foundTerm = true}

        }else if(foundTerm == true){ //because the function is sorted by region there is no need to sort every line
            return;
        }
    })
    return newArray
}
function sortByCol(arr, colIndex){
    arr.sort(sortFunction)
    function sortFunction(a, b) {
        a = a[colIndex]
        b = b[colIndex]
        return (a === b) ? 0 : (a < b) ? -1 : 1
    }
}

function dailyNewCases(){

    let caseIndex = regionData[0].length-2;
    let previousCases = 0;
    let currentCases = regionData[0][caseIndex];

    for(let i=0; i<regionData.length;i++){
        previousCases = currentCases;
        currentCases = regionData[i][caseIndex];
        dailyCaseData.push([currentCases,currentCases-previousCases]); //[cases, case increase from day to day]
    }
    return;
}
function weeklyNewCases(){

    let caseIndex = regionData[0].length-2;
    let previousCases = 0;
    let currentCases = 0;
    let day = 0;
    let startDay
    for(let k = 0; k < 7; k++){
        if(new Date(regionData[k][0]).getDay() == 6){
            currentCases = regionData[k][caseIndex];
            startDay = k;
        }
    }

    for(let i=startDay; i<regionData.length;i++){
        if(day == 6){ //full week rotation
            day = 0
            previousCases = currentCases;
            currentCases = regionData[i][caseIndex];
            weeklyCaseData.push([currentCases,currentCases-previousCases]);
        }
        day++;
    }
    return;
}

function monthlyNewCases(){

    let caseIndex = regionData[0].length-2;
    let previousCases = 0;
    let currentCases = regionData[0][caseIndex];
    let month = regionData[0][0].substr(0,7)
    let initialMonth = true

    for(let i=0; i<regionData.length;i++){
        if(regionData[i][0].includes(month) === false){
            month = regionData[i][0].substr(0,7)
            previousCases = currentCases;
            currentCases = regionData[i][caseIndex];
            monthlyCaseData.push([currentCases,currentCases-previousCases]);
        }
    }
    return;
}

request.open("GET",stateUrl,true);
request.send();