const db = require('../config/cloudsql'); 

const User = {
    create: (userData, callback) => {
        const query = `
            INSERT INTO users (name, username, age, email, password, weight, height, blood_sugar, blood_pressure, bmi, health_condition, activity_level, imageUrl)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)
        `;
        db.query(query, [
            userData.name,
            userData.username,
            userData.age,
            userData.email,
            userData.password,
            userData.weight,
            userData.height,
            userData.blood_sugar,
            userData.blood_pressure,
            userData.bmi,
            userData.health_condition,
            userData.activity_level,
            userData.imageUrl
        ], callback);
    },

    findByEmail: (email, callback) => {
        const query = 'SELECT * FROM users WHERE email = ?';
        db.query(query, [email], callback);
    },

    findByUsername: (username, callback) => {
        const query = 'SELECT * FROM users WHERE username = ?';
        db.query(query, [username], callback);
    },

    deleteById: (id, callback) => {
        const query = 'DELETE FROM users WHERE id = ?';
        db.query(query, [id], callback);
    },

    // app.put('/users/update/:id', (req, res) => {
    //     const id = req.params.id;
    //     const updateData = req.body; // Ambil data form-data
    //     updateById(id, updateData, (err, result) => {
    //         if (err) {
    //             return res.status(500).send({ error: err.message });
    //         }
    //         res.send({ message: "User updated successfully", result });
    //     });
    // });
    

    updateById: (id, updateData, callback) => {
        let query = `UPDATE users SET `;
        const fields = [];
        const values = [];

        // Tambahkan kolom yang diperbarui jika nilainya ada
        if (updateData.name) {
            fields.push('name = ?');
            values.push(updateData.name);
        }
        if (updateData.username) {
            fields.push('username = ?');
            values.push(updateData.username);
        }
        if (updateData.age) {
            fields.push('age = ?');
            values.push(updateData.age);
        }
        if (updateData.email) {
            fields.push('email = ?');
            values.push(updateData.email);
        }
        if (updateData.password) {
            fields.push('password = ?');
            values.push(updateData.password);
        }
        if (updateData.weight) {
            fields.push('weight = ?');
            values.push(updateData.weight);
        }
        if (updateData.height) {
            fields.push('height = ?');
            values.push(updateData.height);
        }
        if (updateData.blood_sugar) {
            fields.push('blood_sugar = ?');
            values.push(updateData.blood_sugar);
        }
        if (updateData.blood_pressure) {
            fields.push('blood_pressure = ?');
            values.push(updateData.blood_pressure);
        }
        if (updateData.bmi) {
            fields.push('bmi = ?');
            values.push(updateData.bmi);
        }
        if (updateData.health_condition) {
            fields.push('health_condition = ?');
            values.push(updateData.health_condition);
        }
        if (updateData.activity_level) {
            fields.push('activity_level = ?');
            values.push(updateData.activity_level);
        }
        if (updateData.imageUrl) {
            fields.push('imageUrl = ?');
            values.push(updateData.imageUrl);
        }

        query += fields.join(', ') + ' WHERE id = ?';
        values.push(id);

        db.query(query, values, callback);
    },
};

module.exports = User;
