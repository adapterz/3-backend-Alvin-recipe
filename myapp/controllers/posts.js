// const express = require('express');
// const router = express.Router();
const connection = require('../models/database');
const upload = require('../models/upload');
const testdb = require('../models/test');

//게시판 전체 조회
exports.inquiry = async function (req, res) {
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
};

//게시판 글쓰기 코드
exports.registration = async function (req, res) {
    // if (req.sessionID !== req.cookies.sid) return res.status(400).send('login_and_use_it'); // 세션ID랑 쿠키에있는 세션ID가 다르면 글쓰기 불가, 로그인을 안했다고 판단

    const title = req.body.title;
    const contents = req.body.contents;
    let images = req.body.images;
    const writer = req.body.writer;

    // 제목 빈칸 불가
    if (title == undefined) return res.status(400).send('title_not_null');
    // 내용 빈칸 불가
    if (contents == undefined) return res.status(400).send('contents_not_null');

    if (images == undefined || images.length == 0) {
        const dbInsert = async function () {
            const con = await connection.getConnection(async conn => conn);

            try {
                const [row] = await con.query('insert into post (title,contents,writer,registration) values(?,?,?,now())', [title, contents, writer]);
                con.release();
                return res.status(201).end();
            } catch (err) {
                console.log(err);
                return res.status(500).end();
            }
        };

        await dbInsert();
        return;
    }

    if (images !== undefined || images.length !== 0) {
        const dbInsert = async function () {
            const con = await connection.getConnection(async conn => conn);

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
    }
};

//게시판 글 검색
exports.search = async function (req, res) {
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
};

//게시판 글 수정
exports.edit = async function (req, res) {
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

    if (editTitle == undefined) editTitle = data[0].title; // 바꿀 제목이 없으면 기존 제목으로 할당

    if (editContents == undefined) editContents = data[0].contents; // 바꿀 내용이 없으면 기존 제목으로 할당

    const dbUpadte = async function () {
        const con = await connection.getConnection(async conn => conn);
        const indexId = data[0].id;
        try {
            const [row] = await con.query('update post set title = ?, contents = ?, edit = now() where id = ?', [editTitle, editContents, indexId]);
            con.release();
            return res.status(201).end();
        } catch (err) {
            console.log(err);
            return res.status(500).end();
        }
    };

    dbUpadte();
};

//게시판 상세보기
exports.view = async function (req, res) {
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
};

//게시판 글 삭제
exports.delete = async function (req, res) {
    const id = req.body.id;
    const writer = req.body.writer;

    const dbData = async function () {
        const con = await connection.getConnection(async conn => conn);
        try {
            const [row] = await con.query('select title,writer,id,contents from post where id = ?', id);

            if (row[0].writer !== writer) {
                con.release();
                return res.status(401).end();
            }
            if (row[0].writer == writer) {
                con.query('delete from post where id = ?', row[0].id);
                con.release();
                return res.status(200).end();
            }
            return;
        } catch (err) {
            console.log(err);
            return res.status(500).end();
        }
    };

    dbData();
};

//게시판 이미지 업로드
//XXX imageData 함수 ASYNC 되어 있는거 AWAIT로 변경해야함
exports.imageUpload = async function (req, res) {
    const images = [];
    let imageURL;

    // console.log(req.files.length);

    for (let i = 0; i < req.files.length; i++) {
        imageURL = '/image/' + req.files[i].filename;

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

        const data = await imageData();
        images.push(data.insertId);
    }
    return res.status(201).json({ imageIndexId: images, imageURL: imageURL });
};
