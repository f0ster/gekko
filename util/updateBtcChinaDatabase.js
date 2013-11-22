var request = require('request');
var sqlite3 = require('sqlite3');
var sprintf = require('sprintf').sprintf;

var starting_tid = 1102666;

var db = new sqlite3.Database('data/btcchina.db');

var getLatestTrades = function(last_tid, callback){

   var options = {};
   options.uri= "https://data.btcchina.com/data/historydata?since=" + last_tid;
   options.agent= false;
   options.headers=[];
   if (typeof callback == "function") {
    request(options, function (err, res, body) {
       if (res && res.statusCode == 200) {
         callback(JSON.parse(body));
       } else if(res){
         callback(new Error("Request failed with " + res.statusCode));
       } else {
         callback(new Error("Request failed"));
       }
     });

   } else {
     var parser = JSONStream.parse(["data", true]);
     request.get(options).pipe(parser);
     return parser;
   }

 }

var insertToDatabase = function(results_array) {
  if( results_array instanceof Array) {
    "use strict";
    var i;    
    for (i = 0; i < results_array.length; i++) {      
      db.run(sprintf('INSERT INTO tx ( date, price, amount, tid, type ) VALUES (\'%s\', %f, %f, %d, \'%s\')', results_array[i]['date'], parseFloat(results_array[i]['price']), parseFloat(results_array[i]['amount']) , parseInt(results_array[i]['tid']) , results_array[i]['type'] ));
    }

    if(results_array.length == 100) {
      getLatestTrades(parseInt(results_array[99]['tid']) , insertToDatabase);
    } else {
      db.close();
    }
  }
}


getLatestTrades(starting_tid, insertToDatabase);

