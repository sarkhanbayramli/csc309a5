var mongoose = require('mongoose');

var businessSchema = mongoose.Schema({
	name: String,
	description: String,
	owner: String
});

var Business = mongoose.model('Business', businessSchema);

module.exports = Business;