import { create } from 'zustand';
import apiClient from '../api/client';
import * as signalR from '@microsoft/signalr';

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
  connection: null,

  isSignalRConnected: false,

  initSignalR: async () => {
    if (get().connection) return;

    const isLocalDev = window.location.hostname === 'localhost' && window.location.port === '3000';
    const hubUrl = isLocalDev ? 'http://localhost:5000/taskhub' : '/taskhub';

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
         accessTokenFactory: () => localStorage.getItem('token')
      })
      .withAutomaticReconnect()
      .build();

    connection.on("TaskCreated", (task) => {
      set(state => {
        if (state.tasks.some(t => t.id === task.id)) return state;
        return { tasks: [...state.tasks, task] };
      });
    });

    connection.on("TaskUpdated", (task) => {
      set(state => ({
        tasks: state.tasks.map(t => t.id === task.id ? task : t)
      }));
    });

    connection.on("TaskMoved", (task) => {
      set(state => ({
        tasks: state.tasks.map(t => t.id === task.id ? task : t)
      }));
    });

    connection.on("TaskAssigned", (task) => {
      set(state => ({
        tasks: state.tasks.map(t => t.id === task.id ? task : t)
      }));
    });

    connection.on("WorkLogged", (log) => {
      get().fetchTasks(true);
    });

    connection.on("CommentAdded", (comment) => {
      console.log("Real-time Comment Received:", comment);
      set(state => ({
        tasks: state.tasks.map(t => {
          if (t.id.toString().toLowerCase() === comment.taskId.toString().toLowerCase()) {
            const comments = t.comments || [];
            if (comments.some(c => c.id === comment.id)) return t;
            return { ...t, comments: [comment, ...comments] };
          }
          return t;
        })
      }));
    });

    connection.on("TaskDeleted", (taskId) => {
      set(state => ({
        tasks: state.tasks.filter(t => t.id !== taskId)
      }));
    });

    try {
      await connection.start();
      set({ connection, isSignalRConnected: true });
      console.log("SignalR Connected");
    } catch (err) {
      console.error("SignalR Connection Error: ", err);
      set({ isSignalRConnected: false });
      setTimeout(get().initSignalR, 5000);
    }
  },

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
      // Do NOT manually add to state here.
      // The SignalR 'TaskCreated' event is the single source of truth.
      // This prevents the duplicate card bug.
      const newTask = await apiClient.post('/tasks', taskData);
      // Fallback: if SignalR hasn't added it yet (e.g. slow connection), add it now.
      set(state => {
        if (state.tasks.some(t => t.id === newTask.id)) return state;
        return { tasks: [...state.tasks, newTask] };
      });
      return newTask;
    } catch (error) {
      throw error;
    }
  },

  updateTask: async (taskId, updates) => {
    try {
      const updatedTask = await apiClient.put(`/tasks/${taskId}`, updates);
      // Update both by exact id match AND by signalR which uses .id
      set(state => ({
        tasks: state.tasks.map(task =>
          task.id.toString().toLowerCase() === taskId.toString().toLowerCase()
            ? { ...task, ...updatedTask }
            : task
        )
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
      await apiClient.post(`/tasks/${taskId}/assign`, { assigneeId });
      await get().fetchTasks(true);
    } catch (error) {
      throw error;
    }
  },

  addWorkLog: async (taskId, hours, description) => {
    try {
      const log = await apiClient.post(`/tasks/${taskId}/worklogs`, { hours, description });
      console.log("WorkLog Saved:", log);
      // Immediately fetch tasks for this user to ensure update is reflected
      await get().fetchTasks(true);
      return log;
    } catch (error) {
      throw error;
    }
  },

  addComment: async (taskId, content) => {
    try {
      const comment = await apiClient.post(`/tasks/${taskId}/comments`, { content });
      console.log("Comment Saved:", comment);
      // Manually add to state for current user for instant feedback
      set(state => ({
        tasks: state.tasks.map(t => {
          if (t.id.toString().toLowerCase() === taskId.toString().toLowerCase()) {
            const currentComments = t.comments || [];
            if (currentComments.some(c => c.id === comment.id)) return t;
            return { ...t, comments: [comment, ...currentComments] };
          }
          return t;
        })
      }));
      return comment;
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