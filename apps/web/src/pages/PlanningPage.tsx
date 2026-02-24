import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DailyPlan } from '@/components/planning/DailyPlan';
import { TimeBlockView } from '@/components/planning/TimeBlockView';
import { formatDate } from '@lifeos/shared';

export default function PlanningPage() {
  const [date, setDate] = useState(formatDate(new Date()));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Daily Planning</h1>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-md border border-border bg-background px-3 py-1.5 text-sm"
        />
      </div>
      <Tabs defaultValue="plan">
        <TabsList>
          <TabsTrigger value="plan">Plan</TabsTrigger>
          <TabsTrigger value="timeblocks">Time Blocks</TabsTrigger>
        </TabsList>
        <TabsContent value="plan" className="mt-4">
          <DailyPlan date={date} />
        </TabsContent>
        <TabsContent value="timeblocks" className="mt-4">
          <TimeBlockView date={date} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
