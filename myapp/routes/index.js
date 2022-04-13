const express = require('express');
const router = express.Router();

const postRouter = require('./posts');
const usersRouter = require('./users');
const commentRouter = require('./comments');

router.use('/comment', commentRouter);
router.use('/users', usersRouter);
router.use('/posts', postRouter);

module.exports = router;
