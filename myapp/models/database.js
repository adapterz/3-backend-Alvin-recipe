const express = require('express');
require('dotenv').config();
const mysql = require('mysql2/promise');
const config = require('../config/key');

// const connection = mysql.createConnection(config.mysqlurl);

// connection.connect(function (err) {
//     if (err) {
//         console.log('mysql_err', err);
//     } else {
//         console.log('mysql_connection');
//     }
// });

// const pool = mysql.createPool(config.mysqlurl);
// const connection = pool.getConnection();

const connection = mysql.createPool(config.mysqlurl);

// pool.getConnection(function (err) {
//     if (err) {
//         console.log('mysql_errer', err);
//     } else {
//         console.log('mysql.connection');
//     }
// });

module.exports = connection;
