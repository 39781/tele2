var nodemailer = require('nodemailer');
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

			var mailOptions = {
			  from: 'hexatestmailer@gmail.com',
			  to: 'BH@hexaware.com',
			  subject: month + ' month bill',
			  text: mainContent,
			  attachments:[
				{
					filename:path.basename(attachmentFile),
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

