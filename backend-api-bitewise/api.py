import os
import re
from flask import Flask, request, jsonify
import google.generativeai as genai
import json
from flask_cors import CORS

GOOGLE_API_KEY = "AIzaSyCGc50f1t6rn24tUKLILSXzR-MBAT6KxY0"
genai.configure(api_key=GOOGLE_API_KEY)

json_format = """
[
    {
        "meal_food" : "Nasi"
        "sugar"     : "0,1 gr"
        "fat"       : "3 gr"
        "carbo"     : "3 gr"
        "protein"   : "3 gr"
    },
    {
        "meal_food" : "Tempe"
        "sugar"     : "0,1 gr"
        "fat"       : "3 gr"
        "carbo"     : "3 gr"
        "protein"   : "3 gr"
    },
    {
        "meal_food" : "Tahu"
        "sugar"     : "0,1 gr"
        "fat"       : "3 gr"
        "carbo"     : "3 gr"
        "protein"   : "3 gr"
    }
]
"""
app = Flask(__name__)
CORS(app)

@app.route('/recommendation', methods=['POST'])
def recommendation():
    prompt = f"Berikan saya rekomendasi makanan dalam bentuk JSON. Setiap objek JSON harus mempunyai key seperti berikut: meal_food , sugar, fat, carbo, protein. Contoh format JSON seperti ini : {json_format}, tanpa keterangan dan penjelasan, hanya JSON aja, min 20"
    model_ai = genai.GenerativeModel('gemini-1.5-flash')
    response_recommend = model_ai.generate_content([prompt])
    food_recommend = response_recommend.text
    final_food_recommend = food_recommend.replace('```json', '').replace('```', '').strip()
    rekomendasi_makanan = json.loads(final_food_recommend)
    print(rekomendasi_makanan)
    return jsonify({
        "status": "success",
        "rekomendasi_makanan": rekomendasi_makanan
    }), 200

if __name__ == '__main__':
    app.run(port=2050)

