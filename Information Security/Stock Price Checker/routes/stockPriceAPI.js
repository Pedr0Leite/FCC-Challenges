"use strict";

let mongooseDB = require("../database/mongo_db");
const addStock = mongooseDB.addStock;

const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

module.exports = function (app) {
  app.route("/api/stock-prices").get(function (req, res) {
    let responseObj = {};
    responseObj["stocksInfo"] = {};

    let stocks = [];

    //check box to determine if its to query 1 or 2 stocks
    let search2stocks = false;

    //response output
    let responseOutput = () => {
      return res.json(responseObj);
    };

    //Find or Update stock on DB
    let findOrUpdate = (stock, record, callbackF) => {

      addStock.findOneAndUpdate(
        { stock_name: stock, date: Date.now()},
        record,
        { new: true, upsert: true },
        (err, record) => {
          if (err) {
            console.log("FindOrUpdate err: ", err);
          } else if (!err && record) {
            if (search2stocks == false) {
              return callbackF(record, getFirstStock);
            }else{
              return callbackF(record, getSecondStock);
            }
          }
        }
      );
    };

    //Likes on a stock
    let likeOnStock = (stock, callbackF) => {
      addStock.findOne(
        { stock_name: stock},
        (err, record) => {
          if (err) {
            console.log("findOne err: ", err);
          // } else if (!err && record && record['ips'] && record['ips'].includes(req.ip)) {
          } else if (!err && record['ips'].includes(req.ip)) {
            return res.send('Error!! Only one like per IP allowed per Stock, sorry!');
          }else{
            //Make sure only one like on a stock per IP, add IP to DB
            let addLikeToStock = {
              $inc: {likes: 1},
              $push: {ips: req.ip}
            }
            callbackF(stock, addLikeToStock, stockValues);
          }
        }
      );
    };

    //Stock values
    let stockValues = (stockToGet, callbackF) => {
      var xhr = new XMLHttpRequest();
      let url = "https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/" + stockToGet['stock_name'] + "/quote";
      xhr.open("GET", url, true);
      xhr.onload = () => {
        let apiRes = JSON.parse(xhr.responseText);
        stockToGet["price"] = apiRes["latestPrice"];
        stockToGet["company_name"] = apiRes["companyName"];
        callbackF(stockToGet, responseOutput);
      };
      xhr.send();
    };

    //First Stock response
    let getFirstStock = (record, callbackF) => {
      responseObj["stocksInfo"]["stock"] = record["stock_name"];
      responseObj["stocksInfo"]["price"] = record["price"];
      responseObj["stocksInfo"]["likes"] = record["likes"];
      responseObj["stocksInfo"]["companyName"] = record["company_name"];
      callbackF();
    };

    //Sercond Stock response
    let getSecondStock = (record, callbackF) => {
      let secondStock = {};
      secondStock["stocksInfo"]["stock"] = record["stock_name"];
      secondStock["stocksInfo"]["price"] = record["price"];
      secondStock["stocksInfo"]["likes"] = record["likes"];
      secondStock["stocksInfo"]["companyName"] = record["company_name"];
      callbackF();
    };

    if (typeof req.query.stock === "string") {
      console.log('ONE STOCKS');
      //query one stock
      let stockNameFromQuery = req.query.stock;
      
      if(req.query.like && req.query.like === 'true'){
      //if its to like the stock
      likeOnStock(stockNameFromQuery, findOrUpdate);

      }else{
        //If its only to gather data from stocks
        let recordInfo = {};
        findOrUpdate(stockNameFromQuery, recordInfo, stockValues);
      }


    } else if (Array.isArray(req.query.stock)) {
      //query two stocks
      search2stocks = true;
      console.log('TWO STOCKS');
      //Stock 1
      let stockNameFromQueryOne = req.query.stock[0];
      if(req.query.like == "true"){
        likeOnStock(stockNameFromQueryOne, findOrUpdate);
      }else{
        let recordInfo = {};
        findOrUpdate(stockNameFromQueryOne, recordInfo, stockValues);
      }
      
      //Stock 2
      let stockNameFromQueryTwo = req.query.stock[1];
      if(req.query.like == "true"){
        likeOnStock(stockNameFromQueryTwo, findOrUpdate);
      }else{
        let recordInfo = {};
        findOrUpdate(stockNameFromQueryTwo, recordInfo, stockValues);
      }
    }
  });
};
