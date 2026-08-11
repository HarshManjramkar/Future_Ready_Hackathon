import os
import glob
from PIL import Image
from google import genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY", "")
if not api_key:
    print("Error: GEMINI_API_KEY not found in .env")
    exit(1)

client = genai.Client(api_key=api_key)

cards_dir = "/Users/harshm/Downloads/Future_Ready_Hackathon/ID Cards"
files = sorted(glob.glob(os.path.join(cards_dir, "*.png")))

print(f"Found {len(files)} ID cards. Querying Gemini to extract student names and details...\n")

prompt = """
Extract the following details from this student ID card:
- Student Name
- Student ID / Registration No
- Class / Grade
- Date of Birth (if any)
- Guardian Phone / Emergency Contact (if any)

Output in a short JSON format.
"""

for f in files:
    try:
        img = Image.open(f)
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[img, prompt]
        )
        print(f"=== {os.path.basename(f)} ===")
        print(response.text.strip())
        print()
    except Exception as e:
        print(f"Error parsing {os.path.basename(f)}: {e}")
