var checkURL = (timeValue) => { 
    var regex = /\d{5,}/g;
    var onlyNumbers = regex.test(timeValue);
    var dateValue;
    (timeValue != "" && typeof timeValue != undefined) ? dateValue = new Date(timeValue) : dateValue = new Date();
    console.log('dateValue :', dateValue);
    if(onlyNumbers){
        var timeData = {
            unix: parseInt(timeValue),
            utc: new Date(parseInt(timeValue)).toUTCString()
    }
    return timeData;
    }

    if(dateValue.toString() === "Invalid Date" && timeValue != ""){
        return {error: "Invalid Date"};
    }else{
        var secondTimeData = {
            unix: dateValue.valueOf(),
            utc: dateValue.toUTCString()
    }
    return secondTimeData;
}
}

module.exports = checkURL;