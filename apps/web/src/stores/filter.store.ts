import { create } from 'zustand';
import type { TaskStatus, TaskPriority, Context } from '@lifeos/shared';

interface FilterState {
  status: TaskStatus | '';
  priority: TaskPriority | '';
  categoryId: string;
  projectId: string;
  context: Context | '';
  search: string;
  setStatus: (status: TaskStatus | '') => void;
  setPriority: (priority: TaskPriority | '') => void;
  setCategoryId: (id: string) => void;
  setProjectId: (id: string) => void;
  setContext: (context: Context | '') => void;
  setSearch: (search: string) => void;
  clearFilters: () => void;
  getActiveFilters: () => Record<string, string>;
}

export const useFilterStore = create<FilterState>((set, get) => ({
  status: '',
  priority: '',
  categoryId: '',
  projectId: '',
  context: '',
  search: '',
  setStatus: (status) => set({ status }),
  setPriority: (priority) => set({ priority }),
  setCategoryId: (id) => set({ categoryId: id }),
  setProjectId: (id) => set({ projectId: id }),
  setContext: (context) => set({ context }),
  setSearch: (search) => set({ search }),
  clearFilters: () => set({ status: '', priority: '', categoryId: '', projectId: '', context: '', search: '' }),
  getActiveFilters: () => {
    const state = get();
    const params: Record<string, string> = {};
    if (state.status) params.status = state.status;
    if (state.priority) params.priority = state.priority;
    if (state.categoryId) params.categoryId = state.categoryId;
    if (state.projectId) params.projectId = state.projectId;
    if (state.context) params.context = state.context;
    if (state.search) params.search = state.search;
    return params;
  },
}));
