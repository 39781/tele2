var express 		= require('express');
var router			= express.Router();	 
var busConfig		= require("./config");	
var fs 				= require("fs");	
var request			= require('request');
var path			= require("path");	
var checksum 		= require('./model/checksum');
var config 			= require('./config/config');
var Authentication = require('./utilities/Authentication');

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

router.get('/getBookedSeats/:src/:dest/:bustype/:date',function(req, res){
	var bookedSeats = [];
	if(bookingInfo['seatsInfo'][req.params.src])
		if(bookingInfo['seatsInfo'][req.params.src][req.params.dest])
			if(bookingInfo['seatsInfo'][req.params.src][req.params.dest][req.params.bustype])
				if(bookingInfo['seatsInfo'][req.params.src][req.params.dest][req.params.bustype][req.params.date])
					bookedSeats = bookingInfo['seatsInfo'][req.params.src][req.params.dest][req.params.bustype][req.params.date];
	res.status(200);
	res.json({"bookedseats":bookedSeats}).end();
})

router.post('/botHandler',Authentication.SetRealm('botHandler'), Authentication.BasicAuthentication, function(req, res){
	//console.log('Dialogflow Request headers: ' + JSON.stringify(req.headers));
	console.log('Dialogflow Request body: ' + JSON.stringify(req.body));	
	console.log(req.body.result.parameters);
	
	switch(req.body.result.metadata.intentName){		
		case 'bookticket':func = bookingSeats;inputObj = JSON.parse(JSON.stringify(req.body)); break;
		case 'ticket':func = ticket; inputObj = req.query.transCode;break;
	}
	func(inputObj)
	.then((respJson)=>{
		res.status(200);
		res.json(responseObj).end();	
	})
	.catch((errInfoJson)=>{
		res.status(400);
		res.json(responseObj).end();	
	})	
});

router.get("/ticket",function(req, res){
	console.log(bookingInfo['tickets'][req.query.transCode],req.query.transCode);
	ticket(req.query.transCode)
	.then((tick)=>{
		res.status(200);
		res.end(tick);
	})
	.catch((errInfo)=>{
		res.status(400);
		res.end(errInfo);
	})
});

router.post("/paymentGateway",function(req, res){	
	var cardNo = req.body.cardNo;
	var expDate = req.body.expDate;
	var cvv = req.body.cvv;
	if(cvv == '000'){
		res.status(400);
		res.json({responseMsg:"transaction failed","transactionCode":"trans1999","reason":"invalid card details"}).end();		
	}else{
		saveBookingInfo(req.body)
		.then((resp)=>{
			res.status(200);
			res.json({responseMsg:"transaction successful","transactionCode":resp.ordId,"redirectUrl":"/ticket?transCode="+resp.ordId}).end()
		})
		.catch((err)=>{
			res.status(200);
			res.json({responseMsg:"transaction failure","transactionCode":err.ordId,"redirectUrl":"/ticket?transCode="+err.ordId}).end()
		})		
	}
})

router.get('/testtxn', function(req,res){
	console.log("in restaurant");
	console.log("--------testtxnjs----");
	res.render('testtxn.ejs',{'config' : config});
});


router.post('/paytmTxn',function(req, res) {
	console.log("POST Order start");
	console.log(req.body);
	saveBookingInfo(req.body)
	.then((resp)=>{
			var paramlist = { 
				ORDER_ID: resp.ordId,
				CUST_ID: resp.custId,
				INDUSTRY_TYPE_ID: config.INDUSTRY_TYPE_ID,
				CHANNEL_ID: config.CHANNEL_ID,
				TXN_AMOUNT: '1',
				MID: config.MID,
				WEBSITE: config.WEBSITE,
				PAYTM_MERCHANT_KEY: config.PAYTM_MERCHANT_KEY
			};			
			var paramarray = new Array();
			console.log(paramlist);
			for (name in paramlist)
			{
			  if (name == 'PAYTM_MERCHANT_KEY') {
				   var PAYTM_MERCHANT_KEY = paramlist[name] ; 
				}else
				{
				paramarray[name] = paramlist[name] ;
				}
			}
			console.log(paramarray);
			paramarray['CALLBACK_URL'] = 'https://fast-reef-26757.herokuapp.com/response';  // in case if you want to send callback
			console.log(PAYTM_MERCHANT_KEY);
			checksum.genchecksum(paramarray, PAYTM_MERCHANT_KEY, function (err, result) 
			{
				  console.log('result of getchecksum',result);
				  res.render('pgredirect.ejs',{ 'restdata' : result });
			});
			console.log("POST Order end");	
	})
});
router.get('/pgredirect', function(req,res){
	console.log("in pgdirect");
	console.log("--------testtxnjs----");
	res.render('pgredirect.ejs');
});
  
router.post('/response', function(req,res){
   console.log("in response post");
   var paramlist = req.body;
	var paramarray = new Array();
	console.log(paramlist);
	if(checksum.verifychecksum(paramlist, config.PAYTM_MERCHANT_KEY))
	{		  
	   console.log("true");
	   res.render('response.ejs',{ 'restdata' : "true" ,'orderId' : paramlist['ORDERID']});
	}else
	{
	   console.log("false");
		res.render('response.ejs',{ 'restdata' : "false" , 'orderId' : paramlist['ORDERID']});
	};
//vidisha
});
var saveBookingInfo = function(reqBody){
	return new Promise(function(resolve, reject){
		var dt = new Date();
		var seed = dt.getFullYear().toString() + dt.getDay().toString() + dt.getMonth().toString() + dt.getHours().toString() + dt.getMinutes().toString() + dt.getSeconds().toString();
		console.log(seed);
		bookingInfo['tickets']["ORD"+seed] = reqBody;			
		if(!bookingInfo['seatsInfo'][reqBody.source])
			bookingInfo['seatsInfo'][reqBody.source]={};
		
		if(!bookingInfo['seatsInfo'][reqBody.source][reqBody.dest])
			bookingInfo['seatsInfo'][reqBody.source][reqBody.dest]={};
		if(!bookingInfo['seatsInfo'][reqBody.source][reqBody.dest][reqBody.bustype])
			bookingInfo['seatsInfo'][reqBody.source][reqBody.dest][reqBody.bustype]={};
		if(bookingInfo['seatsInfo'][reqBody.source][reqBody.dest][reqBody.bustype][reqBody.date]){
			bookingInfo['seatsInfo'][reqBody.source][reqBody.dest][reqBody.bustype][reqBody.date] = bookingInfo['seatsInfo'][reqBody.source][req.body.dest][reqBody.bustype][reqBody.date].concat(reqBody.bookedSeats);
		}else{
			bookingInfo['seatsInfo'][reqBody.source][reqBody.dest][reqBody.bustype][reqBody.date]=reqBody.bookedSeats;		
		}
		resolve({ordId:"ORD"+seed,custId:"CID"+seed});
	});
}
var ticket = function(transCode){
	return new Promise(function(resolve, reject){
		if(bookingInfo['tickets'][transCode]){
			var ticket = "<table id='ticket' align='center'><thead><tr><th colspan=2>TICKET</th></tr></thead><tr><td>Name : <span class='ticketspan'>"+bookingInfo['tickets'][transCode].name+"</span></td><td>Date : <span class='ticketspan'>"+bookingInfo['tickets'][transCode].date+"</span></td></tr><tr><td>Soruce : <span class='ticketspan'>"+bookingInfo['tickets'][transCode].source+"</span></td><td>Destination : <span class='ticketspan'>"+bookingInfo['tickets'][transCode].dest+"</span></td></tr><tr><td>Bus Type : <span class='ticketspan'>"+bookingInfo['tickets'][transCode].bustype+"</span></td><td>Fare : <span class='ticketspan'>"+bookingInfo['tickets'][transCode].fare+"</span></td></tr><tr><td>Total Tickets : <span class='ticketspan'>"+bookingInfo['tickets'][transCode].totTics+"</span></td><td>Total fare <span class='ticketspan'>: "+bookingInfo['tickets'][transCode].tcost+"</span></td></tr><tr><td colspan=2>booked seats <span class='ticketspan'>: "+bookingInfo['tickets'][transCode].bookedSeats+"</span></td></tr></table>";
			resolve(ticket);
		}else{
			reject("Invalid transaction Code")
		}
	})
}

var bookingSeats = function(req){
	return new Promise(function(resolve, reject){
		var keys = Object.keys(req.result.parameters);
		keys.forEach(function(key){			
			if(key == 'Date'&&Array.isArray(req.result.parameters[key])){
				req.result.parameters[key] = req.result.parameters[key][0]+'T'+req.result.parameters[key][1]
			}else{
				req.result.parameters[key] = req.result.parameters[key].toString().toLowerCase();
			}
		});
		var sessionId = (req.sessionId)?req.sessionId:'';	
		var busExist = false, respText="";
		console.log(busConfig.fare);
		if(busConfig.fare[req.result.parameters.source]){
			if(busConfig.fare[req.result.parameters.source][req.result.parameters.Destination]){
				busExist = true;
			}
		}
		if(busConfig.fare[req.result.parameters.Destination]){
			if(busConfig.fare[req.result.parameters.Destination][req.result.parameters.source]){
				busExist = true;
			}
		}
		console.log(req.result.parameters);
		if(busExist){
			console.log(req.result.parameters.Date);
			respText = "/booking.html?name="+req.result.parameters.Name+"&phone="+req.result.parameters.Phone+"&date="+req.result.parameters.Date+"&from="+req.result.parameters.source+"&to="+req.result.parameters.Destination+"&bustype="+req.result.parameters.bustype+"&fare="+busConfig.fare[req.result.parameters.source][req.result.parameters.Destination][req.result.parameters.bustype].fare;
			responseObj = {
			  "speech": "",		  
			  "messages": [{
				  "type": 4,
				  "platform": "facebook",
				  "payload": {
					"facebook": {
					  "attachment": {
						"type": "template",
						"payload": {
						  "template_type": "button",
						  "text": "Click view button to get seat booking page",
						  "buttons": [{
							  "type": "web_url",
							  //"url": "https://limitless-lake-62312.herokuapp.com/index.html",
							  "url": respText,
							  "title": "view",
							  "webview_height_ratio": "tall",
							  "messenger_extensions": "true"
							}]
						}
					  }
					}
				  }
				}
			  ]
			}
		}else{
			respText = "Sorry right now we are not providing bus service between "+req.result.parameters.source+" to "+req.result.parameters.Destination; 
			responseObj = {			
				"speech": "",								
				"messages": [{
				  "type": 0,
				  "platform": "facebook",
				  "speech": respText
				}]
			}
		}
		resolve(responseObj);	
	});
}
module.exports = router;



			