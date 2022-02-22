const express = require('express');
const app = require('../app');
const router = express.Router();

const usersController = require('../controller/users');

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

router.use('/', usersController);





module.exports = router;
