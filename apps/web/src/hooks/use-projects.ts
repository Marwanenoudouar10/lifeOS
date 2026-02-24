import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectApi } from '@/lib/api-client';

export function useProjects() {
  return useQuery({ queryKey: ['projects'], queryFn: projectApi.getAll });
}

export function useProject(id: string) {
  return useQuery({ queryKey: ['projects', id], queryFn: () => projectApi.getById(id), enabled: !!id });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: projectApi.create, onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }) });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => projectApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: projectApi.delete, onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }) });
}
