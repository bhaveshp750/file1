/**
 * TaskPulse Pure Domain Rules
 * Decoupled logic for points, streaks, badges, routine schedules, and feature flags
 */

import { Task, Priority, RoutineTemplate, Badge, UserProfile } from '../types/index';

export const DEFAULT_CATEGORIES = [
  {
    id: 'cat-office',
    name: 'Office & Work',
    color: '#4F46E5', // Indigo
    icon: 'Briefcase',
    channel: {
      id: 'ch-office',
      name: 'Office Priority Channel',
      sound: 'alert_beacon' as const,
      priority: 'high_banner' as const,
      fullscreenAlarm: true,
      vibrationPattern: [200, 100, 200],
    },
  },
  {
    id: 'cat-chores',
    name: 'Household Chores',
    color: '#D97706', // Amber
    icon: 'Home',
    channel: {
      id: 'ch-chores',
      name: 'Home Routine Channel',
      sound: 'chime' as const,
      priority: 'normal' as const,
      fullscreenAlarm: false,
      vibrationPattern: [150, 150],
    },
  },
  {
    id: 'cat-sadhana',
    name: 'Workout & Sadhana',
    color: '#0D9488', // Teal
    icon: 'Activity',
    channel: {
      id: 'ch-sadhana',
      name: 'Zen Sadhana Channel',
      sound: 'zen_bell' as const,
      priority: 'urgent_fullscreen' as const,
      fullscreenAlarm: true,
      vibrationPattern: [300, 200, 300],
    },
  },
  {
    id: 'cat-family',
    name: 'Friends & Family',
    color: '#E11D48', // Rose
    icon: 'Heart',
    channel: {
      id: 'ch-family',
      name: 'Connect Reminder Channel',
      sound: 'soft_pulse' as const,
      priority: 'normal' as const,
      fullscreenAlarm: false,
      vibrationPattern: [100, 100, 100],
    },
  },
  {
    id: 'cat-events',
    name: 'Events & Festivals',
    color: '#7C3AED', // Purple
    icon: 'Calendar',
    channel: {
      id: 'ch-events',
      name: 'Celebration Event Channel',
      sound: 'chime' as const,
      priority: 'high_banner' as const,
      fullscreenAlarm: true,
      vibrationPattern: [250, 150, 250],
    },
  },
  {
    id: 'cat-learning',
    name: 'Study & Learning',
    color: '#0284C7', // Sky Blue
    icon: 'BookOpen',
    channel: {
      id: 'ch-learning',
      name: 'Deep Study Channel',
      sound: 'zen_bell' as const,
      priority: 'normal' as const,
      fullscreenAlarm: false,
      vibrationPattern: [200, 200],
    },
  },
];

export const INITIAL_BADGES: Badge[] = [
  {
    id: 'task-master',
    title: 'Task Master',
    description: 'Completed 15 or more high-impact life tasks',
    icon: '🏆',
    category: 'Productivity',
    unlockedAt: null,
    requirementText: 'Complete 15 tasks',
  },
  {
    id: 'streak-keeper',
    title: 'Streak Keeper',
    description: 'Maintained a strong 5-day active execution streak',
    icon: '🔥',
    category: 'Consistency',
    unlockedAt: null,
    requirementText: 'Achieve 5-day streak',
  },
  {
    id: 'deep-focus-hero',
    title: 'Deep Focus Hero',
    description: 'Completed 3 distraction-free Focus Mode sessions',
    icon: '⚡',
    category: 'Focus',
    unlockedAt: null,
    requirementText: 'Finish 3 focus sessions',
  },
  {
    id: 'on-call-sentinel',
    title: 'On-Call Sentinel',
    description: 'Successfully survived and tracked a 7-day on-call or habit routine',
    icon: '🛡️',
    category: 'DevOps & Endurance',
    unlockedAt: null,
    requirementText: 'Activate & complete an on-call rotation',
  },
  {
    id: 'early-bird',
    title: 'Early Bird',
    description: 'Ticked off morning workout or sadhana tasks before 9 AM',
    icon: '🌅',
    category: 'Wellness',
    unlockedAt: null,
    requirementText: 'Complete a morning task before 9 AM',
  },
  {
    id: 'growth-explorer',
    title: 'Growth Explorer',
    description: 'Invested into yourself by finishing 5 Study & Learning tasks',
    icon: '💡',
    category: 'Growth',
    unlockedAt: null,
    requirementText: 'Complete 5 Study & Learning tasks',
  },
];

/**
 * Point calculation based on task priority and current streak
 */
export function calculateTaskPoints(priority: Priority, streak: number = 0, isRoutine: boolean = false): number {
  const basePoints: Record<Priority, number> = {
    P1: 50,
    P2: 35,
    P3: 20,
    P4: 10,
  };

  const base = basePoints[priority] || 20;
  const streakBonus = Math.min(streak * 5, 50); // up to +50 pts bonus
  const routineBonus = isRoutine ? 15 : 0;

  return base + streakBonus + routineBonus;
}

/**
 * Level progression calculation:
 * Level 1: 0-100 pts
 * Level 2: 101-300 pts
 * Level 3: 301-600 pts
 * etc.
 */
export function calculateUserLevel(totalPoints: number): { level: number; nextLevelPoints: number; currentLevelFloor: number; progressPercent: number } {
  const levels = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 6000];
  let level = 1;

  for (let i = 0; i < levels.length; i++) {
    if (totalPoints >= levels[i]) {
      level = i + 1;
    } else {
      break;
    }
  }

  const currentLevelFloor = levels[level - 1] || 0;
  const nextLevelPoints = levels[level] || currentLevelFloor + 1000;
  const range = nextLevelPoints - currentLevelFloor;
  const progressPercent = Math.min(100, Math.max(0, Math.round(((totalPoints - currentLevelFloor) / range) * 100)));

  return { level, nextLevelPoints, currentLevelFloor, progressPercent };
}

/**
 * Checks which badges should be unlocked based on stats
 */
export function evaluateBadges(
  stats: {
    completedTasksCount: number;
    currentStreak: number;
    focusSessionsCompleted: number;
    hasCompletedOnCall: boolean;
    hasEarlyMorningTask: boolean;
    learningTasksCompleted: number;
  },
  currentBadges: Badge[]
): Badge[] {
  const now = new Date().toISOString();

  return currentBadges.map((badge) => {
    if (badge.unlockedAt) return badge; // Already unlocked

    let shouldUnlock = false;
    switch (badge.id) {
      case 'task-master':
        shouldUnlock = stats.completedTasksCount >= 15;
        break;
      case 'streak-keeper':
        shouldUnlock = stats.currentStreak >= 5;
        break;
      case 'deep-focus-hero':
        shouldUnlock = stats.focusSessionsCompleted >= 3;
        break;
      case 'on-call-sentinel':
        shouldUnlock = stats.hasCompletedOnCall;
        break;
      case 'early-bird':
        shouldUnlock = stats.hasEarlyMorningTask;
        break;
      case 'growth-explorer':
        shouldUnlock = stats.learningTasksCompleted >= 5;
        break;
    }

    if (shouldUnlock) {
      return { ...badge, unlockedAt: now };
    }
    return badge;
  });
}

/**
 * Generates automated multi-day tasks for On-Call rotation or recurring routine
 * Example: Software dev on-call for 7 days with 4 daily monitoring checkpoints
 */
export function generateRoutineTasks(
  routine: RoutineTemplate,
  startDate: Date,
  userId: string
): Omit<Task, 'id'>[] {
  const generated: Omit<Task, 'id'>[] = [];

  for (let day = 0; day < routine.durationDays; day++) {
    const currentDay = new Date(startDate);
    currentDay.setDate(startDate.getDate() + day);

    const dateStr = currentDay.toISOString().split('T')[0];

    routine.timesPerDay.forEach((timeStr, index) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const startDateTime = new Date(currentDay);
      startDateTime.setHours(hours, minutes, 0, 0);

      const dueDateTime = new Date(startDateTime);
      dueDateTime.setMinutes(dueDateTime.getMinutes() + 30); // 30 min duration default

      const dayLabel = `Day ${day + 1}`;
      const checkpointLabel = `Check #${index + 1} (${timeStr})`;

      generated.push({
        userId,
        title: `${routine.title} - ${dayLabel} ${checkpointLabel}`,
        description: `Routine scheduled check for ${routine.title}. Ensure system telemetry, alerts & response protocols are green.`,
        categoryId: routine.categoryId,
        priority: routine.priority,
        status: 'todo',
        startDate: startDateTime.toISOString(),
        dueDate: dueDateTime.toISOString(),
        durationMinutes: 30,
        alarmEnabled: true,
        alarmTime: startDateTime.toISOString(),
        progress: 0,
        routineId: routine.id,
        isRecurring: true,
        completedAt: null,
      });
    });
  }

  return generated;
}

/**
 * Evaluates feature flags for freemium gating
 */
export function evaluateFeatureFlag(
  flagName:
    | 'custom_category_colors'
    | 'max_categories'
    | 'on_call_routine_generator'
    | 'custom_notification_channels'
    | 'advanced_gantt_export'
    | 'unlimited_widgets',
  profile: Pick<UserProfile, 'isPremium' | 'premiumUntil'>
): { allowed: boolean; reason?: string } {
  const isPremiumValid =
    profile.isPremium &&
    (!profile.premiumUntil || new Date(profile.premiumUntil).getTime() > Date.now());

  if (isPremiumValid) {
    return { allowed: true };
  }

  // Free Tier constraints
  switch (flagName) {
    case 'custom_category_colors':
      return { allowed: false, reason: 'Custom hex color palettes require TaskPulse Pro.' };
    case 'max_categories':
      return { allowed: false, reason: 'Free tier is limited to 4 categories maximum.' };
    case 'on_call_routine_generator':
      return { allowed: false, reason: 'Multi-day On-Call and Sprint batch routines are a Pro feature.' };
    case 'advanced_gantt_export':
      return { allowed: false, reason: 'High-res Gantt timeline export requires TaskPulse Pro.' };
    case 'custom_notification_channels':
      return { allowed: false, reason: 'Custom vibration and sound frequencies are a Pro feature.' };
    case 'unlimited_widgets':
      return { allowed: false, reason: 'Free plan includes up to 1 pinned widget.' };
    default:
      return { allowed: true };
  }
}
