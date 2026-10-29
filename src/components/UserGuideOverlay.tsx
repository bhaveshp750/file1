/**
 * Interactive Feature-by-Feature User Guide Component
 * Supports Skip (persists a replay badge) and Skip-All (permanently hides), synced with backend
 */

import React, { useState } from 'react';
import { UserGuidesState } from '../types/index';
import {
  BookOpen,
  ChevronRight,
  Compass,
  HelpCircle,
  Lightbulb,
  Sparkles,
  X,
  CheckCircle,
} from 'lucide-react';

export interface GuideStep {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  badgeLabel: string;
  targetFeature: string;
  highlights: string[];
}

export const GUIDE_STEPS: GuideStep[] = [
  {
    id: 'guide-cockpit',
    title: 'Welcome to TaskPulse (Life Cockpit)',
    subtitle: 'First-Person View (FPV) Task Completer',
    description:
      'Manage tasks across all dimensions of your life: Office, Household, Sadhana/Workouts, and Family. Quickly complete tasks, view XP level progression, and stay focused on what matters next.',
    badgeLabel: 'Core Cockpit Guide',
    targetFeature: 'cockpit',
    highlights: [
      'First-Person View of upcoming deadlines',
      'Instant 1-click Focus Mode entry',
      'Daily Eisenhower priority filtering (P1 - P4)',
    ],
  },
  {
    id: 'guide-categories',
    title: 'Category Customization & Notification Channels',
    subtitle: 'Custom Colors, Alarms, and Vibration Patterns',
    description:
      'Every category has its own distinct color identity and dedicated notification channel. Set custom full-screen alarm sirens, zen singing bowl tones, and vibration pulses.',
    badgeLabel: 'Category & Channels Guide',
    targetFeature: 'categories',
    highlights: [
      'Distinct color palette for visual identification',
      'Fullscreen alarm HUD for urgent alerts',
      'Audio profiles: Chime, Beacon, Zen Bell, Soft Pulse',
    ],
  },
  {
    id: 'guide-routines',
    title: 'On-Call & Multi-Day Repeated Task Rotations',
    subtitle: 'One-Toggle SRE / Dev Rotations & Habit Sprints',
    description:
      'Are you on-call for 7 days or starting a 14-day Sadhana sprint? With one single toggle, TaskPulse generates your daily scheduled monitoring checkpoints and drops them right into your timeline.',
    badgeLabel: 'On-Call Rotations Guide',
    targetFeature: 'routines',
    highlights: [
      'One-toggle 4x daily monitoring scheduler',
      'Automatic cleanup when rotation ends',
      'Earn On-Call Sentinel achievement badges',
    ],
  },
  {
    id: 'guide-gantt',
    title: 'Interactive Gantt Chart Timeline',
    subtitle: 'Visual Project Completion & Milestone Dependencies',
    description:
      'Zoom into your task execution timeline. Track progress bars, link dependencies, and see your whole week unfold visually with category color markers.',
    badgeLabel: 'Gantt Chart Guide',
    targetFeature: 'gantt',
    highlights: [
      'Drag and inspect timeline intervals',
      'Live pulse indicator for current time',
      'Dependency tracking between life deliverables',
    ],
  },
  {
    id: 'guide-focus',
    title: 'Distraction-Free Focus Mode',
    subtitle: 'Single Task Isolation & Pomodoro Countdown',
    description:
      'Eliminate cognitive overload. Lock into a single task with an ambient breathing timer, scratchpad, and optional silence for non-urgent notifications.',
    badgeLabel: 'Focus Mode Guide',
    targetFeature: 'focus',
    highlights: [
      'Hides all other tasks and clutter',
      'Customizable 15, 25, 50-minute Pomodoro timers',
      'Earn +40 XP bonus per completed session',
    ],
  },
];

interface UserGuideOverlayProps {
  userGuides: UserGuidesState;
  onComplete: (guideId: string) => void;
  onSkip: (guideId: string) => void;
  onSkipAll: () => void;
  onResetGuides: () => void;
  activeFeatureTab?: string;
}

export const UserGuideOverlay: React.FC<UserGuideOverlayProps> = ({
  userGuides,
  onComplete,
  onSkip,
  onSkipAll,
  onResetGuides,
  activeFeatureTab,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [askNewFeatureGuide, setAskNewFeatureGuide] = useState(true);

  // If user has not chosen skipAll and has uncompleted guides, automatically show first uncompleted guide on start
  React.useEffect(() => {
    if (userGuides.skipAll) return;
    const firstPendingIndex = GUIDE_STEPS.findIndex(
      (step) => !userGuides.completed.includes(step.id) && !userGuides.skipped.includes(step.id)
    );
    if (firstPendingIndex !== -1) {
      setCurrentStepIndex(firstPendingIndex);
      setIsOpen(true);
    }
  }, [userGuides]);

  const step = GUIDE_STEPS[currentStepIndex] || GUIDE_STEPS[0];

  const handleNext = () => {
    onComplete(step.id);
    if (currentStepIndex < GUIDE_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      setIsOpen(false);
    }
  };

  const handleSkipStep = () => {
    onSkip(step.id);
    setIsOpen(false);
  };

  const handleReopenGuide = (index: number) => {
    setCurrentStepIndex(index);
    setIsOpen(true);
  };

  return (
    <>
      {/* Persistent Floating Guide Recall Badges (when skipped or available) */}
      <div className="fixed bottom-20 sm:bottom-6 right-6 z-40 flex flex-col items-end gap-2">
        {/* If user skipped a guide or wants assistance, show a floating helper pill */}
        {!isOpen && (
          <div className="flex items-center gap-2">
            {userGuides.skipped.length > 0 && (
              <button
                onClick={() => {
                  const skippedIdx = GUIDE_STEPS.findIndex((s) => userGuides.skipped.includes(s.id));
                  handleReopenGuide(skippedIdx !== -1 ? skippedIdx : 0);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500 text-zinc-950 shadow-lg hover:bg-amber-400 transition-transform active:scale-95 animate-pulse"
                title="Click to resume skipped feature guide"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Resume Guide ({userGuides.skipped.length} Skipped)</span>
              </button>
            )}

            <button
              onClick={() => handleReopenGuide(0)}
              aria-label="Open Interactive App Tour"
              className="p-2.5 rounded-full bg-zinc-800/90 text-zinc-200 border border-zinc-700 shadow-xl hover:bg-zinc-700 transition-transform active:scale-95"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Guide Modal Overlay */}
      {isOpen && !userGuides.skipAll && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-3xl bg-zinc-900 border border-zinc-700/80 p-6 sm:p-8 shadow-2xl relative text-zinc-100 overflow-hidden">
            {/* Top Indicator */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  Feature Guide {currentStepIndex + 1} of {GUIDE_STEPS.length}
                </span>
                <span className="text-xs text-zinc-400">{step.badgeLabel}</span>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close guide preview"
                className="p-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Guide Step Content */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white leading-snug">{step.title}</h3>
                  <p className="text-xs text-indigo-400 font-medium">{step.subtitle}</p>
                </div>
              </div>

              <p className="text-sm text-zinc-300 leading-relaxed pt-1">{step.description}</p>

              {/* Highlights List */}
              <div className="p-3.5 rounded-2xl bg-zinc-800/60 border border-zinc-700/40 space-y-2 mt-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Key Capabilities:
                </span>
                {step.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-zinc-200">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="flex gap-1.5 mb-6">
              {GUIDE_STEPS.map((s, idx) => (
                <div
                  key={s.id}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    idx === currentStepIndex
                      ? 'bg-indigo-500'
                      : userGuides.completed.includes(s.id)
                      ? 'bg-emerald-500'
                      : 'bg-zinc-800'
                  }`}
                />
              ))}
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-zinc-800">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleSkipStep}
                  className="flex-1 sm:flex-initial text-xs font-semibold px-3.5 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
                >
                  Skip Step
                </button>
                <button
                  onClick={() => {
                    onSkipAll();
                    setIsOpen(false);
                  }}
                  className="flex-1 sm:flex-initial text-xs font-semibold px-3 py-2 text-zinc-500 hover:text-rose-400 transition-colors"
                >
                  Skip All
                </button>
              </div>

              <button
                onClick={handleNext}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
              >
                <span>{currentStepIndex < GUIDE_STEPS.length - 1 ? 'Next Feature' : 'Finish Tour'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
