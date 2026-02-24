import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FocusMode } from '@/components/focus/FocusMode';
import { SessionHistory } from '@/components/focus/SessionHistory';

export default function FocusPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Focus</h1>
      <Tabs defaultValue="focus">
        <TabsList>
          <TabsTrigger value="focus">Focus Mode</TabsTrigger>
          <TabsTrigger value="history">Session History</TabsTrigger>
        </TabsList>
        <TabsContent value="focus" className="mt-4">
          <FocusMode />
        </TabsContent>
        <TabsContent value="history" className="mt-4">
          <SessionHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}
