/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
const fetch = require('node-fetch');
const mongoose = require('mongoose');
const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

mongoose.connect(CONNECTION_STRING, { useNewUrlParser: true });

module.exports = function (app) {
  const stockSchema = new mongoose.Schema({
    stock: {
      type: String,
      required: true
    },
    ip: {
      type: String    
    }
  }, {
    versionKey: false // You should be aware of the outcome after set to false
  });
  var Stock = mongoose.model('Stock',stockSchema);
  
  app.route('/api/stock-prices')
    .get(function (req, res){   
      let ip = '';
      if (req.headers.hasOwnProperty('x-forwarded-for')) {
        let header = req.headers['x-forwarded-for'].split(',');
        ip = header[0];
      } else {        
        let header = req.headers.host.split(':');
        ip = header[0];
      }      
      let {stock} = req.query;      
      if (typeof stock == 'string') {        
        fetch('https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol='+stock+'&apikey=0L4A9YRBNGEPEEVI')
        .then(res => res.json())
        .then(body => {                   
          let item = body[Object.keys(body)[1]];                
          let priceJson = item[Object.keys(item)[0]];        
          let price = (parseFloat(priceJson['2. high']) + parseFloat(priceJson['3. low'])) / 2;
          if (req.query.like == undefined) {            
            Stock.find({stock: stock}, (err, result) => {
              if (err) {
                res.json(err);
              } else {
                res.json({
                  stockData: {
                    stock: stock,                    
                    price: parseFloat(price).toFixed(2),
                    likes: result.length
                  }
                });                
              }
            });          
          } else {            
            if (req.query.like) {
              Stock.find({stock: stock, ip: ip}, (err, result) => {
                if (err) {
                  res.json(err);
                } else {
                  if (result.length>0) {
                    res.json({message: 'you already liked'});
                  } else {
                    let stockItem = new Stock({
                      stock: stock,
                      ip: ip
                    });
                    stockItem.save((err, result) => {
                      if (err) {
                        res.json(err);
                      } else {
                        res.json(result);
                      }
                    });
                  }
                }
              });              
            } else {
              res.json({
                message: 'invalid like value'
              });
            }
          }
        });      
      } else {
        if (req.query.like == undefined) {
          fetch('https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol='+stock[0]+'&apikey=0L4A9YRBNGEPEEVI')
          .then(res => res.json())
          .then(body => {                              
            let item = body[Object.keys(body)[1]];                
            let priceJson = item[Object.keys(item)[0]];        
            let price1 = (parseFloat(priceJson['2. high']) + parseFloat(priceJson['3. low'])) / 2;
            fetch('https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol='+stock[1]+'&apikey=0L4A9YRBNGEPEEVI')
            .then(res => res.text())
            .then(body => {                         
              item = body[Object.keys(body)[1]];                
              priceJson = item[Object.keys(item)[0]];        
              let price2 = (parseFloat(priceJson['2. high']) + parseFloat(priceJson['3. low'])) / 2;                        
              let output = [];
              Stock.find({stock: stock[0]}, (err0, result0) => {
                if (err0) {
                  output.push(err0);
                  res.json({
                    stockData: output
                  });
                } else {
                  Stock.find({stock: stock[1]}, (err1, result1) => {
                    if (err1) {
                      output.push(err1);
                      res.json({
                        stockData: output
                      });
                    } else {                      
                      output.push({
                        stock: stock[0],
                        price: price1,
                        rel_likes: result0.length - result1.length
                      });
                      output.push({
                        stock: stock[1],
                        price: price2,
                        rel_likes: result1.length - result0.length
                      });
                      res.json({
                        stockData: output
                      });
                    }
                  });
                }
              });
            });
          });
        } else {
          var output = [];
          if (req.query.like) {
            Stock.find({stock: {$in: stock}}, (err, result) => {
              if (err) {
                res.json(err);
              } else {
                if (result.length>0) {
                  res.json({message: 'you already liked'});
                } else {
                  let input = [
                    {
                      stock: stock[0],
                      ip: ip
                    },
                    {
                      stock: stock[1],
                      ip: ip
                    },
                  ];
                  Stock.create(input, (err, result) => {
                    if (err) {
                      res.json(err);
                    } else {
                      console.log(result);
                      res.json({stockData: result});
                    }
                  });
                }
              }
            })                              
          } else {
            res.json({
              message: 'invalid like value'
            });
          }
        }
      }
      
    });
    
};
