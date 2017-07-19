var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
var connection = mongoose.createConnection('mongodb://amitkhatkar:khatkarg1@ds157112.mlab.com:57112/testappdb');
autoIncrement.initialize(connection);
var posts = new Schema({
    tite: String,
    author: String,
    createAt: {type: Date, default: Date.now },
    content: String,
    thumbnail: String,
    readTime: Number,
    isCredits: Boolean,
    credits: Number,
    category: String,
    url: String,
})

posts.plugin(autoIncrement.plugin, 'posts');
module.exports =mongoose.model("Posts", posts);