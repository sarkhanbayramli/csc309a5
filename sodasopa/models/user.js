var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	email: String,
	name: String,
	location: String,
	password: String,
	userType: String,
	pic: {type: String, default: "recommended_holder.png"}
});

var User = mongoose.model('User', userSchema);

module.exports = User;