import { TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCompletionRate, useFocusTimeAnalytics } from '@/hooks/use-analytics';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

function asArray(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
}

export function ProgressCharts() {
  const { data: completionRaw, isLoading: completionLoading } = useCompletionRate(7);
  const { data: focusRaw, isLoading: focusLoading } = useFocusTimeAnalytics(7);

  const isLoading = completionLoading || focusLoading;
  const completionData = asArray(completionRaw);
  const focusData = asArray(focusRaw);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          7-Day Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <p className="mb-2 text-xs text-muted-foreground">Completion Rate</p>
              {completionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={80}>
                  <LineChart data={completionData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                    <XAxis dataKey="date" hide />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload?.[0]) {
                          return (
                            <div className="rounded-md border bg-popover px-3 py-1.5 text-xs shadow-sm">
                              <p>{payload[0].payload.date}</p>
                              <p className="font-medium">{payload[0].value}%</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line type="monotone" dataKey="rate" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="py-4 text-center text-xs text-muted-foreground">No data yet</p>
              )}
            </div>
            <div>
              <p className="mb-2 text-xs text-muted-foreground">Focus Minutes</p>
              {focusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={80}>
                  <LineChart data={focusData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                    <XAxis dataKey="date" hide />
                    <YAxis hide />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload?.[0]) {
                          return (
                            <div className="rounded-md border bg-popover px-3 py-1.5 text-xs shadow-sm">
                              <p>{payload[0].payload.date}</p>
                              <p className="font-medium">{payload[0].value}m</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line type="monotone" dataKey="totalMinutes" stroke="hsl(220, 80%, 50%)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="py-4 text-center text-xs text-muted-foreground">No data yet</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
