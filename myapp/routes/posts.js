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
router.delete('/', postsController.delete);
// 게시글에 들어갈 이미지 업로드
router.post('/image-upload', upload.array('image'), postsController.imageUpload);

module.exports = router;
