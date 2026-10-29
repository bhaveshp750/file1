/**
 * Gamification & Milestone Badges Component
 * Generates viral lead-gen social media image creatives & captions
 */

import React, { useRef, useState, useEffect } from 'react';
import { Badge, UserProfile } from '../types/index';
import { calculateUserLevel } from '../utils/rules';
import confetti from 'canvas-confetti';
import {
  Award,
  Check,
  Copy,
  Download,
  Flame,
  Globe,
  Lock,
  Share2,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react';

interface GamificationViewProps {
  profile: UserProfile;
  badges: Badge[];
}

export const GamificationView: React.FC<GamificationViewProps> = ({ profile, badges }) => {
  const [selectedBadge, setSelectedBadge] = useState<Badge>(badges[0] || null);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const levelInfo = calculateUserLevel(profile.points);

  // Social sharing caption tailored for viral product lead generation
  const socialCaption = `🚀 Leveled up on TaskPulse! Just unlocked the "${selectedBadge?.title || 'Task Master'}" milestone badge! 🏆
⚡ Total XP: ${profile.points} pts | 🔥 Active Streak: ${profile.currentStreak} Days | 🛡️ Level: ${levelInfo.level}

Track your life tasks, on-call DevOps rotations, and habits from First-Person View with TaskPulse.
👉 Available on Android & Desktop (Package: com.samdrashti.file1)
#TaskPulse #Productivity #LifeCockpit #DevOps #Habits`;

  // Draw the high-resolution social card on canvas
  const renderCreativeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1080;
    const height = 1080;
    canvas.width = width;
    canvas.height = height;

    // Background Gradient
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, '#09090b');
    bgGradient.addColorStop(0.5, '#0f172a');
    bgGradient.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Decorative Neon Glow Rings
    const ringGrad = ctx.createRadialGradient(540, 420, 50, 540, 420, 360);
    ringGrad.addColorStop(0, 'rgba(99, 102, 241, 0.35)');
    ringGrad.addColorStop(0.7, 'rgba(168, 85, 247, 0.1)');
    ringGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = ringGrad;
    ctx.fillRect(0, 0, width, height);

    // Outer Border Frame
    ctx.strokeStyle = '#312e81';
    ctx.lineWidth = 14;
    ctx.strokeRect(30, 30, width - 60, height - 60);

    // App Branding Header
    ctx.fillStyle = '#818cf8';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ TASKPULSE • LIFE COCKPIT', 540, 110);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '24px sans-serif';
    ctx.fillText('Cross-Platform Task Manager (com.samdrashti.file1)', 540, 155);

    // Unlocked Banner Pill
    ctx.fillStyle = '#4f46e5';
    ctx.beginPath();
    ctx.roundRect(340, 200, 400, 50, 25);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('🏆 MILESTONE UNLOCKED 🏆', 540, 233);

    // Central Badge Icon (Large Emoji / Symbol)
    ctx.font = '160px sans-serif';
    ctx.fillText(selectedBadge?.icon || '🏆', 540, 420);

    // Badge Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 54px sans-serif';
    ctx.fillText(selectedBadge?.title || 'Task Master', 540, 510);

    // Badge Description
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '30px sans-serif';
    ctx.fillText(selectedBadge?.description || 'Completed high-impact tasks in life', 540, 565);

    // Stats Grid Box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(140, 630, 800, 180, 30);
    ctx.fill();
    ctx.stroke();

    // Stats Column 1: Level
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('LEVEL TIER', 270, 680);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 50px sans-serif';
    ctx.fillText(`Lvl ${levelInfo.level}`, 270, 750);

    // Stats Column 2: XP Points
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('TOTAL XP', 540, 680);
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 50px sans-serif';
    ctx.fillText(`${profile.points} pts`, 540, 750);

    // Stats Column 3: Streak
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('ACTIVE STREAK', 810, 680);
    ctx.fillStyle = '#f43f5e';
    ctx.font = 'bold 50px sans-serif';
    ctx.fillText(`🔥 ${profile.currentStreak}d`, 810, 750);

    // Footer Lead Generation Call to Action
    ctx.fillStyle = '#a5b4fc';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('Organize your life from First-Person View with TaskPulse', 540, 890);

    ctx.fillStyle = '#64748b';
    ctx.font = '24px sans-serif';
    ctx.fillText('Download the App: taskpulse.app | Built for Mobile & Desktop', 540, 940);
  };

  useEffect(() => {
    if (selectedBadge) {
      renderCreativeCanvas();
    }
  }, [selectedBadge, profile]);

  const handleDownloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    confetti({ particleCount: 80, spread: 70 });
    const image = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = image;
    a.download = `TaskPulse-${selectedBadge?.title.replace(/\s+/g, '-')}-Achievement.png`;
    a.click();
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(socialCaption);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Top XP & Level Progression Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-400">
                  Player Rank: Lvl {levelInfo.level}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {profile.points} Total XP
                </span>
              </div>
              <h2 className="text-2xl font-black text-white">{profile.username}</h2>
              <p className="text-xs text-zinc-400">{profile.role}</p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-rose-400 font-extrabold text-xl">
                <Flame className="w-5 h-5 fill-rose-500" />
                <span>{profile.currentStreak} Days</span>
              </div>
              <span className="text-[11px] font-semibold text-zinc-400">Current Streak</span>
            </div>

            <div className="text-center">
              <div className="text-amber-400 font-extrabold text-xl">{profile.focusSessionsCompleted}</div>
              <span className="text-[11px] font-semibold text-zinc-400">Focus Sprints</span>
            </div>

            <div className="text-center">
              <div className="text-indigo-400 font-extrabold text-xl">{badges.filter((b) => b.unlockedAt).length}</div>
              <span className="text-[11px] font-semibold text-zinc-400">Badges Won</span>
            </div>
          </div>
        </div>

        {/* Level Progression Progress Bar */}
        <div className="mt-6 pt-6 border-t border-zinc-800">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="text-zinc-400">
              Level {levelInfo.level} Progress ({levelInfo.progressPercent}%)
            </span>
            <span className="text-indigo-400 font-mono">
              {profile.points} / {levelInfo.nextLevelPoints} XP to Level {levelInfo.level + 1}
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-zinc-800 overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
              style={{ width: `${levelInfo.progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-400" />
          <span>Milestone Badges ({badges.filter((b) => b.unlockedAt).length}/{badges.length} Unlocked)</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {badges.map((badge) => {
            const isUnlocked = !!badge.unlockedAt;
            const isSelected = selectedBadge?.id === badge.id;

            return (
              <button
                key={badge.id}
                onClick={() => setSelectedBadge(badge)}
                className={`p-4 rounded-3xl border text-center transition-all flex flex-col items-center justify-between gap-3 relative cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-800 border-indigo-500 ring-2 ring-indigo-500/40 shadow-xl'
                    : isUnlocked
                    ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                    : 'bg-zinc-950/60 border-zinc-800/40 opacity-55'
                }`}
              >
                {!isUnlocked && (
                  <div className="absolute top-2 right-2 p-1 rounded-full bg-zinc-800 text-zinc-400">
                    <Lock className="w-3 h-3" />
                  </div>
                )}

                <div className="text-4xl mt-1">{badge.icon}</div>

                <div>
                  <h4 className="text-xs font-bold text-white">{badge.title}</h4>
                  <p className="text-[10px] text-zinc-400 line-clamp-2 mt-0.5">{badge.requirementText}</p>
                </div>

                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    isUnlocked ? 'bg-emerald-500/20 text-emerald-300' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {isUnlocked ? 'Unlocked' : 'Locked'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Social Media Sharing & Lead-Gen Creative Card */}
      {selectedBadge && (
        <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-400">
                Viral Social Media Asset Generator
              </span>
              <h3 className="text-xl font-bold text-white">Share Milestone & Boost Product Reach</h3>
              <p className="text-xs text-zinc-400">
                Share this high-impact creative image on Twitter, LinkedIn, or Instagram to showcase achievements and bring in teammates.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCaption}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors"
              >
                {copiedCaption ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCaption ? 'Caption Copied!' : 'Copy Lead-Gen Caption'}</span>
              </button>

              <button
                onClick={handleDownloadImage}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Image Creative (PNG)</span>
              </button>
            </div>
          </div>

          {/* Live Canvas Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            {/* Visual Canvas Display */}
            <div className="flex justify-center p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
              <canvas
                ref={canvasRef}
                className="w-full max-w-[380px] aspect-square rounded-2xl shadow-2xl border border-zinc-800"
              />
            </div>

            {/* Formatted Lead-Gen Caption Preview */}
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Pre-Formatted Viral Post Copy:
                </span>
                <pre className="text-xs text-zinc-300 font-sans whitespace-pre-wrap leading-relaxed select-all">
                  {socialCaption}
                </pre>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(socialCaption)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-bold hover:bg-sky-500/30 transition-colors"
                >
                  Share to X / Twitter
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://taskpulse.app')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-blue-600/20 text-blue-300 border border-blue-600/30 text-xs font-bold hover:bg-blue-600/30 transition-colors"
                >
                  Share to LinkedIn
                </a>
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(socialCaption)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/30 transition-colors"
                >
                  Share to WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
