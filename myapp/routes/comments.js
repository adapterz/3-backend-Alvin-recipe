const express = require('express');
const router = express.Router();

const commentsController = require('../controllers/comments');

router.use('/', commentsController);

module.exports = router;
