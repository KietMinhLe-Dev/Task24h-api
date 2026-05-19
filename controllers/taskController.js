let tasks = [];

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
    const { title, description, startTime, endTime, priority, category, date, durationHours, durationMinutes } = req.body;
    
    if (!title || !startTime || !endTime) {
      return res.status(400).json({ message: "Title, start time, and end time are required" });
    }

    const hours = durationHours ? Number(durationHours) : 0;
    const mins = durationMinutes ? Number(durationMinutes) : 0;
    const totalMin = (hours * 60) + mins;

    if ((durationHours || durationMinutes) && (totalMin < 1 || totalMin > 1440)) {
      return res.status(400).json({ message: "Thời hạn đếm ngược chỉ được từ 1 phút đến 24 giờ" });
    }

    const newTask = {
      id: `task-${Date.now()}`,
      title: title.toUpperCase(),
      description: description || "",
      startTime,
      endTime,
      completed: false,
      priority: priority || "medium",
      category: category || "personal",
      date: date || new Date().toISOString().split('T')[0],
      durationHours: durationHours ? Number(durationHours) : null,
      durationMinutes: durationMinutes ? Number(durationMinutes) : null
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

    const { title, durationHours, durationMinutes } = req.body;
    const hours = durationHours ? Number(durationHours) : 0;
    const mins = durationMinutes ? Number(durationMinutes) : 0;
    const totalMin = (hours * 60) + mins;

    if ((durationHours || durationMinutes) && (totalMin < 1 || totalMin > 1440)) {
      return res.status(400).json({ message: "Thời hạn đếm ngược chỉ được từ 1 phút đến 24 giờ" });
    }

    const updatedTask = {
      ...tasks[taskIndex],
      ...req.body,
      title: title ? title.toUpperCase() : tasks[taskIndex].title,
      durationHours: req.body.durationHours !== undefined 
        ? (req.body.durationHours ? Number(req.body.durationHours) : null)
        : tasks[taskIndex].durationHours,
      durationMinutes: req.body.durationMinutes !== undefined 
        ? (req.body.durationMinutes ? Number(req.body.durationMinutes) : null)
        : tasks[taskIndex].durationMinutes
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
