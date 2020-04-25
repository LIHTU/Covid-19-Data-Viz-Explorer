let request = new XMLHttpRequest();
let datArr = null

request.onreadystatechange = function(){
    if(this.readyState == 4 && this.status == 200){
        datArr = this.responseText.split('\n');
        document.getElementById("response").innerHTML=""
        datArr.forEach(function(line){
            document.getElementById("response").innerHTML+=line+"<br/>"
        })
    }else{
        alert(this.status)
        document.getElementById("response").innerHTML="Unable to connect to link";
    }
}
request.open("GET","https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv",true);
request.send();