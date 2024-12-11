// const express = require('express');
// const { predict, getPredictionResult } = require('../controllers/mlController');

// const router = express.Router();

// router.post('/predict', predict);

// router.get('/results', getPredictionResult);

// module.exports = router;
// mlRoutes.js
const express = require('express');
const {handleOCRAndCompatibilityPrediction } = require('../controllers/mlController');  
// const {handleOCRAndCompatibilityPrediction} = require('../controllers/mlController');

const router = express.Router();
// router.post('/ocr', handleOCRPrediction);
router.post('/predict', handleOCRAndCompatibilityPrediction);

module.exports = router;

