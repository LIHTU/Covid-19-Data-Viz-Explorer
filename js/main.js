let request = new XMLHttpRequest();
let datArr;
let text='';
let dailyCaseData = [];
let monthlyCaseData = [];
let weeklyCaseData = [];
let counties = []

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
        
        regionData = regionParse(datArr,'Washington',index=1,index_2=)
        weeklyCases()
        weeklyCaseData.forEach(function(line){
            text+=line+"<br/>"
        })
        document.getElementById("response").innerHTML=text
    }else{
        document.getElementById("response").innerHTML="Unable to connect to link";
    }
}
function getCounties(){
    regions = []
    currentRegion = regionData[0][1]
    regionData.forEach(function(line){
        if(line !== currentRegion){
            regionData.push(currentRegion);
            currentRegion = regionData[i][1];
        }
    })
    return;
}

function regionParse(arr,term,index=1,index_2=-1){
    newArray = []
    foundTerm = false
    arr.forEach(function(line){
        if (line[index].indexOf(term) > -1){
            newArray.push(line)
            if(foundTerm == false){foundTerm = true}

        }else if(foundTerm == true){ //because the function is sorted by region there is no need to search every line
            return;//have to use return instead of break for forEach function
        }
    })
    return newArray
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
function weeklyCases(){

    let caseIndex = regionData[0].length-2;
    let previousCases = 0;
    let currentCases = 0;
    let startDay;
    for(let k = 0; k < 7; k++){ //finds the first saturday of the data set 
        if(new Date(regionData[k][0]).getDay() == 6){
            currentCases = regionData[k][caseIndex];
            startDay = k;
            break;
        }
    }

    for(let i=startDay; i<regionData.length;i+=7){//grab weekly cases for every last day of a week
        previousCases = currentCases;
        currentCases = regionData[i][caseIndex];
        weeklyCaseData.push([currentCases,currentCases-previousCases]);

    }
    return;
}

function monthlyCases(){

    let caseIndex = regionData[0].length-2;
    let previousCases = 0;
    let currentCases = regionData[0][caseIndex];
    let month = regionData[0][0].substr(0,7)

    for(let i=0; i<regionData.length;i++){
        if(regionData[i][0].includes(month) === false){//grabs case data at the end of each month
            month = regionData[i-1][0].substr(0,7)
            previousCases = currentCases;
            currentCases = regionData[i][caseIndex];
            monthlyCaseData.push([currentCases,currentCases-previousCases]);
        }
    }
    return;
}

request.open("GET",stateUrl,true);
request.send();