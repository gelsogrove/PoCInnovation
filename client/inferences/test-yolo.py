import os
import cv2
from ultralytics import YOLO
from PIL import Image
import pytesseract

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

def zoom_into_bbox(image, bbox, margin=10, zoom_level=1.0):
    """Zoom into the bounding box area with an optional margin and zoom level."""
    x1, y1, x2, y2 = bbox
    # Add margin to the bounding box coordinates
    x1 = max(0, x1 - margin)
    y1 = max(0, y1 - margin)
    x2 = min(image.shape[1], x2 + margin)
    y2 = min(image.shape[0], y2 + margin)
    
    # Crop the bounding box area
    cropped_img = image[y1:y2, x1:x2]
    
    # Calculate new size for zoom
    zoom_width = int(cropped_img.shape[1] * zoom_level)
    zoom_height = int(cropped_img.shape[0] * zoom_level)
    
    # Resize cropped image to zoom level
    zoomed_img = cv2.resize(cropped_img, (zoom_width, zoom_height))
    
    # Draw bounding box on the zoomed image
    # Note: The coordinates of the bounding box in the zoomed image are scaled
    scale_x = zoomed_img.shape[1] / (x2 - x1)
    scale_y = zoomed_img.shape[0] / (y2 - y1)
    bbox_zoomed = [
        int((x1 - x1) * scale_x), int((y1 - y1) * scale_y),
        int((x2 - x1) * scale_x), int((y2 - y1) * scale_y)
    ]
    zoomed_img = draw_bounding_box(zoomed_img, bbox_zoomed, margin=0)
    
    return zoomed_img

def perform_ocr(image):
    """Perform OCR on the given image and return the extracted text."""
    if image.size == 0:
        return "No content detected"
    pil_image = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
    text = pytesseract.image_to_string(pil_image)
    print(f"OCR text detected: {text}")  # Debug print
    return text

def save_ocr_text(text, output_path):
    """Save the OCR extracted text to a file."""
    with open(output_path, 'w') as f:
        f.write(text)

def run_yolo_detection(model_path, input_dir, output_dir, confidence_threshold=0.7, margin=10, target_size=(640, 640), zoom_level=1.0):
    """Run YOLO detection, zoom, and OCR on images in the input directory."""
    os.makedirs(output_dir, exist_ok=True)
    model = YOLO(model_path, task="detect", verbose=True)

    for filename in os.listdir(input_dir):
        if filename.endswith((".jpg", ".jpeg", ".png")):
            filepath = os.path.join(input_dir, filename)
            frame = cv2.imread(filepath)
            
            if frame is None:
                print(f"Errore: Impossibile leggere il file {filepath}.")
                continue
            
            # Resize the frame to the target size
            resized_frame = resize_image(frame, target_size)
            
            # Perform detection on the resized frame
            results = model(resized_frame, verbose=False)
            boxes = results[0].boxes.xyxy.tolist()
            classes = results[0].boxes.cls.tolist()
            names = results[0].names
            confidences = results[0].boxes.conf.tolist()

            for box, cls, conf in zip(boxes, classes, confidences):
                if conf > confidence_threshold:
                    x1, y1, x2, y2 = map(int, box)
                    
                    # Add margin to the bounding box coordinates
                    x1 = max(0, x1 - margin)
                    y1 = max(0, y1 - margin)
                    x2 = min(resized_frame.shape[1], x2 + margin)
                    y2 = min(resized_frame.shape[0], y2 + margin)
                    
                    confidence = conf
                    detected_class = cls
                    name = names[int(cls)]
                    print(f"Object Detected in {filename}: {name}")
                    
                    # Draw bounding box on the resized frame
                    resized_frame_with_bbox = draw_bounding_box(resized_frame.copy(), (x1, y1, x2, y2), margin)
                    
                    # Save the resized frame with bounding boxes
                    output_filepath = os.path.join(output_dir, filename)
                    cv2.imwrite(output_filepath, resized_frame_with_bbox)
                    
                    # Zoom into the bounding box area with zoom level
                    zoomed_img = zoom_into_bbox(resized_frame, (x1, y1, x2, y2), margin, zoom_level)
                    
                    # Save the zoomed image with bounding box using the original filename
                    zoomed_filename = filename  # Use the original filename for the zoomed image
                    zoomed_filepath = os.path.join(output_dir, zoomed_filename)
                    cv2.imwrite(zoomed_filepath, zoomed_img)
                    
                    # Perform OCR on the zoomed image
                    ocr_text = perform_ocr(zoomed_img)
                    
                    # Print OCR text for debugging
                    print(f"OCR Text for {filename}: {ocr_text}")
                    
                    # Save the OCR extracted text with the original filename
                    text_filename = f"{os.path.splitext(filename)[0]}_text.txt"
                    text_filepath = os.path.join(output_dir, text_filename)
                    save_ocr_text(ocr_text, text_filepath)
                    
                    print(f"OCR text saved: {text_filepath}")

    print("Detection, zooming, and OCR completed for all images.")

# Example usage
model_path = "models/vin.onnx"
input_dir = "vin"
output_dir = "output"
confidence_threshold = 0.8
margin = 5
zoom_level = 1  # Zoom level (1 means no zoom, 0.1 means zoom out to 10% of the original crop)

run_yolo_detection(model_path, input_dir, output_dir, confidence_threshold, margin, target_size=(640, 640), zoom_level=zoom_level)
