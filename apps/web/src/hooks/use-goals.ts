import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { goalApi } from '@/lib/api-client';

export function useGoals() {
  return useQuery({ queryKey: ['goals'], queryFn: goalApi.getAll });
}

export function useGoal(id: string) {
  return useQuery({ queryKey: ['goals', id], queryFn: () => goalApi.getById(id), enabled: !!id });
}

export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: goalApi.create, onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }) });
}

export function useUpdateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => goalApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
  });
}

export function useDeleteGoal() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: goalApi.delete, onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }) });
}
