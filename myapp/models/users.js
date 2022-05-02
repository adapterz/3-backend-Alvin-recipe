const connection = require('./database');

// auth테이블에 이메일로 select
exports.authInquiry = async function (userEmail) {
    const dbData = async function () {
        // 이메일 인증번호가 있는지 없는지 위해 검색
        const con = await connection.getConnection(async conn => conn);

        try {
            const [row] = await con.query('select userEmail, authNumber, auth from auth where userEmail = ?', userEmail);
            con.release();
            return row;
        } catch (err) {
            console.log(err);
            return false;
        }
    };

    const data = await dbData();
    return data;
};

// auth테이블에 인증번호 insert
exports.insertAuthEmail = async function (userEmail, random) {
    const dbInsert = async function () {
        // 인증번호가 없다면 인증번호 insert
        const con = await connection.getConnection(async conn => conn);
        try {
            const [row] = await con.query('insert into auth (userEmail, authNumber, registration) values (?,?,now())', [userEmail, random]);
            con.release();
            return row;
        } catch (err) {
            console.log(err);
            return false;
        }
    };

    const data = await dbInsert();
    return data;
};

// auth테이블에 인증번호 update
exports.updateAuthEmail = async function (random, userEmail) {
    const dbUpdate = async function () {
        // 발송된 인증번호가 있다면 새로인 인증번호로 update
        const con = await connection.getConnection(async conn => conn);
        try {
            const [row] = await con.query('update auth set authNumber = ?, registration = now() where userEmail = ?', [random, userEmail]);
            con.release();
            return row;
        } catch (err) {
            console.log(err);
            return false;
        }
    };

    const data = await dbUpdate();
    return data;
};

// auth테이블에 인증확인 update
exports.updateAuth = async function (userEmail) {
    const dbUpdate = async function () {
        const con = await connection.getConnection(async conn => conn);

        try {
            const [row] = await con.query('update auth set auth = "yes", auth_time = now() where userEmail = ?', userEmail);
            con.release();
            return row;
        } catch (err) {
            console.log(err);
            return false;
        }
    };
    const data = await dbUpdate();
    return data;
};

//유저 테이블 조회
exports.userInquiry = async function (userId, userNickname, userEmail) {
    const dbData = async function () {
        const con = await connection.getConnection(async conn => conn);

        try {
            const [row] = await con.query(
                'select id,user_id,nickname,password,image,email,withdrawal,userSalt from user where user_id = ? or nickname = ? or email = ?',
                [userId, userNickname, userEmail]
            );
            con.release();
            return row;
        } catch (err) {
            console.log(err);
            return false;
        }
    };

    const data = await dbData();
    return data;
};

exports.signupInsert = async function (userId, userNickname, userPassword, userEmail, userSalt, image) {
    const dbInsert = async function () {
        const con = await connection.getConnection(async conn => conn);

        try {
            const [row] = await con.query(
                'insert into user (user_id, nickname, password, email, userSalt ,image, registration) values(?,?,?,?,?,?,now())',
                [userId, userNickname, userPassword, userEmail, userSalt, image]
            );

            con.release();
            return row;
        } catch (err) {
            console.log(err);
            return false;
        }
    };

    const data = dbInsert();
    return data;
};

exports.userWithdrawal = async function (indexId) {
    const dbDelete = async function () {
        const con = await connection.getConnection(async conn => conn);

        try {
            const [row] = await con.query('update user set withdrawal = now() where id = ?', indexId);
            con.release();
            return row;
        } catch (err) {
            console.log(err);
            return false;
        }
    };
    const data = await dbDelete();
    return data;
};

// 닉네임 변경 쿼리
exports.nicknameEdit = async function (editNickname, indexId) {
    const dbUpdate = async function () {
        const con = await connection.getConnection(async conn => conn);

        try {
            const [row] = await con.query('update user set nickname = ?, edit = now() where id = ?', [editNickname, indexId]);
            con.release();
            return row;
        } catch (err) {
            console.log(err);
            return false;
        }
    };
    const data = await dbUpdate();
    return data;
};

// 비밀번호 변경 쿼리
exports.passwordEdit = async function (password, userSalt, indexId) {
    const dbUpdate = async function () {
        const con = await connection.getConnection(async conn => conn);

        try {
            const [row] = await con.query('update user set password = ?, userSalt = ?, edit = now() where id = ?', [password, userSalt, indexId]);
            con.release();
            return row;
        } catch (err) {
            console.log(err);
            return false;
        }
    };
    const data = await dbUpdate();
    return data;
};

exports.findPassword = async function (random, indexId) {
    const dbUpdate = async function () {
        const con = await connection.getConnection(async conn => conn);

        try {
            const [row] = await con.query('update user set password = ? where id = ?', [random, indexId]);
            con.release();
            return row;
        } catch (err) {
            console.log(err);
            return false;
        }
    };
    const data = dbUpdate();
    return data;
};

// 회원 이미지 수정
exports.profileImage = async function (image, indexId) {
    const dbUpdate = async function () {
        const con = await connection.getConnection(async conn => conn);

        try {
            const [row] = await con.query('update user set image = ?, edit = now() where id = ?', [image, indexId]);
            con.release();
            return row;
        } catch (err) {
            console.log(err);
            return false;
        }
    };
    const data = dbUpdate();
    return data;
};

exports.userAllInquiry = async function () {
    const dbDate = async function () {
        const con = await connection.getConnection(async conn => conn);

        try {
            const [row] = await con.query('select id, user_id, nickname, email, image from user');
            con.release();
            return row;
        } catch (err) {
            console.log(err);
            return false;
        }
    };
    const data = dbDate();
    return data;
};

exports.test = async function () {
    const dbDate = async function () {
        const con = await connection.getConnection(async conn => conn);

        try {
            const [row] = await con.query('select * from test');
            con.release();
            return row;
        } catch (err) {
            console.log(err);
            return false;
        }
    };
    const data = dbDate();
    return data;
};
