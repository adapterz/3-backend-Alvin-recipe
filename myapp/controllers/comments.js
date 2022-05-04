const commentsModel = require('../models/comment');

//댓글 조회
exports.inquiry = async function (req, res) {
    // const userId = req.cookies.userId;
    const userNickname = req.body.writer;
    const postindexId = req.body.postindexId;

    // if (req.sessionID !== req.cookies.sid) return res.status(400).send('login_and_ues_it'); // 로그인이 안되어 있으면 내가 쓴 댓글 조회 불가

    // 닉네임이 없으면 댓글 조회 불가
    if (userNickname == undefined && postindexId == undefined) return res.status(400).end();

    const commentData = await commentsModel.inquiry(userNickname, null, postindexId);

    // 데이터 베이스 오류면 종료
    if (commentData === false) return res.status(500).end();
    // 작성한 댓글이 없으면 종료
    if (commentData.length == 0) return res.status(404).json({ length: commentData.length });

    return res.status(200).json({ length: commentData.length, results: commentData });
};

//댓글 작성 코드
exports.registration = async function (req, res) {
    const comment = req.body.comment;
    const userNickname = req.body.writer;
    const postindex = req.body.postindex;
    const userindex = req.body.userindex;

    // if (req.sessionID !== req.cookies.sid) return res.status(400).send('login_and_ues_it'); // 로그인 안하면 댓글 작성 불가

    if (comment == undefined) return res.status(400).send('comment_not_null');

    const data = commentsModel.commentInsert(comment, userNickname, userindex, postindex);

    if (data === false) return res.status(500).end();

    return res.status(201).json({ message: 'done' });
};

//댓글 수정 코드
exports.edit = async function (req, res) {
    let editComment = req.body.editComment;
    const id = req.body.id;

    // if (req.sessionID !== req.cookies.sid) return res.status(400).send('login_and_ues_it');

    // if (comment == undefined) return res.status(400).end();

    if (editComment == undefined) return res.status(400).end();

    const commentData = await commentsModel.commentInquiry(null, null, id);

    // 데이터 베이스 오류면 종료
    if (commentData === false) return res.status(500).end();
    // 인덱스 ID가 없으면 종료
    if (commentData.length == 0) return res.status(400).end();
    // 작성자가 다르면 수정 불가
    // if (commentData[0].writer !== userNickname) return res.status(401).end();

    const data = await commentsModel.edit(editComment, id);

    // 데이터 베이스 오류면 종료
    if (data === false) return res.status(500).end();

    return res.status(200).json({ data });
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
    // if (commentData[0].writer !== userNickname) return res.status(401).end();

    const data = await commentsModel.delete(id);

    // 데이터 베이스 오류면 종료
    if (data === false) return res.status(500).end();

    return res.status(200).json({ data });
};

// 내가 쓴 댓글 조회
exports.commentInquiry = async function (req, res) {
    const userindex = req.body.userindex;
    const postindex = req.body.postindex;

    const data = await commentsModel.commentInquiry(userindex, postindex);

    // 데이터베이스 오류면 종료
    if (data === false) return res.status(500).json(data);

    return res.status(200).json({ results: data, length: data.length });
};

// 댓글 게시글 좋아요
exports.like = async function (req, res) {
    const userindex = req.body.userindex;
    const commentindex = req.body.commentindex;

    const data = await commentsModel.like(userindex, commentindex);

    // 데이터베이스 오류면 종료
    if (data === false) return res.status(500).json(data);

    return res.status(201).json({ results: data });
};

// 댓글 게시글 좋아요 취소
exports.dislike = async function (req, res) {
    const userindex = req.body.userindex;
    const commentindex = req.body.commentindex;

    const data = await commentsModel.disLike(userindex, commentindex);

    // 데이터베이스 오류면 종료
    if (data === false) return res.status(500).json(data);

    return res.status(200).json({ results: data });
};

// 댓글 게시글 좋아요 여부확인
exports.checkLike = async function (req, res) {
    const userindex = req.body.userindex;
    const commentindex = req.body.commentindex;

    const data = await commentsModel.checkLike(userindex, commentindex);

    // 데이터베이스 오류면 종료
    if (data === false) return res.status(500).json(data);

    return res.status(201).json({ results: data, length: data.length });
};

exports.mypagePaging = async function (req, res) {
    const userindex = req.body.userindex;
    let page = Number(req.body.page || 1);
    let offset = 1;
    const limit = 5; // 한 화면에서 몇개의 게시글을 보여줄지 결정
    const data = await commentsModel.inquiry(null, null, userindex); // 전체 게시글을 불러오기 위하여 모델 호출
    const total = data.length; // 전체 게시글 변수에 저장
    const lastPage = Math.ceil(total / limit); // 총 페이지 전체게시글 / 한 화면에 보여줄 게시글 나머지는 올림

    // if (page > lastPage) {
    //     // URL로 총페이지보다 높게 요청하는경우 에는 마지막 페이지로 이동
    //     page = lastPage;
    // }

    if (page == 1) {
        offset = 0;
    } else {
        offset = (page - 1) * limit;
    }

    const results = await commentsModel.mypagePaging(userindex, offset, limit);

    return res.status(200).json({ results });
};
