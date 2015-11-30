var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/SodaSopa');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  console.log("Connection open!");
});

var businessSchema = mongoose.Schema({
	name: String,
	description: String
});

var Business = mongoose.model('Business', businessSchema);

module.exports = Business;