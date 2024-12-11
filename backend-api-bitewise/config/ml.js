const dotenv = require('dotenv');
const axios = require('axios');
const genAI = require('../config/geminiapi');
dotenv.config();

const CLOUD_RUN_URL_MODEL_1 = process.env.ML_MODEL_ING_URL;
const CLOUD_RUN_URL_MODEL_2 = process.env.ML_MODEL_COMPABILITY_URL;  


async function getOCRPrediction(imageBuffer) {
    try {
        const response = await axios.post(CLOUD_RUN_URL_MODEL_1, imageBuffer, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            timeout: 10000,
        });

        if (!response.data) {
            throw new Error('Invalid response from OCR Model');
        }

        console.log('OCR Model Response:', response.data);

        const prompt = `
        ${response.data} Teks berikut berisi informasi nilai gizi yang diekstrak menggunakan pytesseract, namun teks tersebut masih sangat kotor dan memerlukan perbaikan. 
        Fokuskan pada informasi mengenai dan buang sisanya:
        Calories (Kalori)
        Carbohydrates (Karbohidrat)
        Sugars (Gula)
        Fat (Lemak)
        Protein (Protein)
        Sodium (Natrium)
        Serving Size (Ukuran Sajian)
        Jika nilai untuk salah satu dari informasi tersebut tidak dapat ditemukan dalam teks OCR, setel nilainya menjadi 0. 
        Setelah memproses dan memperbaiki teks, berikan hasilnya dalam format JSON yang terstruktur dengan informasi gizi yang bersih dan dapat digunakan.
        `;
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        console.log("Result from Gemini:", result.response.text());

        return cleaned_data;

    } catch (error) {
        if (error.response) {
            console.error('Cloud Run Error Response:', {
                status: error.response.status,
                data: error.response.data,
            });

            // Error handling yang lebih spesifik
            if (error.response.status === 400) {
                throw new Error(`Bad Request: ${JSON.stringify(error.response.data)}`);
            } else if (error.response.status === 500) {
                throw new Error(`Server Error: ${JSON.stringify(error.response.data)}`);
            } else {
                throw new Error(
                    `Cloud Run Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`
                );
            }
        } else if (error.request) {
            console.error('No response from Cloud Run:', error.message);
            throw new Error('No response from OCR Model: ' + error.message);
        } else {
            console.error('Unexpected Error:', error.message);
            throw new Error('Unexpected error: ' + error.message);
        }
    }
}


async function getCompatibilityPrediction(data) {
    try {
        console.log("Sending data to Cloud Run:", data); 
        const response = await axios.post(CLOUD_RUN_URL_MODEL_2, data, {
            headers: { 'Content-Type': 'application/json' }
        })
        console.log("Status Code:", response.status);
        console.log("Response Data:", response.data);

        console.log("Response from Cloud Run:", response.data);

        if (!response.data || !response.data.hasOwnProperty('message') ||  !response.data.hasOwnProperty('Health_Risk')) {
            throw new Error('Invalid response format from Cloud Run');
        }

        return {
            message: response.data.message,
            // Compatibilty_Score: response.data.Compatibilty_Score,
            Health_Risk: response.data.Health_Risk
        };  

    } catch (error) {
        console.log("Sending data to Cloud Run:", JSON.stringify(data, null, 2)); 
        console.log("Cloud Run URL:", CLOUD_RUN_URL_MODEL_2);
        console.error('Error communicating with Cloud Run:', error.message);
        throw new Error('Error communicating with Cloud Run: ' + error.message);
    }
}

module.exports = {getCompatibilityPrediction, getOCRPrediction};


