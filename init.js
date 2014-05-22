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
var RES_SUCCESS = 0;
var RES_FAIL = 1;
var STATIC_DOMAIN = 'http://s1.static.mescake.com/';
var STATIC_DOMAIN = 'http://10.237.113.51/';
var DEBUG = false;
if(DEBUG){
   STATIC_DOMAIN = 'http://static.n.mescake.com/';
}
var Res = {
	ajax:function(res,d){
		res.send(d);
	},
	page:function(res,d){
		var d = d||{};
		d.STATIC_DOMAIN = STATIC_DOMAIN;
		res.render(d.view,d);
	}
}

app.get('/',function(req,res){
	 var host = res.req.headers.host;
	 var pageview = require('./lib/pageview.js').PageView;
	 var htmlToText = require('html-to-text');

	 pageview.getGoodsData(function(d1,d2){
		for(var i in d1){
			if(d1[i]){
				d1[i].url = 'http://www.mescake.com/themes/default/images/sgoods/'+d1[i].goods_sn.substring(0,3)+'.jpg';
			}
			if(d1[i]){
				d1[i].goods_desc = htmlToText.fromString(d1[i].goods_desc);
			}
		}
		Res.page(res,{
			view:'index',
			goodsData:d1,
			catoData:d2
		});
	 });
	 
});

app.get('/getIndexDataAnsyc',function(req,res){
	 var pageview = require('./lib/pageview.js').PageView;
	 pageview.getGoodsData(function(d1,d2){
		res.send({
			code:RES_SUCCESS,
			goodsData:d1,
			catoData:d2
		});
	 });
});

app.get('/getGoodsAttrAnsyc',function(req,res){
	 var goodsId = req.query.id;
	 var goods = require('./lib/goods.js').Goods;
	 goods.getGoodsAttrData(goodsId,function(d){
		 Res.ajax(res,{
			code:RES_SUCCESS,
			data:d
		});
	 });
});


app.get('/cake',function(req,res){
	  var pageview = require('./lib/pageview.js').PageView;
	  var goodsId = req.query.id;
	  pageview.getGoodsDetailData(goodsId,function(d,err){
		if(err){
			res.redirect('/');
		}else{
			var filePath = './tmpl/cake_'+goodsId+'.htm';
			fs.exists(filePath, function(exists) {
				if(exists){
					var tmpl = fs.readFileSync(filePath,'utf-8');
					tmpl = tmpl.replace(/\{STATIC_DOMAIN\}/gi,STATIC_DOMAIN);
					
					Res.page(res,{
						view:'goods_detail',
						goodsId:goodsId,
						goods:d.goods,
						matrial:d.goodsattr.attr_value,
						tmpl:tmpl
					});
				}else{
					res.redirect('/');
				}
			});

		}
	  });
		

});

var server = http.createServer(app);
server.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});

