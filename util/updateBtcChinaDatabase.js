

var request = require('request');
var sqlite3 = require('sqlite3');
var sprintf = require('sprintf').sprintf;

var fetched_ids = {};

var db = new sqlite3.Database('data/btcchina.db');

//var starting_tid = 1102666;

var starting_tid = -1;


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

 };

var insertToDatabase = function(results_array) {
  "use strict";
  if( results_array instanceof Array )  {    
    var i =0;
    for (; i < results_array.length; ++i)    {  
      if(results_array[i] != null)      {
        var select_query = 'SELECT tid FROM tx WHERE tid=' + parseInt(results_array[i]['tid']);       
        db.all(select_query, function(err, data) {
          if(err) {
            throw err;
          }
          if( data != null && data.length != 0 ) {
            fetched_ids[parseInt(data[0]['tid'])] = true;
          }
        });
      }
    }
    for (i = 0; i < results_array.length; i += 1) {  
      if(results_array[i] != null && !fetched_ids[parseInt(results_array[i]['tid'])]) {
        var insert_query = sprintf('INSERT INTO tx ( date, price, amount, tid, type ) VALUES (\'%s\', %f, %f, %d, \'%s\')', results_array[i]['date'], parseFloat(results_array[i]['price']), parseFloat(results_array[i]['amount']) , parseInt(results_array[i]['tid']) , results_array[i]['type'] );
        db.run(insert_query);
      }    
    }

    if(results_array.length == 100) {
      getLatestTrades(parseInt(results_array[99]['tid']) , insertToDatabase);
    } else {
      db.close();
    }

  }
};


if( process.argv.length > 2 ) {
  starting_tid = parseInt(process.argv[3]);
  getLatestTrades(starting_tid, insertToDatabase);
}
else {  
  db.all('SELECT max(tid) FROM tx;', function(err, data) {
    if (err)
      throw err;
    if(data.length > 0) {
      starting_tid = parseInt(data[0]['max(tid)']);
    }
    getLatestTrades(starting_tid, insertToDatabase);
  } );
}




