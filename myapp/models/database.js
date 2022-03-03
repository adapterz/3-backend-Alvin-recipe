const express = require('express');
require('dotenv').config();
const mysql = require('mysql');
const config = require('../config/key');

const connection = mysql.createConnection(config.mysqlurl);

connection.connect(function (err) {
    if (err) {
        console.log('mysql_err', err);
    } else {
        console.log('mysql_connection');
    }
});

module.exports = connection;
