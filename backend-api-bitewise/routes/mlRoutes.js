const express = require('express');
const mlroute = express.Router();
const { getPredictionHandler } = require('../controllers/mlController');

mlroute.post('/predict', getPredictionHandler);

module.exports = mlroute;
