const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const generateToken = (user) => {
    return jwt.sign({ 
        id: user.userId, 
        username: user.username,
        name: user.name,
        email: user.email,
        age: user.age,
        weight: user.weight,
        height: user.height,
        blood_sugar: user.blood_sugar,
        blood_pressure: user.blood_pressure,
        bmi: user.bmi,
        health_condition: user.health_condition,
        activity_level: user.activity_level,
        imageUrl: user.imageUrl }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

module.exports = { generateToken };
