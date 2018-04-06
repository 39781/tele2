var express 		= require('express');
var router			= express.Router();	 
var busConfig		= require("./config");	
var fs 				= require("fs");	
var request			= require('request');
var path			= require("path");	
var checksum 		= require('./model/checksum');
var config 			= require('./config/config');
//var Authentication = require('./utilities/Authentication');

router.get('/', function(req, res) {
	console.log('hari');
  res.redirect("/richowebsite");
});


router.get('/richowebsite', function(req, res) {
  res.redirect('/home.html');
});

router.get('/chat', function(req, res) {
  res.redirect('/chat.html');
});


router.post('/botHandler',/*Authentication.SetRealm('botHandler'), Authentication.BasicAuthentication, */function(req, res){
	//console.log('Dialogflow Request headers: ' + JSON.stringify(req.headers));
	console.log('Dialogflow Request body: ' + JSON.stringify(req.body));		
	var contexts = req.body.result.contexts;
	var params={};
	contexts.forEach(function(context){
		if(context.name == "billingcontext"){
			params = context.parameters;
		}
	})
	console.log(params);
	
	var responseObj = {		
		"speech": "",
		"followupEvent":{
			"name":"recoo",
			"data":{  
														
			}
		},			
		"messages": [{
		  "type": 0,
		  "platform": "facebook",
		  "speech": "Thanks for the inputs.  We will send the bill copies to your registered email ID with us"
		},	
		{
		  "type": 0,
		  "speech": ""
		}]
	};	
	res.json(responseObj).end();
});
module.exports = router;



			