import os
import subprocess
import time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import threading

# Configurazioni hard-coded
FOLDER_TO_WATCH = '/Users/gelso/workspace/PoC/server/inferences/defects/scratches'
SCRIPT1 = '/Users/gelso/workspace/PoC/server/inferences/detect-vin.py'
SCRIPT2 = '/Users/gelso/workspace/PoC/server/inferences/detect-defects.py'

class MyHandler(FileSystemEventHandler):
    def __init__(self, script1, script2):
        self.script1 = script1
        self.script2 = script2

    def on_created(self, event):
        # Esegui solo se l'evento non riguarda una directory
        if not event.is_directory:
            print(f"File '{event.src_path}' has been created.")
            
            # Esegui i due script in parallelo utilizzando threading
            threading.Thread(target=self.run_script, args=(self.script1,)).start()
            threading.Thread(target=self.run_script, args=(self.script2,)).start()

    def run_script(self, script):
        print(f"Running script: {script}")
        subprocess.run(['python3', script], check=True)

def start_monitoring(folder, script1, script2):
    # Verifica se la cartella esiste
    if not os.path.isdir(folder):
        print(f"Error: The folder '{folder}' does not exist.")
        return
    
    event_handler = MyHandler(script1, script2)
    observer = Observer()
    observer.schedule(event_handler, folder, recursive=False)
    observer.start()
    print(f"Monitoring folder '{folder}' for new files...")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("Stopping the observer...")
        observer.stop()
    observer.join()
    print("Observer stopped.")

if __name__ == "__main__":
    start_monitoring(FOLDER_TO_WATCH, SCRIPT1, SCRIPT2)
