/**
 * Focus Mode Component
 * Minimizes distractions by showing ONLY the currently selected task and essential details
 * Includes Pomodoro timer, ambient focus pulse, and notification silencing
 */

import React, { useState, useEffect } from 'react';
import { Task, Category } from '../types/index';
import confetti from 'canvas-confetti';
import {
  BellOff,
  CheckCircle2,
  Clock,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  X,
  Zap,
} from 'lucide-react';

interface FocusModeModalProps {
  task: Task | null;
  category?: Category;
  isOpen: boolean;
  onClose: () => void;
  onCompleteTask: (taskId: string) => void;
  onFinishSession: (taskId: string, minutes: number) => void;
}

export const FocusModeModal: React.FC<FocusModeModalProps> = ({
  task,
  category,
  isOpen,
  onClose,
  onCompleteTask,
  onFinishSession,
}) => {
  const [timerMinutes, setTimerMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [disableNotifications, setDisableNotifications] = useState(true);
  const [focusNote, setFocusNote] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Sync timer when timerMinutes changes
  useEffect(() => {
    setSecondsLeft(timerMinutes * 60);
    setIsRunning(false);
  }, [timerMinutes]);

  // Countdown effect
  useEffect(() => {
    if (!isRunning || !isOpen) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsRunning(false);
          confetti({ particleCount: 75, spread: 60 });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, isOpen]);

  if (!isOpen || !task) return null;

  const catColor = category?.color || '#4F46E5';
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const totalSeconds = timerMinutes * 60;
  const progressPercent = Math.round(((totalSeconds - secondsLeft) / totalSeconds) * 100);

  const handleFinishAndClaim = () => {
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
    });
    const minutesDone = Math.max(1, Math.round((totalSeconds - secondsLeft) / 60));
    onFinishSession(task.id, minutesDone);
  };

  const handleCompleteTask = () => {
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.5 },
    });
    onCompleteTask(task.id);
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/95 backdrop-blur-xl transition-all duration-300 ${
        isFullscreen ? 'p-0' : 'p-4 md:p-8'
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="focus-task-title"
    >
      <div
        className={`w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative flex flex-col justify-between overflow-hidden text-zinc-100 ${
          isFullscreen ? 'h-full max-w-none rounded-none' : 'max-h-[92vh] overflow-y-auto'
        }`}
      >
        {/* Ambient Top Glow */}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: catColor }}
        />

        {/* Header Ribbon */}
        <div className="flex items-center justify-between pb-6 border-b border-zinc-800/80 relative z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-amber-400">
                Distraction-Free Focus Mode
              </span>
              <p className="text-xs text-zinc-400">Sole task locked. Distractions minimized.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              className="p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              aria-label="Exit focus mode"
              className="p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center: Selected Task & Countdown Timer */}
        <div className="py-6 flex flex-col items-center text-center relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-white"
              style={{ backgroundColor: catColor }}
            >
              {category?.name || 'Category'}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300">
              {task.priority} Priority
            </span>
          </div>

          <h1 id="focus-task-title" className="text-2xl sm:text-3xl font-extrabold text-white max-w-lg mb-2">
            {task.title}
          </h1>

          {task.description && (
            <p className="text-sm text-zinc-400 max-w-md line-clamp-3 mb-6">
              {task.description}
            </p>
          )}

          {/* Pomodoro Pulse Timer Display */}
          <div className="relative my-4 flex items-center justify-center">
            {/* Circular Progress Arc */}
            <svg className="w-56 h-56 -rotate-90">
              <circle
                cx="112"
                cy="112"
                r="96"
                stroke="currentColor"
                strokeWidth="10"
                className="text-zinc-800"
                fill="transparent"
              />
              <circle
                cx="112"
                cy="112"
                r="96"
                stroke={catColor}
                strokeWidth="10"
                strokeDasharray={2 * Math.PI * 96}
                strokeDashoffset={2 * Math.PI * 96 * (1 - progressPercent / 100)}
                strokeLinecap="round"
                className="transition-all duration-700"
                fill="transparent"
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-white">
                {timeFormatted}
              </span>
              <span className="text-xs text-zinc-400 mt-1">
                {isRunning ? 'Focus In Progress' : secondsLeft === 0 ? 'Session Complete!' : 'Ready'}
              </span>
            </div>
          </div>

          {/* Timer Controls */}
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="px-6 py-3 rounded-2xl font-semibold text-sm flex items-center gap-2 text-white shadow-lg transition-transform active:scale-95"
              style={{ backgroundColor: catColor }}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isRunning ? 'Pause Timer' : 'Start Focus'}</span>
            </button>

            <button
              onClick={() => {
                setIsRunning(false);
                setSecondsLeft(timerMinutes * 60);
              }}
              aria-label="Reset countdown timer"
              className="p-3 rounded-2xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Duration Presets */}
          <div className="flex items-center gap-2 mt-4">
            {[15, 25, 50].map((mins) => (
              <button
                key={mins}
                onClick={() => setTimerMinutes(mins)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  timerMinutes === mins
                    ? 'bg-zinc-200 text-zinc-900 font-bold'
                    : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {mins} min
              </button>
            ))}
          </div>

          {/* Push Notification Silencing Toggle */}
          <div className="mt-6 flex items-center justify-between w-full max-w-md p-3.5 rounded-2xl bg-zinc-800/60 border border-zinc-700/50">
            <div className="flex items-center gap-2.5 text-left">
              <div className={`p-2 rounded-xl ${disableNotifications ? 'bg-rose-500/10 text-rose-400' : 'bg-zinc-700 text-zinc-400'}`}>
                <BellOff className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-200">Silence Non-Urgent Notifications</div>
                <div className="text-[11px] text-zinc-400">Blocks low-priority banners while in deep focus</div>
              </div>
            </div>
            <button
              onClick={() => setDisableNotifications(!disableNotifications)}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                disableNotifications ? 'bg-indigo-600' : 'bg-zinc-700'
              }`}
              aria-label="Toggle silence non-urgent notifications"
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  disableNotifications ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Focus Scratchpad */}
          <div className="w-full max-w-md mt-4 text-left">
            <label className="text-[11px] uppercase tracking-wider font-bold text-zinc-400 mb-1 block">
              Quick Thoughts & Blockers (Scratchpad)
            </label>
            <input
              type="text"
              value={focusNote}
              onChange={(e) => setFocusNote(e.target.value)}
              placeholder="Jot down quick thoughts without leaving the zone..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-800/80 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center gap-3 relative z-10">
          <button
            onClick={handleFinishAndClaim}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center justify-center gap-2 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Finish Session & Claim +40 XP</span>
          </button>

          <button
            onClick={handleCompleteTask}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-transform active:scale-98 shadow-md"
            style={{ backgroundColor: catColor }}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Mark Task Done & Return</span>
          </button>
        </div>
      </div>
    </div>
  );
};
