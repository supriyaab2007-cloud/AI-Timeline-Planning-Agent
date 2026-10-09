import { useEffect, useState } from "react";
import "./App.css";

function CreateProject({
  projectName,
  setProjectName,
  deadline,
  setDeadline,
  hoursPerDay,
  setHoursPerDay,
  completedTasks,
  setCompletedTasks,
  loading,
  generateTimeline,
  message,
}) {
    return (
      <div className="panel create-panel">

        <div className="panel-header">

          <div>
            <h2>Create Project</h2>

            <p>
              Give the AI some information about
              your project.
            </p>
          </div>

          <div className="panel-icon">
            ✦
          </div>

        </div>

        <div className="form-grid">

          <div className="form-group full-width">

            <label>Project Name</label>

            <input
              type="text"
              placeholder="AI Student Attendance System"
              value={projectName}
              onChange={(event) =>
                setProjectName(
                  event.target.value
                )
              }
            />

          </div>

          <div className="form-group">

            <label>Deadline</label>

            <div className="input-box">

              <input
                type="number"
                min="1"
                value={deadline}
                onChange={(event) =>
                  setDeadline(
                    event.target.value
                  )
                }
              />

              <span>days</span>

            </div>

          </div>

          <div className="form-group">

            <label>Available Time</label>

            <div className="input-box">

              <input
                type="number"
                min="0.5"
                step="0.5"
                value={hoursPerDay}
                onChange={(event) =>
                  setHoursPerDay(
                    event.target.value
                  )
                }
              />

              <span>hrs/day</span>

            </div>

          </div>

          <div className="form-group full-width">

            <label>Already Completed</label>

            <textarea
              placeholder="Example: Requirements gathering, database design..."
              value={completedTasks}
              onChange={(event) =>
                setCompletedTasks(
                  event.target.value
                )
              }
            />

          </div>

        </div>

        <button
          type="button"
          className="generate-button"
          onClick={generateTimeline}
          disabled={loading}
        >

          {loading ? (
            <>
              <span className="spinner"></span>
              AI is planning...
            </>
          ) : (
            <>
              ✦ Generate AI Timeline
            </>
          )}

        </button>

        {message && (
          <div className="message">
            {message}
          </div>
        )}

      </div>
    );
  }

function DashboardPage({
  tasks,
  projectName,
  setProjectName,
  deadline,
  setDeadline,
  hoursPerDay,
  setHoursPerDay,
  completedTasks,
  setCompletedTasks,
  loading,
  generateTimeline,
  message,
  getOverallProgress,
  getCompletedCount,
  getInProgressCount,
  getNotStartedCount,
  getPriorityCount,
  ProgressCard,
  PriorityCard,
  MentorCard,
}) {
    return (
      <>
        <section className="hero">
          <div className="hero-content">
            <div className="hero-label">
              ✦ AI PROJECT PLANNER
            </div>

            <h1>
              Plan smarter.
              <br />
              <span>Build faster.</span>
            </h1>

            <p>
              Turn your project idea into a clear,
              realistic timeline with AI-powered
              planning.
            </p>
          </div>

          <div className="hero-decoration">
            <div className="circle-one"></div>
            <div className="circle-two"></div>
            <div className="hero-star">✦</div>
          </div>
        </section>

        <section className="stats-grid">

          <div className="stat-card">
            <div className="stat-icon blue">
              ◫
            </div>

            <div>
              <p>Total Tasks</p>
              <h2>{tasks.length}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon green">
              ✓
            </div>

            <div>
              <p>Completed</p>
              <h2>{getCompletedCount()}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">
              ◔
            </div>

            <div>
              <p>In Progress</p>
              <h2>{getInProgressCount()}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon purple">
              %
            </div>

            <div>
              <p>Overall Progress</p>
              <h2>
                {getOverallProgress()}%
              </h2>
            </div>
          </div>

        </section>

        <section className="dashboard-grid">

          <CreateProject
            projectName={projectName}
            setProjectName={setProjectName}
            deadline={deadline}
            setDeadline={setDeadline}
            hoursPerDay={hoursPerDay}
            setHoursPerDay={setHoursPerDay}
            completedTasks={completedTasks}
            setCompletedTasks={setCompletedTasks}
            loading={loading}
            generateTimeline={generateTimeline}
            message={message}
          />

          <ProgressCard />

        </section>

        {tasks.length > 0 && (
          <section className="dashboard-grid">

            <PriorityCard />

            <MentorCard />

          </section>
        )}

        {tasks.length === 0 && (
          <div className="empty-state">

            <div className="empty-icon">
              ✦
            </div>

            <h2>
              Your project workspace is ready
            </h2>

            <p>
              Enter your project details and let
              AI create your project timeline.
            </p>

          </div>
        )}
      </>
    );
  }


function App() {
  const [activePage, setActivePage] = useState("Dashboard");

  const [projectId, setProjectId] = useState("");
  const [projectHistory, setProjectHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  const [projectName, setProjectName] = useState("");
  const [deadline, setDeadline] = useState("30");
  const [hoursPerDay, setHoursPerDay] = useState("2");
  const [completedTasks, setCompletedTasks] = useState("");

  const [tasks, setTasks] = useState([]);
  const [progress, setProgress] = useState({});

  const [loading, setLoading] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

  const [message, setMessage] = useState("");

  // ================================
  // LOAD SAVED PROJECT HISTORY
  // ================================
  async function loadProjectHistory() {
    setHistoryLoading(true);
    setHistoryError("");
    try {
      const response = await fetch("http://127.0.0.1:5000/projects");
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Could not load project history.");
      }

      let projects = [];
      if (Array.isArray(data)) {
        projects = data;
      } else if (Array.isArray(data.projects)) {
        projects = data.projects;
      } else if (data && (data._id || data.project_name || data.name)) {
        projects = [data];
      }
      setProjectHistory(projects);
    } catch (error) {
      console.error("Project history error:", error);
      setHistoryError(
        "Could not load saved projects. Make sure the backend is running on port 5000."
      );
    } finally {
      setHistoryLoading(false);
    }
  }

  useEffect(() => {
    loadProjectHistory();
  }, []);

  function openSavedProject(project) {
    const id = project._id?.$oid || project._id || project.id || "";
    setProjectId(String(id));
    setProjectName(project.project_name || project.name || "Untitled Project");
    setDeadline(String(project.deadline_days ?? project.deadline ?? 30));
    setHoursPerDay(String(project.hours_per_day ?? 2));
    setCompletedTasks(project.completed_tasks || "None");

    const savedTasks = Array.isArray(project.tasks) ? project.tasks : [];
    setTasks(savedTasks);
    const savedProgress = {};
    savedTasks.forEach((task, index) => {
      savedProgress[index] = Number(task.progress || 0);
    });
    setProgress(savedProgress);
    setMessage("");
    setActivePage("Timeline");
  }

  // ================================
  // CREATE AI TIMELINE
  // ================================

  async function generateTimeline() {
    if (!projectName.trim()) {
      setMessage("Please enter a project name.");
      return;
    }

    if (!deadline || !hoursPerDay) {
      setMessage(
        "Please enter deadline and available hours."
      );
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/create-timeline",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            project_name: projectName,
            deadline: Number(deadline),
            hours_per_day: Number(hoursPerDay),
            completed_tasks:
              completedTasks || "None",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to create timeline"
        );
      }

      // Save MongoDB project ID
      setProjectId(data._id || "");

      // Save tasks
      setTasks(data.tasks || []);

      // Create initial progress
      const initialProgress = {};

      (data.tasks || []).forEach(
        (task, index) => {
          initialProgress[index] =
            Number(task.progress || 0);
        }
      );

      setProgress(initialProgress);

      setMessage(
        "Timeline created successfully!"
      );

      setActivePage("Timeline");

    } catch (error) {
      console.error(error);

      setMessage(
        error.message ||
          "Could not connect to backend. Make sure Flask is running."
      );
    }

    setLoading(false);
  }

  // ================================
  // UPDATE PROGRESS
  // ================================

  async function updateProgress(index, value) {
    const newProgress = Number(value);

    const oldProgress = Number(
      progress[index] || 0
    );

    // Update screen immediately
    setProgress((previous) => ({
      ...previous,
      [index]: newProgress,
    }));

    // If project has no ID
    if (!projectId) {
      setMessage(
        "Project is not connected to the database."
      );

      return;
    }

    setSavingProgress(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:5000/update-progress",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            project_id: projectId,
            task_index: index,
            progress: newProgress,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Failed to save progress."
        );
      }

      // Update task status also
      setTasks((previousTasks) =>
        previousTasks.map(
          (task, taskIndex) => {
            if (taskIndex !== index) {
              return task;
            }

            return {
              ...task,
              progress: newProgress,
              status: data.status,
            };
          }
        )
      );

      setMessage(
        "Progress saved successfully."
      );

    } catch (error) {
      console.error(error);

      // Restore old value if database update failed
      setProgress((previous) => ({
        ...previous,
        [index]: oldProgress,
      }));

      setMessage(
        "Could not save progress. Make sure Flask is running."
      );

    } finally {
      setSavingProgress(false);
    }
  }

  // ================================
  // CALCULATIONS
  // ================================

  function getOverallProgress() {
    if (tasks.length === 0) {
      return 0;
    }

    const total = tasks.reduce(
      (sum, task, index) => {
        return (
          sum +
          Number(progress[index] || 0)
        );
      },
      0
    );

    return Math.round(
      total / tasks.length
    );
  }

  function getCompletedCount() {
    return tasks.filter(
      (task, index) => {
        return (
          Number(progress[index] || 0) ===
          100
        );
      }
    ).length;
  }

  function getInProgressCount() {
    return tasks.filter(
      (task, index) => {
        const value = Number(
          progress[index] || 0
        );

        return value > 0 && value < 100;
      }
    ).length;
  }

  function getNotStartedCount() {
    return tasks.filter(
      (task, index) => {
        return (
          Number(progress[index] || 0) ===
          0
        );
      }
    ).length;
  }

  function getPriorityCount(priority) {
    return tasks.filter((task) => {
      return (
        String(task.priority).toLowerCase() ===
        priority.toLowerCase()
      );
    }).length;
  }

  // ================================
  // NAVIGATION
  // ================================

  function changePage(page) {
    setActivePage(page);
    setMessage("");
  }

  // ================================
  // DASHBOARD
  // ================================


  // ================================
  // PROGRESS CARD
  // ================================

  function ProgressCard() {
    return (
      <div className="panel progress-panel">

        <div className="panel-header">

          <div>
            <h2>Project Progress</h2>

            <p>
              Current project status
            </p>
          </div>

        </div>

        <div className="progress-circle-container">

          <div
            className="progress-circle"
            style={{
              "--progress":
                `${getOverallProgress()}%`,
            }}
          >

            <div className="progress-inner">

              <strong>
                {getOverallProgress()}%
              </strong>

              <span>
                Complete
              </span>

            </div>

          </div>

        </div>

        <div className="progress-summary">

          <div>
            <span className="dot green-dot"></span>
            Completed
            <strong>
              {getCompletedCount()}
            </strong>
          </div>

          <div>
            <span className="dot orange-dot"></span>
            In Progress
            <strong>
              {getInProgressCount()}
            </strong>
          </div>

          <div>
            <span className="dot gray-dot"></span>
            Not Started
            <strong>
              {getNotStartedCount()}
            </strong>
          </div>

        </div>

      </div>
    );
  }

  // ================================
  // TIMELINE PAGE
  // ================================

  function TimelinePage() {
    return (
      <>

        <div className="page-heading">

          <div>
            <h1>Project Timeline</h1>

            <p>
              Your AI-generated project schedule.
            </p>
          </div>

          <div className="task-count">
            {tasks.length} Tasks
          </div>

        </div>

        {tasks.length === 0 ? (
          <div className="empty-state">

            <div className="empty-icon">
              ◫
            </div>

            <h2>
              No timeline created yet
            </h2>

            <p>
              Go to Dashboard and create your
              project timeline.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={() =>
                changePage("Dashboard")
              }
            >
              Create Timeline
            </button>

          </div>
        ) : (
          <TimelineList />
        )}

      </>
    );
  }

  // ================================
  // TIMELINE LIST
  // ================================

  function TimelineList() {
    return (
      <section className="panel timeline-panel">

        <div className="timeline">

          {tasks.map((task, index) => {

            const taskProgress =
              Number(
                progress[index] || 0
              );

            let status = "Not Started";

            if (taskProgress === 100) {
              status = "Completed";
            } else if (taskProgress > 0) {
              status = "In Progress";
            }

            return (
              <div
                className="timeline-item"
                key={index}
              >

                <div className="timeline-number">
                  {index + 1}
                </div>

                <div className="timeline-card">

                  <div className="timeline-top">

                    <div>

                      <div className="task-title-row">

                        <h3>
                          {task.name}
                        </h3>

                        <span
                          className={
                            "priority " +
                            String(
                              task.priority
                            ).toLowerCase()
                          }
                        >
                          {task.priority}
                        </span>

                      </div>

                      <p>
                        {task.description}
                      </p>

                    </div>

                    <div className="duration">
                      {task.duration_days} days
                    </div>

                  </div>

                  <div className="task-info">

                    <span>
                      📅 {task.start_date}
                    </span>

                    <span>
                      → {task.end_date}
                    </span>

                    <span>
                      Status: {status}
                    </span>

                  </div>

                  {task.depends_on &&
                    task.depends_on.length > 0 && (

                      <div className="dependency">

                        🔗 Depends on:{" "}
                        {task.depends_on.join(
                          ", "
                        )}

                      </div>

                    )}

                  <div className="progress-section">

                    <div className="progress-label">

                      <span>
                        Progress
                      </span>

                      <strong>
                        {taskProgress}%
                      </strong>

                    </div>

                    <div className="progress-bar">

                      <div
                        className="progress-fill"
                        style={{
                          width:
                            `${taskProgress}%`,
                        }}
                      ></div>

                    </div>

                    <select
                      value={taskProgress}
                      disabled={savingProgress}
                      onChange={(event) =>
                        updateProgress(
                          index,
                          event.target.value
                        )
                      }
                    >

                      <option value="0">
                        Not Started
                      </option>

                      <option value="25">
                        25% Complete
                      </option>

                      <option value="50">
                        50% Complete
                      </option>

                      <option value="75">
                        75% Complete
                      </option>

                      <option value="100">
                        Completed
                      </option>

                    </select>

                  </div>

                </div>

              </div>
            );
          })}

        </div>

      </section>
    );
  }

  // ================================
  // PROJECTS PAGE
  // ================================

  function ProjectsPage() {
    return (
      <>

        <div className="page-heading">

          <div>
            <h1>Projects</h1>

            <p>
              Manage your academic projects.
            </p>
          </div>

          <button
            type="button"
            className="primary-button"
            onClick={() =>
              changePage("Dashboard")
            }
          >
            + New Project
          </button>

        </div>

        <div className="project-card">

          <div className="project-card-icon">
            AI
          </div>

          <div className="project-card-content">

            <h2>
              {projectName ||
                "No project created"}
            </h2>

            <p>
              {tasks.length} tasks
            </p>

            <div className="small-progress">

              <div
                style={{
                  width:
                    `${getOverallProgress()}%`,
                }}
              ></div>

            </div>

            <span>
              {getOverallProgress()}%
              complete
            </span>

          </div>

          <button
            type="button"
            className="view-button"
            onClick={() =>
              changePage("Timeline")
            }
          >
            View Timeline
          </button>

        </div>

      </>
    );
  }

  // ================================
  // PROJECT HISTORY PAGE
  // ================================
  function ProjectHistoryPage() {
    return (
      <>
        <div className="page-heading">
          <div>
            <h1>Project History</h1>
            <p>View projects you have previously created and saved.</p>
          </div>
          <button
            type="button"
            className="primary-button"
            onClick={loadProjectHistory}
            disabled={historyLoading}
          >
            {historyLoading ? "Refreshing..." : "↻ Refresh"}
          </button>
        </div>

        {historyError && <div className="message" role="alert">{historyError}</div>}

        {historyLoading && projectHistory.length === 0 ? (
          <div className="panel"><p>Loading your saved projects...</p></div>
        ) : projectHistory.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">▣</div>
            <h2>No saved projects found</h2>
            <p>Create a timeline first. Your saved projects will appear here.</p>
            <button type="button" className="primary-button" onClick={() => changePage("Dashboard")}>
              + Create Project
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {projectHistory.map((project, index) => {
              const savedTasks = Array.isArray(project.tasks) ? project.tasks : [];
              const id = project._id?.$oid || project._id || project.id || index;
              const name = project.project_name || project.name || "Untitled Project";
              const deadlineDays = project.deadline_days ?? project.deadline;
              const completed = savedTasks.filter(
                (task) => Number(task.progress || 0) === 100
              ).length;

              return (
                <article className="panel" key={String(id)}>
                  <div className="panel-header">
                    <div>
                      <h2>{name}</h2>
                      <p>
                        {savedTasks.length} {savedTasks.length === 1 ? "task" : "tasks"}
                        {deadlineDays != null ? ` · ${deadlineDays}-day deadline` : ""}
                      </p>
                    </div>
                    <div className="panel-icon">▣</div>
                  </div>
                  <p>{completed} of {savedTasks.length} tasks completed</p>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <button type="button" className="primary-button" onClick={() => openSavedProject(project)}>
                      View Timeline
                    </button>
                    <button
                      type="button"
                      className="view-button"
                      onClick={() => {
                        setProjectName(name);
                        setDeadline(String(deadlineDays ?? 30));
                        setHoursPerDay(String(project.hours_per_day ?? 2));
                        setCompletedTasks(project.completed_tasks || "None");
                        setMessage("");
                        setActivePage("Dashboard");
                      }}
                    >
                      Use as Starting Point
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </>
    );
  }

  // ================================
  // PROGRESS PAGE
  // ================================

  function ProgressPage() {
    return (
      <>

        <div className="page-heading">

          <div>
            <h1>Progress</h1>

            <p>
              Track your project completion.
            </p>
          </div>

        </div>

        <div className="stats-grid">

          <div className="stat-card">

            <div className="stat-icon purple">
              %
            </div>

            <div>
              <p>Overall Progress</p>
              <h2>
                {getOverallProgress()}%
              </h2>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon green">
              ✓
            </div>

            <div>
              <p>Completed</p>
              <h2>
                {getCompletedCount()}
              </h2>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon orange">
              ◔
            </div>

            <div>
              <p>In Progress</p>
              <h2>
                {getInProgressCount()}
              </h2>
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-icon blue">
              ○
            </div>

            <div>
              <p>Not Started</p>
              <h2>
                {getNotStartedCount()}
              </h2>
            </div>

          </div>

        </div>

        {tasks.length > 0 && (
          <TimelineList />
        )}

      </>
    );
  }

  // ================================
  // ANALYTICS PAGE
  // ================================

  function AnalyticsPage() {
    return (
      <>

        <div className="page-heading">

          <div>
            <h1>Analytics</h1>

            <p>
              Understand your project status.
            </p>
          </div>

        </div>

        <div className="dashboard-grid">

          <div className="panel">

            <h2>Task Statistics</h2>

            <div className="analytics-list">

              <div>
                <span>Total Tasks</span>
                <strong>
                  {tasks.length}
                </strong>
              </div>

              <div>
                <span>Completed</span>
                <strong>
                  {getCompletedCount()}
                </strong>
              </div>

              <div>
                <span>In Progress</span>
                <strong>
                  {getInProgressCount()}
                </strong>
              </div>

              <div>
                <span>Not Started</span>
                <strong>
                  {getNotStartedCount()}
                </strong>
              </div>

            </div>

          </div>

          <div className="panel">

            <h2>Priority Distribution</h2>

            <div className="analytics-list">

              <div>
                <span>High Priority</span>

                <strong>
                  {getPriorityCount("High")}
                </strong>
              </div>

              <div>
                <span>Medium Priority</span>

                <strong>
                  {getPriorityCount("Medium")}
                </strong>
              </div>

              <div>
                <span>Low Priority</span>

                <strong>
                  {getPriorityCount("Low")}
                </strong>
              </div>

            </div>

          </div>

        </div>

      </>
    );
  }

  // ================================
  // AI MENTOR PAGE
  // ================================

  function MentorPage() {
    return (
      <div className="mentor-page">

        <div className="mentor-large-icon">
          ✦
        </div>

        <h1>AI Project Mentor</h1>

        <p>
          Your AI mentor helps you understand your
          project, identify delays and plan your
          next steps.
        </p>

        <div className="mentor-options">

          <button
            type="button"
            onClick={() =>
              setMessage(
                "Your project currently has " +
                tasks.length +
                " tasks."
              )
            }
          >
            📊 Check Project Status
          </button>

          <button
            type="button"
            onClick={() =>
              setMessage(
                "Current project progress is " +
                getOverallProgress() +
                "%."
              )
            }
          >
            📈 Check Progress
          </button>

          <button
            type="button"
            onClick={() =>
              setMessage(
                "Focus on completing your High Priority tasks first."
              )
            }
          >
            ✦ Get Planning Advice
          </button>

        </div>

        {message && (
          <div className="mentor-message">
            {message}
          </div>
        )}

      </div>
    );
  }

  // ================================
  // PRIORITY CARD
  // ================================

  function PriorityCard() {
    return (
      <div className="panel">

        <div className="panel-header">

          <div>
            <h2>Task Priority</h2>

            <p>
              Priority distribution
            </p>
          </div>

        </div>

        <div className="priority-list">

          <div className="priority-row">

            <span>
              <i className="priority-dot high"></i>
              High Priority
            </span>

            <strong>
              {getPriorityCount("High")}
            </strong>

          </div>

          <div className="priority-row">

            <span>
              <i className="priority-dot medium"></i>
              Medium Priority
            </span>

            <strong>
              {getPriorityCount("Medium")}
            </strong>

          </div>

          <div className="priority-row">

            <span>
              <i className="priority-dot low"></i>
              Low Priority
            </span>

            <strong>
              {getPriorityCount("Low")}
            </strong>

          </div>

        </div>

      </div>
    );
  }

  // ================================
  // MENTOR CARD
  // ================================

  function MentorCard() {
    return (
      <div className="panel mentor-panel">

        <div className="mentor-icon">
          ✦
        </div>

        <div>

          <span className="mentor-label">
            AI MENTOR
          </span>

          <h2>
            Need help with your project?
          </h2>

          <p>
            Your AI mentor can help identify
            delays and suggest better planning.
          </p>

          <button
            type="button"
            className="mentor-button"
            onClick={() =>
              changePage("AI Mentor")
            }
          >
            Ask AI Mentor →
          </button>

        </div>

      </div>
    );
  }

  // ================================
  // MAIN PAGE SWITCH
  // ================================

  function renderPage() {

    if (activePage === "Projects") {
      return <ProjectsPage />;
    }

    
    if (activePage === "Project History") {
      return <ProjectHistoryPage />;
    }
if (activePage === "Timeline") {
      return <TimelinePage />;
    }

    if (activePage === "Progress") {
      return <ProgressPage />;
    }

    if (activePage === "Analytics") {
      return <AnalyticsPage />;
    }

    if (activePage === "AI Mentor") {
      return <MentorPage />;
    }

    return (
      <DashboardPage
        tasks={tasks}
        projectName={projectName}
        setProjectName={setProjectName}
        deadline={deadline}
        setDeadline={setDeadline}
        hoursPerDay={hoursPerDay}
        setHoursPerDay={setHoursPerDay}
        completedTasks={completedTasks}
        setCompletedTasks={setCompletedTasks}
        loading={loading}
        generateTimeline={generateTimeline}
        message={message}
        getOverallProgress={getOverallProgress}
        getCompletedCount={getCompletedCount}
        getInProgressCount={getInProgressCount}
        getNotStartedCount={getNotStartedCount}
        getPriorityCount={getPriorityCount}
        ProgressCard={ProgressCard}
        PriorityCard={PriorityCard}
        MentorCard={MentorCard}
      />
    );
  }

  // ================================
  // APP UI
  // ================================

  return (
    <div className="app">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="logo">

          <div className="logo-icon">
            AI
          </div>

          <div>
            <h2>Timeline AI</h2>
            <span>Project Planner</span>
          </div>

        </div>

        <nav className="sidebar-nav">

          <p className="nav-title">
            WORKSPACE
          </p>

          <button
            type="button"
            className={
              activePage === "Dashboard"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              changePage("Dashboard")
            }
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            type="button"
            className={
              activePage === "Projects"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              changePage("Projects")
            }
          >
            <span>▣</span>
            Projects
          </button>

          <button
            type="button"
            className={
              activePage === "Project History"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() => {
              changePage("Project History");
              loadProjectHistory();
            }}
          >
            <span>▤</span>
            Project History
          </button>

          <button
            type="button"
            className={
              activePage === "Timeline"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              changePage("Timeline")
            }
          >
            <span>◫</span>
            Timeline
          </button>

          <button
            type="button"
            className={
              activePage === "Progress"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              changePage("Progress")
            }
          >
            <span>◔</span>
            Progress
          </button>

          <button
            type="button"
            className={
              activePage === "Analytics"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              changePage("Analytics")
            }
          >
            <span>▥</span>
            Analytics
          </button>

          <p className="nav-title">
            AI TOOLS
          </p>

          <button
            type="button"
            className={
              activePage === "AI Mentor"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              changePage("AI Mentor")
            }
          >
            <span>✦</span>
            AI Mentor
          </button>

        </nav>

        <div className="sidebar-bottom">

          <div className="ai-mini-card">

            <div className="ai-mini-icon">
              ✦
            </div>

            <div>
              <strong>AI Assistant</strong>
              <p>Ready to help</p>
            </div>

          </div>

          <div className="profile">

            <div className="avatar">
              S
            </div>

            <div>
              <strong>Student</strong>
              <p>CSE (AI & ML)</p>
            </div>

          </div>

        </div>

      </aside>

      {/* MAIN DASHBOARD */}

      <div className="dashboard">

        <header className="topbar">

          <div className="breadcrumb">
            Workspace /{" "}
            <strong>{activePage}</strong>
          </div>

          <div className="topbar-right">

            <div className="search">

              <span>⌕</span>

              <input
                type="text"
                placeholder="Search..."
              />

            </div>

            <button
              type="button"
              className="notification"
              onClick={() =>
                setMessage(
                  "No new notifications."
                )
              }
            >
              🔔
            </button>

            <button
              type="button"
              className="top-avatar"
              onClick={() =>
                setMessage(
                  "Student profile"
                )
              }
            >
              S
            </button>

          </div>

        </header>

        <main className="content">

          {renderPage()}

        </main>

        <footer className="footer">

          <span>
            © 2026 Timeline AI
          </span>

          <span>
            AI-Powered Academic Project Planning
          </span>

        </footer>

      </div>

    </div>
  );
}

export default App;
