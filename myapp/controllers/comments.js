const commentsModel = require('../models/comment');

//내가 쓴 댓글 조회
exports.inquiry = async function (req, res) {
    // const userId = req.cookies.userId;
    const userNickname = req.body.userNickname;

    // if (req.sessionID !== req.cookies.sid) return res.status(400).send('login_and_ues_it'); // 로그인이 안되어 있으면 내가 쓴 댓글 조회 불가

    // 닉네임이 없으면 코맨트 작성 불가
    if (userNickname == undefined) return res.status(400).end();

    const commentData = await commentsModel.commentInquiry(userNickname);

    // 데이터 베이스 오류면 종료
    if (commentData === false) return res.status(500).end();
    // 작성한 댓글이 없으면 종료
    if (commentData.length == 0) return res.status(404).end();

    return res.status(200).json({ length: data.length, results: commentData });
};

//댓글 작성 코드
exports.registration = async function (req, res) {
    let comment = req.body.comment;
    let userNickname = req.body.userNickname;

    // if (req.sessionID !== req.cookies.sid) return res.status(400).send('login_and_ues_it'); // 로그인 안하면 댓글 작성 불가

    if (comment == undefined) return res.status(400).send('comment_not_null');

    const data = commentsModel.commentInsert(comment, userNickname);

    if (data === false) return res.status(500).end();

    return res.status(201).end();
};

//댓글 수정 코드
exports.edit = async function (req, res) {
    let editComment = req.body.editComment;
    const id = req.body.id;

    // if (req.sessionID !== req.cookies.sid) return res.status(400).send('login_and_ues_it');

    // if (comment == undefined) return res.status(400).end();

    if (editComment == undefined) return res.status(400).end();

    const commentData = await commentsModel.commentInquiry(null, id);

    // 데이터 베이스 오류면 종료
    if (commentData === false) return res.status(500).end();
    // 인덱스 ID가 없으면 종료
    if (commentData.length == 0) return res.status(400).end();
    // 작성자가 다르면 수정 불가
    if (commentData[0].writer !== userNickname) return res.status(401).end();

    const data = await commentsModel.edit(editComment, id);

    // 데이터 베이스 오류면 종료
    if (data === false) return res.status(500).end();

    return res.status(200).end();
};

//댓글 삭제 코드
exports.delete = async function (req, res) {
    let id = req.body.id;
    const userNickname = req.body.userNickname;

    // if (req.sessionID !== req.cookies.sid) return res.status(400).send('login_and_ues_it');

    if (id == undefined) return res.status(400).end();

    const commentData = await commentsModel.commentInquiry(null, id);

    // 데이터 베이스 오류면 종료
    if (commentData === false) return res.status(500).end();
    // 인덱스 ID가 없으면 종료
    if (commentData.length == 0) return res.status(400).end();
    // 작성자가 다르면 삭제 불가
    if (commentData[0].writer !== userNickname) return res.status(401).end();

    const data = await commentsModel.delete(id);

    // 데이터 베이스 오류면 종료
    if (data === false) return res.status(500).end();

    return res.status(200).end();
};
