const express = require('express');
const router = express.Router();

const commentsController = require('../controllers/comments');

// router.use('/', commentsController);
// 내가 쓴 댓글 보기
router.post('/inquiry', commentsController.inquiry);
// 댓글 작성
router.post('/registration', commentsController.registration);
// 내가 쓴 댓글 수정
router.patch('/edit', commentsController.edit);
// 내가 쓴 댓글 삭제
router.delete('/', commentsController.delete);

module.exports = router;
