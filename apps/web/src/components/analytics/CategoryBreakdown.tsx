'use client';

import { PieChartIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCategoryBreakdown } from '@/hooks/use-analytics';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';

const COLORS = [
  'hsl(221, 83%, 53%)',  // blue
  'hsl(262, 83%, 58%)',  // purple
  'hsl(142, 71%, 45%)',  // green
  'hsl(38, 92%, 50%)',   // amber
  'hsl(0, 84%, 60%)',    // red
  'hsl(199, 89%, 48%)',  // cyan
  'hsl(326, 80%, 53%)',  // pink
  'hsl(24, 95%, 53%)',   // orange
];

function asArray(d: any): any[] {
  if (Array.isArray(d)) return d;
  if (d && Array.isArray(d.data)) return d.data;
  return [];
}

export function CategoryBreakdown() {
  const { data, isLoading, error } = useCategoryBreakdown();

  if (error) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <p className="text-sm text-destructive">Failed to load category data.</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = asArray(data);
  const hasData = chartData.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChartIcon className="h-5 w-5" />
          Category Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : !hasData ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-sm text-muted-foreground">
              No category data available. Categorize your tasks to see the breakdown.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="totalTasks"
                  nameKey="name"
                >
                  {chartData.map((_: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload?.[0]) {
                      const entry = payload[0].payload;
                      return (
                        <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
                          <p className="font-semibold">
                            {entry.name || 'Uncategorized'}
                          </p>
                          <p className="text-muted-foreground">
                            {entry.totalTasks} tasks ({entry.completedTasks} completed)
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center">
              {chartData.map((entry: any, index: number) => (
                <div key={index} className="flex items-center gap-1.5 text-sm">
                  <div
                    className="h-3 w-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-muted-foreground">
                    {entry.name || 'Uncategorized'}
                  </span>
                  <span className="font-medium">({entry.totalTasks})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
