import json
from datetime import date, timedelta

from flask import Flask, request, jsonify
from flask_cors import CORS

from crewai import Task, Crew
from agents.timeline_agent import timeline_agent
from serpapi_search_tools import web_search

from pymongo import MongoClient
from bson import ObjectId


# ==========================================
# FLASK APP
# ==========================================

app = Flask(__name__)
CORS(app)


# ==========================================
# SERPAPI SEARCH TOOL
# ==========================================

search_tool = web_search(result_limit=5)


# ==========================================
# MONGODB
# ==========================================

client = MongoClient("mongodb://localhost:27017/")

db = client["timeline_planner"]

tasks_collection = db["tasks"]


# ==========================================
# HOME
# ==========================================

@app.route("/")
def home():

    return jsonify({
        "message": "AI Timeline Planning Backend is running!"
    })


# ==========================================
# CREATE TIMELINE
# ==========================================

@app.route("/create-timeline", methods=["POST"])
def create_timeline():

    data = request.json or {}

    project_name = data.get("project_name")

    try:
        deadline = int(data.get("deadline"))
    except (TypeError, ValueError):
        return jsonify({
            "error": "Deadline must be a valid number."
        }), 400

    try:
        hours_per_day = float(data.get("hours_per_day"))
    except (TypeError, ValueError):
        return jsonify({
            "error": "Hours per day must be a valid number."
        }), 400

    completed_tasks = data.get(
        "completed_tasks",
        "None"
    )


    # ==========================================
    # VALIDATION
    # ==========================================

    if not project_name:

        return jsonify({
            "error": "Project name is required."
        }), 400

    if deadline <= 0:

        return jsonify({
            "error": "Deadline must be greater than 0."
        }), 400

    if hours_per_day <= 0:

        return jsonify({
            "error": "Hours per day must be greater than 0."
        }), 400


    # ==========================================
    # START MESSAGE
    # ==========================================

    print()
    print("==============================================")
    print("CREATING AI PROJECT TIMELINE")
    print("==============================================")
    print("Project:", project_name)
    print("Deadline:", deadline, "days")
    print("Hours per day:", hours_per_day)
    print("Completed tasks:", completed_tasks)
    print("==============================================")
    print()


    # ==========================================
    # STEP 1
    # MANDATORY WEB SEARCH
    # ==========================================

    print("==============================================")
    print("STEP 1: SEARCH")
    print("==============================================")
    print("Searching current web information using SerpApi...")
    print()


    search_query = (
        project_name
        + " latest research datasets tools tutorials "
        + "frameworks methodology"
    )


    try:

        search_results = search_tool.run(
            query=search_query,
            engine="google"
        )

        print("SerpApi search completed successfully.")
        print()

    except Exception as e:

        print("SerpApi search failed.")
        print("Error:", str(e))
        print()

        search_results = []


    # ==========================================
    # FORMAT SEARCH RESULTS
    # ==========================================

    if isinstance(search_results, dict):

        research_text = json.dumps(
            search_results,
            indent=2,
            ensure_ascii=False
        )

    elif isinstance(search_results, list):

        research_text = json.dumps(
            search_results,
            indent=2,
            ensure_ascii=False
        )

    else:

        research_text = str(search_results)


    print("SEARCH RESULTS")
    print("----------------------------------------------")
    print(research_text[:8000])
    print("----------------------------------------------")
    print()


    # ==========================================
    # STEP 2 + 3 + 4
    # PLAN → COMPARE → ACT
    # ==========================================

    prompt = (

        "You are an intelligent AI project planning "
        "and research assistant for college students.\n\n"


        # --------------------------------------
        # SEARCH RESULTS
        # --------------------------------------

        "CURRENT WEB RESEARCH\n"
        "The following information was collected "
        "using SerpApi before this planning step.\n\n"

        + research_text
        + "\n\n"


        # --------------------------------------
        # PROJECT INFORMATION
        # --------------------------------------

        "PROJECT INFORMATION\n"

        "Project Name: "
        + project_name
        + "\n"

        "Deadline: "
        + str(deadline)
        + " days\n"

        "Available Hours Per Day: "
        + str(hours_per_day)
        + "\n"

        "Completed Tasks: "
        + completed_tasks
        + "\n\n"


        # --------------------------------------
        # PLAN
        # --------------------------------------

        "STEP 1 - UNDERSTAND AND PLAN\n"

        "First understand what the project is actually "
        "about.\n"

        "Identify the most suitable project type "
        "before creating the timeline.\n\n"

        "Possible project types include:\n"

        "- Computer Vision / Object Detection\n"
        "- AI / Machine Learning\n"
        "- Data Science\n"
        "- Web Application\n"
        "- Mobile Application\n"
        "- IoT / Embedded System\n"
        "- Robotics\n"
        "- Cybersecurity\n"
        "- Software Application\n"
        "- Other technical project\n\n"

        "Do NOT assume every project is an AI/ML project.\n"

        "Create tasks based on the actual project "
        "requirements.\n\n"


        # --------------------------------------
        # COMPARE
        # --------------------------------------

        "STEP 2 - COMPARE RESEARCH\n"

        "Analyze the provided web research.\n\n"

        "Compare useful resources based on:\n"

        "1. Relevance to the project\n"
        "2. Technical usefulness\n"
        "3. Recency\n"
        "4. Documentation quality\n"
        "5. Suitability for a college project\n"
        "6. Implementation difficulty\n\n"

        "Do not blindly use the first search result.\n"

        "Ignore unrelated resources.\n"

        "Prefer reliable and relevant resources.\n\n"


        # --------------------------------------
        # USE RESEARCH
        # --------------------------------------

        "STEP 3 - USE THE RESEARCH\n"

        "Use the research findings when deciding "
        "which project tasks are required.\n\n"

        "For example, if the research identifies "
        "a useful computer vision framework, dataset, "
        "model, library, or development method, "
        "consider that information when creating "
        "the corresponding task.\n\n"

        "Do not add random technologies or resources "
        "that are unrelated to the project.\n\n"


        # --------------------------------------
        # COMPLETED TASKS
        # --------------------------------------

        "COMPLETED TASKS\n"

        "Do not recreate work that has already "
        "been completed.\n"

        "Use the completed task information to "
        "generate only the remaining work.\n\n"


        # --------------------------------------
        # DEADLINE
        # --------------------------------------

        "DEADLINE\n"

        "The complete timeline should fit within "
        "the given deadline whenever reasonably possible.\n"

        "Consider the available hours per day.\n"

        "Create realistic task durations.\n\n"


        # --------------------------------------
        # DEPENDENCIES
        # --------------------------------------

        "TASK DEPENDENCIES\n"

        "Arrange tasks in a logical order.\n"

        "If a task requires another task to be "
        "completed first, mention that task in "
        "depends_on.\n\n"


        # --------------------------------------
        # PRIORITY
        # --------------------------------------

        "PRIORITY\n"

        "Assign each task one of these priorities:\n"

        "- High\n"
        "- Medium\n"
        "- Low\n\n"


        # --------------------------------------
        # ACTION
        # --------------------------------------

        "STEP 4 - ACT\n"

        "Create the final actionable project timeline.\n"

        "The final timeline must be project-specific.\n"

        "Do not create a generic timeline.\n"

        "Use the research findings to improve the "
        "task selection, order, priorities, durations, "
        "and dependencies.\n\n"


        # --------------------------------------
        # OUTPUT FORMAT
        # --------------------------------------

        "FOR EVERY TASK PROVIDE:\n"

        "- name\n"
        "- duration_days\n"
        "- priority\n"
        "- description\n"
        "- depends_on\n\n"


        "RETURN ONLY VALID JSON.\n\n"

        "Use exactly this format:\n\n"

        "{\n"

        '  "tasks": [\n'

        "    {\n"

        '      "name": "Task name",\n'

        '      "duration_days": 2,\n'

        '      "priority": "High",\n'

        '      "description": "Short description",\n'

        '      "depends_on": []\n'

        "    }\n"

        "  ]\n"

        "}\n\n"

        "Do not add markdown.\n"

        "Do not add explanations outside the JSON."

    )


    # ==========================================
    # CREWAI TASK
    # ==========================================

    timeline_task = Task(

        description=prompt,

        expected_output=(

            "Valid JSON containing a tasks array. "

            "Each task must contain name, "

            "duration_days, priority, description, "

            "and depends_on."

        ),

        agent=timeline_agent
    )


    # ==========================================
    # CREW
    # ==========================================

    crew = Crew(

        agents=[
            timeline_agent
        ],

        tasks=[
            timeline_task
        ],

        verbose=True
    )


    # ==========================================
    # RUN AI
    # ==========================================

    print("==============================================")
    print("STEP 2: AI PLANNING + COMPARISON + ACTION")
    print("==============================================")
    print()


    try:

        result = crew.kickoff()

    except Exception as e:

        print("CrewAI execution failed.")
        print("Error:", str(e))

        return jsonify({
            "error": "AI timeline generation failed.",
            "details": str(e)
        }), 500


    result_text = str(result)


    print()
    print("AI response received.")
    print()


    # ==========================================
    # EXTRACT JSON
    # ==========================================

    start = result_text.find("{")

    end = result_text.rfind("}") + 1


    if start == -1 or end == 0:

        return jsonify({

            "error":
                "AI did not return valid JSON.",

            "raw_response":
                result_text

        }), 500


    json_text = result_text[
        start:end
    ]


    try:

        timeline_data = json.loads(
            json_text
        )

    except json.JSONDecodeError:

        return jsonify({

            "error":
                "AI response could not be converted to JSON.",

            "raw_response":
                result_text

        }), 500


    # ==========================================
    # CHECK TASKS
    # ==========================================

    if "tasks" not in timeline_data:

        return jsonify({

            "error":
                "AI response does not contain tasks.",

            "raw_response":
                result_text

        }), 500


    # ==========================================
    # ADD PROJECT INFORMATION
    # ==========================================

    timeline_data["project_name"] = (
        project_name
    )

    timeline_data["deadline_days"] = (
        deadline
    )

    timeline_data["hours_per_day"] = (
        hours_per_day
    )

    timeline_data["completed_tasks"] = (
        completed_tasks
    )


    # ==========================================
    # SAVE RESEARCH INFORMATION
    # ==========================================

    timeline_data["research_query"] = (
        search_query
    )

    timeline_data["research_results"] = (
        search_results
    )


    # ==========================================
    # CREATE DATES
    # ==========================================

    start_date = date.today()

    current_date = start_date


    for task in timeline_data["tasks"]:

        try:

            duration = int(
                task.get(
                    "duration_days",
                    1
                )
            )

        except (TypeError, ValueError):

            duration = 1


        if duration < 1:

            duration = 1


        task_start = current_date


        task_end = (
            current_date
            + timedelta(
                days=duration - 1
            )
        )


        task["start_date"] = (
            task_start.isoformat()
        )

        task["end_date"] = (
            task_end.isoformat()
        )


        task["status"] = (
            "Not Started"
        )

        task["progress"] = 0


        current_date = (
            task_end
            + timedelta(days=1)
        )


    # ==========================================
    # TOTAL TASK DAYS
    # ==========================================

    total_days = 0


    for task in timeline_data["tasks"]:

        try:

            duration = int(
                task.get(
                    "duration_days",
                    1
                )
            )

        except (TypeError, ValueError):

            duration = 1


        if duration < 1:

            duration = 1


        total_days += duration


    timeline_data["total_task_days"] = (
        total_days
    )


    # ==========================================
    # DEADLINE STATUS
    # ==========================================

    if total_days <= deadline:

        timeline_data[
            "deadline_status"
        ] = "Within Deadline"

    else:

        timeline_data[
            "deadline_status"
        ] = "At Risk"


    # ==========================================
    # SAVE TO MONGODB
    # ==========================================

    result_db = (
        tasks_collection.insert_one(
            timeline_data
        )
    )


    timeline_data["_id"] = (
        str(
            result_db.inserted_id
        )
    )


    # ==========================================
    # SUCCESS MESSAGE
    # ==========================================

    print()
    print("==============================================")
    print("TIMELINE CREATED SUCCESSFULLY")
    print("==============================================")

    print(
        "Project:",
        project_name
    )

    print(
        "Total task days:",
        total_days
    )

    print(
        "Deadline:",
        deadline
    )

    print(
        "Deadline status:",
        timeline_data[
            "deadline_status"
        ]
    )

    print()
    print(
        "PLAN -> SEARCH -> COMPARE -> ACT completed."
    )

    print("Timeline saved to MongoDB.")
    print("==============================================")
    print()


    return jsonify(
        timeline_data
    )


# ==========================================
# GET SAVED PROJECTS
# ==========================================

@app.route(
    "/projects",
    methods=["GET"]
)
def get_projects():

    projects = []


    saved_projects = (
        tasks_collection
        .find()
        .sort(
            "_id",
            -1
        )
    )


    for project in saved_projects:

        project["_id"] = str(
            project["_id"]
        )

        projects.append(
            project
        )


    return jsonify(
        projects
    )


# ==========================================
# UPDATE TASK PROGRESS
# ==========================================

@app.route(
    "/update-progress",
    methods=["POST"]
)
def update_progress():

    data = request.json or {}


    project_id = (
        data.get("project_id")
    )

    task_index = (
        data.get("task_index")
    )

    progress_value = (
        data.get("progress")
    )


    # ==========================================
    # VALIDATION
    # ==========================================

    if not project_id:

        return jsonify({
            "error":
                "Project ID is required."
        }), 400


    if task_index is None:

        return jsonify({
            "error":
                "Task index is required."
        }), 400


    if progress_value is None:

        return jsonify({
            "error":
                "Progress is required."
        }), 400


    try:

        task_index = int(
            task_index
        )

        progress_value = int(
            progress_value
        )

    except (TypeError, ValueError):

        return jsonify({
            "error":
                "Invalid task index or progress."
        }), 400


    if (
        progress_value < 0
        or progress_value > 100
    ):

        return jsonify({
            "error":
                "Progress must be between 0 and 100."
        }), 400


    # ==========================================
    # MONGODB OBJECT ID
    # ==========================================

    try:

        object_id = ObjectId(
            project_id
        )

    except Exception:

        return jsonify({
            "error":
                "Invalid project ID."
        }), 400


    # ==========================================
    # FIND PROJECT
    # ==========================================

    project = (
        tasks_collection.find_one(
            {
                "_id": object_id
            }
        )
    )


    if not project:

        return jsonify({
            "error":
                "Project not found."
        }), 404


    tasks = project.get(
        "tasks",
        []
    )


    if (
        task_index < 0
        or task_index >= len(tasks)
    ):

        return jsonify({
            "error":
                "Invalid task index."
        }), 400


    # ==========================================
    # DETERMINE STATUS
    # ==========================================

    if progress_value == 100:

        status = "Completed"

    elif progress_value > 0:

        status = "In Progress"

    else:

        status = "Not Started"


    # ==========================================
    # UPDATE MONGODB
    # ==========================================

    tasks_collection.update_one(

        {
            "_id": object_id
        },

        {
            "$set": {

                f"tasks.{task_index}.progress":
                    progress_value,

                f"tasks.{task_index}.status":
                    status

            }
        }
    )


    print()
    print("Progress updated.")
    print(
        "Project ID:",
        project_id
    )

    print(
        "Task:",
        task_index
    )

    print(
        "Progress:",
        progress_value
    )

    print(
        "Status:",
        status
    )

    print()


    return jsonify({

        "message":
            "Progress updated successfully.",

        "progress":
            progress_value,

        "status":
            status

    })


# ==========================================
# RUN SERVER
# ==========================================

if __name__ == "__main__":

    app.run(

        host="127.0.0.1",

        port=5000,

        debug=True

    )