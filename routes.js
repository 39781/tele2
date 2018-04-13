var express 		= require('express');
var router			= express.Router();	 

var fs 				= require("fs");	
var request			= require('request');
var path			= require("path");	
var checksum 		= require('./model/checksum');
var config 			= require('./config/config');
//var Authentication = require('./utilities/Authentication');
var mailer			= require('./utilities/mail');	
const SendOtp		= require('sendotp');
const sendOtp 		= new SendOtp('208736A4WQr1Mi5acc93a5');
//const sendOtp 		= new SendOtp('209393AILCgzYm2m675acd86a1');
router.get('/', function(req, res) {
	console.log('hari');
  res.redirect("/home.html");
});

router.get('/chat', function(req, res) {
  res.redirect('/chat.html');
});


router.post('/botHandler',/*Authentication.SetRealm('botHandler'), Authentication.BasicAuthentication, */function(req, res){
	//console.log('Dialogflow Request headers: ' + JSON.stringify(req.headers));
	console.log('Dialogflow Request body: ' + JSON.stringify(req.body));	
		var intentName = req.body.result.metadata.intentName;
		switch(intentName){
			case 'easyQuote':func = easyQuote;break;
		}
		func(req.body)
		.then((resp)=>{
			console.log(resp);
			res.json(resp).end();	
		})
		.catch((err)=>{
			res.json(err).end();	
		});
		
		res.end();
});

var easyQuote = function(reqBody){
	return new Promise(function(resolve, reject){
		resolve({		
			"speech": "",
			"displayText":"",
			"followupEvent":{
				"name":"feedBackIntent",
				"data":{  
					"confirmMsg":"Thank you for requesting a quote. We'll get back to you with the details you're looking for as soon as possible",					
				}
			}
		});
	});
}



module.exports = router;



			