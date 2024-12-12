const genAI = require('../config/geminiapi');

const category = `["protein", "sayuran hijau", "buah", "karbohidrat kompleks", "sumber serat", "sumber kalsium", "minuman sehat"]`;
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
        "healthy_packaged_food_brands": "Fitbar", 
        "sugar": "0.1 gr", 
        "fat": "3 gr", 
        "carbo": "3 gr", 
        "protein": "3 gr", 
        "category": "protein" 
    },
    { 
        "healthy_packaged_food_brands": "Soyjoy", 
        "sugar": "0.1 gr", 
        "fat": "3 gr", 
        "carbo": "3 gr", 
        "protein": "3 gr", 
        "category": "sayuran hijau" 
    }
]`;

const getFoodRecommendations = async (Ing, healthRisk) => {
    if (!Ing || !healthRisk) {
        throw new Error('Ing and healthRisk are required');
    }

    const prompt = `
    Jadilah seorang ahli gizi yang menyarankan produk berdasarkan informasi gizi dan penilaian risiko kesehatan berikut, berikan rekomendasi merek makanan kemasan sehat:
    Dengan Informasi Nilai Gizi: ${JSON.stringify(Ing, null, 2)}
    Health Risk: ${healthRisk}
    Berikan saya rekomendasi makanan kemasan di Indonesia dalam bentuk JSON. Setiap objek JSON harus mempunyai key seperti berikut: healthy_packaged_food_brands, sugar, fat, carbo, protein, category.
    Untuk category, berikan kategori sesuai dengan kategori berikut ini: ${category}.
    Contoh format JSON seperti ini: ${jsonFormat}, TANPA keterangan dan penjelasan pada semua key yang telah disebutkan sebelumnya dan maksimal 2 atau 3 kata pada healthy_packaged_food, 
    hanya JSON aja dan untuk nilai dari tiap key itu berformat nilai lalu diikuti dengan satuannya, maksimal 10 merek, hindari non-whitespace characters pada json
    `;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-001" });
        const result = await model.generateContent(prompt);

        // Mengambil hasil rekomendasi makanan dari respons model
        let foodRecommend = result.response.text();

        // Menghapus karakter tambahan sebelum JSON parse
        foodRecommend = foodRecommend.replace(/```json|```/g, '').trim();

        // Parsing hasil menjadi JSON
        const recommendations = JSON.parse(foodRecommend);

        return recommendations;
    } catch (error) {
        console.error('Error generating recommendations:', error);
        throw new Error('Failed to generate food recommendations');
    }
};

module.exports = { getFoodRecommendations };