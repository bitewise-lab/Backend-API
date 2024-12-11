// const mysql = require('mysql2');
// const dotenv = require('dotenv');

// dotenv.config();

// const db = mysql.createConnection({
//     socketPath: `/cloudsql/${process.env.CLOUD_SQL_CONNECTION_NAME}`,  
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
// });


// db.connect((err) => {
//     if (err) {
//         console.error('Error connecting to the database:', err.message);
//     } else {
//         console.log('Connected to Cloud SQL MySQL Database');
//     }
// });

// module.exports = db;

const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    connectTimeout: 50000 
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        console.error('Error code:', err.code);
        console.error('Error stack:', err.stack);
    } else {
        console.log('Connected to XAMPP MySQL Database');
    }
});


module.exports = db;
