const postsModel = require('../models/posts');

//게시판 전체 조회
exports.inquiry = async function (req, res) {
    const data = await postsModel.inquiry();

    if (data == false) return res.status(500).end();

    if (data.length == 0) return res.status(404).end();

    return res.status(200).json({ length: data.length, results: data });
};

//게시판 글쓰기 코드
//프론트랑 연동하면서 테스트 필요( 프론트에서 image의 indexID를 알려줘야함 )
exports.registration = async function (req, res) {
    // if (req.sessionID !== req.cookies.sid) return res.status(400).send('login_and_use_it'); // 세션ID랑 쿠키에있는 세션ID가 다르면 글쓰기 불가, 로그인을 안했다고 판단

    const title = req.body.title;
    const contents = req.body.contents;
    const writer = req.body.writer;
    let images = req.body.images;

    // 제목 빈칸 불가
    if (title == undefined) return res.status(400).send('title_not_null');
    // 내용 빈칸 불가
    if (contents == undefined) return res.status(400).send('contents_not_null');

    if (images.length == 0) images = '없음';

    const data = await postsModel.registration(title, contents, writer, images);

    if (data == false) return res.status(500).end();

    return res.status(201).end();
};

//게시판 글 검색
exports.search = async function (req, res) {
    let title = req.body.title;

    if (title == undefined) return res.status(404).end();

    const data = await postsModel.search(title);

    if (data == false) return res.status(500).end();

    return res.status(200).json({ length: data.length, results: data });
};

//게시판 글 수정
exports.edit = async function (req, res) {
    const id = req.body.id;
    let editContents = req.body.editContents;
    let editTitle = req.body.editTitle;

    // if (req.sessionID !== req.cookies.sid) return res.status(400).send('login_and_use_it'); // 세션ID랑 쿠키에있는 세션ID가 다르면 글 수정 불가, 로그인을 안했다고 판단

    // if (writer == undefined) return res.status(403).send('you_don`t_have_permission'); // 작성자가 없으면 수정 불가

    console.log(editContents);

    const postData = await postsModel.postData(id);

    if (postData == false) return res.status(500).end();

    if (editTitle == undefined) editTitle = postData[0].title; // 바꿀 제목이 없으면 기존 제목으로 할당

    if (editContents == undefined) editContents = postData[0].contents; // 바꿀 내용이 없으면 기존 제목으로 할당

    const update = await postsModel.edit(id, editTitle, editContents);

    if (update == false) return res.status(500).end();

    return res.status(200).end();
};

//게시판 상세보기
exports.view = async function (req, res) {
    let id = req.body.id;

    if (id == undefined) return res.status(401).end();

    const data = await postsModel.view(id);

    if (data == false) return res.status(500).end();

    return res.status(200).json({ results: data });
};

//게시판 글 삭제
exports.delete = async function (req, res) {
    const id = req.body.id;
    const writer = req.body.writer;

    const postData = await postsModel.postData(id);

    if (postData[0].writer !== writer) return res.status(401).end();

    const data = await postsModel.delete(id);

    if (data == false) return res.status(500).end();

    return res.status(200).end();
};

//게시판 이미지 업로드
//XXX imageData 함수 ASYNC 되어 있는거 AWAIT로 변경해야함
exports.imageUpload = async function (req, res) {
    const images = [];
    let imageURL;
    let imageURLs = [];

    for (let i = 0; i < req.files.length; i++) {
        imageURL = '/image/' + req.files[i].filename;
        const data = await postsModel.upload(imageURL);
        images.push(data.insertId);
        imageURLs.push(imageURL);
    }

    return res.status(201).json({ imageIndexId: images, imageURLs: imageURLs });
};
