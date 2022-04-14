const express = require('express');
const router = express.Router();
const connection = require('../models/database');

//내가 쓴 댓글 조회
exports.inquiry = async function (req, res) {
    // const userId = req.cookies.userId;
    const userNickname = req.body.userNickname;

    // if (req.sessionID !== req.cookies.sid) return res.status(400).send('login_and_ues_it'); // 로그인이 안되어 있으면 내가 쓴 댓글 조회 불가

    if (userNickname == undefined) return res.status(401).end();

    const dbData = async function () {
        const con = await connection.getConnection(async conn => conn);

        try {
            const [row] = await con.query('select contents, writer, registration from comment where writer = ?', userNickname);
            con.release();
            return row;
        } catch (err) {
            console.log(err);
            return res.status(500).end();
        }
    };

    const data = await dbData();
    return res.status(200).json({ length: data.length, results: data });
};

//댓글 작성 코드
exports.registration = async function (req, res) {
    let comment = req.body.comment;
    let userNickname = req.body.userNickname;

    // if (req.sessionID !== req.cookies.sid) return res.status(400).send('login_and_ues_it'); // 로그인 안하면 댓글 작성 불가

    if (comment == undefined) return res.status(400).send('comment_not_null');

    const dbData = async function () {
        const con = await connection.getConnection(async conn => conn);

        try {
            const [row] = await con.query('insert into comment (contents, writer, registration) values(?,?,now())', [comment, userNickname]);
            con.release();
            return res.status(201).end();
        } catch (err) {
            console.log(err);
            return res.status(500).end();
        }
    };

    dbData();
};

//댓글 수정 코드
exports.edit = async function (req, res) {
    let comment = req.body.comment;
    let editComment = req.body.editComment;
    const id = req.body.id;

    // if (req.sessionID !== req.cookies.sid) return res.status(400).send('login_and_ues_it');

    // if (comment == undefined) return res.status(400).end();

    if (editComment == undefined) return res.status(400).end();

    const dbData = async function () {
        const con = await connection.getConnection(async conn => conn);

        try {
            const [row] = await con.query('select id,contents from comment where id = ?', id);
            const upadte = await con.query('update comment set contents = ?, edit = now() where id = ?', [editComment, id]);
            con.release();
            return res.status(201).end();
        } catch (err) {
            console.log(err);
            return res.status(500).end();
        }
    };

    dbData();
};

//댓글 삭제 코드
exports.delete = async function (req, res) {
    let id = req.body.id;

    // if (req.sessionID !== req.cookies.sid) return res.status(400).send('login_and_ues_it');

    if (id == undefined) return res.status(400).end();

    const dbData = async function () {
        const con = await connection.getConnection(async conn => conn);

        try {
            const [row] = await con.query('update comment set `delete` = now() where id = ?', id);
            con.release();
            return res.status(201).end();
        } catch (err) {
            console.log(err);
            return res.status(500).end();
        }
    };

    dbData();
};

// module.exports = router;
