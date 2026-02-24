import { Menu, Bell } from 'lucide-react';
import { useUIStore } from '@/stores/ui.store';
import { useFocusStore } from '@/stores/focus.store';

export function Header() {
  const { toggleSidebar } = useUIStore();
  const { isActive, elapsedSeconds, taskTitle, isPaused } = useFocusStore();

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-background/95 px-6 backdrop-blur">
      <button
        onClick={toggleSidebar}
        className="rounded-md p-1.5 text-muted-foreground hover:bg-accent"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1" />

      {isActive && (
        <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
          <span className={`h-2 w-2 rounded-full ${isPaused ? 'bg-yellow-500' : 'animate-pulse bg-green-500'}`} />
          <span>{formatTime(elapsedSeconds)}</span>
          {taskTitle && <span className="text-muted-foreground">- {taskTitle}</span>}
        </div>
      )}

      <button className="relative rounded-md p-1.5 text-muted-foreground hover:bg-accent">
        <Bell className="h-5 w-5" />
      </button>
    </header>
  );
}
