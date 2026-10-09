from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")

db = client["timeline_planner"]
tasks_collection = db["tasks"]

projects = tasks_collection.find()

print("\n===== SAVED PROJECTS =====\n")

count = 0

for project in projects:
    count += 1

    print("Project:", project.get("project_name"))
    print("Deadline:", project.get("deadline_days"), "days")
    print("Hours per day:", project.get("hours_per_day"))
    print("Number of tasks:", len(project.get("tasks", [])))
    print("-" * 50)

print("\nTotal projects stored:", count)