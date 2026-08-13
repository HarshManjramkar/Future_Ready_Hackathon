import os
import cv2

id_dir = '/Users/harshm/Downloads/Future_Ready_Hackathon/ID Cards'
detector = cv2.QRCodeDetector()

files = sorted([f for f in os.listdir(id_dir) if f.endswith('.png')])

print("="*60)
print("DECODING ALL PHYSICAL CANVA ID CARDS IN /ID Cards DIRECTORY")
print("="*60)

for fname in files:
    fpath = os.path.join(id_dir, fname)
    img = cv2.imread(fpath)
    if img is None:
        print(f"FAILED TO READ: {fname}")
        continue
    val, pts, _ = detector.detectAndDecode(img)
    print(f"File: {fname}\n -> Extracted QR Content: '{val}'\n")

print("="*60)
