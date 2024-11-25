const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const db = mysql.createConnection({
    socketPath: `/cloudsql/${process.env.CLOUD_SQL_CONNECTION_NAME}`,  
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to Cloud SQL MySQL Database');
});

module.exports = db;
