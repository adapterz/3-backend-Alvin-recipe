const express = require('express');
const router = express.Router();
const mysql = require('mysql');
require("dotenv").config();

router.get('/', function(req, res){
    // console.log('signup_page!!');
    res.send('signup_page!!!!!!!!');
});
// let userList = [];

//mysql 연결
const connection = mysql.createConnection({
  host : process.env.databaseHost,
  port : process.env.databasePort,
  user : process.env.databaseUser,
  password : process.env.databasePassword,
  database : process.env.databaseName
});

connection.connect();

// 회원 가입 코드
router.post('/', function(req,res){

    let userId = req.body.userId;
    let userNickname = req.body.userNickname;
    let userPassword = req.body.userPassword;
    let userRetryPassword = req.body.userRetryPassword;
    let userEmail = req.body.userEmail;

    // ID 빈칸 불가
    if (userId == null || userId == undefined) return res.status(400).send('userId_please_add_it.');
    // 닉네임 빈칸 불가
    if (userNickname == null || userNickname == undefined) return res.status(400).send('userNickname_please_add_it.');
    // 패스워드 빈칸 불가
    if (userPassword == null || userPassword == undefined) return res.status(400).send('userPassword_please_add_it.');
    // 이메일 빈칸 불가
    if (userEmail == null || userEmail == undefined) return res.status(400).send('userEmail_please_add_it.');
    // 패스워드와 재입력패스워드가 다르면 회원가입 불가
    if (userPassword !== userRetryPassword) return res.status(400).send('it_doesn`t_match_the_password');

    //XXX 추후 수정 예정
    connection.query('select * from user where user_id = ?', userId, function(err, results){ // ID 중복 검사
        if(results.length < 1){ // 중복되는 ID가 없으면 사용 가능
            console.log('useable_id.');
            connection.query('select * from user where nickname = ?', userNickname, function(err, results){ // 닉네임 중복 검사
                if(results.length < 1){ // 중복되는 닉네임이 없으면 회원 가입 완료
                    console.log('useable_nickname.')
                    connection.query('insert into user (user_id, nickname, password, email, registration) values(?,?,?,?,now())',[userId, userNickname, userPassword, userEmail]) // 회원정보 user 테이블에 저장
                    connection.query('insert into hide_user (user_id, nickname, password, email, registration) values(?,?,?,?,now())',[userId, userNickname, userPassword, userEmail]) // 회원정보를 안보이게 저장
                    console.log('membership_registration_completed.')
                    return res.status(201).send('membership_registration_completed.');
                }
                if(results.length >= 1){ // 닉네임 중복 시 회원가입 불가
                    console.log('the_same_nickname_please_change_your_nickname');
                    return res.status(400).send('the_same_nickname_please_change_your_nickname');
                }
            })
        }
        if(results.length >= 1){ // ID 중복 시 회원가입 불가
            console.log('the_same_id_please_change_your_id');
            return res.status(400).send('the_same_id_please_change_your_id');
        }
    });

   
 
});


//로그인 코드
router.post('/login', function(req,res){

    const userId = req.body.userId;
    const userPassword = req.body.userPassword;


    connection.query('select * from user where user_id = ?', userId, function(err, results){ // 데이터베이스에 저장된 ID 찾기
 
        if(results.length == 0) return res.status(401).end(); // 데이터베이스에 저장된 데이터가 없으면 종료
        let findId = results[0].user_id; // 데이터베이스에 저장된 인덱스를 findId에 할당
        console.log(results[0].user_id);
        console.log(results);
        console.log(results.length);
        console.log ('findId : ' + findId);
 
        let findPassword = results[0].password; // 데이터베이스에 저장된 ID의 비밀번호를 findPassword에 할당
        console.log(results.length);
        console.log(results[0].password);
        console.log(findPassword);
        console.log(userPassword);
        if(userPassword == findPassword) res.status(200).send('login_succees.'); // 입력한 비밀번호와 데이터베이스에 저장된 비밀번호가 일치하면 로그인 성공
        if(userPassword !== findPassword) return res.status(401).send('the_password_is_wrong.') // 입력한 비밀번호와 데이터베이스에 저장된 비밀번호가 다르면 로그인 실패
       
    })


});

//회원탈퇴 코드
router.delete('/withdrawal', function (req, res){
    let userId = req.body.userId;
    let userPassword = req.body.userPassword;

    connection.query('select * from user where user_id = ?', userId, function(err, results){ // 데이터베이스에 ID 조회
        if(results.length == 0) return res.status(401).end(); // 데이터베이스에 ID 없으면 종료
        let findPassword = results[0].password; // 데이터베이스에 저장된 ID의 비밀번호를 findPassword에 할당
        let indexId = results[0].id; // 데이터베이스에 저장된 ID의 인덱스ID를 indexId에 할당
        console.log(results);
        console.log(indexId);
        console.log(userPassword);
        console.log(findPassword);
        if(userPassword !== findPassword) return res.status(401).send('the_password_is_wrong.'); // 저장된 패스워드와 입력한 패스워드가 다르면 종료
        if(userPassword == findPassword) {
            connection.query('delete from user where id = ?',indexId); // 저장한 indexId를 기반으로 데이터 삭제
            connection.query('select * from hide_user where user_id = ?',userId, function(err, results){ // hide_user 테이블에서 id를 기반으로 indexId 찾기
                let hide_indexId = results[0].id
                console.log('hide index : ', hide_indexId);
                connection.query('update hide_user set withdrawal = now() where id = ?',hide_indexId); // hide_user 테이블에 삭제된 시간 기록
            })
            return res.status(200).send('successfully_dropped_out_of_the_membership.');
        }

    })


})

//회원수정 코드
router.patch('/edit', function(req, res){
    let userId = req.body.userId;
    let editNickname = req.body.editNickname;
    let userPassword = req.body.userPassword;
    let editEmail = req.body.editEmail;

    // console.log('수정전 닉네임 : ', editNickname);
    // console.log('수정전 이메일 : ', editEmail);
    connection.query('select * from user where user_id = ?',userId, function(err, results){ // 데이터베이스에 ID 조회
        if(results.length == 0) return res.status(401).end(); // 데이터베이스에 ID 없으면 종료
        if(editNickname == undefined) editNickname = results[0].nickname; // 변경할 닉네임이 없으면 원래 닉네임 할당
        if(editEmail == undefined) editEmail = results[0].email; // 변경할 이메일이 없으면 원래 이메일 할당

        let findPassword = results[0].password; // 데이터베이스에 저장된 비밀번호를 findPassword에 할당
        let indexId = results[0].id; // 데이터베이스에 저장된 indexId를 indexId에 할당
        // console.log('수정 후 닉네임 : ', editNickname);
        // console.log('수정 후 이메일 : ', editEmail);
        // console.log(findEmail);
        // console.log(findNickname);
        console.log('index : ', indexId);

        if(userPassword !== findPassword) return res.status(401).send('the_password_is_wrong.'); // 저장된 패스워드와 입력한 패스워드가 다르면 종료
        if(userPassword == findPassword) {
            connection.query('update user set nickname = ?, email = ?, edit = now() where id = ?',[editNickname, editEmail, indexId]); // 회원수정 업데이트 및 수정시간 업데이트
            connection.query('select * from hide_user where user_id = ?',userId, function(err, results){ // hide_user 테이블에 Id 조회
                let hide_indexId = results[0].id // hide_user 테이블에 있는 indexId를 hide_indexId에 할당
                // console.log(userId);
                // console.log('hide index : ', hide_indexId);
                // connection.query('update hide_user set edit = now() where id = ?',hide_indexId); // hide_user 테이블에 수정시간 업데이트
                connection.query('update hide_user set nickname = ?, email = ?, edit = now() where id = ?',[editNickname, editEmail, hide_indexId]); // // hide_user 테이블에 수정시간 업데이트
            })
            return res.status(200).send('done');
        }
    })
})


module.exports = router;
