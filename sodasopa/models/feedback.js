var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/SodaSopa');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  console.log("Connection open!");
});

var feedbackSchema = mongoose.Schema({
	businessId: String,
	authorId: String,
	rating: Number, 
	writeTime: Date,
	feedbackText: String
});

var Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;