const { getOCRPrediction, getCompatibilityPrediction } = require('../config/ml');
const User = require('../models/User');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('file');
const { getFoodRecommendations } = require('../controllers/geminiController');

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
            const ocrResult = await getOCRPrediction(File.buffer);

            // Ensure all OCR result fields are correctly parsed and assigned
            req.body.Calories = ocrResult.Calories || 0;
            req.body.Carbs = ocrResult.Carbohydrates !== undefined ? parseFloat(ocrResult.Carbohydrates) || 0 : 0;
            req.body.Sugars = ocrResult.Sugars !== undefined ? parseFloat(ocrResult.Sugars) || 0 : 0;
            req.body.Fat = ocrResult.Fat !== undefined ? parseFloat(ocrResult.Fat) || 0 : 0;
            req.body.Protein = ocrResult.Protein || 0;
            req.body.Sodium = ocrResult.Sodium || 0;

            // Extract numeric value from Serving Size
            if (ocrResult['Serving Size'] !== undefined && ocrResult['Serving Size'] !== null) {
                if (typeof ocrResult['Serving Size'] === 'number') {
                    req.body.Serving_Size = ocrResult['Serving Size'];
                } else if (typeof ocrResult['Serving Size'] === 'string') {
                    const servingSizeMatch = ocrResult['Serving Size'].match(/\d+/);
                    req.body.Serving_Size = servingSizeMatch ? parseFloat(servingSizeMatch[0]) : 0;
                } else {
                    req.body.Serving_Size = 0;
                }
            } else {
                req.body.Serving_Size = 0;
            }

            console.log('OCR result:', ocrResult);

            // Step 2: Predict compatibility based on OCR results and user data
            const { email } = req.body;
            console.log('Username:', email);

            if (!email) {
                return res.status(400).json({ error: 'Username is required' });
            }

            User.findByEmail(email, async (err, results) => {
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
                    Blood_Pressure: user.blood_pressure,
                };

                // Step 3: Call the Cloud Run endpoint for compatibility prediction
                try {
                    const response = await getCompatibilityPrediction(formattedData);
                    const { Health_Risk: healthRisk, message } = response;
                    const Ing = ocrResult;

                    if (!Ing || !healthRisk) {
                        throw new Error('Ing and healthRisk are required');
                    }

                    // Step 4: Call Gemini API for recommendations
                    const recommendations = await getFoodRecommendations(Ing, healthRisk);

                    res.status(200).json({
                        error: false,
                        message: message,
                        Ing: ocrResult,
                        healthRisk: healthRisk,
                        recommendations: recommendations,
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

module.exports = { handleOCRAndCompatibilityPrediction };