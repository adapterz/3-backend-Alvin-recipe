const connection = require('./database');

//게시글 전체 조회
exports.inquiry = async function () {
    const dbData = async function () {
        const con = await connection.getConnection(async conn => conn);

        try {
            const [row] = await con.query(
                'select id,title,writer,views,`like`,`delete`,registration,comment,images from post where `delete` is null'
            );
            con.release();
            return row;
        } catch (err) {
            // console.log(err);
            return false;
        }
    };

    const data = dbData();
    return data;
};

// 게시글 등록
exports.registration = async function (title, contents, writer, userindex, images, thumbnail) {
    const dbInsert = async function () {
        const con = await connection.getConnection(async conn => conn);

        try {
            const [row] = await con.query(
                'insert into post (title,contents,writer,userindex,images,thumbnail,registration) values(?,?,?,?,?,?,now())',
                [title, contents, writer, userindex, JSON.stringify({ images }), thumbnail]
            );
            for (let i = 0; i < images.length; i++) {
                await con.query('update image set postindex = ? where id = ?', [row.insertId, images[i]]);
            }
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

// 게시글 검색
exports.search = async function (title) {
    const dbData = async function () {
        const con = await connection.getConnection(async conn => conn);
        title = '%' + title + '%'; // select문에서 like 사용하기 위하여 재할당
        try {
            const [row] = await con.query('select id,title,writer,views,`like`,registration,comment,images from post where title like ? ', title);
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

//게시판 게시글 정보조회
exports.postData = async function (id) {
    const dbData = async function () {
        const con = await connection.getConnection(async conn => conn);
        try {
            const [row] = await con.query('select id,writer,title,contents from post where id = ?', id);
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

//게시판 게시글 수정
exports.edit = async function (id, editTitle, editContents) {
    const dbUpdate = async function () {
        const con = await connection.getConnection(async conn => conn);
        try {
            const [row] = await con.query('update post set title = ?, contents = ?, edit = now() where id = ?', [editTitle, editContents, id]);
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

//게시글 상세보기
exports.view = async function (id) {
    const dbData = async function () {
        const con = await connection.getConnection(async conn => conn);

        try {
            const [row] = await con.query('select * from post left join image on post.id = image.postindex where post.id = ?', id);
            await con.query('update post set views = views+1 where id = ?', id);
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

//게시판 게시글 삭제
exports.delete = async function (id) {
    const dbData = async function () {
        const con = await connection.getConnection(async conn => conn);
        try {
            const [row] = await con.query('update post set `delete` = now() where id = ?', id);
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

//게시판 이미지 업로드
exports.upload = async function (imageURL) {
    const imageData = async function () {
        const con = await connection.getConnection(async conn => conn);

        try {
            const [row] = await con.query('insert into image (image) values(?)', imageURL);
            con.release();
            return row;
        } catch (err) {
            console.log(err);
            return false;
        }
    };

    const data = await imageData();
    return data;
};

//게시판 정보 조회
exports.postInquiry = async function (userindex) {
    const dbData = async function () {
        const con = await connection.getConnection(async conn => conn);
        try {
            const [row] = await con.query(
                'select id, writer, title, contents, registration, `like`, comment from post where userindex = ?',
                userindex
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

// 게시판 게시글 좋아요
exports.like = async function (userindex, postindex) {
    const dbData = async function () {
        const con = await connection.getConnection(async conn => conn);
        try {
            const [row] = await con.query('insert into likes (userindex, postindex) values(?,?)', [userindex, postindex]);
            await con.query('update post set `like` = `like`+1 where id = ?', postindex);
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

// 게시판 게시글 좋아요 취소
exports.disLike = async function (userindex, postindex) {
    const dbData = async function () {
        const con = await connection.getConnection(async conn => conn);
        try {
            const [row] = await con.query('delete from likes where userindex = ? and postindex = ?', [userindex, postindex]);
            await con.query('update post set `like` = `like`-1 where id = ?', postindex);
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

// 게시판 게시글 좋아요 여부확인
exports.checkLike = async function (userindex, postindex) {
    const dbData = async function () {
        const con = await connection.getConnection(async conn => conn);
        try {
            const [row] = await con.query('select postindex from likes where userindex = ? and postindex = ?', [userindex, postindex]);
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

// 게시판 좋아요 개수 확인
exports.countLike = async function (postindex) {
    const dbData = async function () {
        const con = await connection.getConnection(async conn => conn);
        try {
            const [row] = await con.query('select postindex from likes where postindex = ?', postindex);
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

// 메인화면 페이징
exports.indexPaging = async function (offset, limit) {
    const dbData = async function () {
        const con = await connection.getConnection(async conn => conn);
        try {
            const [row] = await con.query(
                'select id,title,writer,views,`like`,`delete`,registration,comment,images,thumbnail from post where `delete` is null order by id desc limit ?,?',
                [offset, limit]
            );
            con.release();
            return row;
        } catch (err) {
            return false;
        }
    };
    const data = dbData();
    return data;
};

// 내가 쓴 게시글 페이징
exports.mypagePaging = async function (userindex, offset, limit) {
    const dbData = async function () {
        const con = await connection.getConnection(async conn => conn);
        try {
            const [row] = await con.query(
                'select id,title,writer,views,`like`,`delete`,registration,comment,images from post where `delete` is null and userindex = ? limit ?,?',
                [userindex, offset, limit]
            );
            con.release();
            return row;
        } catch (err) {
            return false;
        }
    };
    const data = dbData();
    return data;
};

// 썸네일 검색
exports.thumbnail = async function (indexId) {
    const dbData = async function () {
        const con = await connection.getConnection(async conn => conn);
        try {
            const [row] = await con.query('select id,image,postindex from image where id = ?', indexId);
            con.release();
            return row;
        } catch (err) {
            return false;
        }
    };
    const data = dbData();
    return data;
};
