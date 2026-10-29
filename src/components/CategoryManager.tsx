/**
 * Category & Notification Channel Customizer
 * Manages category identities, colors, and per-category notification alarm profiles
 */

import React, { useState } from 'react';
import { Category, NotificationChannel, SoundProfile, NotificationPriority } from '../types/index';
import { soundService } from '../services/sound';
import {
  Bell,
  Check,
  Crown,
  Edit2,
  Palette,
  Plus,
  Sliders,
  Sparkles,
  Volume2,
  Vibrate,
} from 'lucide-react';

interface CategoryManagerProps {
  categories: Category[];
  onAddCategory: (categoryData: Partial<Category>) => Promise<void>;
  onUpdateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  isPremium?: boolean;
}

const PRESET_COLORS = ['#4F46E5', '#D97706', '#0D9488', '#E11D48', '#7C3AED', '#0284C7', '#10B981', '#EC4899'];

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  onAddCategory,
  onUpdateCategory,
  isPremium = true,
}) => {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formName, setFormName] = useState('');
  const [formColor, setFormColor] = useState('#4F46E5');
  const [formIsCustomColor, setFormIsCustomColor] = useState(false);
  const [formSound, setFormSound] = useState<SoundProfile>('chime');
  const [formPriority, setFormPriority] = useState<NotificationPriority>('high_banner');
  const [formFullscreen, setFormFullscreen] = useState(true);
  const [testingSound, setTestingSound] = useState<string | null>(null);

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setIsCreating(false);
    setFormName(cat.name);
    setFormColor(cat.color);
    setFormIsCustomColor(!!cat.isCustomColor);
    setFormSound(cat.channel.sound);
    setFormPriority(cat.channel.priority);
    setFormFullscreen(cat.channel.fullscreenAlarm);
  };

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setIsCreating(true);
    setFormName('');
    setFormColor('#4F46E5');
    setFormIsCustomColor(false);
    setFormSound('alert_beacon');
    setFormPriority('high_banner');
    setFormFullscreen(true);
  };

  const handleTestSound = (sound: SoundProfile) => {
    setTestingSound(sound);
    soundService.play(sound);
    setTimeout(() => setTestingSound(null), 1200);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const channel: NotificationChannel = {
      id: editingCategory ? editingCategory.channel.id : `ch-${Date.now()}`,
      name: `${formName.trim()} Notification Channel`,
      sound: formSound,
      priority: formPriority,
      fullscreenAlarm: formFullscreen,
      vibrationPattern: [200, 100, 200],
    };

    if (editingCategory) {
      await onUpdateCategory(editingCategory.id, {
        name: formName.trim(),
        color: formColor,
        isCustomColor: formIsCustomColor,
        channel,
      });
      setEditingCategory(null);
    } else {
      await onAddCategory({
        name: formName.trim(),
        color: formColor,
        isCustomColor: formIsCustomColor,
        icon: 'Tag',
        channel,
      });
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
              <Palette className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">Category & Notification Channels</h2>
          </div>
          <p className="text-xs text-zinc-400">
            Define custom colors, distinct audio profiles, and full-screen alarm behavior for each life domain
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      {/* Categories Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          return (
            <div
              key={cat.id}
              className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl relative overflow-hidden flex flex-col justify-between"
            >
              <div
                className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none"
                style={{ backgroundColor: cat.color }}
              />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-4 h-4 rounded-full ring-2 ring-white/20"
                      style={{ backgroundColor: cat.color }}
                    />
                    <h3 className="text-base font-bold text-white">{cat.name}</h3>
                  </div>

                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-2 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Channel Config Details */}
                <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-2 mb-4 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Alarm Tone:</span>
                    <button
                      onClick={() => handleTestSound(cat.channel.sound)}
                      className="flex items-center gap-1 font-semibold text-indigo-400 hover:text-indigo-300"
                    >
                      <Volume2 className={`w-3.5 h-3.5 ${testingSound === cat.channel.sound ? 'animate-bounce' : ''}`} />
                      <span className="capitalize">{cat.channel.sound.replace('_', ' ')}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Priority Level:</span>
                    <span className="font-semibold text-zinc-200 capitalize">
                      {cat.channel.priority.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Fullscreen HUD Alarm:</span>
                    <span
                      className={`font-semibold ${
                        cat.channel.fullscreenAlarm ? 'text-emerald-400' : 'text-zinc-500'
                      }`}
                    >
                      {cat.channel.fullscreenAlarm ? 'Enabled' : 'Banner Only'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                <span>Color: {cat.color.toUpperCase()}</span>
                {cat.isCustomColor && (
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <Crown className="w-3 h-3" /> Custom Pro
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Modal */}
      {(isCreating || editingCategory) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-3xl bg-zinc-900 border border-zinc-700 p-6 sm:p-8 shadow-2xl relative text-zinc-100">
            <h3 className="text-lg font-bold text-white mb-1">
              {isCreating ? 'Create New Category' : `Edit "${editingCategory?.name}"`}
            </h3>
            <p className="text-xs text-zinc-400 mb-6">
              Configure category branding and notification channel behavior
            </p>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300 mb-1 block">Category Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Health & Sadhana, Office Ops, Family Connect"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Color Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-zinc-300">Category Color</label>
                  <span className="text-[11px] text-zinc-400 font-mono">{formColor}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setFormColor(c);
                        setFormIsCustomColor(false);
                      }}
                      className="w-8 h-8 rounded-full transition-transform hover:scale-110 relative flex items-center justify-center"
                      style={{ backgroundColor: c }}
                    >
                      {formColor === c && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>

                {/* Custom Color Wheel (Pro Feature) */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/80 border border-zinc-700/60">
                  <input
                    type="color"
                    value={formColor}
                    onChange={(e) => {
                      setFormColor(e.target.value);
                      setFormIsCustomColor(true);
                    }}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <div className="text-xs">
                    <span className="font-semibold text-zinc-200">Custom Hex Color</span>
                    <span className="text-[11px] text-amber-400 block flex items-center gap-1">
                      <Crown className="w-3 h-3" /> Pro feature flag enabled
                    </span>
                  </div>
                </div>
              </div>

              {/* Notification Channel Sound Profile */}
              <div>
                <label className="text-xs font-semibold text-zinc-300 mb-1 block">Channel Alert Sound</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['chime', 'alert_beacon', 'zen_bell', 'soft_pulse'] as SoundProfile[]).map((sound) => (
                    <button
                      key={sound}
                      type="button"
                      onClick={() => {
                        setFormSound(sound);
                        handleTestSound(sound);
                      }}
                      className={`p-2.5 rounded-xl border text-left text-xs font-medium flex items-center justify-between transition-colors ${
                        formSound === sound
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-750'
                      }`}
                    >
                      <span className="capitalize">{sound.replace('_', ' ')}</span>
                      <Volume2 className="w-3.5 h-3.5 opacity-60" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Fullscreen Alarm Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-800/60 border border-zinc-700/50">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-indigo-400" />
                  <div>
                    <div className="text-xs font-semibold text-zinc-200">Fullscreen Alarm Heads-Up</div>
                    <div className="text-[11px] text-zinc-400">Fires high-priority modal with snooze</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formFullscreen}
                  onChange={(e) => setFormFullscreen(e.target.checked)}
                  className="w-4 h-4 rounded accent-indigo-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingCategory(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
