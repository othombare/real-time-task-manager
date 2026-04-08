const { model } = require('mongoose');
const nodemailer = require('nodemailer');


const sendEmail = async options => {
    const emailHost = process.env.EMAIL_HOST;
    let emailPort = process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : 2525;
    const emailUser = process.env.EMAIL_USERNAME || process.env.EMAIL_USERANAME;
    const emailPass = process.env.EMAIL_PASSWORD;

    if (!emailHost || !emailUser || !emailPass) {
        throw new Error('Email service is not configured. Please set EMAIL_HOST, EMAIL_USERNAME, and EMAIL_PASSWORD.');
    }

    if (emailHost.includes('mailtrap.io') && (!emailPort || emailPort === 25)) {
        emailPort = 2525;
    }

    const transporter = nodemailer.createTransport({
        host: emailHost,
        port: emailPort,
        auth: {
            user: emailUser,
            pass: emailPass
        },
        secure: false,
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
        tls: {
            rejectUnauthorized: false
        }
    });

    const timeout = ms => new Promise((_, reject) => setTimeout(() => reject(new Error('Email request timed out.')), ms));
    await Promise.race([transporter.verify(), timeout(10000)]);

    const mailOptions = {
        from: 'Real-Time Collab <realtimecollab@example.com>',
        to: options.email,
        subject: options.subject,
        text: options.message
    };

    await Promise.race([transporter.sendMail(mailOptions), timeout(10000)]);
};

module.exports = sendEmail;