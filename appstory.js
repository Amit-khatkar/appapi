var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var crypto = require('crypto');
var Post = require("./model/postmodel");
var User = require("./model/usermodel");

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json());

mongoose.connect('mongodb://amitkhatkar:[password]@ds157112.mlab.com:57112/testappdb');
var port = 3000;
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
      post.style = req.body.style;
      if(req.body.style=="mthumb"){
          var img0 = req.body.thumb1;
          var img1 = req.body.thumb2;
          var img2 = req.body.thumb3;
          post.images.addToSet ({url: img0});
          post.images.addToSet({url: img1});
          post.images.addToSet( {url: img2});
      }
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
// create a user
router.route('/createuser')
    .post(function (req,res) {
        var token;
        require('crypto').randomBytes(24, function(err, buffer) {
            token = buffer.toString('hex');
        });
        var user = new User;
        user.name = req.query.name;
        user.email = req.query.email;
        user.credits = 0;
        user.device_id = req.query.device_id;
        user.access_token = token;
        var hash = crypto.createHash('sha256').update(req.query.password).digest('base64');
        user.password = hash;

        User.findOne({email: req.query.email}, function (err,useremail) {
            if(err){
                res.send(err)
            }
            if(useremail){
                res.json({Status: "422", Error: "Email Address already registered"})
            }else{
                User.findOne({device_id: req.query.device_id}, function (err,userdevice) {
                    if(err){
                        res.send(err)
                    }
                    if(userdevice){
                        res.json({Status: "422", Error: "This Device is Already registered"})
                    } else{

                        user.save(function (err, resp) {
                            if(err)
                                res.send(err);
                            res.json({ message: resp });
                        })
                    }
                })
            }
        })
    })
//end
//login
router.route('/login').get(function (req,res) {
    var email = req.query.email;
    var pass = req.query.password;
    var token;
    require('crypto').randomBytes(24, function (err, buffer) {
        token = buffer.toString('hex');
    });

    var password = crypto.createHash('sha256').update(pass).digest('base64');

    User.findOne({email: email}, function (err, user) {
        if (err) {
            res.send(err)
        }
        if (!user) {
            res.status(404);
            res.json({
                Status: 404,
                Error: "Bro u r not registered"
            })
        }

        if (user) {
            User.findOne({email: email, password: password},function (err,users) {
               if(err){
                   res.send(err)

               }
               if(users){
                   user.access_token = token;
                   user.save(function (err, resp) {
                       if (err)
                           res.send(err);
                       res.json({status: 200,accesstoken: resp.access_token});
                   });
               }else{
                   res.status(401);
                   res.json({
                       Status: 401,
                       Error: "Your Password is Incorrect"
                   })
               }
            })

        }
    })
})

//login end

//sign in with google end
router.route('/glogin').post(function (req,res) {
    var token;
    require('crypto').randomBytes(24, function(err, buffer) {
        token = buffer.toString('hex');
    });
    var user = new User;



    User.findOne({email: req.query.email}, function (err,useremail) {
        if(err){
            res.send(err)
        }
        if(useremail){
            user.access_token = token;

            user.save(function (err, resp) {
                if (err)
                    res.send(err);
                res.json({status: 200,accesstoken: resp});
            });
        }else{
            User.findOne({device_id: req.query.device_id}, function (err,userdevice) {
                if(err){
                    res.send(err)
                }
                if(userdevice){
                    res.json({Status: "422", Error: "This Device is Already registered"})
                } else{
                    user.name = req.query.name;
                    user.email = req.query.email;
                    user.credits = 0;
                    user.device_id = req.query.device_id;
                    user.access_token = token;
                    user.save(function (err, resp) {
                        if(err)
                            res.send(err);
                        res.json({ message: resp });
                    })
                }
            })
        }
    })
})
// reads a post
// router.route('/read').post(function (req,res) {
//     var access_token = req.query.token;
//     var postid = req.query.postid;
//     Post.findOne({_id: req.query.postid}, function (err,post) {
//         if(err){
//             res.send(err);
//         }
//         if(post){
//             var credits =post.credits;
//             var postname = post.title;
//             User.findOne({access_token: access_token}, function (err,user) {
//                 if(err){
//                     res.send(err)
//                 }
//
//                 if(!user){
//                     res.json({error:'Session Expired'})
//                 }else{
//                     User.findOne({access_token: access_token, "news.postid": postid}, function (err,post) {
//                         if(err){
//                             res.send(err)
//                         }
//                         if(post){
//                             res.json({error: "Already Availed"})
//                         }else{
//                             user.news.addToSet( {title: postname, postid: postid})
//                             user.credits += credits;
//                             user.save(function (err, resp) {
//                                 if (err)
//                                     res.send(err);
//                                 res.send(resp); // is
//
//
//
//                             });
//                         }
//
//                     })
//                 }
//             })
//         }else{
//             res.status(404).send;
//             res.json({error:'This post is Expired or Not Found'})
//
//         }
//     })
// })
//end
//sign in with google

app.listen( process.env.PORT || port);
app.use("/api", router);
console.log('We are running on Port ' + port);
