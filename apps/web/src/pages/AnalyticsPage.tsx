import { CompletionRate } from '@/components/analytics/CompletionRate';
import { WeeklyMomentum } from '@/components/analytics/WeeklyMomentum';
import { FocusTimeChart } from '@/components/analytics/FocusTimeChart';
import { CategoryBreakdown } from '@/components/analytics/CategoryBreakdown';

export default function AnalyticsPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Analytics</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <CompletionRate />
        <WeeklyMomentum />
        <FocusTimeChart />
        <CategoryBreakdown />
      </div>
    </div>
  );
}
