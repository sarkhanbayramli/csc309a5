//Define the routes in this js file
//TODO: Check permissions for each page
//TODO: Make sure if session doesn't exist, then don't let anyone to add/delete shit
var express = require('express');
var Business = require('../models/business');
var Feedback = require('../models/feedback');
var User = require('../models/user');
var router = express.Router();
var mongoose = require('mongoose');
var session = require('client-sessions');
var multer  = require('multer');
var uploadBusiness = multer({dest:'public/business/'});
var uploadUser = multer({dest:'public/avatars/'});

mongoose.connect('mongodb://localhost/SodaSopa');

function getTop(map, type){
  var result = {};
  for(var i=0; i < Object.keys(map).length; i++){
    if(map[Object.keys(map)[i]].businessType == type){
      if(Object.keys(result).length < 4){
        result[Object.keys(map)[i]] = map[Object.keys(map)[i]];
      }
      else{
        var leastRating = result[Object.keys(result)[0]].rating;
        var leastKey = Object.keys(result)[0];
        for(var j=0; j < 4; j++){
          if(result[Object.keys(result)[j]].rating < leastRating){
            leastRating = result[Object.keys(result)[j]].rating;
            leastKey = Object.keys(result)[j];
          }
        }
        delete result[leastKey];
        result[Object.keys(map)[i]] = map[Object.keys(map)[i]];
      }
    }
  }
  return result;
}

//Set up the session for the client
router.use(session({
  cookieName: 'session',
  secret: 'a5_assignment_passcode',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
}));

/* GET home page. */
router.get('/', function(req, res, next) {
    if(req.session){
      loggedId = req.session.userId;
      loggedEmail = req.session.email;
      loggedName = req.session.userName;
      loggedType = req.session.userType;
    }

    Feedback.find({}).populate('businessId').exec(function(err, feedbacks){
    var feedbackMap = {};
    for(var i=0; i<feedbacks.length; i++){
      var bid = feedbacks[i].businessId[0];
      if(feedbackMap[bid._id]){
        feedbackMap[bid._id].rating += feedbacks[i].rating;
      }
      else{
        feedbackMap[bid._id] = {rating: feedbacks[i].rating,
                               businessType: bid.type,
                               name : bid.name,
                                pic: bid.pic};
      }
    }
    var topHotels = getTop(feedbackMap, "Hotel");
    var topRestaurants = getTop(feedbackMap, "Restaurant");
    res.render('index.html', {id: loggedId,
                              email: loggedEmail,
                              name: loggedName,
                              type: loggedType,
                              hotels: topHotels,
                              restaurants: topRestaurants});
    });
});

/* GET login/register page. */
router.get('/login', function(req, res, next) {
    if(req.session){
      loggedId = req.session.userId;
      loggedEmail = req.session.email;
      loggedName = req.session.userName;
      loggedType = req.session.userType;
    }
    res.render('login.html', {id: loggedId,
                              email: loggedEmail,
                              name: loggedName,
                              type: loggedType});
});

/* GET browse page. */
router.get('/browse', function(req, res, next) {
    if(req.session){
      loggedId = req.session.userId;
      loggedEmail = req.session.email;
      loggedName = req.session.userName;
      loggedType = req.session.userType;
    }
    Feedback.find({}).populate('businessId').populate('authorId')
    .exec(function(err, feedbacks){
      var feedbackMap = {};
      for(var i=0; i < feedbacks.length; i++){
        if(feedbacks[i].businessId[0]){
        var bid = feedbacks[i].businessId[0]._id;
        if(feedbackMap[bid]){
          feedbackMap[bid].rating += feedbacks[i].rating;
          feedbackMap[bid].times += 1;
        }
        else{
          feedbackMap[bid] = {rating: feedbacks[i].rating,
                              name: feedbacks[i].businessId[0].name,
                              times: 1}
        }
        }
      }
      Business.find({}, function(error, businesses){
        for(var i=0; i < businesses.length; i++){
          if(!feedbackMap[businesses[i]._id]){
            feedbackMap[businesses[i]._id] = {rating: 0, name: businesses[i].name}
          }
        }
        res.render('browse.html', {map: feedbackMap,
                                  id: loggedId,
                              email: loggedEmail,
                              name: loggedName,
                              type: loggedType});
      });
    });
});

/* GET a specific business's page. */
router.get('/business/:id', function(req, res, next) {
    if(req.session){
      loggedId = req.session.userId;
      loggedEmail = req.session.email;
      loggedName = req.session.userName;
      loggedType = req.session.userType;
    }
    var id = require('mongodb').ObjectId(req.params.id);
    var bName;
    var bDescription;
    Business.findOne({"_id": id}, function(error, b){
      Feedback.find({"businessId": req.params.id}).populate("authorId")
      .exec(function(error, feedbacks){
        var avgrating = 0;
        for(var i=0; i< feedbacks.length; i++){
          avgrating += feedbacks[i].rating;
        }
        console.log("rating" + avgrating);
        avgrating = Math.round(avgrating/feedbacks.length);
        console.log("rating" + avgrating);
        bName = b.name;
        bDescription = b.description;
        //Get the recommended top businesses
        Feedback.find({}).populate('businessId').exec(function(err, f){
          var feedbackMap = {};
          for(var i=0; i<f.length; i++){
            var bid = f[i].businessId[0];
            if(bid._id != req.params.id){
            if(feedbackMap[bid._id]){
              feedbackMap[bid._id].rating += f[i].rating;
            }
            else{
              feedbackMap[bid._id] = {rating: f[i].rating,
                                     businessType: bid.type,
                                     name : bid.name,
                                      pic: bid.pic};
            }
            }
          }
          var top = getTop(feedbackMap, b.type);
          res.render('business.html', {bname: bName, 
                                       description: bDescription,
                                       list: feedbacks,
                                       pic: b.pic,
                                       owner: b.owner,
                                       loggedUser: req.session.userId,
                                       bid: id,
                                       id: loggedId,
                                       email: loggedEmail,
                                       name: loggedName,
                                       type: loggedType,
                                       rate: avgrating,
                                       recommended: top});
      });
    });
    });
});

/* POST a feedback about a specific business. */
router.post('/business/:id', function(req, res, next) {
    var rating = req.body.rating;
    var text = req.body.feedback_text;
    if(text != ""){
    var bid = require('mongodb').ObjectId(req.params.id);
    var uid = require('mongodb').ObjectId(req.session.userId);
    var newFeedback = new Feedback({businessId: bid,
                                    authorId: uid,
                                    rating: rating,
                                    feedbackText: text});
    newFeedback.save(function(err){
      if (err) return console.error(err);
      console.log("successfully saved!");
    });
    }
    res.redirect('/business/'+req.params.id);
});

/* GET an add a new business page. */
router.get('/add', function(req, res, next) {
    if(req.session){
      loggedId = req.session.userId;
      loggedEmail = req.session.email;
      loggedName = req.session.userName;
      loggedType = req.session.userType;
    }
    if(req.session.userId){
    res.render('add.html', {id: loggedId,
                          email: loggedEmail,
                          name: loggedName,
                          type: loggedType});
    }
    else{
      res.redirect('/');
    }
});

/* POST route to add a new business. */
//TODO: Support image upload
router.post('/add', uploadBusiness.single('business_img'), function(req, res, next) {
    var business_name = req.body.business_name;
    var business_description = req.body.business_description;
    var business_type = req.body.businessType;
    var business_file = req.body.business_img;
    if(business_name != "" && business_description != ""){
    var owner = require('mongodb').ObjectId(req.session.userId);
    var newBusiness = new Business({name: business_name,
                                    description: business_description,
                                    owner: owner,
                                    pic: req.file.filename,
                                    type: business_type});
    newBusiness.save(function(err){
      if (err) return console.error(err);
      console.log("successfully saved business!");
    });
    }
    res.redirect('/browse');
});

/* GET a specific user. */
router.get('/user/:id', function(req, res, next) {
    if(req.session){
      loggedId = req.session.userId;
      loggedEmail = req.session.email;
      loggedName = req.session.userName;
      loggedType = req.session.userType;
    }
    var userId = require('mongodb').ObjectId(req.params.id);
    Feedback.find({"authorId": userId}).populate("businessId")
    .exec(function(error, feedbacks){
      User.findOne({"_id": userId}, function(error, user){
        res.render('user.html', {loggedUser: req.session.userId,
                               currentUser: req.params.id,
                               list: feedbacks,
                                username: user.name,
                                location: user.location,
                                pic: user.pic,
                              id: loggedId,
                          email: loggedEmail,
                          name: loggedName,
                          type: loggedType});

      });
    })
});

/* GET your profile user. */
router.get('/profile', function(req, res, next) {
    res.redirect('/user/'+req.session.userId);
});

/* GET page to edit your profile. */
router.get('/editprofile', function(req, res, next) {
    if(req.session){
      loggedId = req.session.userId;
      loggedEmail = req.session.email;
      loggedName = req.session.userName;
      loggedType = req.session.userType;
    }

    if(req.session.userId){
    var userId = require('mongodb').ObjectId(req.session.userId);
    User.findOne({"_id": userId}, function(error, user){
        res.render('editprofile.html', {
                                loggedUser: req.session.userId,
                                username: user.name,
                                location: user.location,
                                pic: user.pic,
                              id: loggedId,
                          email: loggedEmail,
                          name: loggedName,
                          type: loggedType
                                });

      });
  }
  else{
    res.redirect('/');
  }
});

/* GET page to edit specific business. */
router.get('/editbusiness/:id', function(req, res, next) {
    if(req.session){
      loggedId = req.session.userId;
      loggedEmail = req.session.email;
      loggedName = req.session.userName;
      loggedType = req.session.userType;
    }

    if(req.session.userId){
  var id = require('mongodb').ObjectId(req.params.id);
    Business.findOne({"_id": id}, function(error, business){
        res.render('editbusiness.html', {
                                name: business.name,
                                description: business.description,
                                pic: business.pic,
                              id: loggedId,
                          email: loggedEmail,
                          name: loggedName,
                          type: loggedType});

      });
  }
  else{
    res.redirect('/');
  }
});

router.post('/editbusiness/:id', function(req, res, next){
  var id = require('mongodb').ObjectId(req.params.id);
  Business.update({"_id":id},
    {description:req.body.business_description}, {upsert:false}, function(err, e){
      res.redirect('/business/'+req.params.id);
    })
});

router.post('/changeinfo', function(req, res, next){
  var id = req.session.userId;
  User.update({"_id":id},
    {name:req.body.change_name, location: req.body.change_location},
     {upsert:false}, function(err, e){
      res.redirect('/profile');
    });
});

router.post('/changepassword', function(req, res, next){
  var id = req.session.userId;
  if(req.body.change_password == req.body.change_password_confirm){
  User.update({"_id":id},
    {password:req.body.change_password},
     {upsert:false}, function(err, e){
      res.redirect('/profile');
    });
  }
  else{
      res.redirect('/profile');
  }
});

router.post('/changeavatar',  uploadUser.single('avatar'), function(req, res, next){  
    var id = req.session.userId;
    User.update({"_id":id},
    {pic:req.file.filename},
     {upsert:false}, function(err, e){
      res.redirect('/profile');
    });
});

/* POST method for registration */
//TODO: Check to see if the email does not exist
//TODO: Check to see if email has a correct style
//TODO: Check to see passwords match
//TODO: Redirect to right place
router.post('/register', function(req, res, next){
    var register_email = req.body.register_email;
    var register_name = req.body.register_name;
    var register_password = req.body.register_password;
    var register_password_confirm = req.body.register_password_confirm;
    if(register_password == register_password_confirm){
      User.find({}, function(error, users){
        if(users){
          User.findOne({email:register_email}, function(error, u){
            if(u){

            }
            else{
              var newUser = new User({email: register_email,
                              name: register_name,
                              location: "",
                              password: register_password,
                              userType: "normal"});
              newUser.save(function(err){
              if (err) return console.error(err);
              console.log("successfully saved!");
              });
            }
          });
          }
          else{
          var newUser = new User({email: register_email,
                              name: register_name,
                              location: "",
                              password: register_password,
                              userType: "admin"});
          newUser.save(function(err){
          if (err) return console.error(err);
          console.log("successfully saved!");
          });
        }
      });
    }
    res.redirect('/login');
});

/* POST method for login */
//TODO: Send an email with a confirmation password
//TODO: Register a session
//TODO: Check if the passwords match before redirecting
router.post('/login', function(req, res, next){
    var login_email = req.body.login_email;
    var login_password = req.body.login_password;
    User.findOne({email: login_email}, function(error, u){
        if(u){
          //send an email, ask for a prompt, check the validation code
          if(u.password == login_password){
            req.session.email = u.email;
            req.session.userType = u.userType;
            req.session.userName = u.name;
            req.session.userId = u._id;
            res.redirect('/');
          }
          else{
            res.redirect('/login');
          }
        }
        else{
          //otherwise redirect back to login page
          res.redirect('/login');
        }
    });
});

//Route for logging out. Destroys the created session
router.get('/logout', function(req, res, next){
  if(req.session){
    req.session.destroy();
    res.redirect('/');
  }
  else{
    res.redirect('/');
  }
});

//Ignores the favicon.ico get requests.
router.get('/favicon.ico', function(req, res, next) {
    res.writeHead(200, {'Content-Type': 'image/x-icon'} );
    res.end();
    console.log('Favicon request');
    return;
});

//All of the admin stuff begins here
//User admin stuff begins here
router.get('/admin', function(req, res, next){
  if(req.session){
    loggedId = req.session.userId;
    loggedEmail = req.session.email;
    loggedName = req.session.userName;
    loggedType = req.session.userType;
  }
  if(loggedType == 'admin'){
    User.find({}, function(err, users){

      res.render('admin.html', {id: loggedId,
                              email: loggedEmail,
                              name: loggedName,
                              type: loggedType,
                              list: users});
    });
  }
  else{
    res.redirect('/login')
  }
});

router.get('/makeadmin/:id', function(req, res, next){
  if(req.session){
    loggedId = req.session.userId;
    loggedEmail = req.session.email;
    loggedName = req.session.userName;
    loggedType = req.session.userType;
  }
  if(loggedType == 'admin'){
    var id = require('mongodb').ObjectId(req.params.id);
    User.update({"_id":id},
      {userType:"admin"},
       {upsert:false}, function(err, e){
        res.redirect('/admin');
      });
  }
  else{
    res.redirect('/login')
  }
});

router.get('/makenormal/:id', function(req, res, next){
  if(req.session){
    loggedId = req.session.userId;
    loggedEmail = req.session.email;
    loggedName = req.session.userName;
    loggedType = req.session.userType;
  }
  if(loggedType == 'admin'){
    var id = require('mongodb').ObjectId(req.params.id);
    User.update({"_id":id},
      {userType:"normal"},
       {upsert:false}, function(err, e){
        res.redirect('/admin');
      });
  }
  else{
    res.redirect('/login')
  }
});

//Businesses admin stuff begins here
router.get('/admin/business', function(req, res, next){
  if(req.session){
    loggedId = req.session.userId;
    loggedEmail = req.session.email;
    loggedName = req.session.userName;
    loggedType = req.session.userType;
  }
  if(loggedType == 'admin'){
    Business.find({}, function(err, business){

      res.render('businessadmin.html', {id: loggedId,
                              email: loggedEmail,
                              name: loggedName,
                              type: loggedType,
                              list: business});
    });
  }
  else{
    res.redirect('/login')
  }
});

router.get('/deletebusiness/:id', function(req, res, next){
  if(req.session){
    loggedId = req.session.userId;
    loggedEmail = req.session.email;
    loggedName = req.session.userName;
    loggedType = req.session.userType;
  }
  if(loggedType == 'admin'){
    var id = require('mongodb').ObjectId(req.params.id);
    Business.remove({"_id":id}, function(err){
      Feedback.remove({"businessId": id}, function(err){
        res.redirect('/admin/business')
      });
    });
  }
  else{
    res.redirect('/login')
  }
});

//Admin of feedback starts here
router.get('/admin/feedback', function(req, res, next){
  if(req.session){
    loggedId = req.session.userId;
    loggedEmail = req.session.email;
    loggedName = req.session.userName;
    loggedType = req.session.userType;
  }
  if(loggedType == 'admin'){
    Feedback.find({}).populate('businessId').populate('authorId')
      .exec(function(err, feedbacks){
      res.render('feedbackadmin.html', {id: loggedId,
                              email: loggedEmail,
                              name: loggedName,
                              type: loggedType,
                              list: feedbacks});
    });
  }
  else{
    res.redirect('/login')
  }
});

router.get('/deletefeedback/:id', function(req, res, next){
  if(req.session){
    loggedId = req.session.userId;
    loggedEmail = req.session.email;
    loggedName = req.session.userName;
    loggedType = req.session.userType;
  }
  if(loggedType == 'admin'){
    var id = require('mongodb').ObjectId(req.params.id);
      Feedback.remove({"_id": id}, function(err){
        res.redirect('/admin/feedback')
      });
  }
  else{
    res.redirect('/login')
  }
});

router.get('/search', function(req, res, next){
    if(req.session){
      loggedId = req.session.userId;
      loggedEmail = req.session.email;
      loggedName = req.session.userName;
      loggedType = req.session.userType;
    }
  res.render('search.html', {id: loggedId,
                            email: loggedEmail,
                            name: loggedName,
                            type: loggedType});
})

router.post('/search', function(req, res, next){
    if(req.session){
      loggedId = req.session.userId;
      loggedEmail = req.session.email;
      loggedName = req.session.userName;
      loggedType = req.session.userType;
    }
    Business.find({name:new RegExp(req.body.search, "i")}, function(err, b){
      
    res.render('search.html', {id: loggedId,
                            email: loggedEmail,
                            name: loggedName,
                            type: loggedType,
                            list: b});
    });
});
module.exports = router;
