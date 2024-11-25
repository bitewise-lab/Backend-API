const axios = require('axios');


const CLOUD_RUN_URL = process.env.ML_MODEL_URL;

async function getPrediction(inputData) {
    try {
        const response = await axios.post(CLOUD_RUN_URL, { input: inputData });
        return response.data; 
    } catch (error) {
        throw new Error('Error communicating with Cloud Run: ' + error.message);
    }
}

module.exports = { getPrediction };