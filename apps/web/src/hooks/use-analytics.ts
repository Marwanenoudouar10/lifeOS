import { useQuery } from '@tanstack/react-query';
import { analyticsApi, dashboardApi } from '@/lib/api-client';

export function useCompletionRate(days = 30) {
  return useQuery({ queryKey: ['analytics', 'completion-rate', days], queryFn: () => analyticsApi.getCompletionRate(days) });
}

export function useFocusTimeAnalytics(days = 30) {
  return useQuery({ queryKey: ['analytics', 'focus-time', days], queryFn: () => analyticsApi.getFocusTime(days) });
}

export function useMomentum() {
  return useQuery({ queryKey: ['analytics', 'momentum'], queryFn: analyticsApi.getMomentum });
}

export function useCategoryBreakdown() {
  return useQuery({ queryKey: ['analytics', 'category-breakdown'], queryFn: analyticsApi.getCategoryBreakdown });
}

export function useWellness() {
  return useQuery({ queryKey: ['analytics', 'wellness'], queryFn: analyticsApi.getWellness });
}

export function useTodayOverview() {
  return useQuery({ queryKey: ['dashboard', 'today'], queryFn: dashboardApi.getToday });
}

export function useUpcomingTasks() {
  return useQuery({ queryKey: ['dashboard', 'upcoming'], queryFn: dashboardApi.getUpcoming });
}

export function useActiveGoals() {
  return useQuery({ queryKey: ['dashboard', 'goals'], queryFn: dashboardApi.getGoals });
}
