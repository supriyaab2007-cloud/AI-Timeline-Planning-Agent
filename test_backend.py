import requests

url = "http://127.0.0.1:5000/create-timeline"

data = {
    "project_name": "AI Student Attendance System",
    "deadline": 30,
    "hours_per_day": 2,
    "completed_tasks": "None"
}

response = requests.post(url, json=data)

print("\n===== BACKEND RESPONSE =====\n")
print(response.json())