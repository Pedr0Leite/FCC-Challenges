var express = require("express");
var app = express();
var cors = require("cors");
const requestIp = require('request-ip');
app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204

const port = "1313";

var ipMiddleware = function(req, res, next){
    const clientIp = requestIp.getClientIp(req);
    next();
};

app.use(requestIp.mw());

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/api/whoami", function (req, res) {
  try{
      var ip = req.clientIp;
      var language = req.acceptsLanguages();
      var software=req.get("User-Agent");
      let finalInfo = {
        "ipaddress":ip,
        "language":language,
        "software":software
      }
    res.json(finalInfo);
  }catch(err){
    console.error(err);
  }
});

// listen for requests :)
app.listen(process.env.PORT || port, ()=>{
  console.log(`We are listen on port ${port} or ${process.env.PORT}`)
});