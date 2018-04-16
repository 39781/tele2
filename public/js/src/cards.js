'use strict';

/* -------------------------------------------------------------------
Copyright (c) 2017-2017 Hexaware Technologies
This file is part of the Innovation LAB - Offline Bot.
------------------------------------------------------------------- */


define(['messageTemplates', 'uuid'], function(messageTpl, uuidv1){

    class CardDesign {

        constructor(card, responseType) {
            this.data = card;
            this.responseType = responseType;
        }

        getHTML(){

            if (this.responseType == "plaintext") {
                console.log(this.data);
                return messageTpl.plaintext(this.data);
            }

            if(this.responseType == "card"){
                console.log(JSON.stringify(this.data));
                return messageTpl.card(this.data);
            }
			if(this.responseType == "list"){
                console.log(JSON.stringify(this.data));
                return messageTpl.list(this.data);
            }
            if(this.responseType == "carousel"){
                return messageTpl.carousel(this.data, uuidv1());
            }
			if(this.responseType == "webview"){
                return messageTpl.webview(this.data, uuidv1());
            }
			if (this.responseType == "quickreplyfromapiai") {
				return messageTpl.quickrepliesfromapiai(this.data);
			}
            if(this.responseType == "quickreplies"){
                return messageTpl.quickreplies(this.data);
            }
            if(this.responseType == "video"){
                console.log(this.data);
                return messageTpl.video(this.data);
            }
            if(this.responseType == "audio"){
                console.log(this.data);
                return messageTpl.audio(this.data);
            }
            if(this.responseType == "file"){
                console.log(this.data);
                return messageTpl.file(this.data);
            }
            if(this.responseType == "receipt"){
                console.log(this.data);
                return messageTpl.receipt(this.data);
            }
            if(this.responseType == "logout"){
                console.log(this.data);
                return messageTpl.logout(this.data);
            }
            if(this.responseType == "login"){
                console.log(this.data);
                return messageTpl.login(this.data);
            }
        }
    }

    return function(card, responseType){
        return new CardDesign(card, responseType).getHTML();
    }
});