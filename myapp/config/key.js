if (process.env.NODE_ENV === 'production') {
    // NODE_ENV가 배포모드면 배포모드로 동작
    module.exports = require('./production');
} else {
    module.exports = require('./deveopment'); // NODE_ENV가 배포모드가 아니면 개발모드로 동작
}
