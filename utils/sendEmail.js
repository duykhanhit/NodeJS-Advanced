const nodemailer = require("nodemailer");

const sendEmail = async (options) => {

  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_POST,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subejct: options.object,
    text: options.message
  }

  const info = await transporter.sendMail(message);
  
}

module.exports = sendEmail;