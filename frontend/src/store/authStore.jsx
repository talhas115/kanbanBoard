import { create } from 'zustand';
import apiClient from '../api/client';

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),

  login: async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify({ id: response.userId, email: response.email }));
      set({ user: { id: response.userId, email: response.email }, token: response.token, isAuthenticated: true });
      return response;
    } catch (error) {
      throw error;
    }
  },

  register: async (email, password) => {
    try {
      const response = await apiClient.post('/auth/register', { email, password });
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify({ id: response.userId, email: response.email }));
      set({ user: { id: response.userId, email: response.email }, token: response.token, isAuthenticated: true });
      return response;
    } catch (error) {
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, isAuthenticated: false });
  }
}));

export default useAuthStore;