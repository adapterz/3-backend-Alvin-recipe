const express = require('express');
const router = express.Router();

const commentsController = require('../controllers/comments');

// 댓글조회
router.post('/inquiry', commentsController.inquiry);
// 댓글 작성
router.post('/registration', commentsController.registration);
// 내가 쓴 댓글 수정
router.patch('/edit', commentsController.edit);
// 내가 쓴 댓글 삭제
router.delete('/', commentsController.delete);
// 내가쓴 댓글 조회
router.post('/user-inquiry', commentsController.commentInquiry);
// 댓글 좋아요
router.post('/like', commentsController.like);
// 댓글 좋아요 취소
router.delete('/like', commentsController.dislike);
// 댓글 좋아요 여부 확인
router.post('/check-like', commentsController.checkLike);
// 내가 쓴 댓글 페이징
router.post('/mypage-paging', commentsController.mypagePaging);

module.exports = router;
