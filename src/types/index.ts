/**
 * TaskPulse Domain Types & Interfaces
 * Package: com.samdrashti.file1
 */

export type Priority = 'P1' | 'P2' | 'P3' | 'P4'; // P1: Urgent & Important, P2: Important, P3: Normal, P4: Someday
export type TaskStatus = 'todo' | 'in_progress' | 'completed';
export type SoundProfile = 'chime' | 'alert_beacon' | 'zen_bell' | 'soft_pulse';
export type NotificationPriority = 'urgent_fullscreen' | 'high_banner' | 'normal' | 'silent';

export interface NotificationChannel {
  id: string;
  name: string;
  sound: SoundProfile;
  priority: NotificationPriority;
  fullscreenAlarm: boolean;
  vibrationPattern: number[]; // ms pulse pattern
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string; // Hex color e.g. #4F46E5
  icon: string;
  isCustomColor?: boolean;
  channel: NotificationChannel;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  categoryId: string;
  priority: Priority;
  status: TaskStatus;
  startDate: string; // ISO string
  dueDate: string; // ISO string
  durationMinutes: number;
  alarmEnabled: boolean;
  alarmTime?: string; // ISO string
  progress: number; // 0 - 100%
  dependencies?: string[]; // IDs of tasks this task depends on (for Gantt)
  routineId?: string; // Reference to On-Call or Recurring Routine if auto-generated
  isRecurring?: boolean;
  completedAt?: string | null;
  pointsAwarded?: number;
}

export interface RoutineTemplate {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  durationDays: number;
  timesPerDay: string[]; // e.g. ['09:00', '13:00', '18:00', '23:00']
  priority: Priority;
  isActive: boolean;
  lastActivatedAt?: string | null;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  unlockedAt: string | null;
  requirementText: string;
}

export interface UserGuidesState {
  completed: string[];
  skipped: string[];
  skipAll: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  avatar: string;
  bio: string;
  role: string;
  points: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  focusSessionsCompleted: number;
  totalFocusMinutes: number;
  isPremium: boolean;
  premiumUntil: string; // ISO string
  userGuides: UserGuidesState;
  createdAt: string;
}

export type AppFlavor = 'dev' | 'staging' | 'prod';
export type DeviceFrame = 'mobile' | 'desktop' | 'fullscreen';

export type WidgetType = 'quick_completer' | 'focus_cockpit' | 'category_ring' | 'streak_trophy';

export interface WidgetItem {
  id: string;
  type: WidgetType;
  title: string;
  size: '2x2' | '4x2';
  pinned: boolean;
}
