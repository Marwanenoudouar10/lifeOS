import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import {
  LayoutDashboard, CheckSquare, FolderKanban, Target,
  Repeat, Clock, CalendarDays, FileText, BarChart3, Plus,
} from 'lucide-react';
import { useUIStore } from '@/stores/ui.store';

const pages = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Tasks', path: '/tasks', icon: CheckSquare },
  { name: 'Projects', path: '/projects', icon: FolderKanban },
  { name: 'Goals', path: '/goals', icon: Target },
  { name: 'Habits', path: '/habits', icon: Repeat },
  { name: 'Focus', path: '/focus', icon: Clock },
  { name: 'Planning', path: '/planning', icon: CalendarDays },
  { name: 'Reviews', path: '/reviews', icon: FileText },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
];

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => setCommandPaletteOpen(false)}
      />
      <Command
        className="relative w-full max-w-lg rounded-xl border border-border bg-popover shadow-2xl"
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === 'Escape') setCommandPaletteOpen(false);
        }}
      >
        <Command.Input
          value={search}
          onValueChange={setSearch}
          placeholder="Type a command or search..."
          className="w-full border-b border-border bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
        />
        <Command.List className="max-h-72 overflow-y-auto p-2">
          <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
            No results found.
          </Command.Empty>
          <Command.Group heading="Actions" className="py-1">
            <Command.Item
              onSelect={() => {
                setCommandPaletteOpen(false);
                navigate('/tasks?new=true');
              }}
              className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
            >
              <Plus className="h-4 w-4" />
              New Task
            </Command.Item>
          </Command.Group>
          <Command.Group heading="Pages" className="py-1">
            {pages.map((page) => (
              <Command.Item
                key={page.path}
                onSelect={() => {
                  setCommandPaletteOpen(false);
                  navigate(page.path);
                }}
                className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
              >
                <page.icon className="h-4 w-4" />
                {page.name}
              </Command.Item>
            ))}
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}
