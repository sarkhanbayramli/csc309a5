var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	email: String,
	name: String,
	location: String,
	password: String,
	userType: String
});

var User = mongoose.model('User', userSchema);

module.exports = User;