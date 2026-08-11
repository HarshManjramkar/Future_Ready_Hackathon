import os
import glob
from PIL import Image

cards_dir = "/Users/harshm/Downloads/Future_Ready_Hackathon/ID Cards"
files = sorted(glob.glob(os.path.join(cards_dir, "*.png")))

print(f"Found {len(files)} ID cards:")
for f in files:
    img = Image.open(f)
    print(f"- {os.path.basename(f)}: size={img.size}, mode={img.mode}")
