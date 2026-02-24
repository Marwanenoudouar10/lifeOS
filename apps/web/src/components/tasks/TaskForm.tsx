import { useState, useEffect } from 'react';
import type { Task, CreateTaskInput, TaskPriority, TaskStatus, Context, EnergyLevel } from '@lifeos/shared';
import { useCreateTask, useUpdateTask } from '@/hooks/use-tasks';
import { useProjects } from '@/hooks/use-projects';
import { useGoals } from '@/hooks/use-goals';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task;
  onSubmit?: (task: Task) => void;
}

const PRIORITIES: { value: TaskPriority; label: string }[] = [
  { value: 'CRITICAL', label: 'Critical' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
  { value: 'NONE', label: 'None' },
];

const STATUSES: { value: TaskStatus; label: string }[] = [
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DONE', label: 'Done' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'DEFERRED', label: 'Deferred' },
];

const CONTEXTS: { value: Context; label: string }[] = [
  { value: 'HOME', label: 'Home' },
  { value: 'WORK', label: 'Work' },
  { value: 'ERRANDS', label: 'Errands' },
  { value: 'COMPUTER', label: 'Computer' },
  { value: 'PHONE', label: 'Phone' },
  { value: 'ANYWHERE', label: 'Anywhere' },
];

const ENERGY_LEVELS: { value: EnergyLevel; label: string }[] = [
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

const EMPTY_FORM: CreateTaskInput = {
  title: '',
  description: '',
  priority: 'MEDIUM',
  status: 'TODO',
  estimatedMinutes: undefined,
  deadline: undefined,
  scheduledDate: undefined,
  context: undefined,
  energyLevel: undefined,
  isImportant: false,
  isUrgent: false,
  categoryId: undefined,
  projectId: undefined,
  goalId: undefined,
};

export function TaskForm({ open, onOpenChange, task, onSubmit }: TaskFormProps) {
  const isEditing = !!task;
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const { data: projects } = useProjects();
  const { data: goals } = useGoals();

  const [form, setForm] = useState<CreateTaskInput>(EMPTY_FORM);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        status: task.status,
        estimatedMinutes: task.estimatedMinutes ?? undefined,
        deadline: task.deadline?.slice(0, 10) ?? undefined,
        scheduledDate: task.scheduledDate?.slice(0, 10) ?? undefined,
        context: task.context ?? undefined,
        energyLevel: task.energyLevel ?? undefined,
        isImportant: task.isImportant,
        isUrgent: task.isUrgent,
        categoryId: task.categoryId ?? undefined,
        projectId: task.projectId ?? undefined,
        goalId: task.goalId ?? undefined,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [task, open]);

  const setField = <K extends keyof CreateTaskInput>(key: K, value: CreateTaskInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isPending = createTask.isPending || updateTask.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }

    const payload: CreateTaskInput = {
      ...form,
      title: form.title.trim(),
      description: form.description?.trim() || undefined,
      estimatedMinutes: form.estimatedMinutes || undefined,
      deadline: form.deadline || undefined,
      scheduledDate: form.scheduledDate || undefined,
      context: form.context || undefined,
      energyLevel: form.energyLevel || undefined,
      categoryId: form.categoryId || undefined,
      projectId: form.projectId || undefined,
      goalId: form.goalId || undefined,
    };

    try {
      if (isEditing && task) {
        const updated = await updateTask.mutateAsync({ id: task.id, data: payload });
        toast.success('Task updated');
        onSubmit?.(updated);
      } else {
        const created = await createTask.mutateAsync(payload);
        toast.success('Task created');
        onSubmit?.(created);
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save task');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Task' : 'Create Task'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the task details below.' : 'Fill in the details for your new task.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setField('title', e.target.value)}
              placeholder="What needs to be done?"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description || ''}
              onChange={(e) => setField('description', e.target.value)}
              placeholder="Add more details..."
              rows={3}
            />
          </div>

          {/* Priority & Status row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={form.priority || 'MEDIUM'}
                onValueChange={(v) => setField('priority', v as TaskPriority)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.status || 'TODO'}
                onValueChange={(v) => setField('status', v as TaskStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Estimated time */}
          <div className="space-y-2">
            <Label htmlFor="estimatedMinutes">Estimated Time (minutes)</Label>
            <Input
              id="estimatedMinutes"
              type="number"
              min={0}
              value={form.estimatedMinutes ?? ''}
              onChange={(e) =>
                setField('estimatedMinutes', e.target.value ? parseInt(e.target.value, 10) : undefined)
              }
              placeholder="e.g. 30"
            />
          </div>

          {/* Deadline & Scheduled Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={form.deadline || ''}
                onChange={(e) => setField('deadline', e.target.value || undefined)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Scheduled Date</Label>
              <Input
                id="scheduledDate"
                type="date"
                value={form.scheduledDate || ''}
                onChange={(e) => setField('scheduledDate', e.target.value || undefined)}
              />
            </div>
          </div>

          {/* Context & Energy Level */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Context</Label>
              <Select
                value={form.context || 'none'}
                onValueChange={(v) => setField('context', v === 'none' ? undefined : v as Context)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select context" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No context</SelectItem>
                  {CONTEXTS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Energy Level</Label>
              <Select
                value={form.energyLevel || 'none'}
                onValueChange={(v) => setField('energyLevel', v === 'none' ? undefined : v as EnergyLevel)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select energy level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No preference</SelectItem>
                  {ENERGY_LEVELS.map((e) => (
                    <SelectItem key={e.value} value={e.value}>
                      {e.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Important & Urgent */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between rounded-md border p-3">
              <Label htmlFor="isImportant" className="cursor-pointer">
                Important
              </Label>
              <Switch
                id="isImportant"
                checked={form.isImportant ?? false}
                onCheckedChange={(checked) => setField('isImportant', checked)}
              />
            </div>

            <div className="flex items-center justify-between rounded-md border p-3">
              <Label htmlFor="isUrgent" className="cursor-pointer">
                Urgent
              </Label>
              <Switch
                id="isUrgent"
                checked={form.isUrgent ?? false}
                onCheckedChange={(checked) => setField('isUrgent', checked)}
              />
            </div>
          </div>

          {/* Project & Goal */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Project</Label>
              <Select
                value={form.projectId || 'none'}
                onValueChange={(v) => setField('projectId', v === 'none' ? undefined : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No project</SelectItem>
                  {projects?.map((p: any) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Goal</Label>
              <Select
                value={form.goalId || 'none'}
                onValueChange={(v) => setField('goalId', v === 'none' ? undefined : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No goal</SelectItem>
                  {goals?.map((g: any) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEditing ? 'Update Task' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
