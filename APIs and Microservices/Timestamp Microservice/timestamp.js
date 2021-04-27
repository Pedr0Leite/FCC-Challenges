var express = require("express");
var app = express();
var cors = require("cors");
var checkURL = require("./checkURL");
app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204

const port = "1313";

app.use(express.static("public"));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/views/index.html");
});


app.get("/api/timestamp/:date_string?", function (req, res) {
  let dateString = req.params.date_string;
  try{
    (dateString == undefined) ? (res.json(checkURL(""))) : (res.json(checkURL(dateString)));
  }catch(err){
    console.error(err);
  }
});

// listen for requests :)
app.listen(process.env.PORT || port, ()=>{
  console.log(`We are listen on port ${port} or ${process.env.PORT}`)
});