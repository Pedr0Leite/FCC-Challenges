var checkURL = (timeValue) => { 
    var regex = /\d{5,}/g;
    var onlyNumbers = regex.test(timeValue);
    let dateValue = new Date(timeValue);
    if(onlyNumbers){
        var timeData = {
            unix: parseInt(timeValue),
            utc: new Date(parseInt(timeValue)).toUTCString()
    }
    return timeData;
    }
    if(dateValue.toString() === "Invalid Date"){
        return {error: "Invalid Date"};
    }else{
        var timeData = {
            unix: dateValue.valueOf(),
            utc: dateValue.toUTCString()
    }
    return timeData;
}
}

module.exports = checkURL;