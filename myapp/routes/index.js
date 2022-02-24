const express = require('express');
const router = express.Router();

const postRouter = require('../controllers/post');
const usersRouter = require('./users');
const commentRouter = require('../controllers/comment');

router.use('/comment', commentRouter);
router.use('/users', usersRouter);
router.use('/post', postRouter);

module.exports = router;
