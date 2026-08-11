"""
Generates high-resolution sample paper form images for EduFlow Magic Dropzone testing
and PPT Presentation slides.
"""

import os
from PIL import Image, ImageDraw, ImageFont

output_dir = "/Users/harshm/Downloads/Future_Ready_Hackathon/sample_forms"
os.makedirs(output_dir, exist_ok=True)

def create_admission_form(filename, is_messy=False):
    # Standard A4 size image (800 x 1130)
    width, height = 800, 1130
    img = Image.new("RGB", (width, height), color=(250, 250, 252))
    draw = ImageDraw.Draw(img)

    # Header Banner
    draw.rectangle([(0, 0), (width, 100)], fill=(15, 30, 60))
    draw.text((30, 25), "GREENWOOD PUBLIC SCHOOL", fill=(255, 255, 255))
    draw.text((30, 55), "STUDENT ADMISSION FORM (2026-2027)", fill=(200, 220, 255))

    # Section 1: Student Information
    draw.rectangle([(30, 120), (770, 150)], fill=(40, 70, 120))
    draw.text((40, 125), "1. STUDENT INFORMATION", fill=(255, 255, 255))

    fields_s1 = [
        ("Student Full Name:", "Aarav Sharma" if not is_messy else "Aarav Sh...ma"),
        ("Date of Birth:", "14 / 05 / 2012"),
        ("Gender:", "[X] Male   [ ] Female   [ ] Other"),
        ("Blood Group:", "O+"),
        ("Class Applying For:", "Grade 10-A"),
        ("Aadhaar Number:", "4829-1029-1092" if not is_messy else "4829-????-1092 (Smudged)")
    ]

    y = 165
    for label, val in fields_s1:
        draw.rectangle([(40, y), (760, y + 35)], outline=(180, 190, 210), fill=(255, 255, 255))
        draw.text((50, y + 8), label, fill=(80, 90, 110))
        # Draw filled text in blue pen color
        pen_color = (20, 40, 180) if not ("Smudged" in val or "..." in val) else (100, 100, 100)
        draw.text((250, y + 8), val, fill=pen_color)
        y += 42

    # Section 2: Parent Information
    y += 10
    draw.rectangle([(30, y), (770, y + 30)], fill=(40, 70, 120))
    draw.text((40, y + 5), "2. PARENT INFORMATION", fill=(255, 255, 255))
    y += 40

    fields_s2 = [
        ("Father's Name:", "Rajesh Sharma"),
        ("Father's Occupation:", "Software Engineer"),
        ("Father's Mobile:", "9876543210" if not is_messy else "98765????? (Messy Ink)"),
        ("Mother's Name:", "Priya Sharma"),
        ("Email Address:", "rajesh.sharma@example.com")
    ]

    for label, val in fields_s2:
        draw.rectangle([(40, y), (760, y + 35)], outline=(180, 190, 210), fill=(255, 255, 255))
        draw.text((50, y + 8), label, fill=(80, 90, 110))
        pen_color = (20, 40, 180) if not "Messy" in val else (120, 120, 120)
        draw.text((250, y + 8), val, fill=pen_color)
        y += 42

    # Documents Submitted Checkboxes
    y += 10
    draw.rectangle([(30, y), (770, y + 30)], fill=(40, 70, 120))
    draw.text((40, y + 5), "3. DOCUMENTS SUBMITTED", fill=(255, 255, 255))
    y += 40

    draw.text((50, y), "[X] Birth Certificate    [X] Aadhaar Card    [X] Transfer Certificate", fill=(20, 40, 180))

    # Watermark Badge
    badge_text = "VERIFIED CLEAN FORM" if not is_messy else "EDGE CASE: SMUDGED INK"
    badge_color = (30, 150, 80) if not is_messy else (200, 100, 20)
    draw.rectangle([(500, 1020), (760, 1070)], fill=badge_color)
    draw.text((520, 1040), badge_text, fill=(255, 255, 255))

    img.save(os.path.join(output_dir, filename))
    print(f"Generated sample form: {filename}")

def create_teacher_leave_form(filename):
    width, height = 800, 1000
    img = Image.new("RGB", (width, height), color=(250, 250, 252))
    draw = ImageDraw.Draw(img)

    # Header Banner
    draw.rectangle([(0, 0), (width, 100)], fill=(70, 30, 90))
    draw.text((30, 25), "VICTORY HIGH SCHOOL", fill=(255, 255, 255))
    draw.text((30, 55), "STAFF LEAVE REQUEST & DISRUPTION FORM", fill=(230, 200, 255))

    fields = [
        ("Teacher Name:", "Dr. Ramesh Verma"),
        ("Employee ID:", "T101"),
        ("Department:", "Mathematics & Physics"),
        ("Leave Type:", "[X] Sick Leave   [ ] Casual   [ ] Emergency"),
        ("Date of Absence:", "Monday, 10th August 2026"),
        ("Affected Classes:", "Grade 10-A (Period 1), Grade 11-Sci (Period 3)"),
        ("Reason for Absence:", "Severe Viral Fever - Medical Certificate Attached"),
        ("Substitute Request:", "Reallocate to free Math/Phys faculty via CP-SAT Engine")
    ]

    y = 130
    for label, val in fields:
        draw.rectangle([(40, y), (760, y + 40)], outline=(190, 180, 210), fill=(255, 255, 255))
        draw.text((50, y + 12), label, fill=(80, 70, 90))
        draw.text((250, y + 12), val, fill=(100, 20, 140))
        y += 50

    draw.rectangle([(500, 900), (760, 950)], fill=(120, 40, 160))
    draw.text((520, 920), "OFFICIAL LEAVE FORM", fill=(255, 255, 255))

    img.save(os.path.join(output_dir, filename))
    print(f"Generated sample form: {filename}")

create_admission_form("1_Admission_Form_Clean.png", is_messy=False)
create_admission_form("2_Admission_Form_Smudged_EdgeCase.png", is_messy=True)
create_teacher_leave_form("3_Teacher_Sick_Leave_Form.png")
