'use strict';

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(function (req, res){
      
    });
    
    // https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/[symbol]/quote

    app.get('/user/:id', function(req, res) {
      res.send('user' + req.params.id);    
    });
    
};
