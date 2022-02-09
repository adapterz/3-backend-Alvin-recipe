// const { router, rawListeners } = require("../app");
var express = require('express');
var router = express.Router();

router.get('/signup', function(req, res, next){
    // console.log('signup_page!!');
    res.send('signup_page!!!!!!!!');
});





// router.get('/', function (req, res, next) {
//     // res.render('index', { title: 'Express' });
//     res.send('Express');
//   });

module.exports = router;