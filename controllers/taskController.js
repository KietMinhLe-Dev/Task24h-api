let tasks = [
  {
    id: "task-1",
    title: "Morning Yoga & Meditation",
    description: "Start the day with deep breathing exercises and a light yoga stretch.",
    startTime: "06:00",
    endTime: "07:00",
    completed: true,
    priority: "low",
    category: "health",
    date: new Date().toISOString().split('T')[0]
  },
  {
    id: "task-2",
    title: "Daily Standup Meeting",
    description: "Sync up with the development team on active tickets and blockers.",
    startTime: "09:00",
    endTime: "09:30",
    completed: true,
    priority: "high",
    category: "work",
    date: new Date().toISOString().split('T')[0]
  },
  {
    id: "task-3",
    title: "Deep Work: React Full-Stack integration",
    description: "Implement high-fidelity glassmorphic task schedule page with responsive layouts.",
    startTime: "10:00",
    endTime: "12:00",
    completed: false,
    priority: "high",
    category: "work",
    date: new Date().toISOString().split('T')[0]
  },
  {
    id: "task-4",
    title: "Healthy Lunch & Hydration",
    description: "Nourish the body and step away from screens for a power break.",
    startTime: "12:30",
    endTime: "13:30",
    completed: true,
    priority: "medium",
    category: "leisure",
    date: new Date().toISOString().split('T')[0]
  },
  {
    id: "task-5",
    title: "Code Review & PR Approvals",
    description: "Go through open pull requests in the repository and give constructive feedback.",
    startTime: "14:30",
    endTime: "15:30",
    completed: false,
    priority: "medium",
    category: "work",
    date: new Date().toISOString().split('T')[0]
  },
  {
    id: "task-6",
    title: "Evening Workout session",
    description: "Strength training routine followed by 20 minutes of light cardio.",
    startTime: "17:30",
    endTime: "19:00",
    completed: false,
    priority: "high",
    category: "health",
    date: new Date().toISOString().split('T')[0]
  },
  {
    id: "task-7",
    title: "Read Tech Articles / Books",
    description: "Read 'Designing Data-Intensive Applications' chapter 4.",
    startTime: "21:00",
    endTime: "21:45",
    completed: false,
    priority: "low",
    category: "study",
    date: new Date().toISOString().split('T')[0]
  }
];

export const getTasks = (req, res) => {
  try {
    const { date } = req.query;
    let filteredTasks = tasks;
    if (date) {
      filteredTasks = tasks.filter(t => t.date === date);
    }
    // Sort tasks by start time chronologically
    filteredTasks.sort((a, b) => a.startTime.localeCompare(b.startTime));
    res.status(200).json(filteredTasks);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tasks", error: error.message });
  }
};

export const createTask = (req, res) => {
  try {
    const { title, description, startTime, endTime, priority, category, date, durationHours } = req.body;
    
    if (!title || !startTime || !endTime) {
      return res.status(400).json({ message: "Title, start time, and end time are required" });
    }

    const newTask = {
      id: `task-${Date.now()}`,
      title,
      description: description || "",
      startTime,
      endTime,
      completed: false,
      priority: priority || "medium",
      category: category || "personal",
      date: date || new Date().toISOString().split('T')[0],
      durationHours: durationHours ? Number(durationHours) : null
    };

    tasks.push(newTask);
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: "Failed to create task", error: error.message });
  }
};

export const updateTask = (req, res) => {
  try {
    const { id } = req.params;
    const taskIndex = tasks.findIndex(t => t.id === id);

    if (taskIndex === -1) {
      return res.status(404).json({ message: "Task not found" });
    }

    const updatedTask = {
      ...tasks[taskIndex],
      ...req.body
    };

    tasks[taskIndex] = updatedTask;
    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: "Failed to update task", error: error.message });
  }
};

export const deleteTask = (req, res) => {
  try {
    const { id } = req.params;
    const taskIndex = tasks.findIndex(t => t.id === id);

    if (taskIndex === -1) {
      return res.status(404).json({ message: "Task not found" });
    }

    tasks = tasks.filter(t => t.id !== id);
    res.status(200).json({ message: "Task deleted successfully", id });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete task", error: error.message });
  }
};

export const clearAllTasks = (req, res) => {
  try {
    const { date } = req.query;
    if (date) {
      tasks = tasks.filter(t => t.date !== date);
    } else {
      tasks = [];
    }
    res.status(200).json({ message: "Tasks cleared successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to clear tasks", error: error.message });
  }
};
