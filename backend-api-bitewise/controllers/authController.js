const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const { generateToken } = require('../config/jwt');
const {bucketProfile} = require('../config/cloudstorage');
const path = require('path');  
const multer = require('multer');
const fs = require('fs');


const storage = multer.memoryStorage();

const upload = multer({ storage: storage }).single('imageFile');

const healthConditionMap = {
    'Diabetes': 'Diabetic',
    'Obesitas': 'Obesity',
    'Penyakit Jantung': 'Heart Disease',
    'Sehat': 'Healthy',
    'Hipertensi': 'Hypertension'
};

const activityLevelMap = {
    'Rendah': 'Low',
    'Sedang': 'Medium',
    'Tinggi': 'High'
};

const register = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(500).json({ message: 'Error uploading file', error: err });
        }

        const {
            name,
            username,
            age,
            email,
            password,
            weight,
            height,
            blood_sugar,
            blood_pressure,
            bmi,
            health_condition,
            activity_level,
        } = req.body;

        const imageFile = req.file;  
        const userId = uuidv4();
        const hashedPassword = bcrypt.hashSync(password, 8);

        if (!imageFile) {
            return res.status(400).json({ message: 'Image file is required' });
        }

        const fileName = Date.now() + path.extname(imageFile.originalname);

        const translatedHealthCondition = healthConditionMap[health_condition];
        const translatedActivityLevel = activityLevelMap[activity_level];
        try {
            const file = bucketProfile.file(fileName);
            const stream = file.createWriteStream({
                metadata: {
                    contentType: imageFile.mimetype,
                },
            });

            stream.on('error', (err) => {
                console.error('GCS upload error:', err);
                return res.status(500).json({ message: 'Error uploading to GCS', error: err });
            });

            stream.on('finish', async () => {
                try {
                    const imageUrl = `https://storage.googleapis.com/${bucketProfile.name}/${fileName}`;

                    const newUser = {
                        userId,
                        name,
                        username,
                        age,
                        email,
                        password: hashedPassword,
                        weight: weight || null,
                        height: height || null,
                        blood_sugar: blood_sugar || null,
                        blood_pressure: blood_pressure || null,
                        bmi: bmi || null,
                        health_condition: translatedHealthCondition || health_condition,
                        activity_level: translatedActivityLevel || activity_level,
                        imageUrl,
                    };

                    await User.create(newUser);  
                    res.status(201).json({
                        error: false,
                        message: 'User registered successfully',
                    });
                } catch (dbError) {
                    console.error('Error registering user:', dbError);
                    return res.status(500).json({ message: 'Error registering user', error: dbError });
                }
            });

            stream.end(imageFile.buffer); 

        } catch (error) {
            console.error('Error processing registration:', error);
            res.status(500).json({ message: 'Error processing registration', error });
        }
    });
};


const login = (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    User.findByEmail(email, (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = results[0];

        if (!user.password) {
            return res.status(500).json({ message: "User password is missing" });
        }


        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) {
            return res.status(401).json({ message: "Invalid password" });
        }

        const token = generateToken(user);

        res.status(200).json({
            "error": false,
            "message": "success",
            "loginResult":{
                userId: user.userId,
                name: user.name,
                username: user.username,
                age: user.age,
                email: user.email,
                weight: user.weight,
                height: user.height,
                blood_sugar: user.blood_sugar,
                blood_pressure: user.blood_pressure,
                bmi: user.bmi,
                health_condition: user.health_condition,
                activity_level: user.activity_level,
                imageUrl: user.imageUrl,
                accessToken: token,
            }
        });
    });
};


const deleteUser = (req, res) => {
    const { id } = req.params;
    User.deleteById(id, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error deleting user', error: err });
        if (result.affectedRows === 0) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ message: 'User deleted successfully' });
    });
};

const updateUser = (req, res) => {
    const { name, username, age, email, password, weight, height, blood_sugar, blood_pressure, bmi, health_condition, activity_level, imageUrl   } = req.body;
    const userId = req.user.id; 

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    const updateData = {
        name,
        username,
        age,
        email,
        weight,
        height,
        blood_sugar,
        blood_pressure,
        bmi,
        health_condition,
        activity_level,
        imageUrl

    };

    if (password) {
        try {
            const hashedPassword = bcrypt.hashSync(password, 8);
            updateData.password = hashedPassword;
        } catch (err) {
            console.error("Error hashing password:", err);
            return res.status(500).json({ message: 'Error hashing password', error: err });
        }
    }

    User.updateById(userId, updateData, (err, result) => {
        if (err) {
            console.error("Error updating user:", err);
            return res.status(500).json({ message: 'Error updating user', error: err });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User updated successfully' });
    });
};


module.exports = { register, login, updateUser,deleteUser };

