'use client';

import { TodayOverview } from './TodayOverview';
import { UpcomingTasks } from './UpcomingTasks';
import { ActiveGoals } from './ActiveGoals';
import { RoutinesStatus } from './RoutinesStatus';
import { ProgressCharts } from './ProgressCharts';

export function Dashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* First row: Overview + Upcoming */}
        <div className="lg:col-span-2">
          <TodayOverview />
        </div>
        <div>
          <RoutinesStatus />
        </div>

        {/* Second row: Tasks + Goals */}
        <div>
          <UpcomingTasks />
        </div>
        <div>
          <ActiveGoals />
        </div>
        <div>
          <ProgressCharts />
        </div>
      </div>
    </div>
  );
}
