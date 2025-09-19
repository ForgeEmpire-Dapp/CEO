const fs = require('fs').promises;
const path = require('path');

class TaskManager {
  constructor(logger) {
    this.logger = logger;
    this.tasksFile = path.join(__dirname, '..', '..', 'data', 'tasks.json');
    this.tasks = [];
    this.initialize();
  }

  async initialize() {
    try {
      // Ensure data directory exists
      const dataDir = path.join(__dirname, '..', '..', 'data');
      try {
        await fs.access(dataDir);
      } catch {
        await fs.mkdir(dataDir, { recursive: true });
      }

      // Load tasks from file or create empty file
      try {
        const data = await fs.readFile(this.tasksFile, 'utf8');
        this.tasks = JSON.parse(data);
      } catch (error) {
        // File doesn't exist or is invalid, create empty tasks array
        this.tasks = [];
        await this.saveTasks();
      }
    } catch (error) {
      this.logger.error('Failed to initialize task manager', { error: error.message });
    }
  }

  async saveTasks() {
    try {
      await fs.writeFile(this.tasksFile, JSON.stringify(this.tasks, null, 2));
    } catch (error) {
      this.logger.error('Failed to save tasks', { error: error.message });
      throw error;
    }
  }

  async createTask(taskData) {
    try {
      const task = {
        id: this.generateId(),
        ...taskData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.tasks.push(task);
      await this.saveTasks();

      if (this.logger) {
        this.logger.info('Task created', { taskId: task.id, assignedTo: task.assignedTo });
      }

      return task;
    } catch (error) {
      this.logger.error('Failed to create task', { error: error.message });
      throw error;
    }
  }

  async getAllTasks() {
    return this.tasks;
  }

  async getTaskById(id) {
    return this.tasks.find(task => task.id === id);
  }

  async updateTask(id, updates) {
    try {
      const taskIndex = this.tasks.findIndex(task => task.id === id);
      if (taskIndex === -1) {
        throw new Error('Task not found');
      }

      this.tasks[taskIndex] = {
        ...this.tasks[taskIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      await this.saveTasks();

      if (this.logger) {
        this.logger.info('Task updated', { taskId: id });
      }

      return this.tasks[taskIndex];
    } catch (error) {
      this.logger.error('Failed to update task', { error: error.message, taskId: id });
      throw error;
    }
  }

  async deleteTask(id) {
    try {
      const taskIndex = this.tasks.findIndex(task => task.id === id);
      if (taskIndex === -1) {
        throw new Error('Task not found');
      }

      const deletedTask = this.tasks.splice(taskIndex, 1)[0];
      await this.saveTasks();

      if (this.logger) {
        this.logger.info('Task deleted', { taskId: id });
      }

      return deletedTask;
    } catch (error) {
      this.logger.error('Failed to delete task', { error: error.message, taskId: id });
      throw error;
    }
  }

  async getTasksByAssignee(assignee) {
    return this.tasks.filter(task => task.assignedTo === assignee);
  }

  async getTasksByStatus(status) {
    return this.tasks.filter(task => task.status === status);
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

module.exports = TaskManager;