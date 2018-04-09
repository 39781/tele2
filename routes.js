var express 		= require('express');
var router			= express.Router();	 
var busConfig		= require("./config");	
var fs 				= require("fs");	
var request			= require('request');
var path			= require("path");	
var checksum 		= require('./model/checksum');
var config 			= require('./config/config');
//var Authentication = require('./utilities/Authentication');
var mailer			= require('./utilities/mail');	
const SendOtp		= require('sendotp');
const sendOtp 		= new SendOtp('208736AMELJFZJR5acb04e2');
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
		case 'lastBillingIntent':func = lastBillingIntent;break;
		case 'recommendBillCycle': func = recommendBillCycle;break; 
		case 'recommendRomingCycle':func = recommendRomingCycle;break;
		case 'recommendBillConfirmation':func = recommendBillConfirmation;break;
		case 'recommendRomingConfirmation':func = recommendRomingConfirmation;break;
		case 'otpIntent':func = otpIntent;break;
	}		
	func(req.body)
	.then((resp)=>{
		console.log(resp);
		res.json(resp).end();	
	})
	.catch((err)=>{
		res.json(err).end();	
	});
});

var lastBillingIntent = function(reqBody){
	return new Promise(function(resolve, reject){
		var contexts = reqBody.result.contexts;
		var params={};
		contexts.forEach(function(context){
			if(context.name == "billingcontext"){
				params = context.parameters;
			}
		})
		console.log(params);
		var date = new Date();
		var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
		params.month = months[date.getMonth()-1];	
		console.log(params);
		getBill(params)
		.then((resp)=>{
			resolve(resp);
		});		
	});
}

var monthBillIntent = function(reqBody){
	return new Promise(function(resolve, reject){
		var contexts = reqBody.result.contexts;
		var params={};
		contexts.forEach(function(context){
			if(context.name == "billingcontext"){
				params = context.parameters;
			}
		})		
		getBill(params)
		.then((resp)=>{
			resolve(resp);
		});
	});
	
}

function getBill(params){
	return new Promise(function(resolve, reject){
		console.log(params);	
		//fs.rename('invoices/Invoice_July2018.pdf',fileName,function(err, data){
			mailer.sendMail('Bh@hexaware.com',params.month,'Please find the following attachment','invoices/Invoice_July2018.pdf');
		//});	
		resolve( {		
			"speech": "",
			"displayText":"",
			"followupEvent":{
				"name":"recommendBillCycle",
				"data":{  
					"acknowledge":"Thanks for the inputs.  We will send the bill copies to your registered email ID with us",
					"mobile":params.mobile
				}
			},
			"messages": [{
				  "type": 0,
				  "speech": ""
				}]
		});
	})
}
var recommendRomingConfirmation = function(reqBody, otpMsg){
	return new Promise(function(resolve, reject){
		var resolvedQuery = reqBody.result.resolvedQuery;		
		var respObj={};
		switch(resolvedQuery.toLowerCase()){
			case 'accept':	sendOtp.send("917200050085", "PRIIND", function (error, data, response) {
								console.log('error',error);
								console.log('data',data);
								console.log('response',response);
							});
							respObj= {		
									"speech": "",
									"displayText":"",
									"followupEvent":{
										"name":"otpIntent",
										"data":{  
											"msg":"We have sent an OTP on your mobile no.  Please enter it",
											"source":"recommendRomingCycle"
										}
									}
								};break;
			case 'ignore':case 'reject':respObj= {		
					"speech": "",
					"displayText":"",
					"followupEvent":{
						"name":"finalIntent",
						"data":{  
							"finalMessage":" "
						}
					}
				};break;
		}
		resolve(respObj);
	});
}

var recommendBillConfirmation = function(reqBody){
	return new Promise(function(resolve, reject){
		var resolvedQuery = reqBody.result.resolvedQuery;		
		var respObj={};
		switch(resolvedQuery.toLowerCase()){
			case 'accept':sendOtp.send("917200050085", "PRIIND", function (error, data, response) {
								console.log('error',error);
								console.log('data',data);
								console.log('response',response);
							});
							respObj= {		
								"speech": "",
								"displayText":"",
								"followupEvent":{
									"name":"otpIntent",
									"data":{  
										"msg":"We have sent an OTP on your mobile no.  Please enter it",
										"source":"recommendBillCycle"
									}
								}
							};break;
			case 'ignore':case 'reject':respObj =  {		
					"speech": "",
					"displayText":"",
					"followupEvent":{
						"name":"finalIntent",
						"data":{  
							"finalMessage":" "
						}
					}
				};break;
		}
		resolve(respObj);
	});
}
/*var recommendBillConfirmation = function(reqBody){
	var contexts = reqBody.result.contexts;
	console.log(contexts);
	return {		
		"speech": "",
		"displayText":"",
		"followupEvent":{
			"name":"otpIntent",
			"data":{  
				"source":"recommendBillCycle"
			}
		}
	};
}
var recommendBillConfirmation = function(reqBody){
	var contexts = reqBody.result.contexts;
	console.log(contexts);
	return {		
		"speech": "",
		"displayText":"",
		"followupEvent":{
			"name":"otpIntent",
			"data":{  
				"source":"recommendBillCycle"
			}
		}
	};
}*/
var otpIntent = function(reqBody){
	return new Promise(function(resolve, reject){
		return sendOtp.verify("917200050085", reqBody.result.parameters['otp'], function (error, data, response) {
			console.log(data); // data object with keys 'message' and 'type'
			var respObj={};
			if(data.type == 'success'){
				if(reqBody.result.parameters['source'] == 'recommendBillCycle'){
					respObj= {		
						"speech": "",
						"displayText":"",
						"followupEvent":{
							"name":"recommendRomingCycle",
							"data":{  
								"acknowledge":"Thanks for confirmation.  Change will be effected from next billing cycle  onwards"
							}
						}
					};
				}else if(reqBody.result.parameters['source'] == 'recommendRomingCycle'){
					respObj= {		
						"speech": "",
						"displayText":"",
						"followupEvent":{
							"name":"finalIntent",
							"data":{  
								"finalMessage":"Thanks for confirmation.  Change will be effected from next billing cycle  onwards"
							}
						}
					};
								
				}
			}
			if(data.type == 'error'){
				respObj= {		
					"speech": "",
					"displayText":"",
					"followupEvent":{
						"name":"otpIntent",
						"data":{  
							"msg":"Invalid Otp, please enter correct otp",
							"source":reqBody.result.parameters['source']
						}
					}
				}
			}
			resolve(respObj);
		})
	});
	/*if(reqBody.result.parameters['otp'] == '88888'){
		if(reqBody.result.parameters['source'] == 'recommendBillCycle'){
			return {		
				"speech": "",
				"displayText":"",
				"followupEvent":{
					"name":"recommendRomingCycle",
					"data":{  
						"acknowledge":"Thanks for confirmation.  Change will be effected from next billing cycle  onwards"
					}
				}
			};
		}else if(reqBody.result.parameters['source'] == 'recommendRomingCycle'){
			return {		
				"speech": "",
				"displayText":"",
				"followupEvent":{
					"name":"finalIntent",
					"data":{  
						"finalMessage":"Thanks for confirmation.  Change will be effected from next billing cycle  onwards"
					}
				}
			};
						
		}	
	}*/
}

module.exports = router;



			