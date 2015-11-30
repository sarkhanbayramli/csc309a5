//Define the routes in this js file
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index.html');
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

//Ignores the favicon.ico get requests.
router.get('/favicon.ico', function(req, res, next) {
    res.writeHead(200, {'Content-Type': 'image/x-icon'} );
    res.end();
    console.log('Favicon request');
    return;
});

module.exports = router;
