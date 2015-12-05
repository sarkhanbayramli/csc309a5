//Define the routes in this js file
var express = require('express');
var Business = require('../models/business');
var User = require('../models/user');
var router = express.Router();
var mongoose = require('mongoose');
var session = require('client-sessions');

mongoose.connect('mongodb://localhost/SodaSopa');

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
  	res.render('index.html', {id: loggedId,
                              email: loggedEmail,
                              name: loggedName,
                              type: loggedType});
});

/* GET login/register page. */
router.get('/login', function(req, res, next) {
  	res.render('login.html');
});

/* GET a specific business's page. */
router.get('/business/:id', function(req, res, next) {
  	res.render('business.html');
});

/* GET a specific user. */
router.get('/user/:id', function(req, res, next) {
  	res.render('user.html');
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
    var newUser = new User({email: register_email,
                            name: register_name,
                            location: "",
                            password: register_password,
                            userType: "normal"});
    newUser.save(function(err){
      if (err) return console.error(err);
      console.log("successfully saved!");
    });
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

module.exports = router;
