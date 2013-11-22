var moment = require('moment');

console.log( 'YYYY-MM-DD\n' );

if(process.argv.length > 2)
{
	for(var i=2; i < process.argv.length; i++) {
		console.log(process.argv[i] + ' ' + moment(process.argv[i], "YYYY-MM-DD").unix());
	}
}
