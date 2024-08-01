import os
import cv2
from ultralytics import YOLO
import easyocr
import shutil

def resize_image(image, target_size=(640, 640)):
    """Resize the input image to the target size."""
    return cv2.resize(image, target_size)

def draw_bounding_box(image, bbox, margin=10, color=(255, 0, 255), thickness=2):
    """Draw a bounding box on the image."""
    x1, y1, x2, y2 = bbox
    x1 = max(0, x1 - margin)
    y1 = max(0, y1 - margin)
    x2 = min(image.shape[1], x2 + margin)
    y2 = min(image.shape[0], y2 + margin)
    cv2.rectangle(image, (x1, y1), (x2, y2), color, thickness)
    return image

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

def perform_ocr(image_path, ocr_confidence_threshold=0.7):
    """Perform OCR on the given image and return the extracted text."""
    model_storage_directory = 'easyocr/models'
    reader = easyocr.Reader(['en'], download_enabled=False, model_storage_directory=model_storage_directory)
    results = reader.readtext(image_path)
    
    vin_number = None
    detected_texts = []
    
    for (bbox, text, prob) in results:
        if prob > ocr_confidence_threshold:
            detected_texts.append(text.strip())
    
    vin_number = ''.join(detected_texts)
    
    return vin_number

def run_yolo_detection(model_path, input_dir, output_dir, tmpDir, confidence_threshold=0.7, ocr_confidence_threshold=0.7, margin=10, target_size=(640, 640), delete_zoom=True, delete_original=False):
    """Run YOLO detection, zoom, and OCR on images in the input directory."""
    os.makedirs(output_dir, exist_ok=True)
    os.makedirs(tmpDir, exist_ok=True)
    model = YOLO(model_path, task="detect", verbose=False)

    for filename in os.listdir(input_dir):
        # Process only files containing the word "vin" in the filename
        if 'vin' in filename.lower() and filename.endswith((".jpg", ".jpeg", ".png")):
            filepath = os.path.join(input_dir, filename)
            frame = cv2.imread(filepath)
            
            if frame is None:
                continue
            
            resized_frame = resize_image(frame, target_size)
            results = model(resized_frame, verbose=False)
            boxes = results[0].boxes.xyxy.tolist()
            confidences = results[0].boxes.conf.tolist()

            if not boxes:
                continue

            for box, conf in zip(boxes, confidences):
                if conf > confidence_threshold:
                    x1, y1, x2, y2 = map(int, box)
                    resized_frame_with_bbox = draw_bounding_box(resized_frame.copy(), (x1, y1, x2, y2), margin)
                    
                    # Save the resized frame with bounding box in tmpDir
                    tmp_filepath = os.path.join(tmpDir, filename)
                    cv2.imwrite(tmp_filepath, resized_frame_with_bbox)
                    
                    # Zoom into the bounding box area
                    zoomed_img = zoom_into_bbox(resized_frame, (x1, y1, x2, y2), margin, zoom_level=3.0)
                    zoomed_filepath = os.path.join(tmpDir, f"ZOOM_{filename}")
                    cv2.imwrite(zoomed_filepath, zoomed_img)
                    
                    # Perform OCR on the zoomed image
                    vin_number = perform_ocr(zoomed_filepath, ocr_confidence_threshold)
                    
                    if vin_number:
                        new_filename = f"VIN_{vin_number}{os.path.splitext(filename)[1]}"
                        new_filepath = os.path.join(output_dir, new_filename)
                        
                        # Copy the original image with bounding box to the output directory
                        shutil.copy(tmp_filepath, new_filepath)
                        
                    # Optionally delete the zoomed image
                    if delete_zoom:
                        os.remove(zoomed_filepath)
                    
                    # Optionally delete the original image
                    if delete_original:
                        os.remove(filepath)
                    
                    # Always delete the temporary file
                    os.remove(tmp_filepath)

                    break

    # Final message (optional)
    # print("Detection, zooming, and OCR completed for all images.")

 
model_path = "models/vin.onnx"
input_dir = "defects/scratches"
output_dir = "output"
tmpDir = "tmp"
confidence_threshold = 0.7
ocr_confidence_threshold = 0.1
margin = 10
delete_zoom = True
delete_original = True

run_yolo_detection(model_path, input_dir, output_dir, tmpDir, confidence_threshold, ocr_confidence_threshold, margin, delete_zoom=delete_zoom, delete_original=delete_original)

