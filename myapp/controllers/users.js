const transporter = require('../email');
const usersModel = require('../models/users');

// 회원 가입 이메일 인증번호 발급 코드
exports.authEmail = async function (req, res, next) {
    const checkEmail = /[\w\-\.]+\@[\w\-\.]+\.[\w]/g; // 이메일 체크 정규식
    const userEmail = req.body.userEmail;

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

    const data = await usersModel.authInquiry(userEmail);
    // 데이터베이스 오류면 종료
    if (data === false) return res.status(500).end();

    // 이미 발급된 인증번호가 없으면 인증번호 생성 후 insert
    if (data.length == 0) {
        await usersModel.insertAuthEmail(userEmail, random);

        transporter.sendMail(mailOptions, function (err, info) {
            if (!err) {
                return res.status(201).send('i`m_done_sending_mail.');
            } else {
                return res.status(500).end();
            }
        });
    }

    // 인증된 이메일이면 종료
    if (data.length !== 0 && data[0].auth == 'yes') return res.status(400).end();

    // 이미 발급된 인증번호가 있으면 새로운 인증번호로 update
    if (data.length !== 0) {
        await usersModel.updateAuthEmail(random, userEmail);

        transporter.sendMail(mailOptions, function (err, info) {
            if (!err) {
                return res.status(201).send('i`m_done_sending_mail.');
            } else {
                return res.status(500).end();
            }
        });
    }
};

// 이메일 인증 코드
exports.auth = async function (req, res) {
    const userEmail = req.body.userEmail;
    let userAuthNumber = req.body.userAuthNumber;

    userAuthNumber = Number(userAuthNumber); // 스트링타입으로 오는 데이터를 정수형으로 변환

    console.log(userEmail);
    if (userEmail == undefined) return res.status(400).end();
    console.log('1');
    if (userAuthNumber == undefined) return res.status(400).end();
    console.log('2');

    const data = await usersModel.authInquiry(userEmail);
    // 데이터베이스 오류면 종료
    if (data === false) return res.status(500).end();

    if (userAuthNumber !== data[0].authNumber) return res.status(400).end();

    if (userAuthNumber == data[0].authNumber) {
        const results = await usersModel.updateAuth(userEmail);

        if (results === false) return res.status(500).end();

        return res.status(200).end();
    }
};

//회원가입 코드
exports.signup = async function (req, res) {
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

    let data = await usersModel.authInquiry(userEmail);

    // 데이터베이스 오류면 종료
    if (data === false) return res.status(500).end();

    // 이메일 인증이 완료가 안됐다면 회원가입 불가
    if (data[0].auth !== 'yes') return res.status(400).send('이메일 인증을 완료해 주세요.');
    // 이메일 인증이 완료가 안됐거나, 인증한 이메일이 아니라면 회원가입 불가
    if (data[0].auth == undefined) return res.status(400).send('이메일 인증을 완료해 주세요.');

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

    const userData = await usersModel.userInquiry(userId, userNickname);

    //데이터 베이스 오류면 종료
    if (userData === false) return res.status(500).end();

    if (userData.length > 0) {
        if (userData[0].user_id == userId) return res.status(400).end(); // 아이디 중복시 회원가입 불가
        if (userData[0].nickname == userNickname) return res.status(400).end(); // 닉네임 중복시 회원가입 불가
    }

    const signupData = await usersModel.signupInsert(userId, userNickname, userPassword, userEmail, image);

    //데이터 베이스 오류면 종료
    if (signupData === false) return res.status(500).end();

    return res.status(201).end();
};

//로그인 코드
exports.login = async function (req, res) {
    const userId = req.body.userId;
    const userPassword = req.body.userPassword;

    if (req.sessionID == req.cookies.sid && req.sessionID !== undefined && req.cookies.sid !== undefined)
        return res.status(200).send('cookie_login_success');

    // 입력한 ID가 없으면 종료
    if (userId == undefined) return res.status(400).send('userId_not_null');
    // 입력한 비밀번호가 없으면 종료
    if (userPassword == undefined) return res.status(400).send('userPassword_not_null');

    const userData = await usersModel.userInquiry(userId);

    // 데이터 베이스 오류면 종료
    if (userData === false) return res.status(500).end();

    // 조회한 ID가 없으면 종료
    if (userData[0] == undefined) return res.status(400).end();

    // 입력한 비밀번호와 저장된 비밀번호가 다르면 종료
    if (userData[0].password !== userPassword) return res.status(401).send('the_password_is_wrong.');

    return res.status(200).cookie('sid', req.sessionID).cookie('userId', userId).json(userData);
};

// 로그 아웃 코드
exports.logout = function (req, res) {
    req.session.destroy(); // 세션삭제
    res.clearCookie('sid').status(200).send('logout.'); // 쿠키삭제
};

//회원탈퇴 코드
exports.withdrawal = async function (req, res) {
    const userId = req.body.userId;
    const userPassword = req.body.userPassword;

    const userData = await usersModel.userInquiry(userId);

    // 데이터 베이스 오류면 종료
    if (userData === false) return res.status(500).end();
    // 아이디가 없으면 종료
    if (userData.length == 0) return res.status(404).end();
    // 비밀번호가 다르면 종료
    if (userData[0].password !== userPassword) return res.status(401).send('the_password_is_wrong.');

    const indexId = userData[0].id;

    const withdrawalData = await usersModel.userWithdrawal(indexId);

    // 데이터 베이스 오류면 종료
    if (withdrawalData === false) return res.status(500).end();

    return res.status(200).send('탈퇴완료');
};

//회원수정 코드
exports.edit = async function (req, res) {
    const userId = req.body.userId;
    let editNickname = req.body.editNickname;
    const userPassword = req.body.userPassword;
    const userRetryPassword = req.body.userRetryPassword;

    // if (req.cookies.userId == undefined) return res.status(404).send('login_and_use_it');

    const userData = await usersModel.userInquiry(userId);

    // 데이터 베이스 오류면 종료
    if (userData === false) return res.status(500).end();
    // 아이디를 잘못 입력했으면 종료
    if (userData.length == 0) return res.status(404).end();
    // 바꿀 닉네임이 없으면 그대로 사용
    if (editNickname == undefined) editNickname = userData[0].nickname;
    // 재입력 비밀번호가 다르면 종료
    if (userPassword !== userRetryPassword) return res.status(401).send('the_password_is_wrong.');

    const indexId = userData[0].id;

    const updateData = await usersModel.edit(editNickname, userPassword, indexId);

    // 데이터 베이스 오류면 종료
    if (updateData === false) return res.status(500).end();

    return res.status(200).end();
};

// 아이디 찾기 코드
exports.findId = async function (req, res) {
    const userEmail = req.body.userEmail;

    const data = await usersModel.userInquiry(null, null, userEmail);

    // 데이터 베이스 오류면 종료
    if (data === false) return res.status(500).end();
    // 입력한 이메일이 없으면 종료
    if (data.length == 0) return res.status(400).end();

    const userId = data[0].user_id;

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
};

// 임시비밀번호 발급 코드( 이메일과 아이디를 입력하면 이메일로 임시비밀번호 발송 )
exports.findPassword = async function (req, res) {
    const userEmail = req.body.userEmail;
    const userId = req.body.userId;

    const data = await usersModel.userInquiry(null, null, userEmail);

    // 데이터 베이스 오류면 종료
    if (data === false) return res.status(500).end();
    // 입력한 이메일이 없으면 종료
    if (data.length == 0) return res.status(400).end();
    // 입력한 아이디와 저장된 아이디가 다르면 종료
    if (data[0].user_id !== userId) return res.status(400).end();

    const indexId = data[0].id;
    let random = Math.floor(Math.random() * 888888) + 111111;

    const updateData = await usersModel.findPassword(random, indexId);

    if (updateData === false) return res.status(500).end();

    const mailOptions = {
        from: process.env.nodemailerEmail,
        to: userEmail,
        subject: '임시 비밀번호 입니다.',
        text: '임시 비밀번호 입니다. ' + random + ' \n 반드시 비밀번호를 변경해 주세요.'
    };
    transporter.sendMail(mailOptions, function (err, info) {
        if (err) return res.status(500).send('err');

        if (!err) return res.status(200).send('i`m_done_sending_mail.');
    });
};

// 회원 이미지 수정
exports.imageUpload = async function (req, res, next) {
    const image = '/image/' + req.file.filename;
    const userId = req.body.userId;

    // 업로드된 이미지가 없으면 종료
    if (image == undefined) return res.status(400).end();
    // 아이디 입력 안했으면 종료
    if (userId == undefined) return res.status(400).send('use_login');

    const data = await usersModel.userInquiry(userId);

    // 데이터 베이스 오류면 종료
    if (data === false) return res.status(500).end();

    if (data.length == 0) return res.status(404).end();

    const indexId = data[0].id;

    const imageData = await usersModel.profileImage(image, indexId);

    // 데이터 베이스 오류면 종료
    if (imageData === false) return res.status(500).end();

    return res.status(200).end();
};
