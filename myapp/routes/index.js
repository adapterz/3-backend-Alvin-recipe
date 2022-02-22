const express = require('express');
const router = express.Router();

const postRouter = require('../controller/post');
const usersRouter = require('./users');
const commentRouter = require('../controller/comment');


/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

router.use('/comment', commentRouter);
router.use('/users',usersRouter);
router.use('/post',postRouter);

module.exports = router;
