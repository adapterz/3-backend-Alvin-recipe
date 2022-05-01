const connection = require('./database');

// comment 테이블 조회
exports.inquiry = async function (userNickname, id, postindexId) {
    const dbData = async function () {
        const con = await connection.getConnection(async conn => conn);

        try {
            const [row] = await con.query(
                'select comment.id, comment.`like`, comment.contents, comment.registration, comment.writer, comment.edit, comment.`delete`, user.image, likes.commentindex from comment left join user on comment.writer = user.nickname left join likes on likes.userindex = user.id and comment.id = likes.commentindex where writer = ? or comment.id =? or comment.postindex = ?',
                [userNickname, id, postindexId]
            );
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
exports.commentInsert = async function (comment, userNickname, userindex, postindex) {
    const dbData = async function () {
        const con = await connection.getConnection(async conn => conn);

        try {
            const [row] = await con.query('insert into comment (contents, writer, postindex, userindex, registration) values(?,?,?,?,now())', [
                comment,
                userNickname,
                postindex,
                userindex
            ]);
            con.query('update post set comment = comment +1 where id = ?', postindex);
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

// 내가 쓴 댓글 조회
exports.commentInquiry = async function (userindex, postindex) {
    const dbData = async function () {
        const con = await connection.getConnection(async conn => conn);
        try {
            const [row] = await con.query(
                // 'select id, writer, contents, registration, `like`, postindex from comment where userindex = ? or postindex = ?',
                'select comment.id, comment.writer, comment.contents, comment.registration, comment.`like`, postindex, title from comment inner join post on comment.postindex = post.id where comment.`delete` is null and comment.userindex = ? or postindex = ?',
                [userindex, postindex]
            );
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

// 댓글 게시글 좋아요
exports.like = async function (userindex, commentindex) {
    const dbData = async function () {
        const con = await connection.getConnection(async conn => conn);
        try {
            const [row] = await con.query('insert into likes (userindex, commentindex) values(?,?)', [userindex, commentindex]);
            await con.query('update comment set `like` = `like`+1 where id = ?', commentindex);
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

// 댓글 게시글 좋아요 취소
exports.disLike = async function (userindex, commentindex) {
    const dbData = async function () {
        const con = await connection.getConnection(async conn => conn);
        try {
            const [row] = await con.query('delete from likes where userindex = ? and commentindex = ?', [userindex, commentindex]);
            await con.query('update comment set `like` = `like`-1 where id = ?', commentindex);
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

// 댓글 게시글 좋아요 여부확인
exports.checkLike = async function (userindex, commentindex) {
    const dbData = async function () {
        const con = await connection.getConnection(async conn => conn);
        try {
            const [row] = await con.query('select commentindex from likes where userindex = ? and commentindex = ?', [userindex, commentindex]);
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

// 내가 쓴 댓글 페이징
exports.mypagePaging = async function (userindex, offset, limit) {
    const dbData = async function () {
        const con = await connection.getConnection(async conn => conn);
        try {
            const [row] = await con.query(
                'select comment.id, comment.writer, comment.contents, comment.registration, comment.`like`, postindex, title from comment inner join post on comment.postindex = post.id where comment.`delete` is null and comment.userindex = ?  limit ?,?',
                [userindex, offset, limit]
            );
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
