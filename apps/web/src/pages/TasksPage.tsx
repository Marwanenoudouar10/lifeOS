import { useState } from 'react';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskForm } from '@/components/tasks/TaskForm';
import { BrainDumpInput } from '@/components/tasks/BrainDumpInput';
import { EisenhowerMatrix } from '@/components/tasks/EisenhowerMatrix';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Brain, Grid2X2 } from 'lucide-react';
import { useFilterStore } from '@/stores/filter.store';
import { useTasks } from '@/hooks/use-tasks';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

export default function TasksPage() {
  const [formOpen, setFormOpen] = useState(false);
  const filters = useFilterStore();
  const { data: tasks, isLoading } = useTasks(filters.getActiveFilters());

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <div className="flex gap-2">
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search tasks..."
          value={filters.search}
          onChange={(e) => filters.setSearch(e.target.value)}
          className="w-64"
        />
        <Select value={filters.status || 'ALL'} onValueChange={(v) => filters.setStatus(v === 'ALL' ? '' : v as any)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="TODO">To Do</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="DONE">Done</SelectItem>
            <SelectItem value="DEFERRED">Deferred</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filters.priority || 'ALL'} onValueChange={(v) => filters.setPriority(v === 'ALL' ? '' : v as any)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="CRITICAL">Critical</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
          </SelectContent>
        </Select>
        {(filters.status || filters.priority || filters.search) && (
          <Button variant="ghost" size="sm" onClick={filters.clearFilters}>
            Clear
          </Button>
        )}
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="matrix">
            <Grid2X2 className="mr-1 h-4 w-4" />
            Matrix
          </TabsTrigger>
          <TabsTrigger value="braindump">
            <Brain className="mr-1 h-4 w-4" />
            Brain Dump
          </TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="mt-4">
          <TaskList tasks={tasks || []} isLoading={isLoading} />
        </TabsContent>
        <TabsContent value="matrix" className="mt-4">
          <EisenhowerMatrix />
        </TabsContent>
        <TabsContent value="braindump" className="mt-4">
          <BrainDumpInput />
        </TabsContent>
      </Tabs>

      <TaskForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
