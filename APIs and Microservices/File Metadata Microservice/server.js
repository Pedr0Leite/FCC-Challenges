'use strict';

var express = require('express');
var cors = require('cors');
var multer = require('multer');

// var path = require('path'); //This is used for local storage only
// const storageMulter = multer.diskStorage({
//   destination: "./img_storage",
//   filename: (req, file, cb) => {cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));}
// });

const upload = multer({
  storage: multer.memoryStorage() //storageMulter var if this needs to be saved localy.
  // limits: {fileSize: 100000000} //This is used to set a file size limit
}).single('upfile');

var app = express();

app.use(cors());
app.use('/public', express.static(process.cwd() + '/public'));

//GET
app.get('/', function (req, res) {
     res.sendFile(process.cwd() + '/views/index.html');
  });

app.get('/hello', function(req, res){
  res.json({greetings: "Hello, API"});
});

//POST
app.post('/api/fileanalyse', function(req, res){
  upload(req, res, (err)=>{
    console.log('file: ' , req.file) 
    if(err){
    res.json({"error":err});
  }else{
    if(req.file == undefined){
      res.json({"error":"Error: No File Selected!"});
    }else{
      console.log('file: ' , req.file) 
      let responseObj = {
        "name": req.file.originalname,
        "type": req.file.mimetype,
        "size": req.file.size
      };
      res.json(responseObj);
    }
  }   
  })
});

app.listen(process.env.PORT || 3000, function () {
  console.log('Node.js listening ...');
});


//1. I can submit a form object that includes a file upload.
// 2. The from file input field has the "name" attribute set to "upfile". We rely on this in testing.
// 3. When I submit something, I will receive the file name, and size in bytes within the JSON response.