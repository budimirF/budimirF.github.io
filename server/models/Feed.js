var mongoose = require('mongoose');

var feedSchema = new mongoose.Schema({
 feedTitle: { type: String, unique: true },
 feedCategory: {type: String },
 feedArticles: { type: Array }
});

module.exports = mongoose.model('Feed', feedSchema);
