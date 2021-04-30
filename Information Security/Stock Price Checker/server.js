// 'use strict';
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmetjs = require("helmet");

const apiRoutes = require("./routes/api.js");
const stockRoutes = require("./routes/stockPriceAPI.js");
const fccTestingRoutes = require("./routes/fcctesting.js");
const runner = require("./test-runner");

const app = express();

app.use("/public", express.static(process.cwd() + "/public"));

//Security - Helmet
app.use(helmetjs.hidePoweredBy());
app.use(helmetjs.frameguard({ action: "deny" }));
app.use(helmetjs.xssFilter());
app.use(helmetjs.noSniff());
app.use(helmetjs.dnsPrefetchControl());
app.use(helmetjs.noCache());
app.use(helmetjs.ieNoOpen());
app.use(
  helmetjs.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'"],
    },
  })
);

//For FCC testing purposes only
app.use(cors({ origin: "*" }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Index page (static HTML)
app.route("/").get(function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API
apiRoutes(app);
stockRoutes(app);

//404 Not Found Middleware
app.use(function (req, res, next) {
  res.status(404).type("text").send("Not Found");
});

//Start our server and tests!
app.listen(process.env.PORT || 3000, function () {
  console.log("Listening on port " + process.env.PORT);
  if (process.env.NODE_ENV === "test") {
    console.log("Running Tests...");
    setTimeout(function () {
      try {
        runner.run();
      } catch (e) {
        var error = e;
        console.log("Tests are not valid:");
        console.log(error);
      }
    }, 3500);
  }
});

module.exports = app; //for testing
