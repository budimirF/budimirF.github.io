var mongoose = require('mongoose');

/*var feedSchema = new mongoose.Schema({
 feedTitle: { type: String, unique: true },
 feedCategory: {type: String },
 feedArticles: { type: Array }
});
*/
var feedSchema = new mongoose.Schema({
 feedLink: { type: String, unique: true },
 feedTitle: { type: String},
 feedCategory: {type: String }
});

module.exports = mongoose.model('Feed', feedSchema);
