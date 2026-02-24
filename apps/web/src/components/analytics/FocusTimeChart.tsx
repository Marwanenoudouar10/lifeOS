'use client';

import { Timer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useFocusTimeAnalytics } from '@/hooks/use-analytics';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

function asArray(d: any): any[] {
  if (Array.isArray(d)) return d;
  if (d && Array.isArray(d.data)) return d.data;
  return [];
}

export function FocusTimeChart() {
  const { data, isLoading, error } = useFocusTimeAnalytics(30);

  if (error) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <p className="text-sm text-destructive">Failed to load focus time data.</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = asArray(data);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timer className="h-5 w-5" />
          Focus Time
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-sm text-muted-foreground">
              No focus session data yet. Start a focus session to track your deep work.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-muted/30"
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickFormatter={(val: string) => {
                  const d = new Date(val);
                  return d.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  });
                }}
                className="text-muted-foreground"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(val: number) => `${val}m`}
                className="text-muted-foreground"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload?.[0]) {
                    const minutes = payload[0].value as number;
                    const hours = Math.floor(minutes / 60);
                    const mins = minutes % 60;
                    const formatted = hours > 0
                      ? `${hours}h ${mins}m`
                      : `${mins}m`;
                    return (
                      <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
                        <p className="text-muted-foreground">
                          {payload[0].payload.date}
                        </p>
                        <p className="font-semibold">{formatted} focused</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="totalMinutes"
                fill="hsl(var(--chart-2, 200 80% 50%))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
