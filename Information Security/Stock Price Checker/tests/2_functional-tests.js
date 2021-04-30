const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

    //access the URL
    suite('GET /api/stock-prices => stockData object', ()=>{
        //Test First Stock without the Like
        test('One Stock without like', ()=>{
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
        test('One Stock with like', ()=>{
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
        test('One like per stock per IP', ()=>{
            chai.request(server).get('/api/stock-prices')
            .query({stock: 'msft', like:true})
            .end((err,res)=>{
                assert.equal(res.body, 'Error!! Only one like per IP allowed per Stock, sorry!');
                done();
            });
        });
        
        //Test Second Stock
        test('Two Stocks', ()=>{
            chai.request(server).get('/api/stock-prices')
            .query({stock: ['msft', 'goog'], like:true})
            .end((err,res)=>{
                let stockData = res.body.stockData;
                if(stockData[0]['stock'] === 'msft'){
                    assert.equal(res.body['stockData'][0]['stock'], 'msft')
                    assert.equal(res.body['stockData'][0]['likes'], 1)
                    assert.equal(res.body['stockData'][0]['rel_likes'], 0)
                    assert.equal(res.body['stockData'][1]['stock'], 'goog')
                    assert.equal(res.body['stockData'][1]['likes'], 1)
                    assert.equal(res.body['stockData'][1]['rel_likes'], 0)
                }else{
                    assert.equal(res.body['stockData'][1]['stock'], 'msft')
                    assert.equal(res.body['stockData'][1]['likes'], 1)
                    assert.equal(res.body['stockData'][1]['rel_likes'], 0)
                    assert.equal(res.body['stockData'][0]['stock'], 'goog')
                    assert.equal(res.body['stockData'][0]['likes'], 1)
                    assert.equal(res.body['stockData'][0]['rel_likes'], 0)
                }
                done();
            });
        });
    })

});
