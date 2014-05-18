var dbName = 'mescake';
var password = '';
var mysql = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password:password,
  database:dbName
});


var Mysql = {
	connect:function(){
		return connection.connect();
	},
	close:function(){
		return connection.close();
	},
	query:function(sql,callback,error){
		//var _c = Mysql.connect();
		connection.query(sql, function(err, rows, fields) {
		  if (err) {
			  throw err;
		  }
		  callback(rows,fields);
		});
	},
	
	//m.getOne('ecs_users',{user_id:2},function(d){
	//console.log(d);
	//});
	getOne:function(table,condition,callback){
	  
	  var sql = 'SELECT * FROM {TABLE} WHERE {CONDITION} LIMIT 0,1';
	  var con = [];
	  for(var c in condition){
		  con.push(c+'='+condition[c]);
	  }
	  con = con.join(' AND ');
	  sql = sql.replace('{TABLE}',table);
	  sql = sql.replace('{CONDITION}',con);

	  this.query(sql,function(rows,fields){
		callback(rows[0]);
	  });
	},

	getAll:function(table,condition,callback){
	  var sql = 'SELECT * FROM {TABLE} WHERE {CONDITION}';
	  var con = [];
	  for(var c in condition){
		  con.push(c+'='+condition[c]);
	  }
	  con = con.join(' AND ');
	  sql = sql.replace('{TABLE}',table);
	  sql = sql.replace('{CONDITION}',con);

	  this.query(sql,function(rows,fields){
		callback(rows);
	  });
	}

}
exports.Mysql = Mysql;
