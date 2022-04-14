// const { router } = require("../app");
const express = require('express');
const router = express.Router();
const connection = require('../models/database');
const upload = require('../models/upload');

//게시판 전체 조회
router.get('/', async function (req, res) {
    const dbData = async function () {
        const con = await connection.getConnection(async conn => conn);

        try {
            const [row] = await con.query('select id,title,writer,views,`like`,registration,comment,images from post');
            con.release();
            return row;
        } catch (err) {
            console.log(err);
            return res.status(500).end();
        }
    };

    const data = await dbData();
    return res.status(200).json({ length: data.length, results: data });
});

//게시판 글쓰기 코드
router.post('/', async function (req, res) {
    // if (req.sessionID !== req.cookies.sid) return res.status(400).send('login_and_use_it'); // 세션ID랑 쿠키에있는 세션ID가 다르면 글쓰기 불가, 로그인을 안했다고 판단

    const title = req.body.title;
    const contents = req.body.contents;
    let images = req.body.images;
    const writer = req.body.writer;

    // 제목 빈칸 불가
    if (title == undefined) return res.status(400).send('title_not_null');
    // 내용 빈칸 불가
    if (contents == undefined) return res.status(400).send('contents_not_null');

    if (images.length == 0) {
        images = '없음';
    }

    const dbInsert = async function () {
        const con = await connection.getConnection(async conn => conn);
        // images.join('-');

        try {
            const [row] = await con.query('insert into post (title,contents,writer,images,registration) values(?,?,?,?,now())', [
                title,
                contents,
                writer,
                JSON.stringify({ images: images })
            ]);
            for (let i = 0; i < images.length; i++) {
                await con.query('update image set postindex = ? where id = ?', [row.insertId, images[i]]);
            }
            con.release();
            return res.status(201).end();
        } catch (err) {
            console.log(err);
            return res.status(500).end();
        }
    };

    await dbInsert();
});

//게시판 글 검색
router.post('/search', async function (req, res) {
    let title = req.body.title;
    const writer = req.body.writer;
    const contents = req.body.contents;

    if (title == undefined) return res.status(404).end();

    const dbData = async function () {
        const con = await connection.getConnection(async conn => conn);
        title = '%' + title + '%'; // select문에서 like 사용하기 위하여 재할당
        try {
            const [row] = await con.query('select title from post where title like ?', title);
            con.release();
            return row;
        } catch (err) {
            console.log(err);
            return res.status(500).end();
        }
    };

    dbData();
    const data = await dbData();

    if (data.length == 0) return res.status(404).end();

    return res.status(200).json({ results: data, length: data.length });
});

//게시판 글 수정
router.patch('/', async function (req, res) {
    const title = req.body.title;
    const writer = req.cookies.userId;
    const id = req.body.id;
    let editContents = req.body.editContents;
    let editTitle = req.body.editTitle;

    // if (req.sessionID !== req.cookies.sid) return res.status(400).send('login_and_use_it'); // 세션ID랑 쿠키에있는 세션ID가 다르면 글 수정 불가, 로그인을 안했다고 판단

    // if (writer == undefined) return res.status(403).send('you_don`t_have_permission'); // 작성자가 없으면 수정 불가

    const dbData = async function () {
        const con = await connection.getConnection(async conn => conn);
        try {
            const [row] = await con.query('select title,writer,id,contents from post where id = ?', id);
            con.release();
            return row;
        } catch (err) {
            console.log(err);
            return res.status(500).end();
        }
    };

    const data = await dbData();

    console.log(data);

    // if(writer == req.cookies.userId) return res.status(401).end();

    //     connection.beginTransaction();
    //     connection.query('select title,writer,id,contents from post where title = ?', title, function (err, results) {
    //         if (results.length == 0) {
    //             connection.rollback();
    //             return res.status(404).send('title_not_find');
    //         }

    //         if (editContents == undefined) editContents = results[0].contents;

    //         if (editTitle == undefined) editTitle = results[0].title;

    //         let checkId = results[0].writer;

    //         if (checkId !== req.cookies.userId) {
    //             connection.rollback();
    //             return res.status(403).send('you_don`t_have_permission');
    //         }

    //         if (err) {
    //             connection.rollback();
    //             return res.status(400).send('mysql_error');
    //         }

    //         let indexId = results[0].id;

    //         connection.query('update post set title = ?, contents = ?, edit = now() where id = ?', [editTitle, editContents, indexId]);
    //         connection.commit();
    //         res.status(200).end();
    //     });
});

//게시판 상세보기
router.post('/view', async function (req, res) {
    let id = req.body.id;

    if (id == undefined) return res.status(401).end();

    const dbData = async function () {
        const con = await connection.getConnection(async conn => conn);

        try {
            const [row] = await con.query('select title,contents,writer,views,`like`,registration,edit,id from post where id = ?', id);
            con.release();
            return res.status(200).json({ results: row });
        } catch (err) {
            console.log(err);
            return res.status(500).end();
        }
    };

    const data = await dbData();
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

//게시판 이미지 업로드
//XXX imageData 함수 ASYNC 되어 있는거 AWAIT로 변경해야함
router.post('/upload', upload.array('image'), async function (req, res) {
    const images = [];
    let imageURL;
    for (let i = 0; i < req.files.length; i++) {
        imageURL = '/image/' + req.files[i].filename;
        // imageURL = 'C:/Users/MYCOM/Desktop/어댑터즈/3-backend-Alvin-recipe/myapp/image' + req.files[i].filename;

        const imageData = async function () {
            const con = await connection.getConnection(async conn => conn);

            try {
                const [row] = await con.query('insert into image (image) values(?)', imageURL);
                con.release();
                return row;
            } catch (err) {
                console.log(err);
                return res.status(500).end();
            }
        };

        const data = imageData();
        images.push(data.insertId);
    }
    return res.status(201).json({ imageIndexId: images, imageURL: imageURL });
});

module.exports = router;
