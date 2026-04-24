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

  fetchTasks: async (projectId = null, silent = false) => {
    if (typeof projectId === 'boolean') {
      silent = projectId;
      projectId = null;
    }
    if (!silent) set({ loading: true, error: null });
    try {
      const url = projectId ? `/tasks?projectId=${projectId}` : '/tasks';
      const tasks = await apiClient.get(url);
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

  moveTask: async (taskId, newOrder, newStatus, projectId = null) => {
    // Optimistic update
    const oldTasks = get().tasks;
    const taskIndex = oldTasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    const task = { ...oldTasks[taskIndex], status: newStatus, order: newOrder };
    const updatedTasks = [...oldTasks];
    updatedTasks[taskIndex] = task;

    set({ tasks: updatedTasks });

    try {
      await apiClient.post(`/tasks/${taskId}/move`, { newOrder, newStatus });
      // We don't need a full silent refetch immediately since we updated state
      // But we can do it after a delay to ensure sync
      setTimeout(() => get().fetchTasks(projectId, true), 2000);
    } catch (error) {
      // Rollback on error
      set({ tasks: oldTasks, error: 'Failed to sync drag and drop. Reverting...' });
      throw error;
    }
  },

  assignTask: async (taskId, assigneeId, projectId = null) => {
    try {
      await apiClient.post(`/tasks/${taskId}/assign`, assigneeId);
      await get().fetchTasks(projectId, true);
    } catch (error) {
      throw error;
    }
  },

  addWorkLog: async (taskId, hours, description, projectId = null) => {
    try {
      await apiClient.post(`/tasks/${taskId}/worklogs`, { hours, description });
      await get().fetchTasks(projectId, true); // Refresh to show new log and updated total time
    } catch (error) {
      throw error;
    }
  },

  addComment: async (taskId, content, projectId = null) => {
    try {
      await apiClient.post(`/tasks/${taskId}/comments`, { content });
      await get().fetchTasks(projectId, true);
    } catch (error) {
      throw error;
    }
  },

  getTimeReport: async (projectId = null) => {
    try {
      const url = projectId ? `/tasks/reports/time?projectId=${projectId}` : '/tasks/reports/time';
      const report = await apiClient.get(url);
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