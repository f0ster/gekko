var sqlite3 = require('sqlite3');
var moment = require('moment');
var _ = require('underscore');
var fs = require('fs');


var candleDurationVal, candleDurationUnits, startTime, endTime = 0;
if(process.argv.length == 2) {
  candleDuration = 60;
  candleDurationUnits = 'minutes';
} else if(process.argv.length != 6) {
  console.log('node candleCalculator.js <start_time_tid> <end_time_tid> <duration> <unit e.g, minutes >\n');
  process.exit(1);
} else {
  candleDurationVal = parseInt(process.argv[4]);
  candleDurationUnits = process.argv[5];
  startTime = moment.unix(process.argv[2]);
  endTime = moment.unix(process.argv[3]);
}


var output = 'data/candles-' + moment.unix(startTime).format('YYYY-MM-DD') + '_' + moment.unix(endTime).format('YYYY-MM-DD') + '_' + candleDurationVal + '-' + candleDurationUnits + '.csv'; // csv file with your candles




var db = new sqlite3.Database('data/btcchina.db');
var i = 0;

var dateformat = 'YYYY-MM-DD HH:mm:ss'
var now = function() {
  return moment().format(dateformat);
}

var toMicro = function(moment) {
  return moment.valueOf() * 1000;
}

////////////////////////////////////////////
// candle vars
////////////////////////////////////////////
// example with string
// var startTime = moment("2012-10-30", "YYYY-MM-DD");
// example with unix timestamp
//var startTime = moment.unix(1312268400)
// candle duration
//var endTime = moment.unix(1325372400);
var candleDuration = moment.duration(candleDurationVal, candleDurationUnits);

var currentCandleTime = startTime;

////////////////////////////////////////////
// process & store candles
////////////////////////////////////////////
var csv = '';
fs.writeFileSync(output, 'date,open,high,low,close\n');
var calculateCandle = function(err, trades) {
  if(err)
    throw err;

  if(prices.length > 0) {
    var prices = _.pluck(trades, 'price');
    var open = _.first(prices);
    var high = _.max(prices);
    var low = _.min(prices);
    var close = _.last(prices);
    console.log(now(), 'calculated candle ', i, '\tOHCL:', open, high, low, close);

    //1309107600,17.51001,17.51001,15,17 //e.g
    csv += [
      currentCandleTime.format('X') - (candleDuration),
      open,
      high,
      low,
      close
    ].join(',') + '\n';

  }
  // recursive
  ask();
}

////////////////////////////////////////////
// write csv
////////////////////////////////////////////
var write = function() {
  console.log(now(), 'going to write last 10 candles to output')
  fs.appendFileSync(output, csv);
  console.log(now(), 'done, written', i, 'candles so far');
  csv = '';
}
var done = function() {
  console.log(now(), 'writing last candles');
  fs.appendFileSync(output, csv);
  console.log(now(), 'all done!');
}

////////////////////////////////////////////
// create sql query
////////////////////////////////////////////
var table = 'tx';
var joins = null;
var columns = null; // means all culumns

var whereClause;
var whereValues = null; // this one not working somehow, hacky workaround
var orderBy = null;
var limit = null;
var distinct = false;

var ask = function() {
  
  if(currentCandleTime > endTime.clone().subtract(candleDuration))
    return done();

  if(++i % 10 === 0)
    write();

  // epoch db time is in seconds, moments are in milli by default, take a couple orders of magnitude
  var from = currentCandleTime.valueOf() / 1000;
  var to = (currentCandleTime.add(candleDuration)).valueOf() / 1000;
  var query = 'SELECT * FROM tx WHERE date > ' + from + ' and date < ' + to +';';
  
  db.all(query, calculateCandle );

}

console.log(now(), 'starting candle calculator');
console.log(now(), 'beginning from:', currentCandleTime.format(dateformat));
console.log(now(), 'ending at:', endTime.format(dateformat));
console.log();
console.log();
ask();