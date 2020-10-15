'use strict';
//Env
const dotenv = require('dotenv').config({ path: '.env' });

//Package
var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var cors = require('cors');
var dns = require('dns');
var app = express();
var bodyparser = require('body-parser');
var shortId = require('shortid');

// Basic Configuration 
var port = process.env.PORT || 3000;
const mongoURI = process.env.MONGO_URI;

/** this project needs a db !! **/ 
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true }, err =>{
  if(err) console.log('MONGODB ERROR:'  + err);
});

// url SCHEMA
const Schema = mongoose.Schema;

// const urlSchema = new Schema({
//     "originalURL":{
//         "type": String
//     },
//     "shortURL_id": {
//         "type": Number,
//         "default": shortId.generate
//     } 
//   });

const urlSchema = new Schema({
  "originalURL": String,
  "shortURL_id": Number
});

const urlShortModel = mongoose.model('urlShortModel', urlSchema);

app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));
app.use(express.urlencoded({extended: false}));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});


/** this project needs to parse POST bodies **/
//Post new URL
app.post('/api/shorturl/new', function(req, res, next) {
  let originalURL = req.body;
  let theData;

  let urlRegex = /https:\/\/www./g;
  dns.lookup(req.body.url.replace(urlRegex, ''), (err, address, family)=>{
    if(err){
      return res.json({
        error: "invalid URL"
      });
    }else{
      console.log('Attempting to create a new entry in the DB...')
      createURL()
    }
  });

  //POST URL
  var createURL = () =>{
    urlShortModel.find()
    .exec()
    .then(docs =>{
      theData = docs;
      var doc = new urlShortModel({"shortURL_id": theData.length, "originalURL":req.body.url});
      theData = theData.filter((obj) => obj["originalURL"] === req.body.url);
      //checking if already exists in DB
      if(theData.length === 0){
        doc.save()
        .then(result =>{
          res.json(result);
          console.log('Entry in the DB created!')
        })
        .catch(err =>{
          console.log('SAVE ERROR: ' + err);
          res.json({"error":err});
        })
      }else{
        res.json({"error": `URL already exist in DB as ${theData[0].shortURL_id}`})
        console.log(`URL already exist in DB as ${theData[0].shortURL_id}`);
      }
    })
  }
});

//Get ALL URL that are in the DB at the moment
app.get('/api/shorturl', function(req, res){
    urlShortModel.find()
    .exec()
    .then(allURL =>{
      res.json(allURL);
})
      .catch(err => {
        console.log("Get All URL error: " + err);
        res.json({"error": err})
      }
)});

//Retrieve the URL
app.get('/api/shorturl/:id', function(req, res){
  let idToSearch = req.params.id;
 
  (function getURL(){
    urlShortModel.find(({"shortURL_id":idToSearch}))
    .exec()
    .then(url =>{
      res.redirect(url[0]["originalURL"])
})
    .catch(err =>{
      console.log("There was an error during GET URL: " + err);
      res.json({"error": err});
    })
})();
});


app.listen(port, function () {
  console.log(`Node.js listening ${port}...`);
});

