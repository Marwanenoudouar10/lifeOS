import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { planApi } from '@/lib/api-client';

export function usePlan(date: string) {
  return useQuery({ queryKey: ['plans', date], queryFn: () => planApi.getByDate(date), enabled: !!date });
}

export function useGeneratePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: planApi.generate,
    onSuccess: (_, date) => qc.invalidateQueries({ queryKey: ['plans', date] }),
  });
}

export function useAddPlanItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ date, data }: { date: string; data: any }) => planApi.addItem(date, data),
    onSuccess: (_, { date }) => qc.invalidateQueries({ queryKey: ['plans', date] }),
  });
}

export function useRemovePlanItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ date, itemId }: { date: string; itemId: string }) => planApi.removeItem(date, itemId),
    onSuccess: (_, { date }) => qc.invalidateQueries({ queryKey: ['plans', date] }),
  });
}

export function useOverloadCheck(date: string) {
  return useQuery({ queryKey: ['plans', date, 'overload'], queryFn: () => planApi.checkOverload(date), enabled: !!date });
}
