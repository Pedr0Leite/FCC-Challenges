"use strict";

let mongooseDB = require("../database/mongo_db");
const addStock = mongooseDB.addStock;

const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

module.exports = function (app) {
  app.route("/api/stock-prices").get(function (req, res) {
    let responseObj = {};
    responseObj["stockData"] = {};

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
          // console.log('req.ip :', req.ip);
          if (!err && record && record['ips'] && record['ips'].includes(req.ip)) {
          return res.json('Error!! Only one like per IP allowed per Stock, sorry!');
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
      responseObj["stockData"]["stock"] = record["stock_name"];
      responseObj["stockData"]["price"] = record["price"];
      responseObj["stockData"]["likes"] = record["likes"];
      responseObj["stockData"]["companyName"] = record["company_name"];
      callbackF();
    };
    
    //Sercond Stock response
    let getSecondStock = (record, callbackF) => {
      let secondStock = {};
      secondStock["stock"] = record["stock_name"];
      secondStock["price"] = record["price"];
      secondStock["likes"] = record["likes"];
      secondStock["companyName"] = record["company_name"];
      stocks.push(secondStock);
      //if there are two stocks, calculate the difference between both likes
      if(stocks.length == 2){
        stocks[0]['rel_likes'] = stocks[0]['likes'] - stocks[1]['likes'];
        stocks[1]['rel_likes'] = stocks[1]['likes'] - stocks[0]['likes'];
        responseObj['stockData'] = stocks;
        callbackF();
      }else{
        //else, do nothing
        return
      }
    };

    if (typeof req.query.stock === "string") {
      console.log('ONE STOCKS PART');
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
      console.log('TWO STOCKS PART');
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
