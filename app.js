var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var crypto = require('crypto');
var Post = require("./model/postmodel");

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

mongoose.connect('mongodb://amitkhatkar:khatkarg1@ds157112.mlab.com:57112/testappdb');
var port = 80;
var router = express.Router();
//start

router.route("/").get(function (req,res) {
    res.json({message: "Hi, this api is working"})
});

//create post api
router.route('/createpost')
    .post(function (req,res) {
      var post = new Post;
      post.title =  req.body.title;
      post.author = req.body.author;
      post.content =  req.body.content;
      if(req.body.credits>0){
          post.isCredits = true;
          post.credits = req.body.credits;
      }else{
          post.isCredits = false;
          post.credits = 0;
      }
      post.thumbnail = req.body.thumbnail;
      post.readTime = req.body.readtime;
      post.category = req.body.category;
      post.url = req.body.url;
        post.save(function (err) {
            if(err)
                res.send(err);
            res.send("created");
        })

})
//get all posts
router.route('/posts')
    .get(function (req,res) {
        var limita=0;
        var page = req.query.page;

        for(var i=1; i < page ; i++){
            limita+=10;
        }
        Post.find(function (err,resp) {
            if(err){
                res.send(err);
            }else{
                res.json({status: "ok", posts: resp});
            }
        }).skip(limita).limit(10);
    })
// get all posts with category
router.route('/catpost')
    .get(function (req,res) {
        var category = req.query.category;
        var limita=0;
        var page = req.query.page;

        for(var i=1; i < page ; i++){
            limita+=10;
        }
        Post.find({category: category}, function (err, post) {
            if(err)
                res.send(err);


            console.log(post.length);
                if(post.length>0){
                    res.status(200).send;
                res.json({status: "ok", code: 200, posts: post});
                }
                if(post.length==0){
                    res.status(404).send;
                    res.json({status: "Category Not Found", code: 404});
                }


        }).skip(limita).limit(10);
    })

// end
app.listen(port);
app.use("/api", router);
console.log('We are running on Port ' + port);
