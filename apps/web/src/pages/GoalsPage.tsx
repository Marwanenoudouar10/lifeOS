import { useParams, useNavigate } from 'react-router-dom';
import { GoalList } from '@/components/goals/GoalList';
import { GoalDetail } from '@/components/goals/GoalDetail';
import { useGoal } from '@/hooks/use-goals';
import { Skeleton } from '@/components/ui/skeleton';

export default function GoalsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: goal, isLoading } = useGoal(id || '');

  if (id) {
    if (isLoading) return <Skeleton className="h-96 w-full" />;
    if (!goal) return <p className="text-muted-foreground">Goal not found</p>;
    return <GoalDetail goal={goal} open={true} onOpenChange={(open) => { if (!open) navigate('/goals'); }} />;
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Goals</h1>
      <GoalList />
    </div>
  );
}
