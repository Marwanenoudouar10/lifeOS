import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { habitApi } from '@/lib/api-client';

export function useHabits() {
  return useQuery({ queryKey: ['habits'], queryFn: habitApi.getAll });
}

export function useHabit(id: string) {
  return useQuery({ queryKey: ['habits', id], queryFn: () => habitApi.getById(id), enabled: !!id });
}

export function useCreateHabit() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: habitApi.create, onSuccess: () => qc.invalidateQueries({ queryKey: ['habits'] }) });
}

export function useUpdateHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => habitApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['habits'] }),
  });
}

export function useDeleteHabit() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: habitApi.delete, onSuccess: () => qc.invalidateQueries({ queryKey: ['habits'] }) });
}

export function useHabitCheckIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => habitApi.checkIn(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['habits'] }),
  });
}

export function useHabitCalendar(id: string, start: string, end: string) {
  return useQuery({
    queryKey: ['habits', id, 'calendar', start, end],
    queryFn: () => habitApi.getCalendar(id, start, end),
    enabled: !!id,
  });
}
