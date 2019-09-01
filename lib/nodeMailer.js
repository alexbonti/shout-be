var nodemailer = require('nodemailer');
var hbs = require('handlebars');
var EmailTemplate = require('../lib/otpVerificationTemplate')
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASSWORD
  }
});
var template = hbs.compile(EmailTemplate.htmlPage);

var mailOptions = {
  from:''+process.env.APPNAME +'<'+process.env.NODEMAILER_USER+'>',
  to: '',
  subject: 'Credits Redemption : DO NOT REPLY',
  html : EmailTemplate.htmlPage
};

var sendMail = function (data){
  mailOptions.to = data.receiversEmail;
  //mailOptions.text = mailOptions.text.concat(' ',text);
  mailOptions.html = template(data);

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

module.exports = {
  sendMail : sendMail
}