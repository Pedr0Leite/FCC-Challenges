const mongoose = require('mongoose');
const schema = require('./mongo_db_schema');

const addStockSchema = schema.addStockSchema

require('dotenv').config();

const URI = process.env.DB;

mongoose.connect(
    URI,
    { useNewUrlParser: true, useUnifiedTopology: true , useFindAndModify: false},
    (err, database) => {
      if (err) {
        console.log("Error loading DB:", err);
        throw err;
      } else {
        console.log("Database loaded");
        db = database;
      }
    }
  );
  
  //Models
  let addStock = mongoose.model("addStock", addStockSchema);

module.exports = {mongoose , addStock}; //for testing