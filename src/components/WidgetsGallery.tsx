/**
 * Home-Screen Widgets Component
 * Interactive Widget Gallery with 4 distinct widget formats and live dashboard preview
 */

import React, { useState } from 'react';
import { Task, Category, UserProfile, WidgetType } from '../types/index';
import {
  Activity,
  CheckCircle2,
  Clock,
  Compass,
  Flame,
  LayoutGrid,
  Pin,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react';

interface WidgetsGalleryProps {
  tasks: Task[];
  categories: Category[];
  profile: UserProfile;
  onOpenFocusMode: (task: Task) => void;
  onCompleteTask: (taskId: string) => void;
}

export const WidgetsGallery: React.FC<WidgetsGalleryProps> = ({
  tasks,
  categories,
  profile,
  onOpenFocusMode,
  onCompleteTask,
}) => {
  const [pinnedWidgets, setPinnedWidgets] = useState<WidgetType[]>([
    'quick_completer',
    'focus_cockpit',
    'category_ring',
    'streak_trophy',
  ]);

  const activeFocusTask = tasks.find((t) => t.status === 'in_progress') || tasks[0];
  const urgentTasks = tasks.filter((t) => t.status !== 'completed').slice(0, 3);
  const completedToday = tasks.filter((t) => t.status === 'completed').length;
  const totalTasks = tasks.length || 1;
  const overallProgress = Math.round((completedToday / totalTasks) * 100);

  const togglePin = (type: WidgetType) => {
    if (pinnedWidgets.includes(type)) {
      setPinnedWidgets(pinnedWidgets.filter((w) => w !== type));
    } else {
      setPinnedWidgets([...pinnedWidgets, type]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
              <LayoutGrid className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">Home-Screen Widget Showcase</h2>
          </div>
          <p className="text-xs text-zinc-400">
            Preview and pin native-style mobile and desktop glanceable widgets for your home screen
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 bg-zinc-800 px-3.5 py-1.5 rounded-xl border border-zinc-700/60">
          <Pin className="w-3.5 h-3.5 text-indigo-400" />
          <span>{pinnedWidgets.length} Widgets Pinned</span>
        </div>
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Widget 1: Quick Completer (Compact 2x2) */}
        <div className="p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-mono text-[10px] font-bold">
                2x2 Compact
              </span>
              <h3 className="text-sm font-bold text-white">Quick Completer Widget</h3>
            </div>
            <button
              onClick={() => togglePin('quick_completer')}
              className={`p-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors ${
                pinnedWidgets.includes('quick_completer')
                  ? 'bg-indigo-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <Pin className="w-3 h-3" />
            </button>
          </div>

          {/* Rendered Widget Simulation */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 shadow-inner space-y-3">
            <div className="flex items-center justify-between text-xs border-b border-zinc-800 pb-2">
              <span className="font-bold text-zinc-300">⚡ Next High Priority</span>
              <span className="text-[10px] text-zinc-500 font-mono">{urgentTasks.length} pending</span>
            </div>

            <div className="space-y-2">
              {urgentTasks.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-2 p-2 rounded-xl bg-zinc-900 border border-zinc-800/60 text-xs">
                  <span className="truncate text-zinc-200 font-medium">{t.title}</span>
                  <button
                    onClick={() => onCompleteTask(t.id)}
                    className="p-1 rounded-lg bg-zinc-800 hover:bg-emerald-600 text-zinc-400 hover:text-white transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Widget 2: Focus Cockpit (Medium 4x2) */}
        <div className="p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-mono text-[10px] font-bold">
                4x2 Wide
              </span>
              <h3 className="text-sm font-bold text-white">Focus Cockpit Widget</h3>
            </div>
            <button
              onClick={() => togglePin('focus_cockpit')}
              className={`p-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors ${
                pinnedWidgets.includes('focus_cockpit')
                  ? 'bg-indigo-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <Pin className="w-3 h-3" />
            </button>
          </div>

          {/* Rendered Widget Simulation */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-zinc-950 via-indigo-950/40 to-zinc-950 border border-indigo-900/40 shadow-inner flex flex-col justify-between h-40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5" />
                <span>Active Focus Target</span>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">25:00 Pomodoro</span>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white truncate">{activeFocusTask?.title || 'No active task'}</h4>
              <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                {activeFocusTask?.description || 'Pick a task to lock in focus mode.'}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
              <span className="text-[10px] text-zinc-400">Silences background chatter</span>
              {activeFocusTask && (
                <button
                  onClick={() => onOpenFocusMode(activeFocusTask)}
                  className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-transform active:scale-95"
                >
                  Enter Cockpit
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Widget 3: Category Progress Ring (Square 2x2) */}
        <div className="p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-mono text-[10px] font-bold">
                2x2 Square
              </span>
              <h3 className="text-sm font-bold text-white">Category Life Ring</h3>
            </div>
            <button
              onClick={() => togglePin('category_ring')}
              className={`p-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors ${
                pinnedWidgets.includes('category_ring')
                  ? 'bg-indigo-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <Pin className="w-3 h-3" />
            </button>
          </div>

          {/* Rendered Widget Simulation */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 shadow-inner flex items-center justify-between gap-4">
            {/* Visual Ring */}
            <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
              <svg className="w-24 h-24 -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="#27272a" strokeWidth="8" fill="transparent" />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#4F46E5"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={2 * Math.PI * 40 * (1 - overallProgress / 100)}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-base font-extrabold text-white">{overallProgress}%</span>
                <span className="text-[9px] text-zinc-400">Today</span>
              </div>
            </div>

            {/* Category Split */}
            <div className="space-y-1.5 flex-1 text-xs">
              {categories.slice(0, 3).map((cat) => (
                <div key={cat.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-zinc-300 text-[11px] truncate">{cat.name}</span>
                  </div>
                  <span className="font-mono text-[10px] text-zinc-400">
                    {tasks.filter((t) => t.categoryId === cat.id && t.status === 'completed').length} /{' '}
                    {tasks.filter((t) => t.categoryId === cat.id).length}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Widget 4: Streak & XP Trophy (Wide 4x2) */}
        <div className="p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-mono text-[10px] font-bold">
                4x2 Wide
              </span>
              <h3 className="text-sm font-bold text-white">Streak & Trophy Board</h3>
            </div>
            <button
              onClick={() => togglePin('streak_trophy')}
              className={`p-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors ${
                pinnedWidgets.includes('streak_trophy')
                  ? 'bg-indigo-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <Pin className="w-3 h-3" />
            </button>
          </div>

          {/* Rendered Widget Simulation */}
          <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800/80 shadow-inner flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                <Flame className="w-8 h-8 fill-rose-500 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Execution Streak</span>
                <div className="text-2xl font-black text-white">{profile.currentStreak} Days Strong</div>
                <span className="text-[11px] text-emerald-400 font-semibold">Active habit streak 🔥</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-lg font-bold text-amber-400 font-mono">{profile.points} XP</div>
              <span className="text-[10px] text-zinc-400">Level {profile.level} Master</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
