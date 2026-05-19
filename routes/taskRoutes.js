import express from "express";
import { 
  getTasks, 
  createTask, 
  updateTask, 
  deleteTask, 
  clearAllTasks 
} from "../controllers/taskController.js";

const router = express.Router();

router.get("/", getTasks);
router.post("/", createTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);
router.delete("/", clearAllTasks);

export default router;
