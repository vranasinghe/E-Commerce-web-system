import os
import sys

# Ensure the root dir is in Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

def main():
    print("Image search now uses Gemini and the live catalog; no embedding index is required.")

if __name__ == "__main__":
    main()
