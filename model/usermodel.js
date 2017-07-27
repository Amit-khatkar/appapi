var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var autoIncrement = require('mongoose-auto-increment');
var connection = mongoose.createConnection('mongodb://amitkhatkar:khatkarg1@ds157112.mlab.com:57112/testappdb');
autoIncrement.initialize(connection);
var user = new Schema({
    name: String,
    email:{ type: String, unique: true },
    createAt: {type: Date, default: Date.now },
    password: String,
    access_token: String,
    credits: Number,
    ref_token: String,
    device_id: String,
    news: [{
        title: String,
        postid: Number
    }],

    url: String
});

user.plugin(autoIncrement.plugin, 'User');
module.exports =mongoose.model("User", user);