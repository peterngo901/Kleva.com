const mysql = require('mysql2');

// Connection Pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: '', // Database Schema Name
    password: '' // Password during install
});

module.exports = pool.promise();