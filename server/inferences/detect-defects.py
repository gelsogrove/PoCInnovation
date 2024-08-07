import os
import onnxruntime
import cv2
import numpy as np
import subprocess

def load_model(model_path):
    """
    Load the ONNX model.
    """
    if not os.path.isfile(model_path):
        raise ValueError(f"Model file does not exist: {model_path}")
    return onnxruntime.InferenceSession(model_path)

def preprocess_image(image, input_shape):
    """
    Preprocess the image for inference.
    """
    if len(input_shape) != 4 or input_shape[1] != 3:
        raise ValueError("input_shape is not valid.")
    
    _, _, new_height, new_width = input_shape
    resized_image = cv2.resize(image, (new_width, new_height))
    normalized_image = resized_image.astype(np.float32) / 255.0
    chw_image = np.transpose(normalized_image, (2, 0, 1))
    batched_image = np.expand_dims(chw_image, axis=0)
    return batched_image, resized_image

def infer(session, input_data):
    """
    Perform inference on the input data.
    """
    input_name = session.get_inputs()[0].name
    outputs = session.run(None, {input_name: input_data})
    return outputs


def clear_output_folder(folder_path):
    """
    Clear the contents of the output folder.
    """
    for filename in os.listdir(folder_path):
        file_path = os.path.join(folder_path, filename)
        if os.path.isfile(file_path):
            os.remove(file_path)


def postprocess(outputs, original_image, confidence_threshold):
    """
    Postprocess the inference results to determine if there are defects
    and draw bounding boxes.
    """
    dets, labels, masks = outputs
    num_dets = dets.shape[1]
    has_defect = False
    highest_confidence = 0

    # Create a copy of the original image to draw bounding boxes
    image_with_boxes = original_image.copy()

    for i in range(num_dets):
        det = dets[0, i]  # Assuming dets[0, i] contains detection information
        confidence = det[4]  # Assuming confidence level is at the fifth place (index 4)

        if confidence > confidence_threshold:
            has_defect = True
            highest_confidence = max(highest_confidence, confidence)

            x1, y1, x2, y2 = int(det[0]), int(det[1]), int(det[2]), int(det[3])
            width = x2 - x1 

            # Draw the bounding box
            cv2.rectangle(image_with_boxes, (x1, y1), (x2, y2), (0, 255, 0), 2)
            
            # Add the text below the bounding box
            text = f"Conf: {confidence:.2f} Width:{width}px"
            text_size, _ = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 2)
            text_w, text_h = text_size
            cv2.putText(image_with_boxes, text, (x1, y2 + text_h + 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

    return has_defect, highest_confidence, image_with_boxes

def clear_input_folder(folder_path):
    """
    Clear the contents of the input folder.
    """
    for filename in os.listdir(folder_path):
        file_path = os.path.join(folder_path, filename)
        if os.path.isfile(file_path):
            os.remove(file_path)

def analyze_images_in_folder(folder_path, model_path, input_shape, output_folder, confidence_threshold):
    """
    Analyze all images in a folder and save images with bounding boxes in a new folder.
    """
    session = load_model(model_path)
    defects_found = False  # Flag to track if any defects were found

    for filename in os.listdir(folder_path):
        if 'vin' not in filename.lower() and filename.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.tiff')):
            image_path = os.path.join(folder_path, filename)
            image = cv2.imread(image_path)
            if image is None:
                print(f"Skipping file {filename} as it could not be read.")
                continue

            preprocessed_image, original_image = preprocess_image(image, input_shape)
            outputs = infer(session, preprocessed_image)
            has_defect, highest_confidence, image_with_boxes = postprocess(outputs, original_image, confidence_threshold)

            if has_defect:
                defects_found = True  # Set flag to True if a defect is found
                base, ext = os.path.splitext(filename)
                confidence_str = f"{highest_confidence:.2f}"
                output_filename = f"{base}{ext}"
                output_path = os.path.join(output_folder, output_filename)
                cv2.imwrite(output_path, image_with_boxes)
                print(f"Saved {output_filename} to {output_folder}")

            os.remove(image_path)
            print(f"Deleted {filename} from {folder_path}")

    return defects_found  # Return the flag indicating whether defects were found

def main():
    input_dir = "defects/scratches"
    model_path = 'models/scratches.onnx'   
    input_shape = [1, 3, 640, 640] 
    output_folder = './output' 
    confidence_threshold = 0.85

    # Clear the output folder before starting the analysis
    clear_output_folder(output_folder)

    defects_found = analyze_images_in_folder(input_dir, model_path, input_shape, output_folder, confidence_threshold)

    if defects_found:
        # Execute the shell command if defects were found
        command = "cd /Users/gelso/workspace/PoC/server/inferences && python3 detect-vin.py"
        subprocess.run(command, shell=True)
    else:
        # Clear the input directory if no defects were found
        clear_input_folder(input_dir)
        print(f"No defects found. Cleared input directory: {input_dir}")

if __name__ == "__main__":
    main()
