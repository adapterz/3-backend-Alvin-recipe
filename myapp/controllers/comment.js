const express = require('express');
const router = express.Router();
const connection = require('../models/database');

//내가 쓴 댓글 조회
router.get('/', function (req, res) {
    // res.status(200).send('comment_page');
    const userId = req.cookies.userId;

    if (req.sessionID !== req.cookies.sid) return res.status(400).send('login_and_ues_it'); // 로그인이 안되어 있으면 내가 쓴 댓글 조회 불가

    connection.query('select contents, writer, registration from commnet where writer = ?', userId, function (err, results) {
        if (err) return res.status(404).end();

        return res.status(200).send(results); // 댓글내용, 작성자, 작성일을 보여줌
    });
});

//댓글 작성 코드
router.post('/', function (req, res) {
    let comment = req.body.comment;
    let userId = req.cookies.userId;

    if (req.sessionID !== req.cookies.sid) return res.status(400).send('login_and_ues_it'); // 로그인 안하면 댓글 작성 불가

    if (comment == undefined) return res.status(400).send('comment_not_null');

    connection.beginTransaction();
    connection.query('insert into comment (contents, writer, registration) values(?,?,now())', [comment, userId], function (err, results) {
        if (err) {
            connection.rollback();
            return res.status(500).end();
        }
        connection.commit();
        res.status(201).end();
    });
});

//댓글 수정 코드
router.patch('/', function (req, res) {
    let comment = req.body.comment;
    let editComment = req.body.editComment;

    if (req.sessionID !== req.cookies.sid) return res.status(400).send('login_and_ues_it');

    if (comment == undefined) return res.status(400).end();

    if (editComment == undefined) return res.status(400).end();

    connection.beginTransaction();
    connection.query('select contents,id from comment where contents = ? ', comment, function (err, results) {
        console.log(results);
        if (results.length == 0) {
            connection.rollback();
            return res.status(400).send('1');
        }

        let indexId = results[0].id;

        if (err) {
            connection.rollback();
            return res.status(400).send('2');
        }

        connection.query('update comment set contents = ?, edit = now() where id = ?', [editComment, indexId]);
        connection.commit();
        res.status(200).send('done');
    });
});

//댓글 삭제 코드
router.delete('/', function (req, res) {
    let comment = req.body.comment;

    if (req.sessionID !== req.cookies.sid) return res.status(400).send('login_and_ues_it');

    if (comment == undefined) return res.status(400).end();

    connection.beginTransaction();
    connection.query('select contents,id from comment where contents = ? ', comment, function (err, results) {
        if (results.length == 0) {
            connection.rollback();
            return res.status(400).send('1');
        }

        if (err) {
            connection.rollback();
            return res.status(400).end();
        }

        let indexId = results[0].id;

        connection.query('delete from comment where id = ?', indexId);
        connection.commit();
        res.status(200).send('done');
    });
});

module.exports = router;
