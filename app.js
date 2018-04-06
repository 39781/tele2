var express = require('express');
var bodyParser = require('body-parser');
var routes = require('./routes');
var redirect = require("express-redirect");
var app = express();
var session = require('express-session');
var port = process.env.PORT || 3000;
app.use(session({ secret: 'this-is-a-secret-token',resave: true, saveUninitialized: true, cookie: { maxAge: 60000 }}));
redirect(app);
//global.recentInput = "";
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false })) 
app.use(bodyParser.json());
app.set('views', __dirname + '/public/views');
app.set('view engine', 'ejs');
app.use(routes);
global.bookingInfo = {
	tickets:{},
	seatsInfo:{}
};
var server = app.listen(port,function(){
	console.log("Application started listening port "+port);		
});


