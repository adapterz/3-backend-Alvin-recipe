const postsModel = require('../models/posts');

//게시판 전체 조회
exports.inquiry = async function (req, res) {
    const data = await postsModel.inquiry();

    if (data == false) return res.status(500).end();

    if (data.length == 0) return res.status(404).end();

    return res.status(200).json({ length: data.length, results: data });
};

//게시판 글쓰기 코드
exports.registration = async function (req, res) {
    // if (req.sessionID !== req.cookies.sid) return res.status(400).send('login_and_use_it'); // 세션ID랑 쿠키에있는 세션ID가 다르면 글쓰기 불가, 로그인을 안했다고 판단

    const title = req.body.title;
    const contents = req.body.contents;
    const writer = req.body.writer;
    const userindex = req.body.userindex;
    let images = req.body.images;

    // 제목 빈칸 불가
    if (title == undefined) return res.status(400).send('title_not_null');
    // 내용 빈칸 불가
    if (contents == undefined) return res.status(400).send('contents_not_null');

    // if (images.length == 0) images = '없음';

    const thumbnailId = images[images.length - 1];

    const thumbnailData = await postsModel.thumbnail(thumbnailId);

    if (thumbnailData === false) return res.status(500).end();

    const thumbnail = thumbnailData[0].image;

    const data = await postsModel.registration(title, contents, writer, userindex, images, thumbnail);

    if (data === false) return res.status(500).end();

    return res.status(201).json({ message: 'done' });
};

//게시판 글 검색
exports.search = async function (req, res) {
    let title = req.body.title;

    if (title == undefined) return res.status(404).end();

    const data = await postsModel.search(title);

    if (data === false) return res.status(500).end();

    return res.status(200).json({ length: data.length, results: data });
};

//게시판 글 수정
exports.edit = async function (req, res) {
    const id = req.body.id;
    let editContents = req.body.editContents;
    let editTitle = req.body.editTitle;

    // if (req.sessionID !== req.cookies.sid) return res.status(400).send('login_and_use_it'); // 세션ID랑 쿠키에있는 세션ID가 다르면 글 수정 불가, 로그인을 안했다고 판단

    // if (writer == undefined) return res.status(403).send('you_don`t_have_permission'); // 작성자가 없으면 수정 불가

    const postData = await postsModel.postData(id);

    if (postData == false) return res.status(500).end();

    if (editTitle == undefined) editTitle = postData[0].title; // 바꿀 제목이 없으면 기존 제목으로 할당

    if (editContents == undefined) editContents = postData[0].contents; // 바꿀 내용이 없으면 기존 제목으로 할당

    const update = await postsModel.edit(id, editTitle, editContents);

    if (update == false) return res.status(500).end();

    return res.status(200).json({ results: update });
};

//게시판 상세보기
exports.view = async function (req, res) {
    let id = req.body.id;

    if (id == undefined) return res.status(401).end();

    const data = await postsModel.view(id);

    if (data === false) return res.status(500).end();

    return res.status(200).json({ results: data });
};

//게시판 글 삭제
exports.delete = async function (req, res) {
    const id = req.body.id;
    const writer = req.body.writer;

    const postData = await postsModel.postData(id);

    if (postData[0].writer !== writer) return res.status(401).end();

    const data = await postsModel.delete(id);

    if (data === false) return res.status(500).end();

    return res.status(200).json({ results: data });
};

//게시판 이미지 업로드
//XXX imageData 함수 ASYNC 되어 있는거 AWAIT로 변경해야함
exports.imageUpload = async function (req, res) {
    const images = [];
    let imageURL;
    let imageURLs = [];

    // console.log(req.files.length);
    for (let i = 0; i < req.files.length; i++) {
        imageURL = '/image/' + req.files[i].filename;
        // imageURL = '/' + req.files[i].filename;
        const data = await postsModel.upload(imageURL);
        images.push(data.insertId);
        imageURLs.push(imageURL);
    }

    return res.status(201).json({ imageIndexId: images, imageURLs: imageURLs });
};

//게시판 게시글 정보조회
exports.postInquiry = async function (req, res) {
    const userindex = req.body.userindex;

    const data = await postsModel.postInquiry(userindex);

    // 데이터베이스 오류면 종료
    if (data === false) return res.status(500).json(data);

    return res.status(200).json({ results: data, length: data.length });
};

// 게시판 게시글 좋아요
exports.like = async function (req, res) {
    const userindex = req.body.userindex;
    const postindex = req.body.postindex;

    const data = await postsModel.like(userindex, postindex);

    // 데이터베이스 오류면 종료
    if (data === false) return res.status(500).json(data);

    return res.status(201).json({ results: data });
};

// 게시판 게시글 좋아요 취소
exports.dislike = async function (req, res) {
    const userindex = req.body.userindex;
    const postindex = req.body.postindex;

    const data = await postsModel.disLike(userindex, postindex);

    // 데이터베이스 오류면 종료
    if (data === false) return res.status(500).json(data);

    return res.status(200).json({ results: data });
};

// 게시판 게시글 좋아요 여부확인
exports.checkLike = async function (req, res) {
    const userindex = req.body.userindex;
    const postindex = req.body.postindex;

    const data = await postsModel.checkLike(userindex, postindex);

    // 데이터베이스 오류면 종료
    if (data === false) return res.status(500).json(data);

    return res.status(201).json({ results: data, length: data.length });
};

// 게시판 게시글 좋아요 갯수 확인
exports.countLike = async function (req, res) {
    const postindex = req.body.postindex;

    const data = await postsModel.countLike(postindex);

    // 데이터베이스 오류면 종료
    if (data === false) return res.status(500).json(data);

    return res.status(201).json({ results: data, length: data.length });
};

// 메인화면 페이징
exports.indexPaging = async function (req, res) {
    // let page = Number(req.query.page || 1); // 기본 페이지1, 쿼리가 없다면 1로 사용
    let page = Number(req.body.page || 1);
    let offset = 1;
    const limit = 20; // 한 화면에서 몇개의 게시글을 보여줄지 결정
    const data = await postsModel.inquiry(); // 전체 게시글을 불러오기 위하여 모델 호출
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

    const results = await postsModel.indexPaging(offset, limit);

    // console.log(results[0].images);
    // console.log(results);
    // console.log(Object.values(results[0]));

    return res.status(200).json({ results });
};

// 내가 쓴 게시글 페이징
exports.mypagePaging = async function (req, res) {
    const userindex = req.body.userindex;
    let page = Number(req.body.page || 1);
    let offset = 1;
    const limit = 20; // 한 화면에서 몇개의 게시글을 보여줄지 결정
    const data = await postsModel.inquiry(); // 전체 게시글을 불러오기 위하여 모델 호출
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

    const results = await postsModel.mypagePaging(userindex, offset, limit);

    return res.status(200).json({ results });
};
