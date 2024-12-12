from flask import Flask, request, jsonify, send_file
import numpy as np
from PIL import Image
import tensorflow as tf
import pytesseract
import io

# Initialize Flask app
app = Flask(__name__)

# Load the model (Make sure the model path is correct)
model = tf.saved_model.load("./model/save_model")
print("Model loaded successfully.")

def img_to_tensor(img_np):
    """Convert numpy image array to a tensor."""
    img_tf = tf.convert_to_tensor(img_np, dtype=tf.float32)
    img_tf = tf.expand_dims(img_tf, axis=0)  # Adding batch dimension
    return img_tf

def img_proccess(img_file):
    """Process the image for model inference."""
    img = Image.open(img_file)  # Open the image from the in-memory file

    # Resize image for detection
    detection_img = img.resize((640, 640))
    detection_img = np.array(detection_img)

    img = np.array(img)
    origin_img = np.zeros(img.shape)

    np.copyto(origin_img, img)

    detection_img = img_to_tensor(detection_img)

    return {'origin_img_np': origin_img, 'detection_img_tensor': detection_img}


def crop_image(image, boxes, scores, score_limit, resize_factor=1.1):
    """Crops the image using bounding box coordinates and returns the extracted text, with the bounding box resized by a factor."""
    now_image_np = np.array(image)

    # Convert to PIL Image
    image_pil = Image.fromarray(np.uint8(now_image_np)).convert("RGB")
    img_width, img_height = image_pil.size

    text_result = ""  # Store the OCR results

    for i in range(0, len(boxes)):
        if float(scores[i]) > score_limit:
            box = boxes[i]
            ymin, xmin, ymax, xmax = tuple(box)

            # Convert normalized coordinates to pixel coordinates
            ymin = int(ymin * img_height)
            xmin = int(xmin * img_width)
            ymax = int(ymax * img_height)
            xmax = int(xmax * img_width)

            # Calculate the width and height of the bounding box
            box_width = xmax - xmin
            box_height = ymax - ymin

            # Resize the bounding box by the resize_factor (e.g., 1.1 for 10% larger)
            new_box_width = int(box_width * resize_factor)
            new_box_height = int(box_height * resize_factor)

            # Recalculate the new coordinates to maintain the center of the bounding box
            center_x = xmin + box_width // 2
            center_y = ymin + box_height // 2

            new_xmin = int(center_x - new_box_width // 2)
            new_ymin = int(center_y - new_box_height // 2)
            new_xmax = int(center_x + new_box_width // 2)
            new_ymax = int(center_y + new_box_height // 2)

            # Ensure the new coordinates are within the image bounds
            new_xmin = max(new_xmin, 0)
            new_ymin = max(new_ymin, 0)
            new_xmax = min(new_xmax, img_width)
            new_ymax = min(new_ymax, img_height)

            # Crop the image using the new bounding box coordinates
            cropped_image = image_pil.crop((new_xmin, new_ymin, new_xmax, new_ymax))

            # Extract text using pytesseract (OCR)
            text = pytesseract.image_to_string(cropped_image)
            text_result += text + "\n"  # Collect all OCR text

    if text_result:
        return text_result  # Return the extracted OCR text

    return None


@app.route('/api/upload', methods=['POST'])
def upload_image():
    """Handle the image upload, process it, and return extracted text.""" 
    # Check if an image is provided in the request
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']

    # Ensure the file is a valid image
    if file and file.filename.lower().endswith(('jpg', 'jpeg', 'png')):
        try:
            # Attempt to open and process the image
            print(f"Received file: {file.filename}")
            path_test_img = img_proccess(file)

            # Perform detection
            detections = model.signatures['detect'](path_test_img["detection_img_tensor"])

            # Log the detections for debugging
            print(f"Detections: {detections}")

            # Crop the image based on detections and get the OCR text
            ocr_text = crop_image(
                path_test_img['origin_img_np'],
                detections['detection_boxes'][0].numpy(),
                detections["detection_scores"][0].numpy(),
                score_limit=0.8
            )

            if ocr_text:
                # Return the extracted text as the response
                return jsonify({"text": ocr_text})

            return jsonify({"error": "No valid detections found."}), 400

        except Exception as e:
            # Log the detailed error
            print(f"Error occurred: {str(e)}")
            return jsonify({"error": f"An error occurred: {str(e)}"}), 500

    return jsonify({"error": "Invalid file format. Please upload an image."}), 400

if __name__ == '__main__':
    app.run(debug=True, port=8080)
