/**
 * TaskPulse API Service with Offline Sync Support
 * Package: com.samdrashti.file1
 */

import { Task, Category, RoutineTemplate, UserProfile, Badge, UserGuidesState } from '../types/index';

const API_BASE = '/api';

export const api = {
  async getHealth(flavor: string = 'dev') {
    const res = await fetch(`${API_BASE}/health?flavor=${flavor}`);
    return res.json();
  },

  async passwordlessLogin(email: string, method: 'magic_link' | 'otp' | 'passkey' = 'magic_link') {
    const res = await fetch(`${API_BASE}/auth/passwordless`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, method }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Passwordless login failed');
    }
    return res.json();
  },

  async socialLogin(provider: 'google' | 'github') {
    const res = await fetch(`${API_BASE}/auth/social`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Social login failed');
    }
    return res.json();
  },

  async getProfile(): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/user/profile`);
    return res.json();
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/user/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  async updateUserGuides(guideId: string, action: 'complete' | 'skip' | 'skip_all' | 'reset'): Promise<UserGuidesState> {
    const res = await fetch(`${API_BASE}/user/guides`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guideId, action }),
    });
    return res.json();
  },

  async getTasks(): Promise<Task[]> {
    const res = await fetch(`${API_BASE}/tasks`);
    return res.json();
  },

  async createTask(taskData: Partial<Task>): Promise<Task> {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create task');
    }
    return res.json();
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<{ task: Task; pointsEarned: number; profile: UserProfile; badges: Badge[] }> {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  async deleteTask(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  async getCategories(): Promise<Category[]> {
    const res = await fetch(`${API_BASE}/categories`);
    return res.json();
  },

  async createCategory(categoryData: Partial<Category>): Promise<Category> {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(categoryData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create category');
    }
    return res.json();
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    return res.json();
  },

  async getRoutines(): Promise<RoutineTemplate[]> {
    const res = await fetch(`${API_BASE}/routines`);
    return res.json();
  },

  async activateRoutine(routineId: string, activate: boolean) {
    const res = await fetch(`${API_BASE}/routines/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ routineId, activate }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to toggle routine');
    }
    return res.json();
  },

  async completeFocusSession(taskId?: string, minutes: number = 25) {
    const res = await fetch(`${API_BASE}/focus/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, minutes }),
    });
    return res.json();
  },

  async getGamification() {
    const res = await fetch(`${API_BASE}/gamification`);
    return res.json();
  },

  async getSubscription() {
    const res = await fetch(`${API_BASE}/subscription`);
    return res.json();
  },

  async extendSubscription() {
    const res = await fetch(`${API_BASE}/subscription/extend`, {
      method: 'POST',
    });
    return res.json();
  },

  async getScratchNotes() {
    const res = await fetch(`${API_BASE}/scratchpad`);
    return res.json();
  },

  async addScratchNote(text: string) {
    const res = await fetch(`${API_BASE}/scratchpad`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    return res.json();
  },

  async deleteScratchNote(id: string) {
    const res = await fetch(`${API_BASE}/scratchpad/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },
};

