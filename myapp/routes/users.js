const express = require('express');
const router = express.Router();

const usersController = require('../controllers/users');
const imageRouter = require('../controllers/image');
const testRouter = require('../controllers/test');

router.use('/test', testRouter);
router.use('/profile', imageRouter);
router.use('/', usersController);

module.exports = router;
