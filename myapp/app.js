process.env.NODE_ENV = 'development';
// process.env.NODE_ENV = 'production';

const express = require('express');
const app = express();
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const cookieParser = require('cookie-parser');
const multer = require('multer'); // form-data 사용하기 위한 미들웨어
const form_date = multer(); // form-data 사용하기 위한 미들웨어

const indexRouter = require('./routes/index');
const config = require('./config/key');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(
    session({
        secret: 'keyboard cat',
        resave: false,
        saveUninitialized: true,
        store: new MySQLStore(config.mysqlurl)
    })
);

app.use('/', indexRouter);

app.listen(config.port, function () {
    console.log(`Example app listening on port ${config.port}`);
});

module.exports = app;
