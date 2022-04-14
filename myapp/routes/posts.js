const express = require('express');
const router = express.Router();

const postsController = require('../controllers/posts');

router.use('/', postsController);

module.exports = router;
