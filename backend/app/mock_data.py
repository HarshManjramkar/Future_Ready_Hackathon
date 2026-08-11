"""
EduFlow Seed Data for School Operations.
Includes teachers, rooms, subjects, cohorts, students with QR/ID codes, and initial attendance.
Updated to match Canva ID cards from Victory High School.
"""

TEACHERS = [
    {"id": "T101", "name": "Dr. Ramesh Verma", "email": "r.verma@victory.edu", "subjects": ["SUB-MATH", "SUB-PHYS"]},
    {"id": "T102", "name": "Ms. Ananya Gupta", "email": "a.gupta@victory.edu", "subjects": ["SUB-ENG", "SUB-HIST"]},
    {"id": "T103", "name": "Mr. Vikram Singh", "email": "v.singh@victory.edu", "subjects": ["SUB-CHEM", "SUB-BIO"]},
    {"id": "T104", "name": "Mrs. Sunita Rao", "email": "s.rao@victory.edu", "subjects": ["SUB-MATH", "SUB-CS"]},
    {"id": "T105", "name": "Mr. David Miller", "email": "d.miller@victory.edu", "subjects": ["SUB-ENG", "SUB-PHYS"]}
]

ROOMS = [
    {"id": "R101", "name": "Room 101 (General)", "capacity": 40, "type": "Theory"},
    {"id": "R102", "name": "Room 102 (General)", "capacity": 40, "type": "Theory"},
    {"id": "R201", "name": "Physics Lab", "capacity": 30, "type": "Lab"},
    {"id": "R202", "name": "Chemistry Lab", "capacity": 30, "type": "Lab"},
    {"id": "R301", "name": "Computer Science Lab", "capacity": 35, "type": "Lab"}
]

COHORTS = [
    {"id": "C10A", "name": "Grade 10-A", "student_count": 32},
    {"id": "C10B", "name": "Grade 10-B", "student_count": 30},
    {"id": "C11A", "name": "Grade 11-Science", "student_count": 28},
    {"id": "C12A", "name": "Grade 12-Science", "student_count": 35}
]

SUBJECTS = [
    {"id": "SUB-MATH", "name": "Mathematics"},
    {"id": "SUB-PHYS", "name": "Physics"},
    {"id": "SUB-CHEM", "name": "Chemistry"},
    {"id": "SUB-BIO", "name": "Biology"},
    {"id": "SUB-ENG", "name": "English Literature"},
    {"id": "SUB-CS", "name": "Computer Science"}
]

STUDENTS = [
    {
        "id": "9901",
        "name": "Arjun",
        "grade": "Grade 10-A",
        "roll_no": "9901",
        "qr_code": "9901",
        "guardian_phone": "+91 76207 99602",
        "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        "attendance_status": "ABSENT",
        "check_in_time": "--"
    },
    {
        "id": "9902",
        "name": "Tanvi",
        "grade": "Grade 10-B",
        "roll_no": "9902",
        "qr_code": "9902",
        "guardian_phone": "+91 76207 79722",
        "avatar": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
        "attendance_status": "ABSENT",
        "check_in_time": "--"
    },
    {
        "id": "9903",
        "name": "Tanvay",
        "grade": "Grade 10-A",
        "roll_no": "9903",
        "qr_code": "9903",
        "guardian_phone": "+91 76207 76602",
        "avatar": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
        "attendance_status": "ABSENT",
        "check_in_time": "--"
    },
    {
        "id": "9904",
        "name": "Shruti",
        "grade": "Grade 10-B",
        "roll_no": "9904",
        "qr_code": "9904",
        "guardian_phone": "+91 76207 55602",
        "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
        "attendance_status": "ABSENT",
        "check_in_time": "--"
    },
    {
        "id": "9905",
        "name": "Sarthak",
        "grade": "Grade 10-A",
        "roll_no": "9905",
        "qr_code": "9905",
        "guardian_phone": "+91 73607 55602",
        "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
        "attendance_status": "ABSENT",
        "check_in_time": "--"
    }
]
