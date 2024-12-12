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

        Compatibility_Score = compatibility_model.predict(input_data)

        risk_input_data = np.concatenate([input_data, Compatibility_Score], axis=1)
        
        health_risk_prediction = risk_model.predict(risk_input_data)[0]

        max_probability = max(health_risk_prediction)
        predicted_class = np.argmax(health_risk_prediction)
        if predicted_class == 0:
            health_risk = "Low"
        elif predicted_class == 1:
            health_risk = "Medium"
        else:
            health_risk = "High"

        # Menampilkan hasil prediksi
        response = {
            "message": "Prediction successful",
            # "Compatibilty_Score": Compatibility_Score[0].tolist(),
            # "Health_Risk": health_risk_prediction[0].tolist()
            "Health_Risk": health_risk
        }

        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)


