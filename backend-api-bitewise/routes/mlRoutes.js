const express = require('express');
const authrouter = express.Router();
const { getPredictionHandler } = require('../controllers/mlController');

authrouter.post('/predict', getPredictionHandler);

module.exports = authrouter;
