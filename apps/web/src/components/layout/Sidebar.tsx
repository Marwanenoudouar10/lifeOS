import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, CheckSquare, FolderKanban, Target, Repeat,
  Clock, CalendarDays, BarChart3, FileText, Search, Moon, Sun,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/ui.store';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/habits', icon: Repeat, label: 'Habits' },
  { to: '/focus', icon: Clock, label: 'Focus' },
  { to: '/planning', icon: CalendarDays, label: 'Planning' },
  { to: '/reviews', icon: FileText, label: 'Reviews' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
];

export function Sidebar() {
  const { sidebarOpen, darkMode, toggleDarkMode, toggleCommandPalette } = useUIStore();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r border-border bg-card transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      <div className="flex h-14 items-center border-b border-border px-4">
        {sidebarOpen ? (
          <h1 className="text-xl font-bold text-primary">lifeOS</h1>
        ) : (
          <span className="text-xl font-bold text-primary">L</span>
        )}
      </div>

      {sidebarOpen && (
        <div className="px-3 py-2">
          <button
            onClick={toggleCommandPalette}
            className="flex w-full items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent"
          >
            <Search className="h-4 w-4" />
            <span>Search...</span>
            <kbd className="ml-auto rounded bg-muted px-1.5 py-0.5 text-xs">⌘K</kbd>
          </button>
        </div>
      )}

      <nav className="flex-1 space-y-1 px-3 py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {sidebarOpen && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <button
          onClick={toggleDarkMode}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent"
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          {sidebarOpen && <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
      </div>
    </aside>
  );
}
