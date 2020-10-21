//Env
const dotenv = require("dotenv").config({ path: ".env" });
var port = process.env.PORT || 3000;
const URI = process.env.MONGO_URI;

//Package
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
// var shortId = require('shortid');
const bodyParser = require("body-parser");
// const mongo = require('mongodb').MongoClient;

// DB connection
// mongoose.connect(mongoURI || 'mongodb://localhost/exercise-track' )
mongoose.connect(
  URI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err, database) => {
    if (err) {
      console.log("Error loading DB:", err);
      throw err;
    } else {
      console.log("Database loaded:", URI);
      db = database;
    }
  }
);

//SCHEMAs
// const Schema = mongoose.Schema;
let addExerciseSchema = new mongoose.Schema({
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: String,
});

let userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  log: [addExerciseSchema],
});

//Models
let newUser = mongoose.model("newUser", userSchema);
let addExercise = mongoose.model("addExercise", addExerciseSchema);

app.use(cors());

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

//GET
//Get ALL Users that are in the DB at the moment
app.get("/api/exercise/users", function (req, res) {
  console.log(req.params);
  newUser.find({}, (error, arrayOfUsers) => {
    if (error) {
      return res.json({
        error: "No Users found",
      });
    } else {
      console.log("All Users");
      console.log("Array: ", arrayOfUsers);
      res.json(arrayOfUsers);
    }
  });
});

//Get a specific user in the DB
app.get("/api/exercise/log", function (req, res) {
  //?{userId}[&from][&to][&limit]
  newUser.findById(req.query.userId, (error, arrayOfUsers) => {
    if (error) {
      return res.json({
        error: "No Users found",
      });
    } else {
      let fromDate = new Date(req.query.from);
      let toDate = new Date(req.query.to);
      let responseLogExercise = {};

      if (fromDate != "Invalid Date" || toDate != "Invalid Date") {
        var resultFilterDate = arrayOfUsers.log.filter(function (value) {
          let date = new Date(value.date);
          let dateRight = toDate;
          let dateLeft = fromDate;
          if (dateLeft == "Invalid Date" && dateRight != "Invalid Date") {
            return (date <= dateRight);
          } else if (dateLeft != "Invalid Date" && dateRight == "Invalid Date") {
            return (date >= dateLeft);
          } else {
            return (date >= dateLeft && date <= dateRight);
          }
        });
        let arrayOfUsersLog = req.query.limit == undefined ? resultFilterDate : resultFilterDate.slice(0, req.query.limit);
        let count = arrayOfUsers.log.filter((value) => { return value; }).length;
        responseLogExercise["_id"] = arrayOfUsers.id;
        responseLogExercise["username"] = arrayOfUsers.username;
        responseLogExercise["count"] = count;
        responseLogExercise["log"] = arrayOfUsersLog;
      } else {
        let arrayOfUsersLog = req.query.limit == undefined ? arrayOfUsers.log : arrayOfUsers.log.slice(0, req.query.limit);
        let count = arrayOfUsers.log.filter((value) => { return value; }).length;
        responseLogExercise["_id"] = arrayOfUsers.id;
        responseLogExercise["username"] = arrayOfUsers.username;
        responseLogExercise["count"] = count;
        responseLogExercise["log"] = arrayOfUsersLog;
      }
      res.json(responseLogExercise);
    }
  });
});

//POST
//Post New User
app.post(
  "/api/exercise/new-user",
  bodyParser.urlencoded({ extended: false }),
  (req, res) => {
    newUser.find({ username: req.body.username }, (error, newUserCheck) => {
      let userInDB = newUserCheck;
      if (userInDB == undefined || userInDB == "") {
        let newUserToDB = new newUser({ username: req.body.username });
        // console.log("newUserToDB: ", newUserToDB);
        newUserToDB.save((error, savedUser) => {
          if (error) {
            console.log("Error! -> " + error);
            res.json(error);
          } else {
            let responseUserObj = {};
            responseUserObj["username"] = savedUser.username;
            responseUserObj["_id"] = savedUser.id;
            res.json(responseUserObj);
          }
        });
      } else {
        res.send("User Already Exist in DB");
      }
    });
  }
);

//Post New Exercise
app.post(
  "/api/exercise/add",
  bodyParser.urlencoded({ extended: false }),
  (req, res) => {
    let exerciseToAdd = new addExercise({
      description: req.body.description,
      duration: req.body.duration,
      date: req.body.date || new Date().toISOString().slice(0, 10),
    });
    newUser.findByIdAndUpdate(
      req.body.userId,
      { $push: { log: exerciseToAdd } },
      { new: true },
      (error, newExercise) => {
        if (error) {
          console.log("Error! -> " + error);
          res.json(error);
        } else {
          let responseExerciseObj = {};
          responseExerciseObj["_id"] = newExercise.id;
          responseExerciseObj["username"] = newExercise.username;
          responseExerciseObj["description"] = newExercise.log[0].description;
          responseExerciseObj["duration"] = newExercise.log[0].duration;
          responseExerciseObj["date"] = new Date(
            newExercise.log[0].date
          ).toDateString();
          res.json(responseExerciseObj);
        }
      }
    );
  }
);

//Port view
const listener = app.listen(port, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
