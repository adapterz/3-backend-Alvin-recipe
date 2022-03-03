const express = require('express');
// const { cookie } = require('express/lib/response');
const router = express.Router();
const connection = require('../models/database');
const transporter = require('../email');
const upload = require('../models/upload');

// 회원 가입 코드
router.post('/auth', upload.single('userEmail'), function (req, res, next) {
    const checkEmail = /[\w\-\.]+\@[\w\-\.]+\.[\w]/g; // 이메일 체크 정규식
    const userEmail = req.body.userEmail;
    const userAuthNumber = req.body.userAuthNumber;

    if (userEmail == undefined) return res.status(400).send('email_is_not_null');

    if (userEmail.match(checkEmail) == null) return res.status(400).end(); // 이메일 형식이 다르면 종료

    const random = Math.floor(Math.random() * 888888) + 111111; // 인증번호

    const mailOptions = {
        // 메일 내용
        from: process.env.nodemailerEmail,
        to: userEmail,
        subject: '이메일 인증',
        text: ' 오른쪽 6글자를 입력해 주세요 ' + random
    };

    connection.query('select userEmail,authNumber from auth where userEmail = ?', userEmail, function (err, results) {
        // 입력한 이메일에 대한 인증번호 검색

        if (err) return res.status(500).end(); // 데이터베이스 오류면 500에러

        if (results.length == 0) {
            // 인증번호가 없다면 인증번호 메일 발송

            transporter.sendMail(mailOptions, function (err, info) {
                if (!err) {
                    // 인증번호 메일 발송 성공 시 데이터베이스에 저장
                    connection.query('insert into auth (userEmail, authNumber, registration) values (?,?,now())', [userEmail, random]); // 데이터베이스에 이메일,인증번호 저장
                    return res.status(201).send('i`m_done_sending_mail.');
                }
                if (err) {
                    // 발송에서 실패 시 에러 메세지
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
                return res.status(200).end();
            }
        }
    });
});

router.post('/', function (req, res) {
    const checkSpace = /\s/g;
    const checkUpper = /[A-Z]+/g;
    const checkLower = /[a-z]+/g;
    const checkNum = /[0-9]+/g;
    const checkSpecial = /[^a-z0-9ㄱ-ㅎ가-힣]+/gi;
    const checkHangul = /[ㄱ-ㅎ가-힣]+/g;

    const userId = req.body.userId;
    const userNickname = req.body.userNickname;
    const userPassword = req.body.userPassword;
    const userRetryPassword = req.body.userRetryPassword;
    const userEmail = req.body.userEmail;
    let image = '/image/deault.png';

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
    // 패스워드 길이 검사(9~20 글자)
    if (userPassword.length < 9 || userPassword.length > 20) return res.status(400).send('password_use_9~20_letters');
    // 패스워드에 공백 사용 불가
    if (userPassword.match(checkSpace) !== null) return res.status(400).send('remove_the_space');
    // 패스워드에 대문자 포함여부 확인
    if (userPassword.match(checkUpper) == null) return res.status(400).send('include_upper_case');
    // 패스워드에 소문자 포함여부 확인
    if (userPassword.match(checkLower) == null) return res.status(400).send('include_lower_case');
    // 패스워드에 숫자 포함여부 확인
    if (userPassword.match(checkNum) == null) return res.status(400).send('include_number');
    // 패스워드에 특수문자 포함여부 확인
    if (userPassword.match(checkSpecial) == null) return res.status(400).send('include_special_characters');
    // 패스워드에 한글 사용불가
    if (userPassword.match(checkHangul) !== null) return res.status(400).send('include_hangul');

    connection.query('select user_id,nickname from user where user_id = ? or nickname = ?', [userId, userNickname], function (err, results) {
        if (err) return res.status(400).end();

        if (results[0] == undefined) {
            // ID,닉네임이 중복 안되면 데이터베이스에 저장
            connection.query('insert into user (user_id, nickname, password, email, image, registration) values(?,?,?,?,?,now())', [
                userId,
                userNickname,
                userPassword,
                userEmail,
                image
            ]);
            // ID,닉네임이 중복 안되면 hiden 테이블에 저장
            connection.query('insert into hide_user (user_id, nickname, password, email, image, registration) values(?,?,?,?,?,now())', [
                userId,
                userNickname,
                userPassword,
                userEmail,
                image
            ]);
            console.log('membership_registration_completed.');
            return res.status(201).send('membership_registration_completed.');
        }

        const checkId = results[0].user_id;
        const checkNickname = results[0].nickname;

        if (checkId == userId) return res.status(400).send('the_same_id_please_change_your_id'); // 아이디 중복시 사용 불가

        if (checkNickname == userNickname) return res.status(400).send('the_same_nickname_please_change_your_nickname'); // 닉네임 중복시 사용 불가
    });
});

router.get('/login', function (req, res) {
    res.status(200).send('login page!');
});

//로그인 코드
router.post('/login', function (req, res) {
    const userId = req.body.userId;
    const userPassword = req.body.userPassword;

    if (req.sessionID == req.cookies.sid && req.sessionID !== undefined && req.cookies.sid !== undefined)
        return res.status(200).send('cookie_login_success');

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
    req.session.destroy(); // 세션삭제
    res.clearCookie('sid').status(200).send('logout.'); // 쿠키삭제
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

// 회원 이미지 수정
router.post('/upload', upload.single('image'), function (req, res, next) {
    const image = '/image/' + req.file.filename;
    const userId = req.cookies.userId;

    if (image == undefined) return res.status(400).end();

    if (userId == undefined) return res.status(400).send('use_login');

    connection.query('select user_id from user where user_id = ?', userId, function (err, results) {
        if (err) return res.status(500).end();

        const searchId = results[0].user_id;

        connection.query('update user set image = ?, edit = now() where user_id = ?', [image, searchId], function (err) {
            if (err) return res.status(500).end();

            if (!err) return res.status(201).end();
        });
    });
});

module.exports = router;
