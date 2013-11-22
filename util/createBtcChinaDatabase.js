var sqlite3 = require('sqlite3');

var db = new sqlite3.Database('data/btcchina.db');

//{"date":"1308930479","price":99,"amount":0.98,"tid":"99","type":"sell"}

db.run("CREATE TABLE tx ( date TEXT, price REAL, amount REAL, tid INTEGER UNIQUE, type TEXT )", function () {
    // "use strict";
    // var insStmt, i;

    // insStmt = db.prepare('INSERT INTO posts (name, message) VALUES (?, ?)');
    // for (i = 0; i < data.length; i += 1) {
    //     insStmt.run(data[i]);
    // }
    // insStmt.finalize();
    db.close();
});
