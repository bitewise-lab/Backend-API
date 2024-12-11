const genAI = require('../config/geminiapi');
// const {getOCRPrediction, getCompatibilityPrediction } = require('../config/ml');

// const getOCRPrediction = await

const jsonFormat = `[ 
    { 
        "healthy_packaged_food_brands": "Oatmeal", 
        "sugar": "0.1 gr", 
        "fat": "3 gr", 
        "carbo": "3 gr", 
        "protein": "3 gr", 
        "category": "Karbohidrat kompleks" 
    },
    { 
        "healthy_packaged_food_brands": "ayam tanpa kulit", 
        "sugar": "0.1 gr", 
        "fat": "3 gr", 
        "carbo": "3 gr", 
        "protein": "3 gr", 
        "category": "protein" 
    },
    { 
        "healthy_packaged_food_brands": "salad sayur", 
        "sugar": "0.1 gr", 
        "fat": "3 gr", 
        "carbo": "3 gr", 
        "protein": "3 gr", 
        "category": "sayuran hijau" 
    }
]`;

const getFoodRecommendations = async (req, res) => {
    const prompt = `Berikan saya rekomendasi makanan dalam bentuk JSON. Setiap objek JSON harus mempunyai key seperti berikut: healthy_packaged_food_brands, sugar, fat, carbo, protein, category. Contoh format JSON seperti ini: ${jsonFormat}, tanpa keterangan dan penjelasan, hanya JSON aja, min 20`;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);

        // Mengambil hasil rekomendasi makanan dari respons model
        let foodRecommend = result.response.text();

        // Menghapus karakter tambahan sebelum JSON parse
        foodRecommend = foodRecommend.replace(/```json|```/g, '').trim();

        // Parsing hasil menjadi JSON
        const rekomendasiMakanan = JSON.parse(foodRecommend);

        console.log(rekomendasiMakanan);

        res.status(200).json({
            status: "success",
            rekomendasi_makanan: rekomendasiMakanan
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: "error",
            message: "Failed to fetch food recommendations."
        });
    }
};

module.exports = { getFoodRecommendations };

