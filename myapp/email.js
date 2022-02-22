const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service : 'gmail',
    host : 'smtp.gmail.com',
    post : 587,
    auth : {
        user : process.env.nodemailerEmail,
        pass : process.env.nodemailerPassword,
    },
});


module.exports = transporter;


