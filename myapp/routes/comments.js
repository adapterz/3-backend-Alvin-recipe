const express = require('express');
const router = express.Router();

const commentsController = require('../controllers/comments');

// router.use('/', commentsController);
router.post('/inquiry', commentsController.inquiry);
router.post('/registration', commentsController.registration);
router.patch('/edit', commentsController.edit);
router.delete('/', commentsController.delete);

module.exports = router;
