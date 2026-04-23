import { create } from 'zustand';
import apiClient from '../api/client';

const COLUMNS = [
  'Backlog',
  'Todo',
  'In Progress',
  'In Review',
  'QA',
  'Blocked',
  'Ready For Release',
  'Done'
];

const useTaskStore = create((set, get) => ({
  tasks: [],
  users: [],
  loading: false,
  error: null,

  fetchTasks: async (silent = false) => {
    if (!silent) set({ loading: true, error: null });
    try {
      const tasks = await apiClient.get('/tasks');
      set({ tasks, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchUsers: async () => {
    try {
      const users = await apiClient.get('/users');
      set({ users });
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  },

  createTask: async (taskData) => {
    try {
      const newTask = await apiClient.post('/tasks', taskData);
      set(state => ({ tasks: [...state.tasks, newTask] }));
      return newTask;
    } catch (error) {
      throw error;
    }
  },

  updateTask: async (taskId, updates) => {
    try {
      const updatedTask = await apiClient.put(`/tasks/${taskId}`, updates);
      set(state => ({
        tasks: state.tasks.map(task => task.id === taskId ? updatedTask : task)
      }));
      return updatedTask;
    } catch (error) {
      throw error;
    }
  },

  deleteTask: async (taskId) => {
    try {
      await apiClient.delete(`/tasks/${taskId}`);
      set(state => ({
        tasks: state.tasks.filter(task => task.id !== taskId)
      }));
    } catch (error) {
      throw error;
    }
  },

  moveTask: async (taskId, newOrder, newStatus) => {
    try {
      await apiClient.post(`/tasks/${taskId}/move`, { newOrder, newStatus });
      await get().fetchTasks();
    } catch (error) {
      throw error;
    }
  },

  assignTask: async (taskId, assigneeId) => {
    try {
      await apiClient.post(`/tasks/${taskId}/assign`, assigneeId);
      await get().fetchTasks();
    } catch (error) {
      throw error;
    }
  },

  addWorkLog: async (taskId, hours, description) => {
    try {
      await apiClient.post(`/tasks/${taskId}/worklogs`, { hours, description });
      await get().fetchTasks(); // Refresh to show new log and updated total time
    } catch (error) {
      throw error;
    }
  },

  getTimeReport: async () => {
    try {
      const report = await apiClient.get('/tasks/reports/time');
      return report;
    } catch (error) {
      throw error;
    }
  },

  getTasksByColumn: (column) => {
    const tasks = get().tasks;
    return tasks
      .filter(task => task.status === column)
      .sort((a, b) => a.order - b.order);
  }
}));

export default useTaskStore;