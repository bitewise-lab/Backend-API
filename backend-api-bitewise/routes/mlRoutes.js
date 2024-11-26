const express = require('express');
const mlroute = express.Router();
const { getPredictionHandler } = require('../controllers/mlController');

mlrouter.post('/predict', getPredictionHandler);

module.exports = mlroute;
