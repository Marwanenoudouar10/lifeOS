'use client';

import { useState } from 'react';
import { Sparkles, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useGeneratePlan } from '@/hooks/use-plans';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface PlanGeneratorProps {
  date: string;
}

const bucketLabels: Record<string, string> = {
  TOP: 'Top Priority',
  SECONDARY: 'Secondary',
  OPTIONAL: 'Optional',
};

const bucketColors: Record<string, string> = {
  TOP: 'bg-red-500/10 text-red-600 border-red-200',
  SECONDARY: 'bg-blue-500/10 text-blue-600 border-blue-200',
  OPTIONAL: 'bg-gray-500/10 text-gray-600 border-gray-200',
};

export function PlanGenerator({ date }: PlanGeneratorProps) {
  const generatePlan = useGeneratePlan();
  const [preview, setPreview] = useState<any>(null);

  const handleGenerate = async () => {
    try {
      const result = await generatePlan.mutateAsync(date);
      setPreview(result);
      toast.success('Plan generated! Review below.');
    } catch {
      toast.error('Failed to generate plan');
    }
  };

  const handleDismiss = () => {
    setPreview(null);
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleGenerate}
        disabled={generatePlan.isPending}
        variant="outline"
        className="gap-2"
      >
        <Sparkles className="h-4 w-4" />
        {generatePlan.isPending ? 'Generating...' : 'Generate Plan'}
      </Button>

      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="border-primary/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Generated Plan Preview
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleDismiss}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {generatePlan.isPending ? (
                  <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ))}
                  </div>
                ) : preview?.items ? (
                  <div className="space-y-3">
                    {['TOP', 'SECONDARY', 'OPTIONAL'].map((bucket) => {
                      const items = preview.items.filter(
                        (item: any) => item.bucket === bucket
                      );
                      if (items.length === 0) return null;
                      return (
                        <div key={bucket}>
                          <Badge
                            variant="outline"
                            className={bucketColors[bucket]}
                          >
                            {bucketLabels[bucket]}
                          </Badge>
                          <ul className="mt-1.5 space-y-1">
                            {items.map((item: any) => (
                              <li
                                key={item.id || item.taskId}
                                className="text-sm flex items-center gap-2"
                              >
                                <Check className="h-3 w-3 text-muted-foreground" />
                                {item.task?.title || item.title || 'Untitled'}
                                {item.task?.estimatedMinutes && (
                                  <span className="text-xs text-muted-foreground">
                                    ({item.task.estimatedMinutes}m)
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Plan generated and applied.
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
