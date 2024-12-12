const dotenv = require('dotenv');
const axios = require('axios');
const genAI = require('../config/geminiapi');
dotenv.config();

const CLOUD_RUN_URL_MODEL_1 = process.env.ML_MODEL_ING_URL;
const CLOUD_RUN_URL_MODEL_2 = process.env.ML_MODEL_COMPABILITY_URL;

const FormData = require('form-data');

async function getOCRPrediction(imageBuffer) {
    try {
        const form = new FormData();
        form.append('file', imageBuffer, {
            filename: 'image.jpg',
            contentType: 'image/jpeg',
        });

        const response = await axios.post(CLOUD_RUN_URL_MODEL_1, form, {
            headers: {
                ...form.getHeaders(),
            },
            timeout: 60000,
        });

        if (!response.data) {
            throw new Error('Invalid response from OCR Model');
        }

        console.log('OCR Model Response:', response.data);

        const prompt = `
        ${response.data.text} Teks berikut berisi informasi nilai gizi yang diekstrak menggunakan pytesseract, namun teks tersebut masih sangat kotor dan memerlukan perbaikan. 
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

        const cleanedText = result.response.text().replace(/```json|```/g, '');

        let cleaned_data;
        try {
            cleaned_data = JSON.parse(cleanedText);
        } catch (parseError) {
            throw new Error('Invalid JSON response from generative model');
        }

        const cleanNumericValues = (value) => {
            if (typeof value === 'string') {
                return parseFloat(value.replace(/[^\d.-]/g, '')) || 0;
            }
            return value;
        };

        for (const key in cleaned_data) {
            if (cleaned_data.hasOwnProperty(key)) {
                cleaned_data[key] = cleanNumericValues(cleaned_data[key]);
            }
        }

        return cleaned_data;

    } catch (error) {
        if (error.response) {
            console.error('Cloud Run Error Response:', {
                status: error.response.status,
                data: error.response.data,
                headers: error.response.headers,
            });

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
        console.log('Sending data to Cloud Run:', JSON.stringify(data, null, 2));
        const response = await axios.post(CLOUD_RUN_URL_MODEL_2, data, {
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 60000,
        });

        if (!response.data) {
            throw new Error('Invalid response from Compatibility Model');
        }

        console.log('Compatibility Model Response:', response.data);

        return response.data;

    } catch (error) {
        if (error.response) {
            console.error('Error communicating with Cloud Run:', {
                status: error.response.status,
                data: error.response.data,
                headers: error.response.headers,
            });

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
            throw new Error('No response from Compatibility Model: ' + error.message);
        } else {
            console.error('Unexpected Error:', error.message);
            throw new Error('Unexpected error: ' + error.message);
        }
    }
}

module.exports = { getCompatibilityPrediction, getOCRPrediction };