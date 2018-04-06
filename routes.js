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
		var intentName = req.body.result.metadata.intentName;
		var func;
		console.log(intentName);
	switch(intentName){
		case 'monthBillIntent':func = monthBillIntent;break;
		case 'recommendBillCycle': func = recommendBillCycle;break; 
		case 'recommendRomingCycle':func = recommendRomingCycle;break;
	}		
	res.json(func(req.body)).end();
});

var monthBillIntent = function(reqBody){
	var contexts = reqBody.result.contexts;
	var params={};
	contexts.forEach(function(context){
		if(context.name == "billingcontext"){
			params = context.parameters;
		}
	})
	console.log(params);
	
	return {		
		"speech": "",
		"followupEvent":{
			"name":"recommendBillCycle",
			"data":{  
				"acknowledge":"Thanks for the inputs.  We will send the bill copies to your registered email ID with us"
			}
		}
	};
}

var recommendRomingCycle = function(reqBody){
	var resolvedQuery = reqBody.result.resolvedQuery;
	switch(resolvedQuery.toLowerCase()){
		case 'accept':return {		
								"speech": "",
								"followupEvent":{
									"name":"otpIntent",
									"data":{  
										"source":"recommendRomingCycle"
									}
								}
							};break;
		case 'ignore':
	}
}

var recommendBillCycle = function(reqBody){
	var resolvedQuery = reqBody.result.resolvedQuery;
	switch(resolvedQuery.toLowerCase()){
		case 'accept':return {		
								"speech": "",
								"followupEvent":{
									"name":"otpIntent",
									"data":{  
										"source":"recommendBillCycle"
									}
								}
							};break;
		case 'ignore':
	}
	
}
var otpIntent = function(reqBody){
	if(reqBody.result.parameters['otp'] == '88888'){
		if(reqBody.result.parameters['source'] == 'recommendBillCycle'){
			return {		
				"speech": "",
				"followupEvent":{
					"name":"recommendRomingCycle",
					"data":{  
						"source":"Thanks for confirmation.  Change will be effected from next billing cycle  onwards"
					}
				}
			};
		}else if(reqBody.result.parameters['source'] == 'recommendRomingCycle'){
			return {		
				"speech": "",
				"followupEvent":{
					"name":"finalIntent",
					"data":{  
						"source":"Thanks for confirmation.  Change will be effected from next billing cycle  onwards"
					}
				}
			};
						
		}	
	}
}

module.exports = router;



			