// authMiddleware.js
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];  

    if (!token) {
        return res.status(403).json({ message: 'No token provided!' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Unauthorized!' });
        }

        // req.user = { id: decoded.id, username: decoded.username, imageUrl: decoded.imageUrl }; 
        req.user = {
            id: decoded.id,
            username: decoded.username,
            name: decoded.name,
            email: decoded.email,
            age: decoded.age,
            weight: decoded.weight,
            height: decoded.height,
            blood_sugar: decoded.blood_sugar,
            blood_pressure: decoded.blood_pressure,
            bmi: decoded.bmi,
            health_condition: decoded.health_condition,
            activity_level: decoded.activity_level,
            imageUrl: decoded.imageUrl
        };
        next();  
    });
};

module.exports = authMiddleware;
