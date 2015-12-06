var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/SodaSopa');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  console.log("Connection open!");
});

var feedbackSchema = mongoose.Schema({
	businessId: [{type: mongoose.Schema.Types.ObjectId, ref: 'Business' }],
	authorId: [{type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
	rating: Number, 
	writeTime: {type:Date, default: Date.now},
	feedbackText: String
});

var Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;