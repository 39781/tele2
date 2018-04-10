'use strict';

/* -------------------------------------------------------------------
Copyright (c) 2017-2017 Hexaware Technologies
This file is part of the Innovation LAB - Offline Bot.
------------------------------------------------------------------- */


define([], function () {

    var methods = {};

    methods.currentTime = () => {

        var currentDate = new Date();
        var hours = (currentDate.getHours() < 10) ? '0' + currentDate.getHours() : currentDate.getHours();
        var minutes = (currentDate.getMinutes() < 10) ? '0' + currentDate.getMinutes() : currentDate.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';

        return `${hours}:${minutes} ${ampm}`;
    };

    methods.scrollSmoothToBottom = (element) => {
		console.log('element',element);
		
        setTimeout(() => {
            var height = element[0].scrollHeight;
            element.scrollTop(height);
			//var objDiv = document.getElementById("scrollbar-style");
			//objDiv.scrollTop = objDiv.scrollHeight;
        }, 500);
    };



    methods.signOut= ()=> {
        var auth2 = gapi.auth2.getAuthInstance();
        auth2.signOut().then(function () {
          console.log('User signed out.');
        });
      }

    return methods;
});




