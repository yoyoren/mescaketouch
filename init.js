//视图调试模式
var VIEW_DEBUG = true;

//开发环境调试
var DEV_DEBUG = true;

//测试机发布环境
var TEST_RELEASE = false;

//线上灰度的发布环境
var PREVIEW_RELEASE = false;

var express = require('express');
var http = require('http');
var path = require('path');
var fs = require('fs');
var app = express();
var session = require('express-session');
var compression = require('compression');
var cookieParser = require('cookie-parser');
var sys = require('sys');
var viewPath =  '/release_views';

app.set('port', process.env.PORT || 5000);
app.set('views', __dirname +viewPath );
app.set('view engine', 'ejs');
//app.use(express.logger('dev'));
//app.use(express.bodyParser());
app.use(cookieParser('mescakemobile'));
app.use(session({
    secret: 'mescakemobile',
	proxy: false // if you do SSL outside of node.
}));
app.use(compression({
 threshold: 1024
}));


var RES_SUCCESS = 0;
var RES_FAIL = 1;
var STATIC_DOMAIN = 'http://s1.static.mescake.com/';
var IMG_DOMAIN = 'http://touch.mescake.com/';

if(VIEW_DEBUG){
   viewPath = '/views';
   app.set('views', __dirname +viewPath );
}

if(DEV_DEBUG){
   STATIC_DOMAIN = 'http://10.237.113.51/';
}

if(TEST_RELEASE){
   STATIC_DOMAIN = 'http://static.n.mescake.com/';
}

if(PREVIEW_RELEASE){
  STATIC_DOMAIN = 'http://static.preview.mescake.com/';
  IMG_DOMAIN = 'http://touch.n.mescake.com/';
}

var Res = {
	ajax:function(res,d){
		res.send(d);
	},
	page:function(res,d){
		var d = d||{};
		d.STATIC_DOMAIN = STATIC_DOMAIN;
		d.DEBUG = DEV_DEBUG;
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
				d1[i].url =IMG_DOMAIN + d1[i].goods_sn.substring(0,3)+'.jpg';
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
	 if(!goodsId||isNaN(goodsId)){
		res.redirect('/');
		return;
	}
	 var goods = require('./lib/goods.js').Goods;
	 goods.getGoodsAttrData(goodsId,function(d){
		 Res.ajax(res,{
			code:RES_SUCCESS,
			data:d
		});
	 });
});

app.get('/login',function(req,res){
	Res.page(res,{
		view:'login'
	});
});

app.get('/account',function(req,res){
	Res.page(res,{
		view:'account'
	});
});

app.get('/myorder',function(req,res){

	Res.page(res,{
		view:'myorder'
	});
});

app.get('/checkout',function(req,res){
	var time = (new Date()).getTime();
	console.log('checkout'+time);
	Res.page(res,{
		view:'checkout_v2',
		date:time
	});
});



app.get('/orderdetail',function(req,res){
	var orderId = req.query.id;
	if(!orderId){
		res.redirect('/');
	}else{
		Res.page(res,{
			view:'orderdetail',
			orderId:orderId
		});
	}
});

app.get('/addressmanager',function(req,res){
	Res.page(res,{
		view:'addressmanager'
	});
});

app.get('/forgetpassword',function(req,res){
	Res.page(res,{
		view:'forgetpassword'
	});
});

app.get('/changepassword',function(req,res){
	Res.page(res,{
		view:'changepassword'
	});
});

app.get('/changemobile',function(req,res){
	Res.page(res,{
		view:'changemobile'
	});
});

app.get('/charge',function(req,res){
	Res.page(res,{
		view:'charge'
	});
});

app.get('/register',function(req,res){
	Res.page(res,{
		view:'register'
	});
});

app.get('/setpassword',function(req,res){
	Res.page(res,{
		view:'setpassword'
	});
});

app.get('/done',function(req,res){
    var orderId = req.query.oid;
	if(!orderId){
	   res.redirect('/');
	   return;
	}
	console.log('done/'+orderId);
	Res.page(res,{
		view:'done',
		orderId:orderId
	});
});

app.get('/shopcar',function(req,res){
	console.log('shopcar');
	Res.page(res,{
		view:'shopcar'
	});
});

app.get('/shopcarempty',function(req,res){
	Res.page(res,{
		view:'shopcarempty'
	});
});


app.get('/newaddress',function(req,res){
	Res.page(res,{
		view:'newaddress_v2'
	});
});
app.get('/cake',function(req,res){
	  var pageview = require('./lib/pageview.js').PageView;
	  var goodsId = req.query.id;
      if(!goodsId||isNaN(goodsId)){
	   res.redirect('/');
	   return;
	  }
	  pageview.getGoodsDetailData(goodsId,function(d,err){
		if(err){
			res.redirect('/');
		}else{
			var filePath = './tmpl/cake_'+goodsId+'.htm';
			fs.exists(filePath, function(exists) {
				if(exists){
					var tmpl = fs.readFileSync(filePath,'utf-8');
					tmpl = tmpl.replace(/\{STATIC_DOMAIN\}/gi,STATIC_DOMAIN);
					tmpl = tmpl.replace(/src/gi,' class="lazyload" data-src');
					d.goodsattr = d.goodsattr||{};
					if(goodsId==68){
					   d.goodsattr.attr_value = 188;
					}
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

