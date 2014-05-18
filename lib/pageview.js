var fs = require('fs');
var async = require('async');
var Mysql = require('../includes/db_connection.js').Mysql;
var PageView = {
	readIndexConfig:function(){
		var string = fs.readFileSync('goodsconfig.json','utf-8');
		return JSON.parse(string,true);
	},
	getGoodsDetailData:function(goodsId,callback){
		Mysql.getOne('ecs_goods',{goods_id:goodsId},function(d){
			callback(d);
		});
	},

	getGoodsAttrData:function(goodsId,callback){
		Mysql.getAll('ecs_goods_attr',{goods_id:goodsId},function(d){
			callback(d);
		});
	},
	
	getGoodsData:function(callback){
		var config = this.readIndexConfig();
		var cat = config['party'].cato;
		var fnArray = [];
		var staffData = {};
		for(var cat in config){
			var currCato = config[cat].cato;
			for(var i=0;i<currCato.length;i++){
			   var currCatoData = currCato[i].data;
			   for(var j=0;j<currCatoData.length;j++){
				  var fn = (function(){
					var goodsId = currCatoData[j];
					return function(fn){
						if(!staffData[goodsId]){
							Mysql.getOne('ecs_goods',{goods_id:goodsId},function(d){
								  staffData[goodsId]  = d;
								  return fn && fn(null);
							 });
						}
					  }
				  })();
				  
				  
				  fnArray.push(fn);
			   }
			}
		}
	
		async.parallel(fnArray,function(){
			callback(staffData,config);
		});
	}

}
//PageView.getGoodsData();
exports.PageView = PageView;