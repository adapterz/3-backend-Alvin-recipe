const express = require('express');
const app = express();
const mysql = require('mysql');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const cookieParser = require('cookie-parser');
const port = 3000;
const indexRouter = require('./routes/index');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: new MySQLStore({
      host: process.env.databaseHost,
      port: process.env.databasePort,
      user: process.env.databaseUser,
      password: process.env.databasePassword,
      database: process.env.databaseName
    })
  })
);

app.use('/', indexRouter);

app.listen(port, function () {
  console.log(`Example app listening on port ${port}`);
});

module.exports = app;
