// const { router } = require("../app");
const express = require('express');
const router = express.Router();
const connection = require('../database');


//게시판 전체 조회
router.get('/', function(req, res){
    
    connection.query('select title,writer,views,`like`,registration,comment from post',function(err, results){
        res.status(200).send(results);
    });

    // res.status(200).send('post_page!!!');
})

//게시판 글쓰기 코드
router.post('/', function(req, res){

    // console.log(req.cookies);
    // console.log(req.sessionID);
    if(req.sessionID !== req.cookies.sid) return res.status(400).send('login_and_use_it');

    let title = req.body.title;
    let contents = req.body.contents;

    // 제목 빈칸 불가
    if(title == undefined) res.status(400).send('title_not_null');
    // 내용 빈칸 불가
    if(contents == undefined) res.status(400).send('contents_not_null');
    connection.beginTransaction();
    connection.query('insert into post (title,contents,writer,registration) values(?,?,?,now())',[title, contents, req.cookies.userId],function(err, results){

        if(err) {
            connection.rollback();
            res.status(400).end();
        }
        connection.commit();
        res.status(201).send('done.')
    });
    

});

//게시판 글 검색
router.get('/search', function(req,res){

    let title = req.body.title
    let writer = req.body.writer
    let contents = req.body.contents

    console.log(title);
    
    if(title !== undefined){ // 제목으로 글 검색
        title = "%"+title+"%"; // select문에서 like 사용하기 위하여 재할당
        connection.query('select title from post where title like ?', title, function(err, results){
            res.status(200).send(results);
        })
    }

    if(writer !== undefined){ // 작성자로 글 검색
        writer = "%"+writer+"%"; // select문에서 like 사용하기 위하여 재할당
        connection.query('select title from post where writer like ?', writer, function(err, results){
            res.status(200).send(results);
        })
    }

    if(contents !== undefined){ // 내용으로 글 검색
        contents = "%"+contents+"%"; // select문에서 like 사용하기 위하여 재할당
        connection.query('select title from post where contents like ?', contents, function(err, results){
            res.status(200).send(results);
        })
    }

});

//게시판 글 수정
router.patch('/', function(req, res){
    
    let title = req.body.title;
    let writer = req.cookies.userId;
    let editContents = req.body.editContents;
    let editTitle = req.body.editTitle;

    if(writer == undefined) return res.status(403).send('you_don`t_have_permission');

    // if(writer == req.cookies.userId) return res.status(401).end();
    connection.beginTransaction();
    connection.query('select title,writer,id from post where title = ?', title, function(err, results){

        
        if(results.length == 0) {
            connection.rollback();
            return res.status(404).send('title_not_find');
        }

        let checkId = results[0].writer;

        if(checkId !== req.cookies.userId){
            connection.rollback();
            return res.status(403).send('you_don`t_have_permission');
        }
        
        if(err){
            connection.rollback();
            return res.status(400).send('mysql_error')
        }
        
        let indexId = results[0].id;

        connection.query('update post set title = ?, contents = ?, edit = now() where id = ?',[editTitle, editContents,indexId]);
        connection.commit();
        res.status(200).send('done');
        
        // console.log(indexId);
        // console.log(results);
        // console.log(results.writer);
        // console.log(JSON.stringify(results));

    })
});

//게시판 상세보기
router.get('/view', function(req, res){

    let title = req.body.title;

    if(title == undefined) return res.status(401).end();
    
    connection.query('select title,contents,writer,views,`like`,registration,edit,id from post where title = ?', title, function(err, results){

        if(err) return res.status(400).send('mysql_error');

        if(results.length == 0) return res.status(401).end();

        let indexId = results[0].id;

        connection.query('update post set views = views + 1 where id = ?',indexId);

        res.status(200).send(results);

    })
});
module.exports = router;