const express = require('express');
const emailRoute = express.Router()
const path = require('path')
const nodemailer = require('nodemailer');
const statusText = require('../utils/statusText');
const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false, 
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
emailRoute.post("/", async function (req, res){
    const mailOptions ={
        from: {
            name: "mohamed tarek rezk", 
            address: process.env.EMAIL_USER
        },
        to: req.body.email, 
        subject: "HI", // Subject line
        text: "Hello world?", // plain text body
        html: "<b>Hello world?</b>", // html body
        attachments: [
            {  
                filename: 'welcome.png',
                path: path.join(__dirname, "avatar.png"),
            }]
      }

      await transporter.sendMail(mailOptions)

      res.status(200).json({status: statusText.SUCCESS, message: 'Email sent successfully'})
 
})


module.exports = emailRoute;