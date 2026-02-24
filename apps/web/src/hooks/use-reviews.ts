import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewApi } from '@/lib/api-client';

export function useDailyReview(date: string) {
  return useQuery({ queryKey: ['reviews', 'daily', date], queryFn: () => reviewApi.getDaily(date), enabled: !!date });
}

export function useCreateDailyReview() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: reviewApi.createDaily, onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews'] }) });
}

export function useGenerateDailyReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reviewApi.generateDaily,
    onSuccess: (_, date) => qc.invalidateQueries({ queryKey: ['reviews', 'daily', date] }),
  });
}

export function useWeeklyReview(weekStart: string) {
  return useQuery({ queryKey: ['reviews', 'weekly', weekStart], queryFn: () => reviewApi.getWeekly(weekStart), enabled: !!weekStart });
}

export function useCreateWeeklyReview() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: reviewApi.createWeekly, onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews'] }) });
}

export function useGenerateWeeklyReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reviewApi.generateWeekly,
    onSuccess: (_, weekStart) => qc.invalidateQueries({ queryKey: ['reviews', 'weekly', weekStart] }),
  });
}
