const { GoogleGenerativeAI } = require('@google/generative-ai');

const GOOGLE_API_KEY = "AIzaSyCGc50f1t6rn24tUKLILSXzR-MBAT6KxY0"; // Gantilah dengan API Key yang valid

const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

module.exports = genAI;





