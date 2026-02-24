const API_BASE = '/api/v1';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || error.message || 'Request failed');
  }

  if (res.status === 204) return undefined as T;
  const json = await res.json();
  // Unwrap { data: ... } envelope from API responses
  if (json && typeof json === 'object' && 'data' in json && Object.keys(json).length <= 2) {
    return json.data as T;
  }
  return json as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

// ── Task API ──
export const taskApi = {
  getAll: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get<any[]>(`/tasks${qs}`);
  },
  getById: (id: string) => api.get<any>(`/tasks/${id}`),
  create: (data: any) => api.post<any>('/tasks', data),
  update: (id: string, data: any) => api.patch<any>(`/tasks/${id}`, data),
  delete: (id: string) => api.delete(`/tasks/${id}`),
  reorder: (id: string, sortOrder: number) => api.patch<any>(`/tasks/${id}/reorder`, { sortOrder }),
  getEisenhower: () => api.get<any>('/tasks/eisenhower'),
  getSuggestions: () => api.get<any[]>('/tasks/suggestions'),
  brainDump: (entries: { raw: string }[]) => api.post<any[]>('/tasks/brain-dump', { entries }),
};

// ── Project API ──
export const projectApi = {
  getAll: () => api.get<any[]>('/projects'),
  getById: (id: string) => api.get<any>(`/projects/${id}`),
  create: (data: any) => api.post<any>('/projects', data),
  update: (id: string, data: any) => api.patch<any>(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
  addMilestone: (projectId: string, data: any) => api.post<any>(`/projects/${projectId}/milestones`, data),
  updateMilestone: (projectId: string, id: string, data: any) => api.patch<any>(`/projects/${projectId}/milestones/${id}`, data),
  deleteMilestone: (projectId: string, id: string) => api.delete(`/projects/${projectId}/milestones/${id}`),
};

// ── Goal API ──
export const goalApi = {
  getAll: () => api.get<any[]>('/goals'),
  getById: (id: string) => api.get<any>(`/goals/${id}`),
  create: (data: any) => api.post<any>('/goals', data),
  update: (id: string, data: any) => api.patch<any>(`/goals/${id}`, data),
  delete: (id: string) => api.delete(`/goals/${id}`),
  computeProgress: (id: string) => api.post<any>(`/goals/${id}/compute-progress`),
};

// ── Habit API ──
export const habitApi = {
  getAll: () => api.get<any[]>('/habits'),
  getById: (id: string) => api.get<any>(`/habits/${id}`),
  create: (data: any) => api.post<any>('/habits', data),
  update: (id: string, data: any) => api.patch<any>(`/habits/${id}`, data),
  delete: (id: string) => api.delete(`/habits/${id}`),
  checkIn: (id: string, data: any) => api.post<any>(`/habits/${id}/check-in`, data),
  getCalendar: (id: string, start: string, end: string) =>
    api.get<any[]>(`/habits/${id}/calendar?start=${start}&end=${end}`),
  getStreaks: (id: string) => api.get<any>(`/habits/${id}/streaks`),
};

// ── Focus API ──
export const focusApi = {
  start: (data?: any) => api.post<any>('/focus/start', data),
  pause: (id: string) => api.post<any>(`/focus/${id}/pause`),
  resume: (id: string) => api.post<any>(`/focus/${id}/resume`),
  complete: (id: string, data?: any) => api.post<any>(`/focus/${id}/complete`, data),
  getActive: () => api.get<any>('/focus/active'),
  getHistory: (days?: number) => api.get<any[]>(`/focus/history?days=${days || 7}`),
};

// ── Plan API ──
export const planApi = {
  getByDate: (date: string) => api.get<any>(`/plans/${date}`),
  generate: (date: string) => api.post<any>(`/plans/${date}/generate`),
  addItem: (date: string, data: any) => api.post<any>(`/plans/${date}/items`, data),
  updateItem: (date: string, itemId: string, data: any) => api.patch<any>(`/plans/${date}/items/${itemId}`, data),
  removeItem: (date: string, itemId: string) => api.delete(`/plans/${date}/items/${itemId}`),
  checkOverload: (date: string) => api.get<any>(`/plans/${date}/overload`),
  rollover: (date: string) => api.post<any>(`/plans/${date}/rollover`),
  getTimeBlocks: (date: string) => api.get<any[]>(`/plans/${date}/time-blocks`),
  addTimeBlock: (date: string, data: any) => api.post<any>(`/plans/${date}/time-blocks`, data),
  removeTimeBlock: (date: string, blockId: string) => api.delete(`/plans/${date}/time-blocks/${blockId}`),
};

// ── Review API ──
export const reviewApi = {
  getDaily: (date: string) => api.get<any>(`/reviews/daily/${date}`),
  createDaily: (data: any) => api.post<any>('/reviews/daily', data),
  generateDaily: (date: string) => api.post<any>(`/reviews/daily/${date}/generate`),
  getWeekly: (weekStart: string) => api.get<any>(`/reviews/weekly/${weekStart}`),
  createWeekly: (data: any) => api.post<any>('/reviews/weekly', data),
  generateWeekly: (weekStart: string) => api.post<any>(`/reviews/weekly/${weekStart}/generate`),
};

// ── Tags & Categories ──
export const tagApi = {
  getAll: () => api.get<any[]>('/tags'),
  create: (data: any) => api.post<any>('/tags', data),
  update: (id: string, data: any) => api.patch<any>(`/tags/${id}`, data),
  delete: (id: string) => api.delete(`/tags/${id}`),
};

export const categoryApi = {
  getAll: () => api.get<any[]>('/categories'),
  create: (data: any) => api.post<any>('/categories', data),
  update: (id: string, data: any) => api.patch<any>(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

// ── Reminders ──
export const reminderApi = {
  getAll: () => api.get<any[]>('/reminders'),
  getDue: () => api.get<any[]>('/reminders/due'),
  create: (data: any) => api.post<any>('/reminders', data),
  dismiss: (id: string) => api.post<any>(`/reminders/${id}/dismiss`),
  delete: (id: string) => api.delete(`/reminders/${id}`),
};

// ── Dashboard ──
export const dashboardApi = {
  getToday: () => api.get<any>('/dashboard/today'),
  getUpcoming: () => api.get<any[]>('/dashboard/upcoming'),
  getGoals: () => api.get<any[]>('/dashboard/goals'),
};

// ── Analytics ──
export const analyticsApi = {
  getCompletionRate: (days?: number) => api.get<any>(`/analytics/completion-rate?days=${days || 30}`),
  getFocusTime: (days?: number) => api.get<any>(`/analytics/focus-time?days=${days || 30}`),
  getMomentum: () => api.get<any>('/analytics/momentum'),
  getCategoryBreakdown: () => api.get<any>('/analytics/category-breakdown'),
  getWellness: () => api.get<any>('/analytics/wellness'),
};
