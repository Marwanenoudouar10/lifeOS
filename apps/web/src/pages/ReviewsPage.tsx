import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DailyReview } from '@/components/reviews/DailyReview';
import { WeeklyReview } from '@/components/reviews/WeeklyReview';

export default function ReviewsPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Reviews</h1>
      <Tabs defaultValue="daily">
        <TabsList>
          <TabsTrigger value="daily">Daily Review</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Review</TabsTrigger>
        </TabsList>
        <TabsContent value="daily" className="mt-4">
          <DailyReview />
        </TabsContent>
        <TabsContent value="weekly" className="mt-4">
          <WeeklyReview />
        </TabsContent>
      </Tabs>
    </div>
  );
}
