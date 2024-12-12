# from flask import Flask, request, jsonify
# import tensorflow as tf
# import numpy as np
# from sklearn.preprocessing import LabelEncoder

# app = Flask(__name__)

# health_condition_encoder = LabelEncoder()
# activity_level_encoder = LabelEncoder()
# # blood_pressure_encoder = LabelEncoder()

# health_condition_encoder.fit(["Healthy", "Diabetic", "Obese", "Heart Disease", "Hypertension"])
# activity_level_encoder.fit(["Low", "Medium", "High"])
# # blood_pressure_encoder.fit(["Normal", "High", "Low"])

# @app.route('/')
# def hello():
#     return "Hello, World!"

# # Load model
# model = tf.keras.models.load_model('model/health_compatibility.h5')

# @app.route('/predict', methods=['POST'])
# def predict():
#     try:
#         data = request.get_json()

#         required_fields = [
#             "Calories", "Carbs", "Sugars", "Fat", "Protein", "Sodium", "Serving_Size",
#             "Health_Condition", "Height", "Weight", "Age", "BMI", "Activity_Level", 
#             "Blood_Sugar_Level", "Blood_Pressure"
#         ]
        
#         if not all(field in data for field in required_fields):
#             return jsonify({"error": "Missing required fields in the request"}), 400

#         try:
#             numeric_fields = [
#                 "Calories", "Carbs", "Sugars", "Fat", "Protein", "Sodium", 
#                 "Serving_Size", "Height", "Weight", "Age", "BMI", 
#                 "Blood_Sugar_Level", "Blood_Pressure"  # Masukkan Blood_Pressure sebagai float
#             ]
#             for field in numeric_fields:
#                 data[field] = float(data[field])
#         except ValueError as e:
#             return jsonify({"error": f"Invalid numeric value: {str(e)}"}), 400

#         health_condition = data["Health_Condition"]
#         activity_level = data["Activity_Level"]

#         if health_condition not in health_condition_encoder.classes_:
#             return jsonify({"error": f"Invalid Health_Condition: {health_condition}"}), 400
#         if activity_level not in activity_level_encoder.classes_:
#             return jsonify({"error": f"Invalid Activity_Level: {activity_level}"}), 400

#         encoded_health_condition = health_condition_encoder.transform([health_condition])[0]
#         encoded_activity_level = activity_level_encoder.transform([activity_level])[0]

#         features = [
#             data["Calories"], data["Carbs"], data["Sugars"], data["Fat"], 
#             data["Protein"], data["Sodium"], data["Serving_Size"], 
#             encoded_health_condition, data["Height"], data["Weight"], 
#             data["Age"], data["BMI"], encoded_activity_level, 
#             data["Blood_Sugar_Level"], data["Blood_Pressure"]  # Gunakan sebagai float langsung
#         ]
        
#         input_data = np.array(features).reshape(1, -1)

#         prediction = model.predict(input_data)

#         return jsonify({
#             "message": "Prediction successful",
#             # "input_data": [float(i) if isinstance(i, np.float64) else int(i) for i in features],  # Pastikan tipe data yang dikirim adalah float atau int
#             "prediction": prediction[0].tolist()  # Pastikan prediksi dikonversi ke list yang bisa diserialisasi
#         })


#     except Exception as e:
#         return jsonify({
#             "error": str(e)
#         }), 500

# if __name__ == '__main__':
#     app.run(host='0.0.0.0', port=8080)
from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
from sklearn.preprocessing import LabelEncoder

app = Flask(__name__)

health_condition_encoder = LabelEncoder()
activity_level_encoder = LabelEncoder()

health_condition_encoder.fit(["Healthy", "Diabetic", "Obese", "Heart Disease", "Hypertension"])
activity_level_encoder.fit(["Low", "Medium", "High"])


compatibility_model = tf.keras.models.load_model('model/health_compatibility.h5')
risk_model = tf.keras.models.load_model('model/health_risk.h5')

@app.route('/')
def hello():
    return "Hello, World!"

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()

        required_fields = [
            "Calories", "Carbs", "Sugars", "Fat", "Protein", "Sodium", "Serving_Size",
            "Health_Condition", "Height", "Weight", "Age", "BMI", "Activity_Level", 
            "Blood_Sugar_Level", "Blood_Pressure"
        ]
        
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields in the request"}), 400

        try:
            numeric_fields = [
                "Calories", "Carbs", "Sugars", "Fat", "Protein", "Sodium", 
                "Serving_Size", "Height", "Weight", "Age", "BMI", 
                "Blood_Sugar_Level", "Blood_Pressure"
            ]
            for field in numeric_fields:
                data[field] = float(data[field])
        except ValueError as e:
            return jsonify({"error": f"Invalid numeric value: {str(e)}"}), 400

        health_condition = data["Health_Condition"]
        activity_level = data["Activity_Level"]

        if health_condition not in health_condition_encoder.classes_:
            return jsonify({"error": f"Invalid Health_Condition: {health_condition}"}), 400
        if activity_level not in activity_level_encoder.classes_:
            return jsonify({"error": f"Invalid Activity_Level: {activity_level}"}), 400

        encoded_health_condition = health_condition_encoder.transform([health_condition])[0]
        encoded_activity_level = activity_level_encoder.transform([activity_level])[0]

        features = [
            data["Calories"], data["Carbs"], data["Sugars"], data["Fat"], 
            data["Protein"], data["Sodium"], data["Serving_Size"], 
            encoded_health_condition, data["Height"], data["Weight"], 
            data["Age"], data["BMI"], encoded_activity_level, 
            data["Blood_Sugar_Level"], data["Blood_Pressure"]
        ]
        
        input_data = np.array(features).reshape(1, -1)

        compatibility_prediction = compatibility_model.predict(input_data)

        health_risk_input = np.array([compatibility_prediction[0]]).reshape(1, -1)

        health_risk_prediction = risk_model.predict(health_risk_input)

        health_risk_categories = ["Low", "Medium", "High"]
        predicted_risk = health_risk_categories[int(np.argmax(health_risk_prediction))]

        return jsonify({
            "message": "Prediction successful",
            "health_risk": predicted_risk, 
            "compatibility_prediction": compatibility_prediction[0].tolist()  
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
