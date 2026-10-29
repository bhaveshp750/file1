/**
 * Interactive Gantt Chart Timeline View
 * Visualizes task execution schedules, dependencies, completion progress, and milestones
 */

import React, { useState, useMemo } from 'react';
import { Task, Category, Priority } from '../types/index';
import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Filter,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';

interface GanttViewProps {
  tasks: Task[];
  categories: Category[];
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onOpenFocusMode: (task: Task) => void;
  isPremium?: boolean;
}

export const GanttView: React.FC<GanttViewProps> = ({
  tasks,
  categories,
  onUpdateTask,
  onOpenFocusMode,
  isPremium = true,
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [timelineSpan, setTimelineSpan] = useState<'3d' | '7d' | '14d'>('7d');
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Calculate timeline start and days
  const { startOfTimeline, daysCount, daysArray } = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const count = timelineSpan === '3d' ? 3 : timelineSpan === '7d' ? 7 : 14;
    const days: Date[] = [];
    for (let i = 0; i < count; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }

    return { startOfTimeline: start, daysCount: count, daysArray: days };
  }, [timelineSpan]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (selectedCategoryId !== 'all' && task.categoryId !== selectedCategoryId) return false;
      if (selectedPriority !== 'all' && task.priority !== selectedPriority) return false;
      return true;
    });
  }, [tasks, selectedCategoryId, selectedPriority]);

  // Get Category Map
  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  // Calculate position & width percentage on timeline
  const getTaskTimelineSpan = (task: Task) => {
    const timelineStartMs = startOfTimeline.getTime();
    const timelineTotalMs = daysCount * 24 * 60 * 60 * 1000;

    const taskStartMs = new Date(task.startDate).getTime();
    const taskDueMs = new Date(task.dueDate).getTime();

    // Clamp within view
    const leftMs = Math.max(0, taskStartMs - timelineStartMs);
    const durationMs = Math.max(3600000 * 2, taskDueMs - taskStartMs); // min 2 hours visual bar

    const leftPercent = Math.min(100, Math.max(0, (leftMs / timelineTotalMs) * 100));
    const widthPercent = Math.min(100 - leftPercent, Math.max(4, (durationMs / timelineTotalMs) * 100));

    return { leftPercent, widthPercent };
  };

  const nowMs = Date.now();
  const timelineStartMs = startOfTimeline.getTime();
  const timelineTotalMs = daysCount * 24 * 60 * 60 * 1000;
  const currentPulseLeft = Math.min(100, Math.max(0, ((nowMs - timelineStartMs) / timelineTotalMs) * 100));

  const handleExportTimeline = () => {
    if (!isPremium) {
      alert('High-resolution Gantt Export is a TaskPulse Pro feature.');
      return;
    }
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Interactive Gantt Timeline</h2>
              <p className="text-xs text-zinc-400">
                Track task schedules, milestone dependencies, and execution progress in real-time
              </p>
            </div>
          </div>
        </div>

        {/* Filter and Span Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeline View Range */}
          <div className="flex rounded-xl bg-zinc-800 p-1 border border-zinc-700/60 text-xs">
            {(['3d', '7d', '14d'] as const).map((span) => (
              <button
                key={span}
                onClick={() => setTimelineSpan(span)}
                className={`px-3 py-1 rounded-lg font-semibold uppercase transition-all ${
                  timelineSpan === span
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {span}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 border border-zinc-700 text-xs text-zinc-200 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Priority Dropdown */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 border border-zinc-700 text-xs text-zinc-200 focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="P1">P1 (Urgent)</option>
            <option value="P2">P2 (Important)</option>
            <option value="P3">P3 (Normal)</option>
            <option value="P4">P4 (Someday)</option>
          </select>

          {/* Export Button */}
          <button
            onClick={handleExportTimeline}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold border border-zinc-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Gantt</span>
          </button>
        </div>
      </div>

      {/* Gantt Interactive Surface */}
      <div className="rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden">
        {/* Timeline Header Row (Dates) */}
        <div className="grid border-b border-zinc-800 bg-zinc-950/60 sticky top-0 z-20" style={{ gridTemplateColumns: `260px 1fr` }}>
          <div className="p-3.5 px-5 text-xs font-bold uppercase tracking-wider text-zinc-400 border-r border-zinc-800 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-zinc-400" />
            <span>Task Deliverable</span>
          </div>

          {/* Days Columns */}
          <div className="grid" style={{ gridTemplateColumns: `repeat(${daysCount}, minmax(0, 1fr))` }}>
            {daysArray.map((day, idx) => {
              const isToday = day.toDateString() === new Date().toDateString();
              return (
                <div
                  key={idx}
                  className={`p-3 text-center border-r border-zinc-800/80 last:border-r-0 ${
                    isToday ? 'bg-indigo-950/40' : ''
                  }`}
                >
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div
                    className={`text-xs font-bold mt-0.5 ${
                      isToday ? 'text-indigo-400 inline-block px-2 py-0.5 rounded-full bg-indigo-500/20' : 'text-zinc-200'
                    }`}
                  >
                    {day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline Body Rows */}
        <div className="divide-y divide-zinc-800/60 relative">
          {/* Current Real-time Pulse Marker */}
          {currentPulseLeft >= 0 && currentPulseLeft <= 100 && (
            <div
              className="absolute top-0 bottom-0 z-10 pointer-events-none flex flex-col items-center"
              style={{ left: `calc(260px + (100% - 260px) * ${currentPulseLeft / 100})` }}
            >
              <div className="px-1.5 py-0.5 rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-md animate-pulse">
                NOW
              </div>
              <div className="w-0.5 h-full bg-rose-500/80 shadow-[0_0_8px_#f43f5e]" />
            </div>
          )}

          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center text-zinc-400">
              <Layers className="w-10 h-10 mx-auto mb-2 text-zinc-600" />
              <p className="text-sm">No tasks scheduled in this timeline window.</p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const cat = categoryMap.get(task.categoryId);
              const catColor = cat?.color || '#4F46E5';
              const { leftPercent, widthPercent } = getTaskTimelineSpan(task);

              return (
                <div
                  key={task.id}
                  className="grid hover:bg-zinc-800/30 transition-colors group cursor-pointer"
                  style={{ gridTemplateColumns: `260px 1fr` }}
                  onClick={() => setActiveTask(task)}
                >
                  {/* Task Left Label */}
                  <div className="p-3 px-5 border-r border-zinc-800 flex items-center justify-between gap-3 overflow-hidden">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: catColor }}
                        />
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 truncate">
                          {cat?.name || 'Task'}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                            task.priority === 'P1'
                              ? 'bg-rose-500/20 text-rose-400'
                              : task.priority === 'P2'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-zinc-200 truncate group-hover:text-white">
                        {task.title}
                      </div>
                    </div>

                    <div className="text-[11px] font-mono text-zinc-400 flex-shrink-0">
                      {task.progress}%
                    </div>
                  </div>

                  {/* Task Timeline Bar Channel */}
                  <div className="relative h-14 flex items-center px-2">
                    {/* Background Grid Lines */}
                    <div
                      className="absolute inset-0 grid pointer-events-none opacity-20"
                      style={{ gridTemplateColumns: `repeat(${daysCount}, minmax(0, 1fr))` }}
                    >
                      {daysArray.map((_, i) => (
                        <div key={i} className="border-r border-zinc-600 h-full last:border-r-0" />
                      ))}
                    </div>

                    {/* Interactive Gantt Bar */}
                    <div
                      className="absolute h-8 rounded-xl flex items-center px-3 shadow-md transition-all group-hover:h-9 group-hover:brightness-110 overflow-hidden cursor-pointer"
                      style={{
                        left: `${leftPercent}%`,
                        width: `${Math.max(widthPercent, 8)}%`,
                        backgroundColor: `${catColor}35`,
                        border: `1.5px solid ${catColor}`,
                      }}
                      title={`${task.title} (${task.progress}%)`}
                    >
                      {/* Progress Fill */}
                      <div
                        className="absolute inset-y-0 left-0 rounded-l-lg opacity-40 transition-all duration-300"
                        style={{
                          width: `${task.progress}%`,
                          backgroundColor: catColor,
                        }}
                      />

                      <div className="relative z-10 flex items-center justify-between w-full text-white text-[11px] font-semibold truncate gap-2">
                        <span className="truncate">{task.title}</span>
                        {task.status === 'completed' && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Task Inspector & Completion Drawer */}
      {activeTask && (
        <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-700 shadow-2xl relative animate-in fade-in slide-in-from-bottom-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white uppercase"
                  style={{ backgroundColor: categoryMap.get(activeTask.categoryId)?.color || '#4F46E5' }}
                >
                  {categoryMap.get(activeTask.categoryId)?.name}
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  {new Date(activeTask.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} →{' '}
                  {new Date(activeTask.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">{activeTask.title}</h3>
              {activeTask.description && <p className="text-xs text-zinc-400 mt-1">{activeTask.description}</p>}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenFocusMode(activeTask)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-md transition-all active:scale-95"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Launch Focus Mode</span>
              </button>

              <button
                onClick={() => {
                  onUpdateTask(activeTask.id, {
                    status: activeTask.status === 'completed' ? 'todo' : 'completed',
                    progress: activeTask.status === 'completed' ? 0 : 100,
                  });
                  setActiveTask(null);
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all active:scale-95 ${
                  activeTask.status === 'completed' ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{activeTask.status === 'completed' ? 'Reopen Task' : 'Mark 100% Done'}</span>
              </button>
            </div>
          </div>

          {/* Progress Slider */}
          <div className="mt-4 flex items-center gap-4">
            <span className="text-xs font-semibold text-zinc-400">Progress:</span>
            <input
              type="range"
              min="0"
              max="100"
              value={activeTask.progress}
              onChange={(e) => {
                const val = Number(e.target.value);
                onUpdateTask(activeTask.id, {
                  progress: val,
                  status: val === 100 ? 'completed' : val > 0 ? 'in_progress' : 'todo',
                });
                setActiveTask({ ...activeTask, progress: val });
              }}
              className="flex-1 accent-indigo-500 cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-zinc-200">{activeTask.progress}%</span>
          </div>
        </div>
      )}
    </div>
  );
};
