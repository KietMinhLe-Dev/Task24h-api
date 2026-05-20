import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const jsonFilePath = path.join(__dirname, '../tasks_db.json');

export let activeDbMode = 'json';

// In-memory or JSON storage array
let memoryTasks = [];

// MongoDB model reference
let TaskModel = null;

const loadJsonTasks = async () => {
  try {
    const data = await fs.readFile(jsonFilePath, 'utf8');
    memoryTasks = data.trim() ? JSON.parse(data) : [];
  } catch (error) {
    if (error.code === 'ENOENT') {
      memoryTasks = [];
      await saveJsonTasks();
    } else {
      console.error('Error reading JSON DB file:', error);
      memoryTasks = [];
    }
  }
};

const saveJsonTasks = async () => {
  try {
    await fs.writeFile(jsonFilePath, JSON.stringify(memoryTasks, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing to JSON DB file:', error);
  }
};

const initMongoose = async () => {
  try {
    const mongoose = (await import('mongoose')).default;
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/task_tracker';
    await mongoose.connect(uri);
    
    const taskSchema = new mongoose.Schema({
      title: { type: String, required: true },
      description: { type: String, default: '' },
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
      completed: { type: Boolean, default: false },
      priority: { type: String, default: 'medium' },
      category: { type: String, default: 'personal' },
      date: { type: String, required: true },
      durationHours: { type: Number, default: null },
      durationMinutes: { type: Number, default: null },
      createdAt: { type: Date, default: Date.now }
    }, {
      toJSON: {
        transform: (doc, ret) => {
          ret.id = ret._id.toString();
          if (!ret.createdAt) ret.createdAt = doc._id.getTimestamp();
          delete ret._id;
          delete ret.__v;
          return ret;
        }
      },
      toObject: {
        transform: (doc, ret) => {
          ret.id = ret._id.toString();
          if (!ret.createdAt) ret.createdAt = doc._id.getTimestamp();
          delete ret._id;
          delete ret.__v;
          return ret;
        }
      }
    });
    
    TaskModel = mongoose.models.Task || mongoose.model('Task', taskSchema);
    activeDbMode = 'mongodb';
    console.log('✅ Khởi tạo thành công: Kết nối MongoDB thành công.');
  } catch (error) {
    console.error('❌ Lỗi kết nối MongoDB hoặc thiếu thư viện mongoose:', error.message);
    console.log('⚠️ Tự động chuyển đổi về chế độ JSON File DB.');
    activeDbMode = 'json';
    await loadJsonTasks();
  }
};

export const initDb = async () => {
  const mode = process.env.DB_MODE || 'json';
  
  if (mode === 'mongodb') {
    await initMongoose();
  } else if (mode === 'json') {
    activeDbMode = 'json';
    await loadJsonTasks();
    console.log('✅ Khởi tạo thành công: Sử dụng JSON File DB để lưu dữ liệu tại tasks_db.json.');
  } else {
    activeDbMode = 'memory';
    memoryTasks = [];
    console.log('✅ Khởi tạo thành công: Sử dụng RAM (In-Memory) để lưu dữ liệu. KHÔNG DÙNG DATABASE!');
  }
};

export const taskDb = {
  getTasks: async (filterDate) => {
    if (activeDbMode === 'mongodb') {
      const query = filterDate ? { date: filterDate } : {};
      const dbTasks = await TaskModel.find(query);
      return dbTasks.map(t => t.toObject());
    } else {
      let filtered = [...memoryTasks];
      if (filterDate) {
        filtered = filtered.filter(t => t.date === filterDate);
      }
      return filtered;
    }
  },

  createTask: async (taskData) => {
    if (activeDbMode === 'mongodb') {
      const newTask = new TaskModel({
        title: taskData.title.toUpperCase(),
        description: taskData.description || '',
        startTime: taskData.startTime,
        endTime: taskData.endTime,
        completed: false,
        priority: taskData.priority || 'medium',
        category: taskData.category || 'personal',
        date: taskData.date || new Date().toISOString().split('T')[0],
        durationHours: taskData.durationHours,
        durationMinutes: taskData.durationMinutes
      });
      await newTask.save();
      return newTask.toObject();
    } else {
      const newTask = {
        id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        title: taskData.title.toUpperCase(),
        description: taskData.description || '',
        startTime: taskData.startTime,
        endTime: taskData.endTime,
        completed: false,
        priority: taskData.priority || 'medium',
        category: taskData.category || 'personal',
        date: taskData.date || new Date().toISOString().split('T')[0],
        durationHours: taskData.durationHours,
        durationMinutes: taskData.durationMinutes,
        createdAt: new Date().toISOString()
      };
      
      memoryTasks.push(newTask);
      if (activeDbMode === 'json') {
        await saveJsonTasks();
      }
      return newTask;
    }
  },

  updateTask: async (id, updateData) => {
    if (activeDbMode === 'mongodb') {
      // If title is updated, uppercase it
      const dataToUpdate = { ...updateData };
      if (dataToUpdate.title) {
        dataToUpdate.title = dataToUpdate.title.toUpperCase();
      }
      
      const updated = await TaskModel.findByIdAndUpdate(id, dataToUpdate, { new: true });
      if (!updated) return null;
      return updated.toObject();
    } else {
      const index = memoryTasks.findIndex(t => t.id === id);
      if (index === -1) return null;

      const filteredUpdate = {};
      for (const key in updateData) {
        if (updateData[key] !== undefined) {
          filteredUpdate[key] = updateData[key];
        }
      }

      if (filteredUpdate.title) {
        filteredUpdate.title = filteredUpdate.title.toUpperCase();
      }

      memoryTasks[index] = { ...memoryTasks[index], ...filteredUpdate };
      if (activeDbMode === 'json') {
        await saveJsonTasks();
      }
      return memoryTasks[index];
    }
  },

  deleteTask: async (id) => {
    if (activeDbMode === 'mongodb') {
      const deleted = await TaskModel.findByIdAndDelete(id);
      if (!deleted) return null;
      return deleted.toObject();
    } else {
      const index = memoryTasks.findIndex(t => t.id === id);
      if (index === -1) return null;
      
      const deletedTask = memoryTasks[index];
      memoryTasks.splice(index, 1);
      if (activeDbMode === 'json') {
        await saveJsonTasks();
      }
      return deletedTask;
    }
  },

  clearAllTasks: async (filterDate) => {
    if (activeDbMode === 'mongodb') {
      const query = filterDate ? { date: filterDate } : {};
      await TaskModel.deleteMany(query);
      return true;
    } else {
      if (filterDate) {
        memoryTasks = memoryTasks.filter(t => t.date !== filterDate);
      } else {
        memoryTasks = [];
      }
      if (activeDbMode === 'json') {
        await saveJsonTasks();
      }
      return true;
    }
  }
};
