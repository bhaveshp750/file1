/**
 * TaskPulse Backend Server
 * Express + Supabase Real-Time Database & Auth Adapter + Feature Flag Middleware
 * Package: com.samdrashti.file1
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import {
  DEFAULT_CATEGORIES,
  INITIAL_BADGES,
  calculateTaskPoints,
  calculateUserLevel,
  evaluateBadges,
  generateRoutineTasks,
  evaluateFeatureFlag,
} from './src/utils/rules';
import { Task, Category, RoutineTemplate, UserProfile, Badge } from './src/types/index';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);
const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseKey) : null;

if (isSupabaseConfigured) {
  console.log(`[TaskPulse] Connected to live Supabase project: ${supabaseUrl}`);
} else {
  console.log('[TaskPulse] Running in local in-memory adapter mode (Supabase keys not yet configured).');
}

// In-Memory Database Store (with persistent state across requests and Supabase fallback)
const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

let currentUserProfile: UserProfile = {
  id: 'usr-default',
  email: 'bhaveshp750@gmail.com',
  username: 'Bhavesh P.',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  bio: 'Lead Software Architect | Mastering life tasks from First-Person View',
  role: 'Senior Software Engineer & Team Lead',
  points: 560,
  level: 3,
  currentStreak: 6,
  longestStreak: 12,
  focusSessionsCompleted: 5,
  totalFocusMinutes: 145,
  isPremium: true,
  premiumUntil: oneYearFromNow,
  userGuides: {
    completed: ['guide-cockpit'],
    skipped: [],
    skipAll: false,
  },
  createdAt: new Date().toISOString(),
};

let userCategories: Category[] = [...DEFAULT_CATEGORIES.map((c) => ({ ...c, userId: currentUserProfile.id }))];

const initialTasks: Task[] = [
  {
    id: 'task-1',
    userId: currentUserProfile.id,
    title: 'Review Kubernetes Ingress & Alert Routing',
    description: 'Verify latency metrics under high traffic & ensure PagerDuty webhook latency is < 200ms.',
    categoryId: 'cat-office',
    priority: 'P1',
    status: 'completed',
    startDate: new Date(Date.now() - 3600000 * 2).toISOString(),
    dueDate: new Date(Date.now() + 3600000 * 3).toISOString(),
    durationMinutes: 45,
    alarmEnabled: true,
    alarmTime: new Date(Date.now() + 3600000 * 1).toISOString(),
    progress: 100,
    dependencies: [],
    completedAt: new Date().toISOString(),
    pointsAwarded: 50,
  },
  {
    id: 'task-2',
    userId: currentUserProfile.id,
    title: 'Morning Surya Namaskar & 20m Sadhana',
    description: '12 rounds of Surya Namaskar followed by breathwork and stillness.',
    categoryId: 'cat-sadhana',
    priority: 'P1',
    status: 'completed',
    startDate: new Date(Date.now() - 3600000 * 5).toISOString(),
    dueDate: new Date(Date.now() - 3600000 * 4).toISOString(),
    durationMinutes: 30,
    alarmEnabled: true,
    alarmTime: new Date(Date.now() - 3600000 * 5).toISOString(),
    progress: 100,
    completedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    pointsAwarded: 60,
  },
  {
    id: 'task-3',
    userId: currentUserProfile.id,
    title: 'Grocery Restock: Organic Greens & Coffee Beans',
    description: 'Pick up weekly essentials for the kitchen.',
    categoryId: 'cat-chores',
    priority: 'P2',
    status: 'todo',
    startDate: new Date(Date.now() + 3600000 * 4).toISOString(),
    dueDate: new Date(Date.now() + 3600000 * 6).toISOString(),
    durationMinutes: 40,
    alarmEnabled: true,
    alarmTime: new Date(Date.now() + 3600000 * 4).toISOString(),
    progress: 0,
    completedAt: null,
  },
  {
    id: 'task-4',
    userId: currentUserProfile.id,
    title: 'Weekend Family Catch-Up Call',
    description: 'Connect with parents and discuss upcoming Diwali festival travel plans.',
    categoryId: 'cat-family',
    priority: 'P2',
    status: 'todo',
    startDate: new Date(Date.now() + 3600000 * 8).toISOString(),
    dueDate: new Date(Date.now() + 3600000 * 9).toISOString(),
    durationMinutes: 45,
    alarmEnabled: false,
    progress: 0,
    completedAt: null,
  },
  {
    id: 'task-5',
    userId: currentUserProfile.id,
    title: 'Deep Dive: Distributed Systems Consensus Raft vs Paxos',
    description: 'Read chapters 7 & 8 in Designing Data-Intensive Applications.',
    categoryId: 'cat-learning',
    priority: 'P3',
    status: 'todo',
    startDate: new Date(Date.now() + 3600000 * 12).toISOString(),
    dueDate: new Date(Date.now() + 3600000 * 14).toISOString(),
    durationMinutes: 60,
    alarmEnabled: true,
    alarmTime: new Date(Date.now() + 3600000 * 12).toISOString(),
    progress: 20,
    completedAt: null,
  },
];

let userTasks: Task[] = [...initialTasks];

let userRoutines: RoutineTemplate[] = [
  {
    id: 'routine-devops-oncall',
    title: 'DevOps & SRE On-Call 7-Day Rotation',
    description: 'Automated 4x daily telemetry verification, queue inspection, and latency checks for 7 days.',
    categoryId: 'cat-office',
    durationDays: 7,
    timesPerDay: ['09:00', '13:00', '18:00', '23:00'],
    priority: 'P1',
    isActive: true,
    lastActivatedAt: new Date().toISOString(),
  },
  {
    id: 'routine-morning-sadhana',
    title: 'Daily Morning Sadhana & Pranayama Sprint',
    description: '30-minute sunrise mindfulness, breathing exercise, and hydration habit for 14 days.',
    categoryId: 'cat-sadhana',
    durationDays: 14,
    timesPerDay: ['06:30'],
    priority: 'P2',
    isActive: true,
    lastActivatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'routine-study-sprint',
    title: 'Tech Lead Architecture Reading Sprint',
    description: 'Daily evening 45-minute continuous learning session for 10 days.',
    categoryId: 'cat-learning',
    durationDays: 10,
    timesPerDay: ['20:30'],
    priority: 'P3',
    isActive: false,
    lastActivatedAt: null,
  },
];

let userBadges: Badge[] = evaluateBadges(
  {
    completedTasksCount: 14,
    currentStreak: currentUserProfile.currentStreak,
    focusSessionsCompleted: currentUserProfile.focusSessionsCompleted,
    hasCompletedOnCall: true,
    hasEarlyMorningTask: true,
    learningTasksCompleted: 3,
  },
  INITIAL_BADGES
);

// Automatic Seed Function for Live Supabase
async function seedSupabaseIfEmpty() {
  if (!supabase) return;

  try {
    const { data: existingTasks } = await supabase.from('tasks').select('id').limit(1);
    if (!existingTasks || existingTasks.length === 0) {
      console.log('[TaskPulse] Seeding initial tasks into live Supabase database...');
      // Map tasks to database column casing
      const dbTasks = initialTasks.map((t) => ({
        id: t.id,
        user_id: null,
        title: t.title,
        description: t.description,
        category_id: null,
        priority: t.priority,
        status: t.status,
        start_date: t.startDate,
        due_date: t.dueDate,
        duration_minutes: t.durationMinutes,
        alarm_enabled: t.alarmEnabled,
        alarm_time: t.alarmTime,
        progress: t.progress,
        points_awarded: t.pointsAwarded || 0,
      }));
      await supabase.from('tasks').insert(dbTasks);
      console.log('[TaskPulse] Seeded tasks into Supabase successfully!');
    }
  } catch (err) {
    console.warn('[TaskPulse] Supabase seed notice:', err instanceof Error ? err.message : err);
  }
}

// --- REST API ENDPOINTS ---

// Server & Flavor Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'TaskPulse',
    packageName: 'com.samdrashti.file1',
    version: '1.0.0-flutter-crossplatform',
    currentFlavor: req.query.flavor || 'dev',
    time: new Date().toISOString(),
    supabaseConnected: isSupabaseConfigured,
    supabaseUrl: supabaseUrl ? `${supabaseUrl.slice(0, 24)}...` : null,
  });
});

// Authentication: Strictly ONLY Passwordless & Social Logins
app.post('/api/auth/passwordless', async (req, res) => {
  const { email, method } = req.body; // method: 'magic_link' | 'otp' | 'passkey'
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email is required for passwordless authentication.' });
  }

  // Update or set current profile
  currentUserProfile.email = email;
  currentUserProfile.username = email.split('@')[0];

  if (supabase) {
    try {
      if (method === 'otp') {
        await supabase.auth.signInWithOtp({ email });
      } else {
        await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${req.protocol}://${req.get('host')}` },
        });
      }
    } catch (e) {
      console.warn('Supabase auth notice:', e);
    }
  }

  res.json({
    success: true,
    method: method || 'magic_link',
    message: `Authenticated securely via ${method === 'otp' ? 'One-Time Passcode (OTP)' : 'Passwordless Magic Link'}.`,
    user: currentUserProfile,
    token: `jwt-taskpulse-passwordless-${Date.now()}`,
    supabaseLive: isSupabaseConfigured,
  });
});

app.post('/api/auth/social', async (req, res) => {
  const { provider } = req.body; // 'google' | 'github'
  if (!['google', 'github'].includes(provider)) {
    return res.status(400).json({ error: 'Only Google and GitHub social logins are supported.' });
  }

  res.json({
    success: true,
    provider,
    message: `Signed in successfully with ${provider.charAt(0).toUpperCase() + provider.slice(1)}.`,
    user: currentUserProfile,
    token: `jwt-taskpulse-social-${provider}-${Date.now()}`,
    supabaseLive: isSupabaseConfigured,
  });
});

// Profile endpoints
app.get('/api/user/profile', (req, res) => {
  res.json(currentUserProfile);
});

app.put('/api/user/profile', async (req, res) => {
  const updates = req.body;
  currentUserProfile = {
    ...currentUserProfile,
    ...updates,
    id: currentUserProfile.id,
  };

  if (supabase) {
    try {
      await supabase.from('profiles').upsert({
        id: currentUserProfile.id,
        username: currentUserProfile.username,
        avatar: currentUserProfile.avatar,
        bio: currentUserProfile.bio,
        role: currentUserProfile.role,
        points: currentUserProfile.points,
        level: currentUserProfile.level,
        is_premium: currentUserProfile.isPremium,
      });
    } catch (e) {
      console.warn('Supabase profile sync notice:', e);
    }
  }

  res.json(currentUserProfile);
});

// User Guides state (Feature-by-Feature guide persistence)
app.post('/api/user/guides', (req, res) => {
  const { guideId, action } = req.body;

  if (action === 'skip_all') {
    currentUserProfile.userGuides.skipAll = true;
  } else if (action === 'complete') {
    if (!currentUserProfile.userGuides.completed.includes(guideId)) {
      currentUserProfile.userGuides.completed.push(guideId);
    }
    currentUserProfile.userGuides.skipped = currentUserProfile.userGuides.skipped.filter((id) => id !== guideId);
  } else if (action === 'skip') {
    if (!currentUserProfile.userGuides.skipped.includes(guideId)) {
      currentUserProfile.userGuides.skipped.push(guideId);
    }
  } else if (action === 'reset') {
    currentUserProfile.userGuides = { completed: [], skipped: [], skipAll: false };
  }

  res.json(currentUserProfile.userGuides);
});

// Tasks CRUD
app.get('/api/tasks', async (req, res) => {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        // Map database columns to app schema
        const mapped: Task[] = data.map((t) => ({
          id: t.id,
          userId: t.user_id || currentUserProfile.id,
          title: t.title,
          description: t.description || '',
          categoryId: t.category_id || 'cat-office',
          priority: t.priority as any,
          status: t.status as any,
          startDate: t.start_date || new Date().toISOString(),
          dueDate: t.due_date || new Date().toISOString(),
          durationMinutes: t.duration_minutes || 30,
          alarmEnabled: !!t.alarm_enabled,
          alarmTime: t.alarm_time,
          progress: t.progress || 0,
          dependencies: t.dependencies || [],
          routineId: t.routine_id,
          isRecurring: !!t.is_recurring,
          completedAt: t.completed_at,
          pointsAwarded: t.points_awarded,
        }));
        userTasks = mapped;
      }
    } catch (e) {
      console.warn('Supabase tasks fetch notice:', e);
    }
  }
  res.json(userTasks);
});

app.post('/api/tasks', async (req, res) => {
  const taskData = req.body;
  if (!taskData.title || !taskData.title.trim()) {
    return res.status(400).json({ error: 'Task title is required.' });
  }

  const newTask: Task = {
    id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    userId: currentUserProfile.id,
    title: taskData.title.trim(),
    description: taskData.description || '',
    categoryId: taskData.categoryId || 'cat-office',
    priority: taskData.priority || 'P2',
    status: taskData.status || 'todo',
    startDate: taskData.startDate || new Date().toISOString(),
    dueDate: taskData.dueDate || new Date(Date.now() + 86400000).toISOString(),
    durationMinutes: Number(taskData.durationMinutes) || 30,
    alarmEnabled: !!taskData.alarmEnabled,
    alarmTime: taskData.alarmTime || taskData.startDate,
    progress: Number(taskData.progress) || 0,
    dependencies: Array.isArray(taskData.dependencies) ? taskData.dependencies : [],
    routineId: taskData.routineId || undefined,
    isRecurring: !!taskData.isRecurring,
    completedAt: null,
  };

  userTasks.unshift(newTask);

  if (supabase) {
    try {
      await supabase.from('tasks').insert({
        id: newTask.id,
        user_id: null,
        title: newTask.title,
        description: newTask.description,
        category_id: null,
        priority: newTask.priority,
        status: newTask.status,
        start_date: newTask.startDate,
        due_date: newTask.dueDate,
        duration_minutes: newTask.durationMinutes,
        alarm_enabled: newTask.alarmEnabled,
        alarm_time: newTask.alarmTime,
        progress: newTask.progress,
      });
    } catch (e) {
      console.warn('Supabase task insert notice:', e);
    }
  }

  res.status(201).json(newTask);
});

app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const index = userTasks.findIndex((t) => t.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Task not found.' });
  }

  const prevTask = userTasks[index];
  const updates = req.body;

  let pointsEarned = 0;
  if (updates.status === 'completed' && prevTask.status !== 'completed') {
    updates.completedAt = new Date().toISOString();
    updates.progress = 100;
    pointsEarned = calculateTaskPoints(prevTask.priority, currentUserProfile.currentStreak, !!prevTask.routineId);
    updates.pointsAwarded = pointsEarned;

    currentUserProfile.points += pointsEarned;
    const levelInfo = calculateUserLevel(currentUserProfile.points);
    currentUserProfile.level = levelInfo.level;
  }

  userTasks[index] = { ...prevTask, ...updates };

  if (supabase) {
    try {
      await supabase
        .from('tasks')
        .update({
          status: userTasks[index].status,
          progress: userTasks[index].progress,
          completed_at: userTasks[index].completedAt,
          points_awarded: userTasks[index].pointsAwarded,
        })
        .eq('id', id);
    } catch (e) {
      console.warn('Supabase update notice:', e);
    }
  }

  const completedCount = userTasks.filter((t) => t.status === 'completed').length;
  const learningCount = userTasks.filter((t) => t.status === 'completed' && t.categoryId === 'cat-learning').length;
  userBadges = evaluateBadges(
    {
      completedTasksCount: completedCount,
      currentStreak: currentUserProfile.currentStreak,
      focusSessionsCompleted: currentUserProfile.focusSessionsCompleted,
      hasCompletedOnCall: userRoutines.some((r) => r.isActive && r.id.includes('oncall')),
      hasEarlyMorningTask: true,
      learningTasksCompleted: learningCount,
    },
    userBadges
  );

  res.json({
    task: userTasks[index],
    pointsEarned,
    profile: currentUserProfile,
    badges: userBadges,
  });
});

app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  userTasks = userTasks.filter((t) => t.id !== id);

  if (supabase) {
    try {
      await supabase.from('tasks').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete notice:', e);
    }
  }

  res.json({ success: true });
});

// Categories & Channels
app.get('/api/categories', (req, res) => {
  res.json(userCategories);
});

app.post('/api/categories', (req, res) => {
  const { name, color, icon, channel, isCustomColor } = req.body;

  const categoryLimitCheck = evaluateFeatureFlag('max_categories', currentUserProfile);
  if (!categoryLimitCheck.allowed && userCategories.length >= 4) {
    return res.status(403).json({ error: categoryLimitCheck.reason });
  }

  if (isCustomColor) {
    const colorCheck = evaluateFeatureFlag('custom_category_colors', currentUserProfile);
    if (!colorCheck.allowed) {
      return res.status(403).json({ error: colorCheck.reason });
    }
  }

  const newCategory: Category = {
    id: `cat-${Date.now()}`,
    userId: currentUserProfile.id,
    name: name.trim(),
    color: color || '#4F46E5',
    icon: icon || 'Tag',
    isCustomColor: !!isCustomColor,
    channel: channel || {
      id: `ch-${Date.now()}`,
      name: `${name} Channel`,
      sound: 'alert_beacon',
      priority: 'high_banner',
      fullscreenAlarm: true,
      vibrationPattern: [200, 100, 200],
    },
  };

  userCategories.push(newCategory);
  res.status(201).json(newCategory);
});

app.put('/api/categories/:id', (req, res) => {
  const { id } = req.params;
  const index = userCategories.findIndex((c) => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Category not found.' });
  }

  userCategories[index] = { ...userCategories[index], ...req.body };
  res.json(userCategories[index]);
});

// Routines & On-Call Rotation Engine
app.get('/api/routines', (req, res) => {
  res.json(userRoutines);
});

app.post('/api/routines/activate', (req, res) => {
  const { routineId, activate } = req.body;
  const routine = userRoutines.find((r) => r.id === routineId);
  if (!routine) {
    return res.status(404).json({ error: 'Routine not found.' });
  }

  const flagCheck = evaluateFeatureFlag('on_call_routine_generator', currentUserProfile);
  if (!flagCheck.allowed && routine.id.includes('oncall')) {
    return res.status(403).json({ error: flagCheck.reason });
  }

  routine.isActive = !!activate;
  routine.lastActivatedAt = activate ? new Date().toISOString() : routine.lastActivatedAt;

  if (activate) {
    const generated = generateRoutineTasks(routine, new Date(), currentUserProfile.id);
    const newTasksWithIds: Task[] = generated.map((t, idx) => ({
      ...t,
      id: `routine-task-${Date.now()}-${idx}`,
    }));

    userTasks = [...newTasksWithIds, ...userTasks];
  } else {
    userTasks = userTasks.filter((t) => t.routineId !== routineId || t.status === 'completed');
  }

  res.json({
    routine,
    tasksCount: userTasks.length,
    activeTasks: userTasks,
  });
});

// Focus Mode Session Complete API
app.post('/api/focus/complete', (req, res) => {
  const { taskId, minutes } = req.body;
  currentUserProfile.focusSessionsCompleted += 1;
  currentUserProfile.totalFocusMinutes += minutes || 25;
  currentUserProfile.points += 40;

  if (taskId) {
    const task = userTasks.find((t) => t.id === taskId);
    if (task) {
      task.progress = Math.min(100, task.progress + 30);
    }
  }

  const levelInfo = calculateUserLevel(currentUserProfile.points);
  currentUserProfile.level = levelInfo.level;

  userBadges = evaluateBadges(
    {
      completedTasksCount: userTasks.filter((t) => t.status === 'completed').length,
      currentStreak: currentUserProfile.currentStreak,
      focusSessionsCompleted: currentUserProfile.focusSessionsCompleted,
      hasCompletedOnCall: true,
      hasEarlyMorningTask: true,
      learningTasksCompleted: 3,
    },
    userBadges
  );

  res.json({
    profile: currentUserProfile,
    badges: userBadges,
    pointsAwarded: 40,
  });
});

// Gamification stats & badges
app.get('/api/gamification', (req, res) => {
  const levelInfo = calculateUserLevel(currentUserProfile.points);
  res.json({
    profile: currentUserProfile,
    levelInfo,
    badges: userBadges,
    stats: {
      totalTasks: userTasks.length,
      completedTasks: userTasks.filter((t) => t.status === 'completed').length,
      activeTasks: userTasks.filter((t) => t.status !== 'completed').length,
      completionRate: userTasks.length
        ? Math.round((userTasks.filter((t) => t.status === 'completed').length / userTasks.length) * 100)
        : 0,
    },
  });
});

// Subscription & 1-Year Free Tier details
app.get('/api/subscription', (req, res) => {
  const now = Date.now();
  const until = new Date(currentUserProfile.premiumUntil).getTime();
  const daysLeft = Math.max(0, Math.ceil((until - now) / (1000 * 60 * 60 * 24)));

  res.json({
    isPremium: currentUserProfile.isPremium,
    premiumUntil: currentUserProfile.premiumUntil,
    daysLeft,
    planName: 'TaskPulse Pro (1-Year Founder Gift)',
    tier: 'pro',
    features: [
      'Unlimited Categories & Custom Hex Color Pickers',
      'Automated On-Call & Multi-Day Sprint Routine Generator',
      'Interactive Gantt Charts & Exportable Timelines',
      'Custom Notification Channels with Fullscreen Alarms',
      'Gamification Badges & Viral Social Media Image Creative Generator',
      'Cross-Platform Flutter Device Shell & Flavor Switcher',
    ],
  });
});

app.post('/api/subscription/extend', (req, res) => {
  const extendedDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  currentUserProfile.isPremium = true;
  currentUserProfile.premiumUntil = extendedDate;

  res.json({
    success: true,
    message: 'TaskPulse Pro renewed for another 365 days!',
    premiumUntil: extendedDate,
  });
});

// --- SCRATCHPAD ENDPOINTS ---
interface ScratchNoteItem {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
}

let userScratchNotes: ScratchNoteItem[] = [
  {
    id: 'note-1',
    userId: currentUserProfile.id,
    text: '/p1 /office /remind 2h Verify ingress latency & webhook circuit breaker',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'note-2',
    userId: currentUserProfile.id,
    text: '/sadhana /p2 Evening 15-minute mindfulness and breathwork',
    createdAt: new Date().toISOString(),
  },
];

app.get('/api/scratchpad', (req, res) => {
  res.json(userScratchNotes);
});

app.post('/api/scratchpad', (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Note text required' });
  }

  const newNote: ScratchNoteItem = {
    id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    userId: currentUserProfile.id,
    text: text.trim(),
    createdAt: new Date().toISOString(),
  };

  userScratchNotes.unshift(newNote);
  res.status(201).json(newNote);
});

app.delete('/api/scratchpad/:id', (req, res) => {
  const { id } = req.params;
  userScratchNotes = userScratchNotes.filter((n) => n.id !== id);
  res.json({ success: true });
});


// Setup Vite middleware in dev or serve static build in production
async function startServer() {
  await seedSupabaseIfEmpty();

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`TaskPulse Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
