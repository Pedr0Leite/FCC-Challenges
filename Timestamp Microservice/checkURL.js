var moment = require('./node_modules/moment');

var checkURL = (timeValue) => {
    var regex = /^[0-9]+$/g;
    var onlyNumbers = regex.test(timeValue);
    if(timeValue == "" || timeValue == undefined){
        var timeData = {
            unix: new Date().getTime(),
            utc: new Date().toUTCString()
        }
        return timeData;
    }else if(onlyNumbers){
        var timeData = {
            unix: timeValue,
            utc: moment.unix(timeValue / 1000).format("llll")
        }
        return timeData;
    }else if(!onlyNumbers){
        var timeData = {
            unix: moment(timeValue).valueOf(),
            utc: moment(timeValue).format("llll")
        }
        return timeData;
    }else{
        var timeData = {"error" : "Invalid Date" };
        return timeData;
    }
}

module.exports = checkURL;