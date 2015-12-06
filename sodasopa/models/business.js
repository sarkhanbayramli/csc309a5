var mongoose = require('mongoose');

var businessSchema = mongoose.Schema({
	name: String,
	description: String,
	owner: [{type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
	approved: {type: String, default: "no"},
	pic: {type: String, default: "recommended_holder.png"},
	type: {type: String, default: "Restaurant"}
});

var Business = mongoose.model('Business', businessSchema);

module.exports = Business;