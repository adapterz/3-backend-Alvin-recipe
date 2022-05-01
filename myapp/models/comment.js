const connection = require('./database');

// comment 테이블 조회
exports.commentInquiry = async function (userNickname, id) {
    const dbData = async function () {
        const con = await connection.getConnection(async conn => conn);

        try {
            const [row] = await con.query('select id, contents, writer, registration from comment where writer = ? or id = ?', [userNickname, id]);
            con.release();
            return row;
        } catch (err) {
            console.log(err);
            return false;
        }
    };

    const data = dbData();
    return data;
};

//  댓글 추가
exports.commentInsert = async function (comment, userNickname) {
    const dbData = async function () {
        const con = await connection.getConnection(async conn => conn);

        try {
            const [row] = await con.query('insert into comment (contents, writer, registration) values(?,?,now())', [comment, userNickname]);
            con.release();
            return row;
        } catch (err) {
            console.log(err);
            return false;
        }
    };

    const data = dbData();
    return data;
};

// 댓글 수정
exports.edit = async function (editComment, id) {
    const dbData = async function () {
        const con = await connection.getConnection(async conn => conn);

        try {
            const [row] = await con.query('update comment set contents = ?, edit = now() where id = ?', [editComment, id]);
            con.release();
            return row;
        } catch (err) {
            console.log(err);
            return false;
        }
    };

    const data = dbData();
    return data;
};

// 댓글 삭제
exports.delete = async function (id) {
    const dbData = async function () {
        const con = await connection.getConnection(async conn => conn);

        try {
            const [row] = await con.query('update comment set `delete` = now() where id = ?', id);
            con.release();
            return row;
        } catch (err) {
            console.log(err);
            return false;
        }
    };

    const data = dbData();
    return data;
};
