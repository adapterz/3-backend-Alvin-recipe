const express = require('express');
const router = express.Router();
const upload = require('../models/upload');

const postsController = require('../controllers/posts');

// 게시글 전체조회
router.get('/', postsController.inquiry);
// 게시글 등록
router.post('/registration', postsController.registration);
// 게시글 검색
router.post('/search', postsController.search);
// 게시글 수정
router.patch('/edit', postsController.edit);
// 게시글 상세보기
router.post('/view', postsController.view);
// 게시글 삭제
router.patch('/', postsController.delete);
// 게시글에 들어갈 이미지 업로드
router.post('/image-upload', upload.array('image'), postsController.imageUpload);
// 게시글 정보 조회
router.post('/inquiry', postsController.postInquiry);
// 게시글 좋아요
router.post('/like', postsController.like);
// 게시글 좋아요 취소
router.delete('/like', postsController.dislike);
// 게시글 좋아요 여부 확인
router.post('/check-like', postsController.checkLike);
// 게시글 좋아요 갯수 확인
router.post('/count-like', postsController.countLike);
// 메인화면 페이징
router.post('/index-paging', postsController.indexPaging);
// 내가 쓴 게시글 페이징
router.post('/mypage-paging', postsController.mypagePaging);
module.exports = router;
