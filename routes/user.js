
var bodyParser = require('body-parser');
var bcrypt = require('bcryptjs');
var jtoken = require('jsonwebtoken');
var nodemailer = require('nodemailer');
var passport = require('passport');
var User = require('../models/User');
var myKey = require('../setup/urls');
require('dotenv').config();

var saltRounds = 10;
var encoder = bodyParser.urlencoded({extended: true});


const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: true, // Set to 'true' for secure connection (TLS)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});


module.exports = function (app){

	app.post('/register', encoder, (req, res, next) =>{
		User
		.find()
		.then(user => {
				const newUser = new User({
					name: req.body.name,
					email: req.body.email,
					mobile: req.body.mobile,
					password: req.body.password,
				});
				bcrypt.genSalt(10, (err, salt) => {
   					bcrypt.hash(newUser.password, salt, (err, hash) => {
        			// Store hash in your password DB.
   						newUser.password = hash;
   						newUser
							.save()
							.then(user => res.json(user))
							.catch(err => console.log(err));	
    				});
				});
		})
		.catch(err => console.log(err));
	});


	app.post('/login', encoder, 
		(req, res, next) => {
		var email = req.body.email;
		var password = req.body.password;
		// console.log(req.body);
		User
		.findOne({email: req.body.email})
		.then(user => {
			if(!user){
				return res.status(400).json({emailerror: `this email is not found`});
			}
			bcrypt.compare(password, user.password)
			.then((isValid) => {
				if(isValid){
					res.json(user);
				}else{
					res.status(404).json({passworderror: `password is not correct`});
				}    			
			}).catch(err => console.log(err));
		})
		.catch(err => console.log(err));
	});


	app.post('/sendToken', encoder, async (req, res, next) => {
		const email = req.body.email;
		try{
			const email = req.body.email;
			const user = await User.findOne({email: email});
			if(!user){
				return res.status(404).json({message : 'user not found'});
			}
			const payload = {
						id: user.id,
						email: user.email,
						password: user.password,
					};

			const token = jtoken.sign({payload}, process.env.JWT_SECRET, 
				(err, asyncToken) => {
  				if (err) throw err;
  				console.log(asyncToken);
  				var NewUser = User.findOneAndUpdate({token: token});
					const mailOptions = {
							from: process.env.EMAIL_USER,
							to: email,
							subject: "Hello from Nodemailer",
							html: `
										<!DOCTYPE html>
											<html ⚡4email>
												<head>
													<meta charset="utf-8">
												  <script async src="https://cdn.ampproject.org/v0.js"></script>
												  <style amp4email-boilerplate>body{visibility:visible}</style>
													<style amp-custom>
														body {
												      font-family: Arial, sans-serif;
												      background-color: #f4f4f4;
													    color: #333;
												      padding: 20px;
														}
												    h1 {
												      color: #ff5722;
														}
														.container {
												      max-width: 600px;
												      margin: 0 auto;
															background-color: #fff;
												      padding: 30px;
												      border-radius: 5px;
												      box-shadow: 0 0 10px rgba(0,0,0,0.1);
														}
												    .button {
															display: inline-block;
												      background-color: #ff5722;
												      color: #fff;
												      padding: 10px 20px;
															text-decoration: none;
												      border-radius: 5px;
															transition: background-color 0.3s;
												    }
														.button:hover {
															background-color: #e64a19;
												    }
													</style>
												</head>
												<body>
													<div class="container">
												    <h1>Welcome to Our Newsletter!</h1>
												    <p>Dear Subscriber,</p>
														<p>We are thrilled to share the latest updates with you.</p>
												    <p>Here are some highlights:</p>
												    <ul>
															<li><strong>New Feature:</strong> Introducing Dynamic AMP Emails!</li>
												      <li><strong>Event Reminder:</strong> Join us for our Colorful Workshop next week.</li>
												      <li><strong>Article of the Week:</strong> Discover the Power of AMP for Email.</li>
														</ul>
												    <p>Click the button below to explore more:</p>
														<a class="button" href="https://localhost:3000/token">${asyncToken}</a>
														<p>${asyncToken}</p>
												    <p>Thank you for being part of our community!</p>
														<p>Best regards,<br> The Newsletter Team</p>
													</div>
												</body>
											</html>
										`
							};
							transporter.sendMail(mailOptions);
							res.json(user);	
			});
			console.log(token, "token")
		}
		catch(error){
			res.status(500).json({error : error.message});
		}
	});


	app.post('/token', encoder, async (req, res, next) => {
			var token = req.headers.token;
			console.log(token, "params")
			// console.log(req.header) 
			console.log()
			try {
				if(token){
        	const decode = jtoken.verify(token, process.env.JWT_SECRET);
        	console.log(decode);
        	res.json({
            login: true,
            data: decode,
        	});
				}
				else{
					res.json({
          	  login: false,
            	data: 'error'
        	});
				}
			}
			catch(error){
				res.status(500).json({error : error.message});
			}
	});
}
