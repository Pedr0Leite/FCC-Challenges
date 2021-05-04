var mongoose = require('mongoose');

const schemas = {
//SCHEMAs
addStockSchema: new mongoose.Schema({
    stock_name: { type: String, required: true },
    likes: { type: Number, default: 0 },
    ips: [String],
    date: {type: Date},
  })
};

module.exports = schemas; //for testing