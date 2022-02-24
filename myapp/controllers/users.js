const express = require('express');
// const { cookie } = require('express/lib/response');
const router = express.Router();
const connection = require('../models/database');
const transporter = require('../email');

router.get('/', function (req, res) {
    // console.log('signup_page!!');
    res.send('welcome!_for_my_recipe');
});

// 회원 가입 코드
router.post('/', function (req, res, next) {
    let userEmail = req.body.userEmail;
    let userAuthNumber = req.body.userAuthNumber;

    let random = Math.floor(Math.random() * 888888) + 111111;

    const mailOptions = {
        from: process.env.nodemailerEmail,
        to: userEmail,
        subject: '이메일 인증',
        text: ' 오른쪽 6글자를 입력해 주세요 ' + random
    };

    connection.query('select userEmail,authNumber from auth where userEmail = ?', userEmail, function (err, results) {
        // 입력한 이메일에 대한 인증번호 검색

        if (err) return res.status(500).end();

        if (results.length == 0) {
            // 인증번호가 없다면 인증번호 메일 발송

            transporter.sendMail(mailOptions, function (err, info) {
                if (!err) {
                    // 인증번호 메일 발송 성공 시 데이터베이스에 저장
                    connection.query('insert into auth (userEmail, authNumber, registration) values (?,?,now())', [userEmail, random]); // 데이터베이스에 이메일,인증번호 저장
                    // console.log('메일발송 성공',info);
                    return res.status(201).send('i`m_done_sending_mail.');
                }
                if (err) {
                    // 발송에서 실패 시 에러 메세지
                    // console.log('여기에러',err);
                    return res.status(500).send('err');
                }
            });
            return;
        } else {
            // 발송된 인증번호가 있다면

            const authNum = results[0].authNumber; // 데이터베이스에 저장된 인증번호 변수에 할당

            // 데이터베이스에 저장된 인증번호와, body로 전달받은 인증번호 비교
            if (authNum !== userAuthNumber) return res.status(400).send('the_authentication_number_is_different.'); // 입력한 인증번호가 다르다면 종료

            if (authNum == userAuthNumber) {
                connection.query('delete from auth where userEmail = ?', userEmail); // 인증에 성공했기 때문에 데이터베이스에 저장된 인증번호 삭제
                next(); // 입력한 인증번호와 데이터베이스에 저장된 인증번호가 같으면 다음api 호출
            }
        }
    });
});

router.post('/', function (req, res) {
    console.log('이메일 인증 완료');

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
    connection.beginTransaction();
    connection.query('select * from user where user_id = ?', userId, function (err, results) {
        // ID 중복 검사
        if (results.length < 1) {
            // 중복되는 ID가 없으면 사용 가능
            console.log('useable_id.');
            connection.query('select * from user where nickname = ?', userNickname, function (err, results) {
                // 닉네임 중복 검사
                if (results.length < 1) {
                    // 중복되는 닉네임이 없으면 회원 가입 완료
                    console.log('useable_nickname.');
                    connection.query('insert into user (user_id, nickname, password, email, registration) values(?,?,?,?,now())', [
                        userId,
                        userNickname,
                        userPassword,
                        userEmail
                    ]); // 회원정보 user 테이블에 저장
                    connection.query('insert into hide_user (user_id, nickname, password, email, registration) values(?,?,?,?,now())', [
                        userId,
                        userNickname,
                        userPassword,
                        userEmail
                    ]); // 회원정보를 안보이게 저장
                    connection.commit();
                    console.log('membership_registration_completed.');
                    return res.status(201).send('membership_registration_completed.');
                }
                if (results.length >= 1) {
                    // 닉네임 중복 시 회원가입 불가
                    connection.rollback();
                    console.log('the_same_nickname_please_change_your_nickname');
                    return res.status(400).send('the_same_nickname_please_change_your_nickname');
                }
            });
        }
        if (results.length >= 1) {
            // ID 중복 시 회원가입 불가
            connection.rollback();
            console.log('the_same_id_please_change_your_id');
            return res.status(400).send('the_same_id_please_change_your_id');
        }
    });

    // connection.query('select user_id,nickname from user where user_id = ?', userId, function(err, results){

    //     if(err) return res.status(400).end();

    //     if(results.length > 0) return res.status(400).end();

    //     let searchId = results[0].userId;
    //     let searchNickname = results[0].nickname;

    //     if(searchId == userId) return res.status(400).send('the_same_id_please_change_your_id');

    //     if(searchNickname == userNickname) return res.status(400).send('the_same_nickname_please_change_your_nickname');

    // })
});

router.get('/login', function (req, res) {
    res.status(200).send('login page!');
});

//로그인 코드
router.post('/login', function (req, res) {
    const userId = req.body.userId;
    const userPassword = req.body.userPassword;

    // console.log(req.cookies.sid);
    // console.log(req.cookies.userId);

    if (req.sessionID == req.cookies.sid) return res.status(200).send('cookie_login_success');

    if (userId == undefined) return res.status(400).send('userId_not_null');

    if (userPassword == undefined) return res.status(400).send('userPassword_not_null');

    connection.query('select * from user where user_id = ?', userId, function (err, results) {
        // 데이터베이스에 저장된 ID 찾기

        if (results.length == 0) return res.status(404).end(); // 데이터베이스에 저장된 데이터가 없으면 종료

        let findPassword = results[0].password; // 데이터베이스에 저장된 ID의 비밀번호를 findPassword에 할당

        if (userPassword == findPassword) res.status(200).cookie('sid', req.sessionID).cookie('userId', userId).send('login_succses.'); // 입력한 비밀번호와 데이터베이스에 저장된 비밀번호가 일치하면 로그인 성공

        if (userPassword !== findPassword) return res.status(401).send('the_password_is_wrong.'); // 입력한 비밀번호와 데이터베이스에 저장된 비밀번호가 다르면 로그인 실패
    });
});

// 로그 아웃 코드
router.get('/logout', function (req, res) {
    req.session.destroy();
    res.clearCookie('sid').status(200).send('logout.');
});

//회원탈퇴 코드
router.delete('/', function (req, res) {
    let userId = req.body.userId;
    let userPassword = req.body.userPassword;

    connection.beginTransaction();
    connection.query('select * from user where user_id = ?', userId, function (err, results) {
        // 데이터베이스에 ID 조회
        if (results.length == 0) {
            connection.rollback();
            return res.status(404).end(); // 데이터베이스에 ID 없으면 종료
        }
        if (err) {
            connection.rollback();
            return res.status(401).end();
        }
        let findPassword = results[0].password; // 데이터베이스에 저장된 ID의 비밀번호를 findPassword에 할당
        let indexId = results[0].id; // 데이터베이스에 저장된 ID의 인덱스ID를 indexId에 할당
        // console.log(results);
        // console.log(indexId);
        // console.log(userPassword);
        // console.log(findPassword);
        if (userPassword !== findPassword) return res.status(401).send('the_password_is_wrong.'); // 저장된 패스워드와 입력한 패스워드가 다르면 종료
        if (userPassword == findPassword) {
            connection.query('delete from user where id = ?', indexId); // 저장한 indexId를 기반으로 데이터 삭제
            connection.query('select * from hide_user where user_id = ?', userId, function (err, results) {
                // hide_user 테이블에서 id를 기반으로 indexId 찾기
                let hide_indexId = results[0].id;
                // console.log('hide index : ', hide_indexId);
                connection.query('update hide_user set withdrawal = now() where id = ?', hide_indexId); // hide_user 테이블에 삭제된 시간 기록
            });
            connection.commit();
            return res.status(200).end();
        }
    });
});

//회원수정 코드
router.patch('/', function (req, res) {
    let userId = req.body.userId;
    let editNickname = req.body.editNickname;
    let userPassword = req.body.userPassword;
    let editEmail = req.body.editEmail;

    connection.beginTransaction();
    connection.query('select * from user where user_id = ?', userId, function (err, results) {
        // 데이터베이스에 ID 조회
        if (results.length == 0) return res.status(404).end(); // 데이터베이스에 ID 없으면 종료
        if (editNickname == undefined) editNickname = results[0].nickname; // 변경할 닉네임이 없으면 원래 닉네임 할당
        if (editEmail == undefined) editEmail = results[0].email; // 변경할 이메일이 없으면 원래 이메일 할당

        let findPassword = results[0].password; // 데이터베이스에 저장된 비밀번호를 findPassword에 할당
        let indexId = results[0].id; // 데이터베이스에 저장된 indexId를 indexId에 할당

        console.log('index : ', indexId);

        if (userPassword !== findPassword) return res.status(401).send('the_password_is_wrong.'); // 저장된 패스워드와 입력한 패스워드가 다르면 종료
        if (userPassword == findPassword) {
            connection.query('update user set nickname = ?, email = ?, edit = now() where id = ?', [editNickname, editEmail, indexId]); // 회원수정 업데이트 및 수정시간 업데이트
            connection.query('select * from hide_user where user_id = ?', userId, function (err, results) {
                // hide_user 테이블에 Id 조회
                let hide_indexId = results[0].id; // hide_user 테이블에 있는 indexId를 hide_indexId에 할당
                connection.query('update hide_user set nickname = ?, email = ?, edit = now() where id = ?', [editNickname, editEmail, hide_indexId]); // // hide_user 테이블에 수정시간 업데이트
            });
            connection.commit();
            return res.status(200).end();
        }
    });
});

// 아이디 찾기 코드
router.get('/findid', function (req, res) {
    let userEmail = req.body.userEmail;

    connection.query('select email,user_id from user where email = ?', userEmail, function (err, results) {
        if (err) return res.status(500).end();

        if (results < 1) return res.status(400).end();

        let userId = results[0].user_id;

        const mailOptions = {
            from: process.env.nodemailerEmail,
            to: userEmail,
            subject: '가입한 ID',
            text: '가입한 ID 입니다. ' + userId
        };
        transporter.sendMail(mailOptions, function (err, info) {
            if (err) return res.status(500).send('err');

            if (!err) return res.status(200).send('i`m_done_sending_mail.');
        });
    });
});

// 임시비밀번호 발급 코드
router.post('/findpassword', function (req, res) {
    let { userEmail, userId } = req.body;

    connection.query('select user_id,email from user where user_id = ?', userId, function (err, results) {
        if (err) return res.status(500).end();

        if (results < 1) return res.status(404).send('ID가 없습니다.');

        let findId = results[0].user_id;
        let findEmail = results[0].email;

        if (findId !== userId) return res.status(400).send('id가 다릅니다.');

        if (findEmail !== userEmail) return res.status(400).send('이메일이 다릅니다.');

        if (findId == userId && findEmail == userEmail) {
            let random = Math.floor(Math.random() * 888888) + 111111;

            const mailOptions = {
                from: process.env.nodemailerEmail,
                to: userEmail,
                subject: '임시 비밀번호 입니다.',
                text: '임시 비밀번호 입니다. ' + random + ' \n 반드시 비밀번호를 수정해 주세요.'
            };
            transporter.sendMail(mailOptions);

            connection.query('update user set password = ? where user_id = ?', [random, userId]);

            return res.status(200).send('i`m_done_sending_mail.');
        }
    });
});

module.exports = router;
