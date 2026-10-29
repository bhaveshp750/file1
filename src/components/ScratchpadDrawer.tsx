/**
 * Scratchpad Drawer Component with Slash Commands
 * Allows jotting down quick notes and converting them into structured tasks
 * Supported Commands: /p1 - /p4, /office, /sadhana, /chores, /family, /learning, /events, /remind [time]
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Category, Task, ScratchNote } from '../types/index';
import { parseScratchCommand, SLASH_COMMAND_SUGGESTIONS } from '../utils/commandParser';
import { soundService } from '../services/sound';
import confetti from 'canvas-confetti';
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  Clock,
  Command,
  FileText,
  Lightbulb,
  Plus,
  Sparkles,
  Tag,
  Trash2,
  X,
  Zap,
} from 'lucide-react';

interface ScratchpadDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  notes: ScratchNote[];
  onAddNote: (text: string) => Promise<void>;
  onDeleteNote: (id: string) => Promise<void>;
  onConvertToTask: (note: ScratchNote, taskData: Partial<Task>) => Promise<void>;
}

export const ScratchpadDrawer: React.FC<ScratchpadDrawerProps> = ({
  isOpen,
  onClose,
  categories,
  notes,
  onAddNote,
  onDeleteNote,
  onConvertToTask,
}) => {
  const [inputText, setInputText] = useState('');
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashFilter, setSlashFilter] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Live parsed preview of current input
  const liveParsed = useMemo(() => {
    return parseScratchCommand(inputText, categories);
  }, [inputText, categories]);

  // Handle typing & slash detection
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputText(val);

    const lastSlashIdx = val.lastIndexOf('/');
    if (lastSlashIdx !== -1 && lastSlashIdx === val.length - 1) {
      setShowSlashMenu(true);
      setSlashFilter('');
    } else if (lastSlashIdx !== -1 && !val.slice(lastSlashIdx).includes(' ')) {
      setShowSlashMenu(true);
      setSlashFilter(val.slice(lastSlashIdx).toLowerCase());
    } else {
      setShowSlashMenu(false);
    }
  };

  const handleSelectCommand = (cmd: string) => {
    const lastSlashIdx = inputText.lastIndexOf('/');
    let nextText = inputText;
    if (lastSlashIdx !== -1) {
      nextText = inputText.slice(0, lastSlashIdx) + cmd + ' ';
    } else {
      nextText = inputText + ' ' + cmd + ' ';
    }
    setInputText(nextText);
    setShowSlashMenu(false);
    inputRef.current?.focus();
  };

  const filteredCommands = useMemo(() => {
    if (!slashFilter) return SLASH_COMMAND_SUGGESTIONS;
    return SLASH_COMMAND_SUGGESTIONS.filter((s) => s.command.toLowerCase().includes(slashFilter));
  }, [slashFilter]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    await onAddNote(inputText.trim());
    setInputText('');
    setShowSlashMenu(false);
  };

  const handleConvertSingle = async (note: ScratchNote) => {
    const parsed = parseScratchCommand(note.text, categories);
    confetti({ particleCount: 70, spread: 60 });
    soundService.play('chime');

    await onConvertToTask(note, {
      title: parsed.cleanTitle,
      description: `Captured via Scratchpad: "${note.text}"`,
      categoryId: parsed.categoryId,
      priority: parsed.priority,
      alarmEnabled: parsed.alarmEnabled,
      alarmTime: parsed.alarmTime,
      dueDate: parsed.dueDate || new Date(Date.now() + 86400000).toISOString(),
      durationMinutes: 30,
      status: 'todo',
      progress: 0,
    });
  };

  const handleConvertAll = async () => {
    if (notes.length === 0) return;
    confetti({ particleCount: 120, spread: 90 });
    soundService.play('chime');

    for (const note of [...notes]) {
      const parsed = parseScratchCommand(note.text, categories);
      await onConvertToTask(note, {
        title: parsed.cleanTitle,
        description: `Captured via Scratchpad: "${note.text}"`,
        categoryId: parsed.categoryId,
        priority: parsed.priority,
        alarmEnabled: parsed.alarmEnabled,
        alarmTime: parsed.alarmTime,
        dueDate: parsed.dueDate || new Date(Date.now() + 86400000).toISOString(),
        durationMinutes: 30,
        status: 'todo',
        progress: 0,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-zinc-900 border border-zinc-700/80 p-6 sm:p-8 shadow-2xl relative text-zinc-100 flex flex-col justify-between">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-6">
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400">
                <FileText className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white tracking-tight">Quick Scratchpad</h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    /Commands Active
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Brain-dump items with slash commands (/p1, /office, /remind 2h) & convert to tasks later
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Close scratchpad"
              className="p-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Capture Form with Slash Autocomplete */}
          <form onSubmit={handleAddSubmit} className="space-y-3 mb-6 relative">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={handleInputChange}
                placeholder="Type a quick thought... Try: /p1 /office /remind 2h Review SRE metrics"
                className="w-full pl-4 pr-12 py-3.5 rounded-2xl bg-zinc-950 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 shadow-inner"
              />

              <button
                type="submit"
                className="absolute right-2.5 top-2.5 p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all active:scale-95 shadow-md shadow-indigo-600/30"
                title="Add to scratchpad"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Slash Command Autocomplete Dropdown */}
            {showSlashMenu && (
              <div className="absolute top-14 left-0 right-0 z-30 p-2 rounded-2xl bg-zinc-950 border border-indigo-500/60 shadow-2xl space-y-1 max-h-56 overflow-y-auto">
                <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 px-3 py-1 flex items-center gap-1.5">
                  <Command className="w-3 h-3 text-indigo-400" />
                  <span>Available /Commands (Click to insert):</span>
                </div>
                {filteredCommands.map((s) => (
                  <button
                    key={s.command}
                    type="button"
                    onClick={() => handleSelectCommand(s.command)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-zinc-800/80 transition-colors group cursor-pointer"
                  >
                    <span className="font-mono text-xs font-bold text-indigo-300 group-hover:text-indigo-200">
                      {s.command}
                    </span>
                    <span className="text-[11px] text-zinc-400 group-hover:text-zinc-300">
                      {s.description}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Live Detected Attributes Chip Bar */}
            {inputText.trim() && (
              <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-[11px]">
                <span className="text-zinc-500 font-semibold text-[10px] uppercase">Detected:</span>

                {/* Detected Category */}
                <span
                  className="px-2 py-0.5 rounded-full font-bold text-white"
                  style={{ backgroundColor: liveParsed.categoryColor || '#4F46E5' }}
                >
                  {liveParsed.categoryName || 'Office'}
                </span>

                {/* Detected Priority */}
                <span
                  className={`px-2 py-0.5 rounded-full font-bold ${
                    liveParsed.priority === 'P1'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : liveParsed.priority === 'P2'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-zinc-800 text-zinc-300'
                  }`}
                >
                  {liveParsed.priority} Priority
                </span>

                {/* Detected Reminder */}
                {liveParsed.alarmEnabled && (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                    <Bell className="w-3 h-3 text-amber-400" />
                    <span>Alarm siren {liveParsed.reminderMinutes ? `in ${liveParsed.reminderMinutes}m` : 'active'}</span>
                  </span>
                )}

                <span className="text-zinc-400 truncate max-w-[200px]">
                  ➔ Title: "{liveParsed.cleanTitle}"
                </span>
              </div>
            )}

            {/* Cheatsheet pill hints */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] text-zinc-400">
              <span className="font-semibold text-zinc-400">Quick Cheatsheet:</span>
              <button
                type="button"
                onClick={() => handleSelectCommand('/p1')}
                className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-rose-400 font-mono"
              >
                /p1
              </button>
              <button
                type="button"
                onClick={() => handleSelectCommand('/office')}
                className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-indigo-400 font-mono"
              >
                /office
              </button>
              <button
                type="button"
                onClick={() => handleSelectCommand('/sadhana')}
                className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-teal-400 font-mono"
              >
                /sadhana
              </button>
              <button
                type="button"
                onClick={() => handleSelectCommand('/remind 30m')}
                className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-mono"
              >
                /remind 30m
              </button>
              <button
                type="button"
                onClick={() => handleSelectCommand('/due tomorrow')}
                className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-sky-400 font-mono"
              >
                /due tomorrow
              </button>
            </div>
          </form>

          {/* Scratch Notes List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-400 px-1">
              <span>Saved Scratch Items ({notes.length})</span>
              {notes.length > 1 && (
                <button
                  type="button"
                  onClick={handleConvertAll}
                  className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Convert All to Tasks</span>
                </button>
              )}
            </div>

            {notes.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-zinc-950/60 border border-zinc-800 text-zinc-400">
                <FileText className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
                <p className="text-xs font-bold text-zinc-300">Your scratchpad is empty</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Type thoughts with /commands above to capture items on the fly!
                </p>
              </div>
            ) : (
              notes.map((note) => {
                const parsed = parseScratchCommand(note.text, categories);

                return (
                  <div
                    key={note.id}
                    className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 shadow-md hover:border-zinc-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase"
                          style={{ backgroundColor: parsed.categoryColor || '#4F46E5' }}
                        >
                          {parsed.categoryName || 'Category'}
                        </span>

                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            parsed.priority === 'P1'
                              ? 'bg-rose-500/20 text-rose-300'
                              : parsed.priority === 'P2'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {parsed.priority}
                        </span>

                        {parsed.alarmEnabled && (
                          <span className="flex items-center gap-1 text-[10px] text-amber-400 font-mono">
                            <Bell className="w-3 h-3" />
                            <span>Alarm siren configured</span>
                          </span>
                        )}
                      </div>

                      <div className="text-xs font-bold text-white">{parsed.cleanTitle}</div>
                      <div className="text-[11px] font-mono text-zinc-500 line-clamp-1">{note.text}</div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
                      <button
                        onClick={() => handleConvertSingle(note)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all active:scale-95"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Convert to Task</span>
                      </button>

                      <button
                        onClick={() => onDeleteNote(note.id)}
                        className="p-2 rounded-xl bg-zinc-800 hover:bg-rose-500/20 text-zinc-500 hover:text-rose-400 transition-colors"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-zinc-800 mt-6 flex items-center justify-between text-xs text-zinc-500">
          <span>💡 Pro-tip: Use <code className="text-zinc-300">/remind 2h</code> to automatically trigger a siren alert.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
