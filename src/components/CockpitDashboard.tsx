/**
 * First-Person View (FPV) Life Cockpit & Task Completer
 * Core dashboard for tracking, categorizing, prioritizing, and monitoring ongoing tasks in life
 */

import React, { useState, useMemo } from 'react';
import { Task, Category, Priority, UserProfile } from '../types/index';
import {
  Activity,
  AlertTriangle,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Filter,
  Flame,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Volume2,
  Zap,
} from 'lucide-react';

interface CockpitDashboardProps {
  tasks: Task[];
  categories: Category[];
  profile: UserProfile;
  onAddTask: (taskData: Partial<Task>) => Promise<void>;
  onUpdateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  onOpenFocusMode: (task: Task) => void;
  onTriggerAlarmTest: (task: Task) => void;
  onOpenProfile: () => void;
  onOpenScratchpad?: () => void;
}

export const CockpitDashboard: React.FC<CockpitDashboardProps> = ({
  tasks,
  categories,
  profile,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onOpenFocusMode,
  onTriggerAlarmTest,
  onOpenProfile,
  onOpenScratchpad,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  // New Task Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategoryId, setNewCategoryId] = useState(categories[0]?.id || 'cat-office');
  const [newPriority, setNewPriority] = useState<Priority>('P2');
  const [newDuration, setNewDuration] = useState(30);
  const [newAlarm, setNewAlarm] = useState(true);

  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (selectedCategory !== 'all' && t.categoryId !== selectedCategory) return false;
      if (selectedPriority !== 'all' && t.priority !== selectedPriority) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = t.title.toLowerCase().includes(query);
        const matchesDesc = t.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc) return false;
      }
      return true;
    });
  }, [tasks, selectedCategory, selectedPriority, searchQuery]);

  const activeTasks = filteredTasks.filter((t) => t.status !== 'completed');
  const completedTasks = filteredTasks.filter((t) => t.status === 'completed');

  // Next High Priority Target
  const nextTarget = activeTasks.find((t) => t.priority === 'P1') || activeTasks[0];

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await onAddTask({
      title: newTitle.trim(),
      description: newDescription.trim(),
      categoryId: newCategoryId,
      priority: newPriority,
      durationMinutes: newDuration,
      alarmEnabled: newAlarm,
      alarmTime: new Date(Date.now() + 3600000 * 2).toISOString(),
      startDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 86400000).toISOString(),
    });

    setNewTitle('');
    setNewDescription('');
    setIsAddingTask(false);
  };

  return (
    <div className="space-y-6">
      {/* Flight Deck Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onOpenProfile}
              className="relative group cursor-pointer"
              title="Click to view profile & pro perks"
            >
              <img
                src={profile.avatar}
                alt={profile.username}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500 shadow-lg group-hover:scale-105 transition-transform"
              />
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-indigo-600 text-[9px] font-black text-white shadow-md">
                Lvl {profile.level}
              </span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-400">
                  First-Person View (FPV) Life Cockpit
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Pro Founder Tier
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Welcome back, {profile.username}
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                {activeTasks.length} active deliverables requiring your focus today
              </p>
            </div>
          </div>

          {/* Quick Metrics Chips */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-zinc-950/80 border border-zinc-800">
              <Flame className="w-4 h-4 text-rose-500 fill-rose-500" />
              <div className="text-left">
                <div className="text-xs font-bold text-white">{profile.currentStreak} Days</div>
                <div className="text-[10px] text-zinc-400">Streak</div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-zinc-950/80 border border-zinc-800">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <div className="text-left">
                <div className="text-xs font-bold text-amber-400">{profile.points} XP</div>
                <div className="text-[10px] text-zinc-400">Total Points</div>
              </div>
            </div>

            {onOpenScratchpad && (
              <button
                onClick={onOpenScratchpad}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer"
                title="Quick Scratchpad (/commands to convert to tasks)"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span>Scratchpad (/cmd)</span>
              </button>
            )}

            <button
              onClick={() => setIsAddingTask(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
            </button>
          </div>
        </div>
      </div>

      {/* Focus On Next Target Banner */}
      {nextTarget && (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-zinc-900 via-indigo-950/40 to-zinc-900 border border-indigo-900/50 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                <Zap className="w-4 h-4 animate-pulse" />
              </span>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Recommended Next Focus
              </span>
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase"
                style={{ backgroundColor: categoryMap.get(nextTarget.categoryId)?.color || '#4F46E5' }}
              >
                {categoryMap.get(nextTarget.categoryId)?.name}
              </span>
            </div>
            <h3 className="text-base font-bold text-white">{nextTarget.title}</h3>
            {nextTarget.description && (
              <p className="text-xs text-zinc-400 line-clamp-1">{nextTarget.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onTriggerAlarmTest(nextTarget)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
              title="Test Fullscreen Heads-Up Alarm with sound"
            >
              <Bell className="w-3.5 h-3.5 text-rose-400" />
              <span>Test Alarm Siren</span>
            </button>

            <button
              onClick={() => onOpenFocusMode(nextTarget)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-md transition-all active:scale-95"
            >
              <Zap className="w-4 h-4" />
              <span>Launch Focus Mode</span>
            </button>
          </div>
        </div>
      )}

      {/* Category Pills & Priority Filters */}
      <div className="space-y-3">
        {/* Category Filter Pills with distinct colors */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-zinc-200 text-zinc-900 shadow-sm'
                : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            All Life Domains ({tasks.length})
          </button>

          {categories.map((cat) => {
            const count = tasks.filter((t) => t.categoryId === cat.id).length;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
                  isSelected
                    ? 'text-white shadow-md'
                    : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                }`}
                style={
                  isSelected
                    ? { backgroundColor: cat.color, borderColor: cat.color }
                    : { borderLeftColor: cat.color, borderLeftWidth: '4px' }
                }
              >
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-black/30 text-white' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Priority Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-2xl border border-zinc-800 text-xs">
            {['all', 'P1', 'P2', 'P3', 'P4'].map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPriority(p)}
                className={`px-3 py-1 rounded-xl font-bold uppercase transition-all ${
                  selectedPriority === p
                    ? 'bg-indigo-600 text-white'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {p === 'all' ? 'All Priorities' : p}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ongoing tasks..."
              className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Task List: Active Tasks */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-400 px-1">
          <span>Active Tasks ({activeTasks.length})</span>
          <span>Execution Status</span>
        </div>

        {activeTasks.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-zinc-900/50 border border-zinc-800/80 text-zinc-400">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500" />
            <p className="text-sm font-bold text-white">All Clear in Flight Deck!</p>
            <p className="text-xs text-zinc-500 mt-0.5">No pending tasks found for the selected filter.</p>
          </div>
        ) : (
          activeTasks.map((task) => {
            const cat = categoryMap.get(task.categoryId);
            const catColor = cat?.color || '#4F46E5';

            return (
              <div
                key={task.id}
                className="p-4 sm:p-5 rounded-3xl bg-zinc-900 border border-zinc-800/80 shadow-md hover:border-zinc-700 transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  {/* Mark Done Checkbox */}
                  <button
                    onClick={() => onUpdateTask(task.id, { status: 'completed', progress: 100 })}
                    aria-label={`Mark task ${task.title} complete`}
                    className="mt-0.5 w-6 h-6 rounded-lg border-2 border-zinc-700 hover:border-emerald-500 hover:bg-emerald-500/10 transition-colors flex items-center justify-center text-transparent hover:text-emerald-400 flex-shrink-0 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  {/* Task Text & Metadata */}
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider"
                        style={{ backgroundColor: catColor }}
                      >
                        {cat?.name || 'Category'}
                      </span>

                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          task.priority === 'P1'
                            ? 'bg-rose-500/20 text-rose-400'
                            : task.priority === 'P2'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {task.priority}
                      </span>

                      {task.alarmEnabled && (
                        <span className="flex items-center gap-1 text-[10px] text-zinc-400 font-mono">
                          <Bell className="w-3 h-3 text-amber-400" />
                          <span>Alarm Active</span>
                        </span>
                      )}

                      {task.routineId && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20">
                          Rotation Batch
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {task.title}
                    </h4>

                    {task.description && (
                      <p className="text-xs text-zinc-400 line-clamp-1">{task.description}</p>
                    )}
                  </div>
                </div>

                {/* Right Actions & Progress */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
                  {/* Progress Control */}
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                    <span>{task.progress}%</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={task.progress}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        onUpdateTask(task.id, {
                          progress: val,
                          status: val === 100 ? 'completed' : val > 0 ? 'in_progress' : 'todo',
                        });
                      }}
                      className="w-20 accent-indigo-500 cursor-pointer"
                    />
                  </div>

                  {/* Focus Mode Launcher */}
                  <button
                    onClick={() => onOpenFocusMode(task)}
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-zinc-300 transition-colors"
                    title="Enter Focus Mode"
                  >
                    <Zap className="w-4 h-4" />
                  </button>

                  {/* Trigger Alarm Test */}
                  <button
                    onClick={() => onTriggerAlarmTest(task)}
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-rose-400 transition-colors"
                    title="Test Alarm Heads-Up"
                  >
                    <Bell className="w-4 h-4" />
                  </button>

                  {/* Delete Task */}
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-2 rounded-xl bg-zinc-800 hover:bg-rose-500/20 text-zinc-500 hover:text-rose-400 transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Completed Tasks Accordion */}
      {completedTasks.length > 0 && (
        <div className="pt-4 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 px-1">
            Completed Archive ({completedTasks.length})
          </div>

          <div className="space-y-2 opacity-60 hover:opacity-100 transition-opacity">
            {completedTasks.map((t) => (
              <div
                key={t.id}
                className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="line-through text-zinc-400 font-medium">{t.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-amber-400 font-bold">+{t.pointsAwarded || 35} XP</span>
                  <button
                    onClick={() => onUpdateTask(t.id, { status: 'todo', progress: 0 })}
                    className="text-[10px] font-semibold text-zinc-400 hover:text-white px-2 py-0.5 rounded bg-zinc-800"
                  >
                    Reopen
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Add Task Modal */}
      {isAddingTask && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-3xl bg-zinc-900 border border-zinc-700 p-6 sm:p-8 shadow-2xl relative text-zinc-100">
            <h3 className="text-lg font-bold text-white mb-1">Create Life Deliverable</h3>
            <p className="text-xs text-zinc-400 mb-6">Categorize, prioritize, and set dedicated alarm channels</p>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 mb-1 block">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Verify deployment latency, Morning yoga, Grocery run..."
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 mb-1 block">Description & Notes</label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Add context, acceptance criteria, or essential links..."
                  className="w-full px-4 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 mb-1 block">Category</label>
                  <select
                    value={newCategoryId}
                    onChange={(e) => setNewCategoryId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-xs text-white focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 mb-1 block">Priority Level</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-xs text-white focus:outline-none"
                  >
                    <option value="P1">P1 (Urgent & Important)</option>
                    <option value="P2">P2 (Important)</option>
                    <option value="P3">P3 (Normal)</option>
                    <option value="P4">P4 (Someday)</option>
                  </select>
                </div>
              </div>

              {/* Alarm Checkbox */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/80 border border-zinc-700/60">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-zinc-200 font-semibold">Enable Channel Alarm Siren</span>
                </div>
                <input
                  type="checkbox"
                  checked={newAlarm}
                  onChange={(e) => setNewAlarm(e.target.checked)}
                  className="w-4 h-4 rounded accent-indigo-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsAddingTask(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
