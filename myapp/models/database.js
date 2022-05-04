const express = require('express');
require('dotenv').config();
const mysql = require('mysql2/promise');
const config = require('../config/key');

const connection = mysql.createPool(config.mysqlurl);

module.exports = connection;
