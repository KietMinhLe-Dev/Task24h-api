import { taskDb } from "../config/database.js";

export const getTasks = async (req, res) => {
  try {
    const { date } = req.query;
    const dbTasks = await taskDb.getTasks(date);
    // Sort tasks by start time chronologically (safely handle missing startTime)
    dbTasks.sort((a, b) => {
      const timeA = a.startTime || "";
      const timeB = b.startTime || "";
      return timeA.localeCompare(timeB);
    });
    res.status(200).json(dbTasks);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tasks", error: error.message });
  }
};

export const createTask = async (req, res) => {
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

    const newTask = await taskDb.createTask({
      title,
      description,
      startTime,
      endTime,
      priority,
      category,
      date,
      durationHours,
      durationMinutes
    });

    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: "Failed to create task", error: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, durationHours, durationMinutes } = req.body;
    
    const hours = durationHours ? Number(durationHours) : 0;
    const mins = durationMinutes ? Number(durationMinutes) : 0;
    const totalMin = (hours * 60) + mins;

    if ((durationHours || durationMinutes) && (totalMin < 1 || totalMin > 1440)) {
      return res.status(400).json({ message: "Thời hạn đếm ngược chỉ được từ 1 phút đến 24 giờ" });
    }

    const updatedTask = await taskDb.updateTask(id, req.body);

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: "Failed to update task", error: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTask = await taskDb.deleteTask(id);

    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ message: "Task deleted successfully", id });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete task", error: error.message });
  }
};

export const clearAllTasks = async (req, res) => {
  try {
    const { date } = req.query;
    await taskDb.clearAllTasks(date);
    res.status(200).json({ message: "Tasks cleared successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to clear tasks", error: error.message });
  }
};

