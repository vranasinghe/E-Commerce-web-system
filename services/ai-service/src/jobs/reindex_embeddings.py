import os
import sys

# Ensure the root dir is in Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from src.services.vision import VisionService

def main():
    print("[INFO] Starting product embeddings reindexing pipeline...")
    VisionService.generate_product_embeddings()
    print("[SUCCESS] Finished reindexing pipeline.")

if __name__ == "__main__":
    main()
