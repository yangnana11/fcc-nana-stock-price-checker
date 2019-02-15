/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    
    suite('GET /api/stock-prices => stockData object', function() {
      
      test('1 stock', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog'})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.property(res.body, 'stockData', 'Stock data has to be existed');
          
          done();
        });
      });
      
      test('1 stock with like', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog', like: true})
        .end(function(err, res){
          assert.equal(res.status, 200);    
          assert.property(res.body, 'stock', 'Stock data has to be existed');
          
          done();
        });
      });
      
      test('1 stock with like again (ensure likes arent double counted)', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog', like: true})
        .end(function(err, res){
          assert.equal(res.status, 200);          
          assert.property(res.body, 'message', 'Can not like again');                 
          
          done();
        });
      });
      
      test('2 stocks', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['goog', 'msft']})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.property(res.body, 'stockData', 'Stock data has to be existed');
          
          done();
        });
      });
      
      test('2 stocks with like', function(done) {        
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['swir', 'ino'], like: true})
        .end(function(err, res){
          assert.equal(res.status, 200);             
          assert.property(res.body, 'stockData', 'Stock data has to be existed');
          done();
        });
      });
      
    });

});
