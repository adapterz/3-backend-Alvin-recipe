const express = require('express');
const app = require('../app');
const router = express.Router();

const usersController = require('../controllers/users');

router.use('/', usersController);

module.exports = router;
