'use client';

import { useState, useMemo } from 'react';
import { Plus, X, Clock } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { planApi } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { TimeBlock } from '@lifeos/shared';

interface TimeBlockViewProps {
  date: string;
}

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6am to 10pm

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function formatHour(hour: number): string {
  if (hour === 0 || hour === 12) return `${hour === 0 ? 12 : 12} ${hour < 12 ? 'AM' : 'PM'}`;
  return `${hour > 12 ? hour - 12 : hour} ${hour >= 12 ? 'PM' : 'AM'}`;
}

export function TimeBlockView({ date }: TimeBlockViewProps) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    startTime: '09:00',
    endTime: '10:00',
    label: '',
  });

  const { data: blocks, isLoading } = useQuery({
    queryKey: ['plans', date, 'time-blocks'],
    queryFn: () => planApi.getTimeBlocks(date),
    enabled: !!date,
  });

  const addBlock = useMutation({
    mutationFn: (data: any) => planApi.addTimeBlock(date, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans', date, 'time-blocks'] });
      toast.success('Time block added');
      setDialogOpen(false);
      setFormData({ startTime: '09:00', endTime: '10:00', label: '' });
    },
    onError: () => toast.error('Failed to add time block'),
  });

  const removeBlock = useMutation({
    mutationFn: (blockId: string) => planApi.removeTimeBlock(date, blockId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans', date, 'time-blocks'] });
      toast.success('Time block removed');
    },
    onError: () => toast.error('Failed to remove time block'),
  });

  const handleAdd = () => {
    if (!formData.startTime || !formData.endTime) {
      toast.error('Start and end times are required');
      return;
    }
    addBlock.mutate({
      startTime: formData.startTime,
      endTime: formData.endTime,
      label: formData.label.trim() || undefined,
    });
  };

  // Map blocks to pixel positions
  const startMinute = 6 * 60; // 6am
  const endMinute = 22 * 60; // 10pm
  const totalMinutes = endMinute - startMinute;
  const hourHeight = 60; // pixels per hour
  const totalHeight = (totalMinutes / 60) * hourHeight;

  const positionedBlocks = useMemo(() => {
    if (!blocks) return [];
    return blocks.map((block: TimeBlock) => {
      const startMins = timeToMinutes(block.startTime);
      const endMins = timeToMinutes(block.endTime);
      const top = ((startMins - startMinute) / totalMinutes) * totalHeight;
      const height = ((endMins - startMins) / totalMinutes) * totalHeight;
      return { ...block, top: Math.max(0, top), height: Math.max(20, height) };
    });
  }, [blocks, totalHeight]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time Blocks
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDialogOpen(true)}
            className="gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Block
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <div className="relative" style={{ height: totalHeight }}>
            {/* Hour grid lines */}
            {HOURS.map((hour) => {
              const top = ((hour * 60 - startMinute) / totalMinutes) * totalHeight;
              return (
                <div
                  key={hour}
                  className="absolute left-0 right-0 flex items-start"
                  style={{ top }}
                >
                  <span className="text-xs text-muted-foreground w-14 flex-shrink-0 -mt-2">
                    {formatHour(hour)}
                  </span>
                  <div className="flex-1 border-t border-dashed border-muted" />
                </div>
              );
            })}

            {/* Time blocks */}
            {positionedBlocks.map((block: any) => (
              <div
                key={block.id}
                className="absolute left-16 right-0 rounded-md bg-primary/10 border border-primary/20 px-3 py-1.5 group"
                style={{ top: block.top, height: block.height }}
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {block.label || 'Untitled Block'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {block.startTime} - {block.endTime}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    onClick={() => removeBlock.mutate(block.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Empty state */}
            {(!blocks || blocks.length === 0) && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">
                  No time blocks scheduled. Click "Add Block" to get started.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Time Block</DialogTitle>
            <DialogDescription>
              Schedule a focused block of time for your day.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="block-label">Label</Label>
              <Input
                id="block-label"
                placeholder="e.g. Deep Work, Meeting..."
                value={formData.label}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, label: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="block-start">Start Time</Label>
                <Input
                  id="block-start"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, startTime: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="block-end">End Time</Label>
                <Input
                  id="block-end"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, endTime: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={addBlock.isPending}>
              {addBlock.isPending ? 'Adding...' : 'Add Block'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
