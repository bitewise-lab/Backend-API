const db = require('../config/cloudsql');
const moment = require('moment'); 

const Post = {
    create: (username, description, imageUrl,imageUser, createdAt) => {
        return new Promise((resolve, reject) => {
            const sql = 'INSERT INTO posts (username, description, imageUrl, imageUser, createdAt) VALUES (?, ?, ?, ?, ?)';
            db.query(sql, [username, description, imageUrl,imageUser, createdAt], (err, result) => {
                if (err) {
                    console.error('Error inserting data into database:', err);
                    return reject(err);
                }
                console.log('Insert successful:', result);
                resolve(result);
            });
        });
    },
    
    
    getAll: (callback) => {
        const sql = 'SELECT * FROM posts';
        db.query(sql, (err, results) => {
            if (err) {
                return callback(err, null);
            }
            const formattedResults = results.map(post => {
                const postTime = moment(post.timestamp);
                const now = moment();

                if (now.diff(postTime, 'hours') >= 24) {
                    post.formattedTime = postTime.format('YYYY-MM-DD');  
                } else {
                    post.formattedTime = postTime.format('HH:mm');  
                }

                return post;
            });

            callback(null, formattedResults);
        });
    },

    getById: (id, callback) => {
        const sql = 'SELECT * FROM posts WHERE id = ?';
        db.query(sql, [id], (err, results) => {
            if (err || results.length === 0) return callback(err, null);
            
            const post = results[0];
            const postTime = moment(post.timestamp);
            const now = moment();

            if (now.diff(postTime, 'hours') >= 24) {
                post.formattedTime = postTime.format('YYYY-MM-DD');  
            } else {
                post.formattedTime = postTime.format('HH:mm');  
            }

            callback(null, post);
        });
    },

    update: (id, username, description, imageUrl, createdAt,  callback) => {
        const sql = 'UPDATE posts SET username = ?, description = ?, imageUrl =? WHERE id = ?';
        db.query(sql, [username, description,imageUrl, createdAt,  id], callback);
    },

    delete: (id, callback) => {
        const sql = 'DELETE FROM posts WHERE id = ?';
        db.query(sql, [id], callback);
    },
};

module.exports = Post;
