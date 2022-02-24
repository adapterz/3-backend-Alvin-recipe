// const { router } = require("../app");
const express = require('express');
const router = express.Router();
const connection = require('../models/database');

//게시판 전체 조회
router.get('/', function (req, res) {
    connection.query('select title,writer,views,`like`,registration,comment from post', function (err, results) {
        res.status(200).send(results); // 제목,작성자,조회수,좋아요,등록일,댓글 조회해서 보여줌
    });
});

//게시판 글쓰기 코드
router.post('/', function (req, res) {
    if (req.sessionID !== req.cookies.sid) return res.status(400).send('login_and_use_it'); // 세션ID랑 쿠키에있는 세션ID가 다르면 글쓰기 불가, 로그인을 안했다고 판단

    const title = req.body.title;
    const contents = req.body.contents;

    // 제목 빈칸 불가
    if (title == undefined) return res.status(400).send('title_not_null');
    // 내용 빈칸 불가
    if (contents == undefined) return res.status(400).send('contents_not_null');

    connection.beginTransaction();
    connection.query(
        'insert into post (title,contents,writer,registration) values(?,?,?,now())',
        [title, contents, req.cookies.userId],
        function (err, results) {
            if (err) {
                connection.rollback();
                res.status(400).end();
            }
            connection.commit();
            res.status(201).end();
        }
    );
});

//게시판 글 검색
router.get('/search', function (req, res) {
    const title = req.body.title;
    const writer = req.body.writer;
    const contents = req.body.contents;

    if (title !== undefined) {
        // 제목으로 글 검색
        title = '%' + title + '%'; // select문에서 like 사용하기 위하여 재할당
        connection.query('select title from post where title like ?', title, function (err, results) {
            res.status(200).send(results);
        });
    }

    if (writer !== undefined) {
        // 작성자로 글 검색
        writer = '%' + writer + '%'; // select문에서 like 사용하기 위하여 재할당
        connection.query('select title from post where writer like ?', writer, function (err, results) {
            res.status(200).send(results);
        });
    }

    if (contents !== undefined) {
        // 내용으로 글 검색
        contents = '%' + contents + '%'; // select문에서 like 사용하기 위하여 재할당
        connection.query('select title from post where contents like ?', contents, function (err, results) {
            res.status(200).send(results);
        });
    }
});

//게시판 글 수정
router.patch('/', function (req, res) {
    const title = req.body.title;
    const writer = req.cookies.userId;
    let editContents = req.body.editContents;
    let editTitle = req.body.editTitle;

    if (req.sessionID !== req.cookies.sid) return res.status(400).send('login_and_use_it'); // 세션ID랑 쿠키에있는 세션ID가 다르면 글 수정 불가, 로그인을 안했다고 판단

    if (writer == undefined) return res.status(403).send('you_don`t_have_permission'); // 작성자가 없으면 수정 불가

    // if(writer == req.cookies.userId) return res.status(401).end();
    connection.beginTransaction();
    connection.query('select title,writer,id,contents from post where title = ?', title, function (err, results) {
        if (results.length == 0) {
            connection.rollback();
            return res.status(404).send('title_not_find');
        }

        if (editContents == undefined) editContents = results[0].contents;

        if (editTitle == undefined) editTitle = results[0].title;

        let checkId = results[0].writer;

        if (checkId !== req.cookies.userId) {
            connection.rollback();
            return res.status(403).send('you_don`t_have_permission');
        }

        if (err) {
            connection.rollback();
            return res.status(400).send('mysql_error');
        }

        let indexId = results[0].id;

        connection.query('update post set title = ?, contents = ?, edit = now() where id = ?', [editTitle, editContents, indexId]);
        connection.commit();
        res.status(200).end();

        // console.log(indexId);
        // console.log(results);
        // console.log(results.writer);
        // console.log(JSON.stringify(results));
    });
});

//게시판 상세보기
router.get('/view', function (req, res) {
    let title = req.body.title;

    if (title == undefined) return res.status(401).end();

    connection.query('select title,contents,writer,views,`like`,registration,edit,id from post where title = ?', title, function (err, results) {
        if (err) return res.status(400).end();

        if (results.length == 0) return res.status(401).end();

        let indexId = results[0].id;

        connection.query('update post set views = views + 1 where id = ?', indexId); // 게시판 상세보기하면 조회수가 1 오름

        res.status(200).send(results); // 제목,내용,작성자,조회수,좋아요,등록일,수정일을 보여줌
    });
});

//게시판 글 삭제
router.delete('/', function (req, res) {
    let title = req.body.title;

    if (req.sessionID !== req.cookies.sid) return res.status(400).send('login_and_use_it');

    if (title == undefined) return res.statusMessage(400).end();

    connection.beginTransaction();
    connection.query('select title,id from post where title = ?', title, function (err, results) {
        if (err) {
            connection.rollback();
            return res.status(400).end();
        }
        let indexId = results[0].id;

        connection.query('delete from post where id = ?', indexId);
        connection.commit();
        res.status(200).send('done');
    });
});
module.exports = router;
