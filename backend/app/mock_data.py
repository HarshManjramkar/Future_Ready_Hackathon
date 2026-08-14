"""
EduFlow Seed Data for School Operations (Standard CBSE / State Board Class 10 Curriculum).
Includes faculty capability matrix, subjects, rooms, cohorts, expanded student roster, and daily timetable grids.
"""

SUBJECTS = [
    {"id": "SUB_101", "name": "English Language & Literature", "code": "ENG-10", "weekly_periods": 6, "lab_required": False},
    {"id": "SUB_102", "name": "Mathematics (Algebra & Geometry)", "code": "MATH-10", "weekly_periods": 7, "lab_required": False},
    {"id": "SUB_103", "name": "Science (Physics, Chemistry, Biology)", "code": "SCI-10", "weekly_periods": 7, "lab_required": True},
    {"id": "SUB_104", "name": "Social Science (History, Geo, Civics, Eco)", "code": "SST-10", "weekly_periods": 6, "lab_required": False},
    {"id": "SUB_105", "name": "Second Language (Hindi / Marathi)", "code": "LANG-10", "weekly_periods": 5, "lab_required": False},
    {"id": "SUB_106", "name": "Information Technology (IT 402)", "code": "IT-10", "weekly_periods": 4, "lab_required": True},
    {"id": "SUB_107", "name": "Physical Education & Health", "code": "PE-10", "weekly_periods": 3, "lab_required": True}
]

TEACHERS = [
    {
        "id": "TCH_101",
        "name": "Mrs. Deepti Bisen",
        "primary_subject_id": "SUB_102",
        "primary_subject_name": "Mathematics",
        "subjects": ["SUB_102", "SUB_106"],
        "substitute_capable_subjects": ["SUB_102", "SUB_106"],
        "max_daily_periods": 5,
        "contact": "+91 98765 11001",
        "email": "d.bisen@victory.edu"
    },
    {
        "id": "TCH_102",
        "name": "Mr. Rajesh Deshmukh",
        "primary_subject_id": "SUB_103",
        "primary_subject_name": "Science",
        "subjects": ["SUB_103", "SUB_102"],
        "substitute_capable_subjects": ["SUB_103", "SUB_102"],
        "max_daily_periods": 5,
        "contact": "+91 98765 11002",
        "email": "r.deshmukh@victory.edu"
    },
    {
        "id": "TCH_103",
        "name": "Mrs. Sunita Kulkarni",
        "primary_subject_id": "SUB_101",
        "primary_subject_name": "English",
        "subjects": ["SUB_101", "SUB_104"],
        "substitute_capable_subjects": ["SUB_101", "SUB_104"],
        "max_daily_periods": 5,
        "contact": "+91 98765 11003",
        "email": "s.kulkarni@victory.edu"
    },
    {
        "id": "TCH_104",
        "name": "Mr. Amit Joshi",
        "primary_subject_id": "SUB_104",
        "primary_subject_name": "Social Science",
        "subjects": ["SUB_104", "SUB_105"],
        "substitute_capable_subjects": ["SUB_104", "SUB_105"],
        "max_daily_periods": 5,
        "contact": "+91 98765 11004",
        "email": "a.joshi@victory.edu"
    },
    {
        "id": "TCH_105",
        "name": "Mrs. Rohini Patil",
        "primary_subject_id": "SUB_105",
        "primary_subject_name": "Second Language (Hindi/Marathi)",
        "subjects": ["SUB_105", "SUB_101"],
        "substitute_capable_subjects": ["SUB_105", "SUB_101"],
        "max_daily_periods": 4,
        "contact": "+91 98765 11005",
        "email": "r.patil@victory.edu"
    },
    {
        "id": "TCH_106",
        "name": "Mr. Vikram Shinde",
        "primary_subject_id": "SUB_106",
        "primary_subject_name": "Information Technology",
        "subjects": ["SUB_106", "SUB_103"],
        "substitute_capable_subjects": ["SUB_106", "SUB_103"],
        "max_daily_periods": 5,
        "contact": "+91 98765 11006",
        "email": "v.shinde@victory.edu"
    },
    {
        "id": "TCH_107",
        "name": "Coach Ramesh Pawar",
        "primary_subject_id": "SUB_107",
        "primary_subject_name": "Physical Education",
        "subjects": ["SUB_107", "SUB_101", "SUB_104"],
        "substitute_capable_subjects": ["SUB_107", "SUB_101", "SUB_104"],
        "max_daily_periods": 6,
        "contact": "+91 98765 11007",
        "email": "r.pawar@victory.edu"
    }
]

ROOMS = [
    {"id": "R301", "name": "Room 301 (General)", "capacity": 40, "type": "Theory"},
    {"id": "R201", "name": "Science Lab", "capacity": 30, "type": "Lab"},
    {"id": "R303", "name": "Computer Science Lab", "capacity": 35, "type": "Lab"},
    {"id": "R001", "name": "Playground / Sports Ground", "capacity": 100, "type": "Sports"}
]

CLASSES_DB = [
    {
        "class_id": "10-A",
        "grade": 10,
        "division": "A",
        "room_number": "Room 301",
        "class_teacher_id": "TCH_101",
        "total_students": 17
    }
]

COHORTS = [
    {"id": "10-A", "name": "Grade 10", "student_count": 17}
]

STUDENTS_DB = [
    # Live Demo Test Cards (Matching physical Canva ID designs)
    {
        "student_id": "9901",
        "id": "9901",
        "full_name": "Arjun",
        "name": "Arjun",
        "class_id": "10-A",
        "grade": "Grade 10",
        "roll_no": "9901",
        "phone": "+91 76207 99602",
        "guardian_phone": "+91 76207 99602",
        "qr_token": "EDU-9901-2026",
        "qr_code": "9901",
        "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        "status": "PRESENT",
        "attendance_status": "ABSENT",
        "check_in_time": "--",
        "academic_risk": "LOW"
    },
    {
        "student_id": "9902",
        "id": "9902",
        "full_name": "Tanvi",
        "name": "Tanvi",
        "class_id": "10-A",
        "grade": "Grade 10",
        "roll_no": "9902",
        "phone": "+91 76207 79722",
        "guardian_phone": "+91 76207 79722",
        "qr_token": "EDU-9902-2026",
        "qr_code": "9902",
        "avatar": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
        "status": "PRESENT",
        "attendance_status": "ABSENT",
        "check_in_time": "--",
        "academic_risk": "LOW"
    },
    {
        "student_id": "9903",
        "id": "9903",
        "full_name": "Tanvay",
        "name": "Tanvay",
        "class_id": "10-A",
        "grade": "Grade 10",
        "roll_no": "9903",
        "phone": "+91 76207 76602",
        "guardian_phone": "+91 76207 76602",
        "qr_token": "EDU-9903-2026",
        "qr_code": "9903",
        "avatar": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
        "status": "PRESENT",
        "attendance_status": "ABSENT",
        "check_in_time": "--",
        "academic_risk": "LOW"
    },
    {
        "student_id": "9904",
        "id": "9904",
        "full_name": "Shruti",
        "name": "Shruti",
        "class_id": "10-A",
        "grade": "Grade 10",
        "roll_no": "9904",
        "phone": "+91 76207 55602",
        "guardian_phone": "+91 76207 55602",
        "qr_token": "EDU-9904-2026",
        "qr_code": "9904",
        "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
        "status": "PRESENT",
        "attendance_status": "ABSENT",
        "check_in_time": "--",
        "academic_risk": "LOW"
    },
    {
        "student_id": "9905",
        "id": "9905",
        "full_name": "Sarthak",
        "name": "Sarthak",
        "class_id": "10-A",
        "grade": "Grade 10",
        "roll_no": "9905",
        "phone": "+91 73607 55602",
        "guardian_phone": "+91 73607 55602",
        "qr_token": "EDU-9905-2026",
        "qr_code": "9905",
        "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
        "status": "FLAGGED_PROXY",
        "attendance_status": "ABSENT",
        "check_in_time": "--",
        "academic_risk": "MEDIUM"
    },
    {
        "student_id": "12345",
        "id": "12345",
        "full_name": "Aarav Sharma",
        "name": "Aarav Sharma",
        "class_id": "10-A",
        "grade": "Grade 10",
        "roll_no": "12345",
        "phone": "+91 98765 43210",
        "guardian_phone": "+91 98765 43210",
        "qr_token": "EDU-12345-2026",
        "qr_code": "12345",
        "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        "status": "PRESENT",
        "attendance_status": "ABSENT",
        "check_in_time": "--",
        "academic_risk": "LOW",
        "form_vlm_parsed": True
    },
    # Batch Roster Students (Grade 10)
    {"student_id": "9906", "id": "9906", "full_name": "Aditya Kulkarni", "name": "Aditya Kulkarni", "class_id": "10-A", "grade": "Grade 10", "roll_no": "9906", "qr_code": "9906", "phone": "+91 98220 11001", "guardian_phone": "+91 98220 11001", "avatar": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150", "status": "PRESENT", "attendance_status": "ABSENT", "check_in_time": "--", "academic_risk": "LOW"},
    {"student_id": "9907", "id": "9907", "full_name": "Ananya Iyer", "name": "Ananya Iyer", "class_id": "10-A", "grade": "Grade 10", "roll_no": "9907", "qr_code": "9907", "phone": "+91 98220 11002", "guardian_phone": "+91 98220 11002", "avatar": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150", "status": "PRESENT", "attendance_status": "ABSENT", "check_in_time": "--", "academic_risk": "LOW"},
    {"student_id": "9908", "id": "9908", "full_name": "Rohan Mehta", "name": "Rohan Mehta", "class_id": "10-A", "grade": "Grade 10", "roll_no": "9908", "qr_code": "9908", "phone": "+91 98220 11003", "guardian_phone": "+91 98220 11003", "avatar": "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150", "status": "ABSENT", "attendance_status": "ABSENT", "check_in_time": "--", "academic_risk": "HIGH"},
    {"student_id": "9909", "id": "9909", "full_name": "Siddhi Patil", "name": "Siddhi Patil", "class_id": "10-A", "grade": "Grade 10", "roll_no": "9909", "qr_code": "9909", "phone": "+91 98220 11004", "guardian_phone": "+91 98220 11004", "avatar": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150", "status": "PRESENT", "attendance_status": "ABSENT", "check_in_time": "--", "academic_risk": "LOW"},
    {"student_id": "9910", "id": "9910", "full_name": "Varun Joshi", "name": "Varun Joshi", "class_id": "10-A", "grade": "Grade 10", "roll_no": "9910", "qr_code": "9910", "phone": "+91 98220 11005", "guardian_phone": "+91 98220 11005", "avatar": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150", "status": "PRESENT", "attendance_status": "ABSENT", "check_in_time": "--", "academic_risk": "LOW"},
    {"student_id": "9911", "id": "9911", "full_name": "Isha Nair", "name": "Isha Nair", "class_id": "10-A", "grade": "Grade 10", "roll_no": "9911", "qr_code": "9911", "phone": "+91 98220 11006", "guardian_phone": "+91 98220 11006", "avatar": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150", "status": "PRESENT", "attendance_status": "ABSENT", "check_in_time": "--", "academic_risk": "LOW"},
    {"student_id": "9912", "id": "9912", "full_name": "Kabir Verma", "name": "Kabir Verma", "class_id": "10-A", "grade": "Grade 10", "roll_no": "9912", "qr_code": "9912", "phone": "+91 98220 11007", "guardian_phone": "+91 98220 11007", "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", "status": "ABSENT", "attendance_status": "ABSENT", "check_in_time": "--", "academic_risk": "MEDIUM"},
    {"student_id": "9913", "id": "9913", "full_name": "Neha Deshmukh", "name": "Neha Deshmukh", "class_id": "10-A", "grade": "Grade 10", "roll_no": "9913", "qr_code": "9913", "phone": "+91 98220 11008", "guardian_phone": "+91 98220 11008", "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", "status": "PRESENT", "attendance_status": "ABSENT", "check_in_time": "--", "academic_risk": "LOW"},
    {"student_id": "9914", "id": "9914", "full_name": "Pranav Shinde", "name": "Pranav Shinde", "class_id": "10-A", "grade": "Grade 10", "roll_no": "9914", "qr_code": "9914", "phone": "+91 98220 11009", "guardian_phone": "+91 98220 11009", "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", "status": "PRESENT", "attendance_status": "ABSENT", "check_in_time": "--", "academic_risk": "LOW"},
    {"student_id": "9915", "id": "9915", "full_name": "Riya Bhosale", "name": "Riya Bhosale", "class_id": "10-A", "grade": "Grade 10", "roll_no": "9915", "qr_code": "9915", "phone": "+91 98220 11010", "guardian_phone": "+91 98220 11010", "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", "status": "PRESENT", "attendance_status": "ABSENT", "check_in_time": "--", "academic_risk": "LOW"},
    {"student_id": "9916", "id": "9916", "full_name": "Shreyas Deshmukh", "name": "Shreyas Deshmukh", "class_id": "10-A", "grade": "Grade 10", "roll_no": "9916", "qr_code": "9916", "phone": "+91 98220 11011", "guardian_phone": "+91 98220 11011", "avatar": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150", "status": "PRESENT", "attendance_status": "ABSENT", "check_in_time": "--", "academic_risk": "LOW"}
]

# Alias list for backwards compatibility
STUDENTS = STUDENTS_DB

# Daily Timetable Grid for Class 10 (8 Periods)
TIMETABLE_10A = [
    {"period": 1, "day": "Monday", "time": "08:00 - 08:45", "subject_id": "SUB_102", "subject": "Mathematics", "teacher_id": "TCH_101", "teacher_name": "Mrs. Deepti Bisen", "room": "Room 301"},
    {"period": 2, "day": "Monday", "time": "08:45 - 09:30", "subject_id": "SUB_103", "subject": "Science", "teacher_id": "TCH_102", "teacher_name": "Mr. Rajesh Deshmukh", "room": "Science Lab"},
    {"period": 3, "day": "Monday", "time": "09:30 - 10:15", "subject_id": "SUB_101", "subject": "English", "teacher_id": "TCH_103", "teacher_name": "Mrs. Sunita Kulkarni", "room": "Room 301"},
    {"period": 4, "day": "Monday", "time": "10:30 - 11:15", "subject_id": "SUB_104", "subject": "Social Science", "teacher_id": "TCH_104", "teacher_name": "Mr. Amit Joshi", "room": "Room 301"},
    {"period": 5, "day": "Monday", "time": "11:15 - 12:00", "subject_id": "SUB_105", "subject": "Second Language (Hindi/Marathi)", "teacher_id": "TCH_105", "teacher_name": "Mrs. Rohini Patil", "room": "Room 301"},
    {"period": 6, "day": "Monday", "time": "12:30 - 01:15", "subject_id": "SUB_106", "subject": "Information Technology", "teacher_id": "TCH_106", "teacher_name": "Mr. Vikram Shinde", "room": "Comp Lab"},
    {"period": 7, "day": "Monday", "time": "01:15 - 02:00", "subject_id": "SUB_107", "subject": "Physical Education", "teacher_id": "TCH_107", "teacher_name": "Coach Ramesh Pawar", "room": "Playground"},
    {"period": 8, "day": "Monday", "time": "02:00 - 02:45", "subject_id": "SUB_102", "subject": "Mathematics (Problem Solving)", "teacher_id": "TCH_101", "teacher_name": "Mrs. Deepti Bisen", "room": "Room 301"}
]
