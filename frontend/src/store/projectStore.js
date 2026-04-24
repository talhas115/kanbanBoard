import { create } from 'zustand';
import apiClient from '../api/client';

const useProjectStore = create((set, get) => ({
  projects: [],
  currentProject: null,
  loading: false,
  error: null,

  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get('/projects');
      set({ projects: response, loading: false });
      
      // Select first project by default if none selected
      if (response.length > 0 && !get().currentProject) {
        set({ currentProject: response[0] });
      }
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  setCurrentProject: (project) => {
    set({ currentProject: project });
  },

  createProject: async (name, key, description) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post('/projects', { name, key, description });
      set(state => ({ 
        projects: [response, ...state.projects],
        currentProject: response,
        loading: false 
      }));
      return response;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  deleteProject: async (id) => {
    set({ loading: true });
    try {
      await apiClient.delete(`/projects/${id}`);
      set(state => ({
        projects: state.projects.filter(p => p.id !== id),
        currentProject: state.currentProject?.id === id ? null : state.currentProject,
        loading: false
      }));
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  }
}));

export default useProjectStore;
