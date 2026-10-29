/**
 * Repeated & On-Call Multi-Day Rotation Engine
 * Designed for software engineers, habit sprints, and multi-day recurring schedules
 */

import React, { useState } from 'react';
import { RoutineTemplate, Category, Priority } from '../types/index';
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Flame,
  Layers,
  Plus,
  Power,
  RotateCw,
  Shield,
  Sparkles,
  Zap,
} from 'lucide-react';

interface RoutinesViewProps {
  routines: RoutineTemplate[];
  categories: Category[];
  onToggleRoutine: (routineId: string, activate: boolean) => void;
  isPremium?: boolean;
}

export const RoutinesView: React.FC<RoutinesViewProps> = ({
  routines,
  categories,
  onToggleRoutine,
  isPremium = true,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDays, setNewDays] = useState(7);
  const [newCategoryId, setNewCategoryId] = useState(categories[0]?.id || 'cat-office');
  const [newPriority, setNewPriority] = useState<Priority>('P1');
  const [timesInput, setTimesInput] = useState('09:00, 13:00, 18:00, 23:00');

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950/80 via-zinc-900 to-purple-950/60 border border-indigo-800/40 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
            <Shield className="w-3.5 h-3.5" />
            <span>SRE & Habit Multi-Day Rotation Engine</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            One-Toggle Repeated Routines & On-Call Shifts
          </h2>

          <p className="text-sm text-zinc-300 leading-relaxed">
            Need to monitor high-priority systems 4 times a day for a week? Or start a 14-day Sadhana habit sprint?
            Flip a single toggle to auto-schedule your entire recurring batch of tasks, complete with calendar alarms and timeline milestones.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-zinc-300">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Multi-Day Auto Expansion</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Dedicated Notification Sirens</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Syncs to Gantt Timeline</span>
            </div>
          </div>
        </div>
      </div>

      {/* Routine Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {routines.map((routine) => {
          const cat = categoryMap.get(routine.categoryId);
          const catColor = cat?.color || '#4F46E5';
          const totalTasksInBatch = routine.durationDays * routine.timesPerDay.length;

          return (
            <div
              key={routine.id}
              className={`rounded-3xl p-6 bg-zinc-900 border transition-all relative flex flex-col justify-between shadow-xl ${
                routine.isActive
                  ? 'border-indigo-500/80 shadow-[0_0_30px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/40'
                  : 'border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div>
                {/* Header Badge & Category */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider"
                    style={{ backgroundColor: catColor }}
                  >
                    {cat?.name || 'Category'}
                  </span>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      routine.isActive
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {routine.isActive ? 'Active Shift' : 'Inactive'}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="text-lg font-bold text-white mb-2 leading-snug">{routine.title}</h3>
                <p className="text-xs text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
                  {routine.description}
                </p>

                {/* Routine Specs */}
                <div className="p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-2 mb-6">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      Duration:
                    </span>
                    <span className="font-bold text-zinc-200">{routine.durationDays} Days</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      Frequency:
                    </span>
                    <span className="font-bold text-zinc-200">{routine.timesPerDay.length}x / day</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-zinc-400" />
                      Batch Tasks:
                    </span>
                    <span className="font-mono font-bold text-indigo-400">{totalTasksInBatch} Tasks</span>
                  </div>

                  {/* Scheduled Times Pills */}
                  <div className="pt-2 border-t border-zinc-800/60">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block mb-1.5">
                      Daily Checkpoints:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {routine.timesPerDay.map((time, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 font-mono text-[10px] border border-zinc-700/60"
                        >
                          {time}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Toggle Activation Button */}
              <div>
                <button
                  onClick={() => onToggleRoutine(routine.id, !routine.isActive)}
                  className={`w-full py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg ${
                    routine.isActive
                      ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                  }`}
                >
                  <Power className="w-4 h-4" />
                  <span>{routine.isActive ? 'Turn Off On-Call Rotation' : 'Activate 7-Day Routine Shift'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
