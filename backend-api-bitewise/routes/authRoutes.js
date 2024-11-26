const express = require('express');
const { register, login } = require('../controllers/authController');

const authroute = express.Router();

authroute.post('/register', register);
authroute.post('/login', login);


module.exports = authroute;
