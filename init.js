var express = require('express');
var http = require('http');
var path = require('path');
var fs = require('fs');
var app = express();
var session = require('express-session');
//var jade = require('jade');
app.set('port', process.env.PORT || 5000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
//app.use(express.logger('dev'));
//app.use(express.bodyParser());
//app.use(express.session());
var sys = require('sys');
 

var m = require('./includes/db_connection.js').Mysql;
m.getOne('ecs_users',{user_id:2},function(d){
	console.log(d);
});

app.get('/',function(req,res){
	 res.render('index', {});
});

var server = http.createServer(app);
server.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});

