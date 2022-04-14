const express = require('express');
const router = express.Router();
const upload = require('../models/upload');

const usersController = require('../controllers/users');

// 이메일 인증번호 발송
router.post('/auth-email', usersController.authEmail);
// 이메일 인증
router.post('auth', usersController.auth);
// 회원 가입
router.post('/signup', usersController.signup);
// 로그인
router.post('/login', usersController.login);
// 로그아웃
router.get('/logout', usersController.logout);
// 회원탈퇴
router.delete('/withdrawal', usersController.withdrawal);
// 회원정보 수정
router.patch('/edit', usersController.edit);
// 아이디 찾기
router.post('/find-id', usersController.findId);
// 비밀번호 찾기
router.post('/find-password', usersController.findPassword);
// 회원 프로필사진 수정
router.patch('/image-upload', upload.single('image'), usersController.imageUpload);

module.exports = router;
