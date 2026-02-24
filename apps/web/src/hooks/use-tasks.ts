import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '@/lib/api-client';

export function useTasks(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: () => taskApi.getAll(params),
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: () => taskApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: taskApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => taskApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: taskApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useEisenhowerMatrix() {
  return useQuery({
    queryKey: ['tasks', 'eisenhower'],
    queryFn: taskApi.getEisenhower,
  });
}

export function useTaskSuggestions() {
  return useQuery({
    queryKey: ['tasks', 'suggestions'],
    queryFn: taskApi.getSuggestions,
  });
}

export function useBrainDump() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: taskApi.brainDump,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}
