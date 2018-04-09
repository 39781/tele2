var nodemailer = require('nodemailer');
var mailer = {
	sendMail:function(toAddress, month, mainContent){
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
			  text: mainContent
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

