const express = require('express');
require("dotenv").config();
const mysql = require('mysql');
const database = {};

// //mysql 연결
const connection = mysql.createConnection({
  host : process.env.databaseHost,
  port : process.env.databasePort,
  user : process.env.databaseUser,
  password : process.env.databasePassword,
  database : process.env.databaseName,
  dateStrings: 'date'
});

connection.connect();


module.exports = connection;