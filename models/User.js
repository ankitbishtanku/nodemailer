
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({

	name: {
		type: String,
	},
	email: {
		type: String,
	},
	mobile: {
		type: String,
	},
	password: {
		type: String,
	},
	token:{
		type: String,
	},
});


module.exports = User = mongoose.model('User', UserSchema);