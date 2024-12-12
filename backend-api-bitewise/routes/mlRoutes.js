const express = require('express');
const {handleOCRAndCompatibilityPrediction } = require('../controllers/mlController');  

const router = express.Router();
router.post('/predict', handleOCRAndCompatibilityPrediction);

module.exports = router;
