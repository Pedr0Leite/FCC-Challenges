const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

    //access the URL
    suite('GET /api/stock-prices => stockData object', ()=>{

        //Test First Stock without the Like
        test('One Stock without like', (done)=>{
            chai.request(server).get('/api/stock-prices')
            .query({stock: 'goog'})
            .end((err,res)=>{
                assert.equal(res.body['stockData']['stock'], 'goog')
                assert.isNotNull(res.body['stockData']['price'])
                assert.isNotNull(res.body['stockData']['likes'])
                done();
            });
        });

        //Test First Stock with the Like
        test('One Stock with like', (done)=>{
            chai.request(server).get('/api/stock-prices')
            .query({stock: 'msft', like:true})
            .end((err,res)=>{
                let stockData = res.body.stockData;
                assert.equal(res.body['stockData']['stock'], 'msft')
                assert.equal(res.body['stockData']['likes'], 1)
                done();
            });
        });
        
        //Test One like per Stock per Ip
        test('One like per stock per IP', (done)=>{
            chai.request(server).get('/api/stock-prices')
            .query({stock: 'goog', like:true})
            .end((err,res)=>{
            console.log('res :', res.body);
                assert.equal(res.body, 'Error!! Only one like per IP allowed per Stock, sorry!');
                done();
            });
        });
        
        //Test Two Stock
        test('Two stocks', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['aapl', 'amzn']})
        .end(function(err, res){
          let stockData = res.body['stockData']
          assert.isArray(stockData)
          /* Stocks can come in either order */
          if(stockData[0]['stock'] === 'aapl'){
            assert.equal(stockData[0]['stock'], 'aapl')
            assert.equal(stockData[0]['likes'], 0)
            assert.equal(stockData[0]['rel_likes'], 0)

            assert.equal(stockData[1]['stock'], 'amzn')
            assert.equal(stockData[1]['likes'], 0)
            assert.equal(stockData[1]['rel_likes'], 0)
          }else{
            assert.equal(stockData[1]['stock'], 'aapl')
            assert.equal(stockData[1]['likes'], 0)
            assert.equal(stockData[1]['rel_likes'], 0)

            assert.equal(stockData[0]['stock'], 'amzn')
            assert.equal(stockData[0]['likes'], 0)
            assert.equal(stockData[0]['rel_likes'], 0)
          }
          done()
        });
      });

        //Test Two Stocks with likes 
        test('Two stocks with like', function(finish) {
            chai.request(server)
            .get('/api/stock-prices')
            .query({stock: ['spot', 'amzn'], like: true})
            .end(function(err, res){
              let stockData = res.body.stockData
              if(stockData[0]['stock'] === 'spot'){
                assert.equal(stockData[0]['stock'], 'spot')
                assert.equal(stockData[0]['likes'], 1)
                assert.equal(stockData[0]['rel_likes'], 0)
                assert.equal(stockData[1]['stock'], 'amzn')
                assert.equal(stockData[1]['likes'], 1)
                assert.equal(stockData[1]['rel_likes'], 0)
              }else{
                assert.equal(stockData[1]['stock'], 'spot')
                assert.equal(stockData[1]['likes'], 1)
                assert.equal(stockData[1]['rel_likes'], 0)
                assert.equal(stockData[0]['stock'], 'amzn')
                assert.equal(stockData[0]['likes'], 1)
                assert.equal(stockData[0]['rel_likes'], 0)
              }
              finish()
            });
          });
    });
});
