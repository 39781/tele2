'use strict';

/* -------------------------------------------------------------------
Copyright (c) 2017-2017 Hexaware Technologies
This file is part of the Innovation LAB - Offline Bot.
------------------------------------------------------------------- */


define(['jquery', 'settings', 'utils', 'messageTemplates', 'cards', 'uuid'],
function($, config, utils, messageTpl, cards, uuidv1){

	class ApiHandler{

		constructor(){
			this.options = {
				sessionId: uuidv1(),
				lang: "en"
			};
		}

		userSays(userInput, callback){
			callback(null, messageTpl.userplaintext({
				"payload": userInput,
				"senderName": config.userTitle,
				"senderAvatar": config.userAvatar,
				"time": utils.currentTime(),
				"className": 'pull-right'
			}));
		}
		askBot(userInput, callback){
			this.userSays(userInput, callback);

			this.options.query = userInput;
			console.log(userInput);
			$.ajax({
				type: "POST",
				url: config.chatServerURL + "query?v=20150910",
				contentType: "application/json; charset=utf-8",
				dataType: "json",
				headers: {
					"Authorization": "Bearer " + config.accessToken
				},
				data: JSON.stringify(this.options),
				success: function(response) {
					let isCardorCarousel = false;
					let isImage = false;
					let isQuickReply = false;
					let isQuickReplyFromApiai = false;
					let isVideo=false;
					let videoUrl=null;
					let isAudio=false;
					let audioUrl=null;
					let isList = false;
					let isFile=false;
					let fileUrl=null;
					let isReceipt=false;
					let receiptData=null;
					let isLogOut=false;
					let logoutData=null;
					let listData=null;
					let login=null;
					let isLogIn=false;
					let webviewData = null;
					let isWebView = false;
					//To find Card || Carousel
					let count = 0;
					let hasbutton;
					let buttons;
					
					console.log(response);
					if(response.status.code!=200){
						let cardHTML = cards({
							"payload": response.status.errorDetails,
							"senderName": config.botTitle,
							"senderAvatar": config.botAvatar,
							"time": utils.currentTime(),
							"className": ''
						}, "plaintext");
						callback(null, cardHTML);
					}else{
						if(response.result.fulfillment.messages){
							for(let i in response.result.fulfillment.messages){
								if(response.result.fulfillment.messages[i].type == 0 ){
									let cardHTML = cards({
										"payload": response.result.fulfillment.messages[i].speech,
										"senderName": config.botTitle,
										"senderAvatar": config.botAvatar,
										"time": utils.currentTime(),
										"className": ''
									}, "plaintext");
									callback(null, cardHTML);
								}
								if(response.result.fulfillment.messages[i].type == 1){
									count = count + 1;
									hasbutton=(response.result.fulfillment.messages[i].buttons.length > 0) ? true :false;
									isCardorCarousel = true;           
								}
								if(response.result.fulfillment.messages[i].type == 2){
									isQuickReplyFromApiai = true;
								}
								if(response.result.fulfillment.messages[i].type == 3){
									isImage = true;
								}
								if(response.result.fulfillment.messages[i].type == 4){
									
									console.log(response.result.fulfillment.messages[i]);
									//isQuickReply = (response.result.fulfillment.messages[i].payload.facebook.quick_replies.length > 0) ? true : false ;
									//console.log(isQuickReply);
									if(response.result.fulfillment.messages[i].payload.facebook.attachment.type=="video" ){
										isVideo= true  ;
										videoUrl=response.result.fulfillment.messages[i].payload.facebook.attachment.payload.url;
										//console.log(videoUrl);
									}
									
									if(response.result.fulfillment.messages[i].payload.facebook.attachment.type=="audio" ){
									isAudio= true ;
									audioUrl=response.result.fulfillment.messages[i].payload.facebook.attachment.payload.url;
									//console.log(audioUrl);
									}
									if(response.result.fulfillment.messages[i].payload.facebook.attachment.type=="file" ){
									isFile=true;
									fileUrl=response.result.fulfillment.messages[i].payload.facebook.attachment.payload.url;
									//console.log(fileUrl);
									}
									if(response.result.fulfillment.messages[i].payload.facebook.attachment.payload.template_type=="receipt" ){
										isReceipt=true;
									receiptData=response.result.fulfillment.messages[i].payload.facebook.attachment.payload;
									//console.log(isReceipt);
									}
									if(response.result.fulfillment.messages[i].payload.facebook.attachment.payload.template_type=="list" ){
										console.log('list');
										isList=true;
										listData=response.result.fulfillment.messages;
									//console.log(isReceipt);
									}
									if(response.result.fulfillment.messages[i].payload.facebook.attachment.payload.template_type=='logout'){
										isLogOut=true;
										logoutData=response.result.fulfillment.messages[i].payload.facebook.attachment.payload;
									console.log(isLogOut);
									}
									
									if(response.result.fulfillment.messages[i].payload.facebook.attachment.payload.template_type=='login'){
										login=response.result.fulfillment.messages[i].payload.facebook.attachment.payload.elements;
										isLogIn=true;	
									}
									if(['button','generic'].indexOf(response.result.fulfillment.messages[i].payload.facebook.attachment.payload.template_type)>=0){		
										console.log(JSON.stringify(response));
										buttons=response.result.fulfillment.messages[i].payload.facebook.attachment.payload.buttons;
										for(let l=0; l<buttons.length;l++){
											if(buttons[l].type == 'web_url'){
												isWebView = true;
												webviewData = response.result.fulfillment.messages[i].payload.facebook.attachment.payload;
											}
										}								
									}
								}
							}
						}else{
						 let cardHTML = cards({
								"payload": response.result.fulfillment.speech,
								"senderName": config.botTitle,
								"senderAvatar": config.botAvatar,
								"time": utils.currentTime(),
								"className": ''
							}, "plaintext");
							callback(null, cardHTML);
						}
					}
					//Carousel
					if(isCardorCarousel){
						if(count == 1){
							let cardHTML = cards({
								"payload": response.result.fulfillment.messages,
								"senderName": config.botTitle,
								"senderAvatar": config.botAvatar,
								"time": utils.currentTime(),
								"buttons":hasbutton,
								"className": ''
							}, "card");
							callback(null, cardHTML);
						} 
						else {
							let carouselHTML = cards({
								
									"payload": response.result.fulfillment.messages,
									"senderName": config.botTitle,
									"senderAvatar": config.botAvatar,
									"time": utils.currentTime(),
									"buttons":hasbutton,
									"className": ''
								
							}, "carousel");
							callback(null, carouselHTML);
						}
					}
					//Image Response
					if(isImage){
						let cardHTML = cards(response.result.fulfillment.messages, "image");
						callback(null, cardHTML);
					}
					//CustomPayload Quickreplies
					if(isQuickReply){
						let cardHTML = cards({
							"payload": response.result.fulfillment.messages,
								"senderName": config.botTitle,
								"senderAvatar": config.botAvatar,
								"time": utils.currentTime(),
								"className": ''
						}, "quickreplies");
						callback(null, cardHTML);
					}
					//Apiai Quickreply
					if(isQuickReplyFromApiai){
						let cardHTML = cards({
							"payload": response.result.fulfillment.messages,
								"senderName": config.botTitle,
								"senderAvatar": config.botAvatar,
								"time": utils.currentTime(),
								"className": ''
						}, "quickreplyfromapiai");
						callback(null, cardHTML);
					}
					if(isVideo){
						let cardHTML = cards({
							"payload": videoUrl,
								"senderName": config.botTitle,
								"senderAvatar": config.botAvatar,
								"time": utils.currentTime(),
								"className": ''
						}, "video");
						callback(null, cardHTML);
					}
					if(isAudio){
						let cardHTML = cards({
							"payload": audioUrl,
								"senderName": config.botTitle,
								"senderAvatar": config.botAvatar,
								"time": utils.currentTime(),
								"className": ''
						}, "audio");
						callback(null, cardHTML);
					}
					if(isFile){
						let cardHTML = cards({
							"payload": fileUrl,
								"senderName": config.botTitle,
								"senderAvatar": config.botAvatar,
								"time": utils.currentTime(),
								"className": ''
						}, "file");
						callback(null, cardHTML);
					}
					if (isList) {
						console.log('cards calling - list');
						let cardHTML = cards({
							"payload": listData,
							"senderName": config.botTitle,
							"senderAvatar": config.botAvatar,
							"time": utils.currentTime(),
							"className": ''
						}, "list");
						callback(null, cardHTML);
					}
					if (isReceipt) {
						let cardHTML = cards({
							"payload": receiptData,
							"senderName": config.botTitle,
							"senderAvatar": config.botAvatar,
							"time": utils.currentTime(),
							"className": ''
						}, "receipt");
						callback(null, cardHTML);
					}
					if (isLogOut) {
						console.log("ISWEB logout:::"+$('#webchat').context.URL);
						let cardHTML = cards({
							"payload": logoutData,
							"senderName": config.botTitle,
							"senderAvatar": config.botAvatar,
							"time": utils.currentTime(),
							"className": '',
							"isWeb":$('#webchat').context.URL
						}, "logout");
						callback(null, cardHTML);
					}
					if (isWebView) {
						console.log("ISWEB:::"+$('#webchat').context.URL);
						let cardHTML = cards({
							"payload": webviewData,							
							"senderName": config.botTitle,
							"senderAvatar": config.botAvatar,
							"time": utils.currentTime(),
							"className": '',
							"isWeb":$('#webchat').context.URL
						}, "webview");
						callback(null, cardHTML);
					}
					if (isLogIn) {
						console.log("ISWEB:::"+$('#webchat').context.URL);
						let cardHTML = cards({
							"payload": login,
							"senderName": config.botTitle,
							"senderAvatar": config.botAvatar,
							"time": utils.currentTime(),
							"className": '',
							"isWeb":$('#webchat').context.URL
						}, "login");
						callback(null, cardHTML);
					}

					
				},
				error: function() {
					callback("Internal Server Error", null);
				}
			});
		}
	}

	return function(accessToken){
		return new ApiHandler();
	}
});