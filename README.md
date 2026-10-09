# AI Timeline Planning Agent

## Overview
AI Timeline Planning Agent is an AI-powered project planning system that helps students and developers organize projects, discover useful resources, and generate project timelines.

## Problem Statement
Planning a project can be difficult because users need to identify tasks, estimate completion time, find relevant resources, and meet deadlines. This project aims to simplify the process using AI.

## Features
- AI-powered project timeline generation
- Web resource search using SerpApi
- Project task planning and organization
- Deadline risk identification
- Delay detection and timeline rescheduling
- Task progress tracking
- Project history management
- MongoDB database integration
- Web-based user interface

## How It Works
1. **Plan:** Enter project details and the deadline.
2. **Research:** Search for relevant project resources.
3. **Compare:** Use research results to help prioritize tasks.
4. **Generate:** Create a project timeline.
5. **Track:** Update task progress and manage delays.

## Technologies Used
- Python
- CrewAI
- OpenRouter
- SerpApi
- Flask
- React
- Vite
- MongoDB

## Project Structure
- `agents/` — AI agent components
- `frontend/` — Web application frontend
- `backend.py` — Backend application
- `database.py` — Database operations
- `serpapi_search.py` — Web resource search
- `deadline_risk.py` — Deadline risk functionality
- `delay_detection.py` — Delay detection
- `reschedule_timeline.py` — Timeline rescheduling
- `update_progress.py` — Progress updates

## Getting Started

### Prerequisites
- Python 3.12
- Node.js and npm
- MongoDB
- OpenRouter API key
- SerpApi API key

### Installation
Clone the repository:

    git clone https://github.com/supriyaab2007-cloud/AI-Timeline-Planning-Agent.git

Enter the project directory:

    cd AI-Timeline-Planning-Agent

Create and activate a virtual environment:

    python -m venv venv
    venv\Scripts\activate

Install the dependencies:

    pip install -r requirements.txt

### Environment Variables
Create a `.env` file in the project root and configure your API keys:

    OPENROUTER_API_KEY=your_openrouter_api_key
    SERPAPI_API_KEY=your_serpapi_api_key

Never upload your API keys or `.env` file to GitHub.

### Run the Backend

    python backend.py

### Run the Frontend

Open another terminal:

    cd frontend
    npm install
    npm run dev

Open the local address displayed by Vite in your browser.

## Future Improvements
- Improved task dependency scheduling
- Better duration estimation
- More accurate deadline risk prediction
- Enhanced research relevance ranking
- Improved project analytics
