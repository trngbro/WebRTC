"use strict";

var axios = require('axios');

var Q = require('q');

var ALPHA_VANTAGE_API_KEY = 'XJ11NJLLJ07I69HA';

function fetchStockPrice(symbol) {
  var deferred = Q.defer();
  var apiUrl = "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=".concat(symbol, "&apikey=").concat(ALPHA_VANTAGE_API_KEY);
  axios.get(apiUrl).then(function (response) {
    var stockData = response.data['Global Quote'];

    if (stockData) {
      var price = stockData['05. price'];
      deferred.resolve(price);
    } else {
      deferred.reject(new Error("Unable to fetch stock data for symbol ".concat(symbol)));
    }
  })["catch"](function (error) {
    deferred.reject(error);
  });
  return deferred.promise;
}

var stockSymbol = 'AAPL';
fetchStockPrice(stockSymbol).then(function (price) {
  console.log("Current stock price of ".concat(stockSymbol, ": $").concat(price));
})["catch"](function (error) {
  console.error(error.message);
});