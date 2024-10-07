import os
import subprocess
from concurrent.futures import ThreadPoolExecutor
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# Configurazioni
FOLDER_TO_WATCH = '/Users/gelso/workspace/PoC/inferences/defects/scratches'
SCRIPT1 = '/Users/gelso/workspace/PoC/inferences/detect-vin.py'
SCRIPT2 = '/Users/gelso/workspace/PoC/inferences/detect-defects.py'
IMAGE_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.bmp', '.tiff'}

class MyHandler(FileSystemEventHandler):
    def __init__(self, script1, script2):
        self.script1 = script1
        self.script2 = script2
        self.executor = ThreadPoolExecutor(max_workers=2)  # Utilizza fino a 2 thread in parallelo

    def on_created(self, event):
        if not event.is_directory:
            file_path = event.src_path
            _, ext = os.path.splitext(file_path)
            if ext.lower() in IMAGE_EXTENSIONS:
                file_name = os.path.basename(file_path).lower()
                if 'vin' in file_name:
                    # Esegui SCRIPT1 in parallelo
                    self.executor.submit(self.run_script, self.script1)
                else:
                    # Esegui SCRIPT2 in parallelo
                    self.executor.submit(self.run_script, self.script2)

    def run_script(self, script):
        try:
            print(f"Eseguendo lo script: {script}")
            subprocess.run(['python3', script], check=True)
        except subprocess.CalledProcessError as e:
            print(f"Errore durante l'esecuzione dello script {script}: {e}")

def start_monitoring(folder, script1, script2):
    if not os.path.isdir(folder):
        print(f"Errore: folder '{folder}' not exist.")
        return

    event_handler = MyHandler(script1, script2)
    observer = Observer()
    observer.schedule(event_handler, folder, recursive=False)
    observer.start()
    print(f"watch folder '{folder}' for new file")

    try:
        while True:
            pass  # keep in execution until KeyboardInterrupt
    except KeyboardInterrupt:
        observer.stop()
    observer.join()

if __name__ == "__main__":
    start_monitoring(FOLDER_TO_WATCH, SCRIPT1, SCRIPT2)
