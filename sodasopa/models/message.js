var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/SodaSopa');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  console.log("Connection open!");
});

var messageSchema = mongoose.Schema({
	fromId: String,
	toId: String,
	messageText: String
});

var Message = mongoose.model('Message', messageSchema);

module.exports = Messaage;