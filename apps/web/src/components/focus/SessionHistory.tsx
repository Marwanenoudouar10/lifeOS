'use client';

import { Clock, FileText, Link2, Inbox } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useFocusHistory } from '@/hooks/use-focus';
import type { FocusSession } from '@lifeos/shared';

function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function SessionHistory() {
  const { data: sessions, isLoading, error } = useFocusHistory(30);

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-destructive">Failed to load session history.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Session History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : !sessions || sessions.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <Inbox className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              No focus sessions recorded yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session: FocusSession) => (
              <div
                key={session.id}
                className="flex items-start gap-4 rounded-lg border p-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">
                      {formatDate(session.startedAt)}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {formatDuration(session.totalSeconds)}
                    </Badge>
                    {session.status === 'COMPLETED' && (
                      <Badge className="text-xs bg-green-500/10 text-green-600 border-green-200">
                        Completed
                      </Badge>
                    )}
                  </div>

                  {session.task && (
                    <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                      <Link2 className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{session.task.title}</span>
                    </div>
                  )}

                  {session.notes && (
                    <div className="flex items-start gap-1 mt-1 text-sm text-muted-foreground">
                      <FileText className="h-3 w-3 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{session.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
