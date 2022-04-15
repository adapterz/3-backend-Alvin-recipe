const connection = require('./database');

exports.inquiry = async function () {
    const dbData = async function () {
        const con = await connection.getConnection(async conn => conn);

        try {
            const [row] = await con.query('select id,title,writer,views,`like`,registration,comment,images from post');
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

exports.registration = async function (title, contents, writer, images) {
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
            return row;
        } catch (err) {
            console.log(err);
            return false;
        }
    };

    const data = dbInsert();
    return data;
};

exports.search = async function (title) {
    const dbData = async function () {
        const con = await connection.getConnection(async conn => conn);
        title = '%' + title + '%'; // select문에서 like 사용하기 위하여 재할당
        try {
            const [row] = await con.query('select title from post where title like ?', title);
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

exports.view = async function (id) {
    const dbData = async function () {
        const con = await connection.getConnection(async conn => conn);

        try {
            const [row] = await con.query('select title,contents,writer,views,`like`,registration,edit,id from post where id = ?', id);
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

exports.delete = async function (id) {
    const dbData = async function () {
        const con = await connection.getConnection(async conn => conn);
        try {
            const [row] = await con.query('delete from post where id = ?', id);
            return row;
        } catch (err) {
            console.log(err);
            return false;
        }
    };
    const data = dbData();
    return data;
};

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
