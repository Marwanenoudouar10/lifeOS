import type { ProjectStatus } from './common.js';

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  color: string;
  deadline: string | null;
  sortOrder: number;
  categoryId: string | null;
  goalId: string | null;
  category?: { id: string; name: string; color: string } | null;
  goal?: { id: string; title: string } | null;
  milestones?: Milestone[];
  _count?: { tasks: number };
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string | null;
  isCompleted: boolean;
  dueDate: string | null;
  sortOrder: number;
  projectId: string | null;
  goalId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  color?: string;
  deadline?: string;
  categoryId?: string;
  goalId?: string;
}

export interface UpdateProjectInput extends Partial<CreateProjectInput> {
  status?: ProjectStatus;
  sortOrder?: number;
}
