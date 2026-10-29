/**
 * Fullscreen Alarm Modal Component
 * Renders an attention-grabbing fullscreen heads-up notification with sound & snooze
 */

import React, { useEffect, useState } from 'react';
import { Task, Category } from '../types/index';
import { soundService } from '../services/sound';
import { Bell, BellOff, CheckCircle2, Clock, Volume2, X } from 'lucide-react';

interface FullscreenAlarmModalProps {
  task: Task | null;
  category?: Category;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (taskId: string) => void;
  onSnooze: (taskId: string, minutes: number) => void;
}

export const FullscreenAlarmModal: React.FC<FullscreenAlarmModalProps> = ({
  task,
  category,
  isOpen,
  onClose,
  onComplete,
  onSnooze,
}) => {
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (!isOpen || !task) return;

    const sound = category?.channel.sound || 'alert_beacon';
    if (!isMuted) {
      soundService.play(sound);
      const interval = setInterval(() => {
        if (!isMuted) {
          soundService.play(sound);
        }
      }, 3500);
      return () => clearInterval(interval);
    }
  }, [isOpen, task, category, isMuted]);

  if (!isOpen || !task) return null;

  const catColor = category?.color || '#4F46E5';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="alarm-task-title"
    >
      <div
        className="w-full max-w-lg rounded-3xl p-8 bg-zinc-900 border-2 shadow-2xl relative overflow-hidden text-center text-white"
        style={{ borderColor: catColor, boxShadow: `0 0 50px ${catColor}40` }}
      >
        {/* Pulsing Aura */}
        <div
          className="absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-40 animate-pulse pointer-events-none"
          style={{ background: catColor }}
        />
        <div
          className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-40 animate-pulse pointer-events-none"
          style={{ background: catColor }}
        />

        {/* Top Controls */}
        <div className="flex items-center justify-between relative z-10 mb-6">
          <button
            onClick={() => setIsMuted(!isMuted)}
            aria-label={isMuted ? 'Unmute alarm sound' : 'Mute alarm sound'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 transition-colors"
          >
            {isMuted ? <BellOff className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />}
            <span>{isMuted ? 'Muted' : 'Sound Ringing'}</span>
          </button>

          <span
            className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-white"
            style={{ backgroundColor: catColor }}
          >
            {category?.name || 'Urgent Priority Task'}
          </span>

          <button
            onClick={onClose}
            aria-label="Dismiss alarm"
            className="p-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Visual Alarm Beacon Icon */}
        <div className="relative z-10 my-6 flex justify-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center animate-pulse"
            style={{ backgroundColor: `${catColor}25`, border: `2px solid ${catColor}` }}
          >
            <Bell className="w-10 h-10 animate-wiggle" style={{ color: catColor }} />
          </div>
        </div>

        {/* Task Details */}
        <div className="relative z-10 space-y-3 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-semibold border border-rose-500/20">
            <Clock className="w-3.5 h-3.5" />
            <span>Scheduled Deadline Reached</span>
          </div>
          <h2 id="alarm-task-title" className="text-2xl font-bold text-white tracking-tight">
            {task.title}
          </h2>
          {task.description && (
            <p className="text-sm text-zinc-400 line-clamp-2 max-w-md mx-auto">{task.description}</p>
          )}
          <div className="text-xs text-zinc-400">
            Channel: <span className="text-zinc-200 font-medium">{category?.channel.name || 'Default Channel'}</span> ({category?.channel.sound || 'chime'})
          </div>
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 space-y-3">
          <button
            onClick={() => onComplete(task.id)}
            className="w-full py-4 px-6 rounded-2xl font-bold text-base flex items-center justify-center gap-2 text-white shadow-lg transition-transform active:scale-98 hover:brightness-110"
            style={{ backgroundColor: catColor }}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Mark Task Completed & Claim XP</span>
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onSnooze(task.id, 5)}
              className="py-2.5 px-4 rounded-xl text-sm font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
            >
              Snooze 5 Min
            </button>
            <button
              onClick={() => onSnooze(task.id, 10)}
              className="py-2.5 px-4 rounded-xl text-sm font-medium bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
            >
              Snooze 10 Min
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
