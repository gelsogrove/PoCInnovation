import easyocr
import os

def perform_ocr(image_path):
    # Verifica se il file esiste
    if not os.path.exists(image_path):
        print(f"Il percorso dell'immagine non esiste: {image_path}")
        return

    try:
        # Percorso ai modelli locali
        model_storage_directory = 'easyocr/models'  # Modifica il percorso se necessario
        
        # Inizializza il lettore EasyOCR
        reader = easyocr.Reader(['en'], download_enabled=False, model_storage_directory=model_storage_directory)
        
        # Leggi il testo dall'immagine
        results = reader.readtext(image_path)

        # Stampa i risultati
        for (bbox, text, prob) in results:
            print(f"Testo rilevato: {text} con probabilità: {prob}")

    except Exception as e:
        print(f"Si è verificato un errore: {e}")

# Percorso dell'immagine
image_path = '/Users/gelso/workspace/PoC/client/inferences/output/zoomed_VIN_number_location.jpg'
perform_ocr(image_path)
