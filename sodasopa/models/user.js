var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/SodaSopa');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  console.log("Connection open!");
});

var userSchema = mongoose.Schema({
	username: String,
	name: String,
	location: String,
	password: String
});

var User = mongoose.model('User', userSchema);

module.exports = User;