import cv2
import numpy as np
import base64
from ultralytics import YOLO
import easyocr
import os

def zoom_into_bbox(image, bbox, margin=10, zoom_level=3.0):
    """Zoom into the bounding box area with an optional margin and zoom level."""
    x1, y1, x2, y2 = bbox
    x1 = max(0, x1 - margin)
    y1 = max(0, y1 - margin)
    x2 = min(image.shape[1], x2 + margin)
    y2 = min(image.shape[0], y2 + margin)
    
    cropped_img = image[y1:y2, x1:x2]
    
    zoom_width = int(cropped_img.shape[1] * zoom_level)
    zoom_height = int(cropped_img.shape[0] * zoom_level)
    
    zoomed_img = cv2.resize(cropped_img, (zoom_width, zoom_height))
    
    return zoomed_img

def convert_image_to_base64(image):
    """Convert image to a Base64 encoded string."""
    _, buffer = cv2.imencode('.jpg', image)
    base64_str = base64.b64encode(buffer).decode('utf-8')
    return base64_str

def perform_ocr(image_base64, ocr_confidence_threshold=0.7):
    """Perform OCR on the given Base64 image and return the extracted text with confidence."""
    reader = easyocr.Reader(['en'], download_enabled=True)
    
    # Decode Base64 string to image
    image_data = base64.b64decode(image_base64)
    image_np = np.frombuffer(image_data, np.uint8)
    image = cv2.imdecode(image_np, cv2.IMREAD_COLOR)
    
    results = reader.readtext(image)
    
    detected_texts = []
    
    for (bbox, text, prob) in results:
        if prob > ocr_confidence_threshold:
            detected_texts.append((text.strip(), prob))
    
    return detected_texts

def process_image(filepath, model, confidence_threshold, ocr_confidence_threshold, margin):
    """Process a single image: detect, zoom, and OCR."""
    frame = cv2.imread(filepath)
    if frame is None:
        print(f"Failed to read image {filepath}.")
        return

    results = model(frame, verbose=False)
    boxes = results[0].boxes.xyxy.tolist()
    confidences = results[0].boxes.conf.tolist()

    if not boxes:
        print("No boxes detected.")
        return

    for box, conf in zip(boxes, confidences):
        if conf > confidence_threshold:
            x1, y1, x2, y2 = map(int, box)
            
            # Zoom into the bounding box area
            zoomed_img = zoom_into_bbox(frame, (x1, y1, x2, y2), margin, zoom_level=3.0)
            
            # Convert zoomed image to Base64
            zoomed_image_base64 = convert_image_to_base64(zoomed_img)
            
            # Perform OCR on the zoomed image
            detected_texts = perform_ocr(zoomed_image_base64, ocr_confidence_threshold)
            
            for text, prob in detected_texts:
                print(f"Detected Text: {text}, Confidence: {prob}")
            break

def main():
    model_path = "models/vin.onnx"
    image_path = "/Users/gelso/workspace/PoC/server/inferences/defects/scratches/mycar4.jpg"
    confidence_threshold = 0.7
    ocr_confidence_threshold = 0.1
    margin = 10

    model = YOLO(model_path, task="detect", verbose=False)
    process_image(image_path, model, confidence_threshold, ocr_confidence_threshold, margin)

if __name__ == "__main__":
    main()
