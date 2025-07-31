const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const transporter = nodemailer.createTransport({  // <-- FIXED method name here
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),          // make sure port is a number
    secure: false, // Must be `false` for Gmail (use `true` for port 465)
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

module.exports = transporter;

