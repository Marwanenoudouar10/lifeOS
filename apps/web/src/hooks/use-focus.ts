import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { focusApi } from '@/lib/api-client';

export function useActiveFocus() {
  return useQuery({ queryKey: ['focus', 'active'], queryFn: focusApi.getActive });
}

export function useFocusHistory(days = 7) {
  return useQuery({ queryKey: ['focus', 'history', days], queryFn: () => focusApi.getHistory(days) });
}

export function useStartFocus() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: focusApi.start, onSuccess: () => qc.invalidateQueries({ queryKey: ['focus'] }) });
}

export function usePauseFocus() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: focusApi.pause, onSuccess: () => qc.invalidateQueries({ queryKey: ['focus'] }) });
}

export function useResumeFocus() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: focusApi.resume, onSuccess: () => qc.invalidateQueries({ queryKey: ['focus'] }) });
}

export function useCompleteFocus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: any }) => focusApi.complete(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['focus'] }),
  });
}
