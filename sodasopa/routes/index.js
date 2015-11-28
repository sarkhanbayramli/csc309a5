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

//Ignores the favicon.ico get requests.
router.get('/favicon.ico', function(req, res, next) {
    res.writeHead(200, {'Content-Type': 'image/x-icon'} );
    res.end();
    console.log('Favicon request');
    return;
});

module.exports = router;
