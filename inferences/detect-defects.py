import os
import onnxruntime
import cv2
import numpy as np
import subprocess

def load_model(model_path):
    """Carica il modello ONNX."""
    if not os.path.isfile(model_path):
        raise ValueError(f"File del modello non trovato: {model_path}")
    return onnxruntime.InferenceSession(model_path)

def preprocess_image(image, input_shape):
    """Preprocessa l'immagine per il modello."""
    _, _, new_height, new_width = input_shape
    resized_image = cv2.resize(image, (new_width, new_height))
    normalized_image = resized_image.astype(np.float32) / 255.0
    chw_image = np.transpose(normalized_image, (2, 0, 1))
    batched_image = np.expand_dims(chw_image, axis=0)
    return batched_image, resized_image

def infer(session, input_data):
    """Esegue l'inferenza sul modello."""
    input_name = session.get_inputs()[0].name
    return session.run(None, {input_name: input_data})

def clear_output_folder(folder_path):
    """Pulisce la cartella di output, mantenendo solo i file contenenti 'vin' nel nome."""
    for filename in os.listdir(folder_path):
        file_path = os.path.join(folder_path, filename)
        if os.path.isfile(file_path) and 'vin' not in filename.lower():
            os.remove(file_path)
            # print(f"File eliminato: {filename}")

def clear_input_folder(folder_path):
    """Pulisce la cartella di input, mantenendo solo i file che contengono 'vin' nel nome."""
    for filename in os.listdir(folder_path):
        if 'vin' not in filename.lower():
            file_path = os.path.join(folder_path, filename)
            if os.path.isfile(file_path):
                #try:
                    os.remove(file_path)
                    # print(f"File eliminato: {filename}")
                # except Exception as e:
                    # print(f"Errore nell'eliminazione del file {filename}: {e}")


def postprocess(outputs, original_image, confidence_threshold):
    """Postprocessa le uscite del modello e annota le immagini."""
    dets, _, _ = outputs
    num_dets = dets.shape[1]
    has_defect = False
    highest_confidence = 0

    for i in range(num_dets):
        det = dets[0, i]
        confidence = det[4]

        if confidence > confidence_threshold:
            has_defect = True
            highest_confidence = max(highest_confidence, confidence)
       

            x1, y1, x2, y2 = int(det[0]), int(det[1]), int(det[2]), int(det[3])
            width = x2 - x1 
            cv2.rectangle(original_image, (x1, y1), (x2, y2), (0, 255, 0), 2)
            text = f"Conf: {confidence:.2f} Width:{width}px"
            cv2.putText(original_image, text, (x1, y2 + 20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)

    return has_defect, highest_confidence, original_image

def analyze_images_in_folder(folder_path, model_path, input_shape, output_folder, confidence_threshold):
    """Analizza le immagini nella cartella e salva le immagini con difetti."""
    session = load_model(model_path)
    defects_found = False

    for filename in os.listdir(folder_path):
        if 'vin' not in filename.lower() and filename.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.tiff')):
            image_path = os.path.join(folder_path, filename)
            image = cv2.imread(image_path)
            if image is None:
                print(f"Impossibile leggere il file: {filename}")
                continue

            preprocessed_image, original_image = preprocess_image(image, input_shape)
            outputs = infer(session, preprocessed_image)
            has_defect, highest_confidence, image_with_boxes = postprocess(outputs, original_image, confidence_threshold)

            if has_defect:
                defects_found = True
                base, ext = os.path.splitext(filename)
                output_filename = f"{base}{ext}"
                output_path = os.path.join(output_folder, output_filename)
                cv2.imwrite(output_path, image_with_boxes)
                # print(f"File con difetto salvato: {output_filename}")

            try:
                os.remove(image_path)
            except FileNotFoundError:
                print(f"File non trovato per eliminazione: {image_path}")

    return defects_found

def main():
    input_dir = "defects/scratches"
    model_path = 'models/scratches.onnx'
    input_shape = [1, 3, 640, 640]
    output_folder = './output'
    confidence_threshold = 0.85

    clear_output_folder(output_folder)

    defects_found = analyze_images_in_folder(input_dir, model_path, input_shape, output_folder, confidence_threshold)

    if defects_found:
        command = "cd /Users/gelso/workspace/PoC/inferences && python3 detect-vin.py"
        subprocess.run(command, shell=True)
    else:
        clear_input_folder(input_dir)
        #print(f"Nessun difetto trovato. Cartella di input svuotata: {input_dir}")

if __name__ == "__main__":
    main()
