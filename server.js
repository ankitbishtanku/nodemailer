/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';


var express = require('express');
var passport = require('passport');
var mongoose = require('mongoose');
var user = require('./routes/user');
var app = express();

require('dotenv').config();
console.log(process.env.EMAIL_HOST)
var port = process.env.PORT || 3000;
user(app);


var db = require('./setup/urls').mongoURL;
mongoose
	.connect(db)
	.then(() => console.log(`mongodb connected`))
	.catch((err) => console.log(err));



// Serialize and deserialize user for session management
passport.serializeUser((user, done) => {
    done(null, user.id); // Store user ID in session
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
	}
});


app.use(passport.initialize());
require('./strategies/jwtStrategy')(passport);


app.listen(port, () => {
	console.log(`server is running or listening at port ${port}`);
});
