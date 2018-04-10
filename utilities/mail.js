var nodemailer 	= require('nodemailer');
var fs 			= require('fs');
var path		= require('path');	
var mailer = {
	sendMail:function(toAddress, month, mainContent,attachmentFile){
		return new Promise(function(resolve, reject){
			var transporter = nodemailer.createTransport({
				service: 'gmail',
				auth: {
					user: 'hexatestmailer@gmail.com',
					pass: 'a###W14&$'
				}
			});
			var fileName = 'invoices_'+month+'2017.pdf';
			var mailOptions = {
			  from: 'hexatestmailer@gmail.com',
			  to: 'SouradeepR@hexaware.com, venkateshlk@hexaware.com,  BH@hexaware.com',
			  subject: month + ' month bill',
			  text: mainContent,
			  attachments:[
				{
					filename:fileName,
					content:fs.createReadStream(attachmentFile)		
				}
			  ]
			};

			transporter.sendMail(mailOptions, function(error, info){
				if (error) {
					console.log(error);
					reject(error);
				} else {
					console.log(info.response);
					resolve(info.response);
				}
			});
		});
	}	

}

module.exports = mailer;

