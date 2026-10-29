/**
 * User Profile & Pro Subscription Manager Modal
 * Handles username, avatar selection, task statistics, and 1-Year Founder Pro status
 */

import React, { useState } from 'react';
import { UserProfile } from '../types/index';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import {
  Activity,
  Award,
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  Clock,
  Crown,
  Flame,
  HelpCircle,
  RotateCcw,
  Shield,
  Sparkles,
  Trophy,
  User,
  X,
  Zap,
} from 'lucide-react';

interface ProfileModalProps {
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  onResetTour: () => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  profile,
  isOpen,
  onClose,
  onUpdateProfile,
  onResetTour,
}) => {
  const [username, setUsername] = useState(profile.username);
  const [role, setRole] = useState(profile.role);
  const [bio, setBio] = useState(profile.bio);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [isSaving, setIsSaving] = useState(false);
  const [subscriptionMessage, setSubscriptionMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(profile.premiumUntil).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onUpdateProfile({
      username: username.trim(),
      role: role.trim(),
      bio: bio.trim(),
      avatar,
    });
    setIsSaving(false);
    onClose();
  };

  const handleExtendPro = async () => {
    const res = await api.extendSubscription();
    confetti({ particleCount: 100, spread: 80 });
    setSubscriptionMessage(res.message);
    await onUpdateProfile({ premiumUntil: res.premiumUntil, isPremium: true });
    setTimeout(() => setSubscriptionMessage(null), 3000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl bg-zinc-900 border border-zinc-700 p-6 sm:p-8 shadow-2xl relative text-zinc-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-6">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <User className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-white">Profile & Pro Subscription</h2>
              <p className="text-xs text-zinc-400">Personalize identity and manage founder subscription benefits</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close profile modal"
            className="p-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1-Year Free Pro Founder Tier Banner */}
        <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-indigo-500/15 border border-amber-500/30 shadow-lg mb-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                  TaskPulse Pro Founder Plan
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                  Active
                </span>
              </div>
              <div className="text-sm font-bold text-white">
                {daysLeft} Days Free Premium Access Remaining
              </div>
              <p className="text-[11px] text-zinc-400">
                All features unlocked: On-Call generator, custom hex palettes, Gantt export, and unlimited widgets.
              </p>
            </div>

            <button
              onClick={handleExtendPro}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Renew / Extend 1 Year</span>
            </button>
          </div>

          {subscriptionMessage && (
            <div className="mt-3 p-2 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs text-center font-semibold">
              {subscriptionMessage}
            </div>
          )}
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* Avatar Picker */}
          <div>
            <label className="text-xs font-bold text-zinc-300 mb-2 block">Choose Your Avatar</label>
            <div className="flex items-center gap-4 mb-3">
              <img
                src={avatar}
                alt="Selected avatar"
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500 shadow-md"
              />
              <div className="text-xs text-zinc-400">
                <span className="font-semibold text-zinc-200">Personal Flight Deck Identity</span>
                <p className="text-[11px] mt-0.5">Select a pre-designed portrait or paste a custom image URL below.</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              {PRESET_AVATARS.map((av, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatar(av)}
                  className={`w-10 h-10 rounded-xl overflow-hidden transition-all ${
                    avatar === av ? 'ring-2 ring-indigo-500 scale-105' : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={av} alt="preset" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            <input
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="Or enter custom avatar image URL..."
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Username & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-zinc-300 mb-1 block">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-300 mb-1 block">Role / Title</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Senior Software Dev, Team Lead..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-800 border border-zinc-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="text-xs font-bold text-zinc-300 mb-1 block">Life Cockpit Bio</label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Personal Task Statistics Snapshot */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
              Personal Productivity Cockpit Telemetry
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800/80">
                <div className="text-base font-extrabold text-amber-400">{profile.points}</div>
                <div className="text-[10px] text-zinc-400">Total XP</div>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800/80">
                <div className="text-base font-extrabold text-rose-400">{profile.currentStreak} Days</div>
                <div className="text-[10px] text-zinc-400">Current Streak</div>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800/80">
                <div className="text-base font-extrabold text-indigo-400">{profile.focusSessionsCompleted}</div>
                <div className="text-[10px] text-zinc-400">Focus Sprints</div>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800/80">
                <div className="text-base font-extrabold text-teal-400">{profile.totalFocusMinutes} min</div>
                <div className="text-[10px] text-zinc-400">Deep Focus Time</div>
              </div>
            </div>
          </div>

          {/* User Tour Reset */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-800/50 border border-zinc-700/40">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              <div>
                <span className="text-xs font-semibold text-zinc-200">Interactive User Guides</span>
                <p className="text-[11px] text-zinc-400">Reset onboarding walkthroughs for all features</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onResetTour}
              className="px-3 py-1.5 rounded-xl bg-zinc-700 hover:bg-zinc-600 text-xs font-semibold text-zinc-200 transition-colors"
            >
              Restart Tours
            </button>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
            >
              {isSaving ? 'Saving Changes...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
