const {getOCRPrediction, getCompatibilityPrediction } = require('../config/ml');
const User = require('../models/User');
const axios = require('axios');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('file');


const handleOCRAndCompatibilityPrediction = (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(500).json({
                error: true,
                message: 'Error uploading file',
            });
        }

        const File = req.file;

        if (!File) {
            return res.status(400).json({
                error: true,
                message: 'Image file is required',
            });
        }

        try {
            // 1. Proses OCR
            const ocrResult = await getOCRPrediction(File.buffer);

            req.body.Calories = ocrResult.Calories;
            req.body.Carbs = ocrResult.Carbs;
            req.body.Sugars = ocrResult.Sugars;
            req.body.Fat = ocrResult.Fat;
            req.body.Protein = ocrResult.Protein;
            req.body.Sodium = ocrResult.Sodium;
            req.body.Serving_Size = ocrResult.Serving_Size;

            console.log('OCR result:', ocrResult);

            // 2. Lakukan prediksi kecocokan dengan data pengguna
            const { username } = req.body;

            if (!username) {
                return res.status(400).json({ error: 'Username is required' });
            }

            User.findByUsername(username, async (err, results) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Database error' });
                }

                if (results.length === 0) {
                    return res.status(404).json({ error: 'User not found' });
                }

                const user = results[0];

                const formattedData = {
                    Calories: req.body.Calories,
                    Carbs: req.body.Carbs,
                    Sugars: req.body.Sugars,
                    Fat: req.body.Fat,
                    Protein: req.body.Protein,
                    Sodium: req.body.Sodium,
                    Serving_Size: req.body.Serving_Size,
                    Health_Condition: user.health_condition, 
                    Height: user.height, 
                    Weight: user.weight, 
                    Age: user.age, 
                    BMI: user.bmi, 
                    Activity_Level: user.activity_level, 
                    Blood_Sugar_Level: user.blood_sugar, 
                    Blood_Pressure: user.blood_pressure 
                };

                try {
                    const response = await getCompatibilityPrediction(formattedData);
                    res.status(200).json({
                        // message: 'Prediction successful',
                        ocrResult,
                        "error": false,
                        message: response.message, 
                        healthRisk: response.Health_Risk
                    });
                } catch (error) {
                    console.error('Prediction error:', error);
                    res.status(500).json({ error: 'Failed to process compatibility prediction' });
                }
            });
        } catch (error) {
            console.error('OCR Prediction Error:', error);
            res.status(500).json({
                error: true,
                message: 'Failed to process OCR prediction',
            });
        }
    });
};

// module.exports = { handleCompatibilityPrediction };
module.exports = { handleOCRAndCompatibilityPrediction };










