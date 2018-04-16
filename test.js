fs = require('fs');
fs.rename('invoices/Invoice_July2017.pdf','invoices/Invoice_July2018.pdf',function(err, data){
	console.log(data);
})