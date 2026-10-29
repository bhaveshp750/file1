/**
 * TaskPulse App Entrypoint
 * Cross-Platform Project Management & Life Cockpit Tool
 * Package: com.samdrashti.file1 | Flutter BLoC Architecture
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Task, Category, RoutineTemplate, UserProfile, Badge, AppFlavor, DeviceFrame } from './types/index';
import { api } from './services/api';
import { soundService } from './services/sound';
import { TaskBloc, initialTaskState, TaskState } from './bloc/task_bloc';

import { FlutterShell } from './components/FlutterShell';
import { CockpitDashboard } from './components/CockpitDashboard';
import { GanttView } from './components/GanttView';
import { RoutinesView } from './components/RoutinesView';
import { GamificationView } from './components/GamificationView';
import { WidgetsGallery } from './components/WidgetsGallery';
import { CategoryManager } from './components/CategoryManager';
import { FocusModeModal } from './components/FocusModeModal';
import { FullscreenAlarmModal } from './components/FullscreenAlarmModal';
import { UserGuideOverlay } from './components/UserGuideOverlay';
import { ProfileModal } from './components/ProfileModal';
import { AuthModal } from './components/AuthModal';

export default function App() {
  // App Flavor & Device Frame
  const [flavor, setFlavor] = useState<AppFlavor>('dev');
  const [deviceFrame, setDeviceFrame] = useState<DeviceFrame>('desktop');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState<'cockpit' | 'gantt' | 'routines' | 'gamification' | 'widgets' | 'categories'>('cockpit');

  // Core State
  const taskBloc = useMemo(() => new TaskBloc(initialTaskState), []);
  const [taskState, setTaskState] = useState<TaskState>(taskBloc.state);

  const [categories, setCategories] = useState<Category[]>([]);
  const [routines, setRoutines] = useState<RoutineTemplate[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Modals & Overlays
  const [focusTask, setFocusTask] = useState<Task | null>(null);
  const [isFocusOpen, setIsFocusOpen] = useState(false);

  const [alarmTask, setAlarmTask] = useState<Task | null>(null);
  const [isAlarmOpen, setIsAlarmOpen] = useState(false);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Subscribe to TaskBloc
  useEffect(() => {
    const unsubscribe = taskBloc.subscribe((state) => {
      setTaskState(state);
    });
    return () => unsubscribe();
  }, [taskBloc]);

  // Initial Data Fetch
  useEffect(() => {
    async function initApp() {
      try {
        taskBloc.add({ type: 'TASK_FETCH_REQUESTED' });
        const [cats, rts, prof, gam] = await Promise.all([
          api.getCategories(),
          api.getRoutines(),
          api.getProfile(),
          api.getGamification(),
        ]);
        setCategories(cats);
        setRoutines(rts);
        setProfile(prof);
        if (gam.badges) setBadges(gam.badges);
      } catch (err) {
        console.error('Initial data load error:', err);
      }
    }
    initApp();
  }, [taskBloc]);

  // Synchronize category map
  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  // --- HANDLERS ---
  const handleAddTask = async (taskData: Partial<Task>) => {
    taskBloc.add({ type: 'TASK_CREATED', taskData });
  };

  const handleUpdateTask = async (id: string, updates: Partial<Task>) => {
    taskBloc.add({ type: 'TASK_UPDATED', id, updates });
    // Refresh gamification & badges
    const gam = await api.getGamification();
    setProfile(gam.profile);
    setBadges(gam.badges);
  };

  const handleDeleteTask = async (id: string) => {
    taskBloc.add({ type: 'TASK_DELETED', id });
  };

  const handleToggleRoutine = async (routineId: string, activate: boolean) => {
    try {
      const res = await api.activateRoutine(routineId, activate);
      // Refresh routines and tasks
      const [updatedRoutines, updatedTasks, gam] = await Promise.all([
        api.getRoutines(),
        api.getTasks(),
        api.getGamification(),
      ]);
      setRoutines(updatedRoutines);
      taskBloc.add({ type: 'TASK_FETCH_REQUESTED' });
      setProfile(gam.profile);
      setBadges(gam.badges);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to toggle routine');
    }
  };

  const handleOpenFocusMode = (task: Task) => {
    setFocusTask(task);
    setIsFocusOpen(true);
  };

  const handleTriggerAlarmTest = (task: Task) => {
    setAlarmTask(task);
    setIsAlarmOpen(true);
  };

  const handleFinishFocusSession = async (taskId: string, minutes: number) => {
    const res = await api.completeFocusSession(taskId, minutes);
    setProfile(res.profile);
    setBadges(res.badges);
    taskBloc.add({ type: 'TASK_FETCH_REQUESTED' });
    setIsFocusOpen(false);
  };

  const handleAlarmComplete = async (taskId: string) => {
    await handleUpdateTask(taskId, { status: 'completed', progress: 100 });
    setIsAlarmOpen(false);
  };

  const handleAlarmSnooze = (taskId: string, minutes: number) => {
    alert(`Task snooze set for ${minutes} minutes.`);
    setIsAlarmOpen(false);
  };

  const handleAddCategory = async (catData: Partial<Category>) => {
    try {
      const created = await api.createCategory(catData);
      setCategories([...categories, created]);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to create category');
    }
  };

  const handleUpdateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      const updated = await api.updateCategory(id, updates);
      setCategories(categories.map((c) => (c.id === id ? updated : c)));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to update category');
    }
  };

  const handleGuideAction = async (guideId: string, action: 'complete' | 'skip' | 'skip_all' | 'reset') => {
    if (!profile) return;
    const updatedGuides = await api.updateUserGuides(guideId, action);
    setProfile({ ...profile, userGuides: updatedGuides });
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold tracking-tight">Initializing TaskPulse Life Cockpit...</p>
        </div>
      </div>
    );
  }

  return (
    <FlutterShell
      currentFlavor={flavor}
      onFlavorChange={setFlavor}
      deviceFrame={deviceFrame}
      onDeviceFrameChange={setDeviceFrame}
      isDarkMode={isDarkMode}
      onToggleTheme={() => setIsDarkMode(!isDarkMode)}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      profile={profile}
      onOpenProfile={() => setIsProfileOpen(true)}
      onOpenAuth={() => setIsAuthOpen(true)}
    >
      {/* Tab 1: First-Person View (FPV) Cockpit Dashboard */}
      {activeTab === 'cockpit' && (
        <CockpitDashboard
          tasks={taskState.tasks}
          categories={categories}
          profile={profile}
          onAddTask={handleAddTask}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          onOpenFocusMode={handleOpenFocusMode}
          onTriggerAlarmTest={handleTriggerAlarmTest}
          onOpenProfile={() => setIsProfileOpen(true)}
        />
      )}

      {/* Tab 2: Interactive Gantt Chart Timeline View */}
      {activeTab === 'gantt' && (
        <GanttView
          tasks={taskState.tasks}
          categories={categories}
          onUpdateTask={handleUpdateTask}
          onOpenFocusMode={handleOpenFocusMode}
          isPremium={profile.isPremium}
        />
      )}

      {/* Tab 3: Routines & Multi-Day On-Call Rotation Engine */}
      {activeTab === 'routines' && (
        <RoutinesView
          routines={routines}
          categories={categories}
          onToggleRoutine={handleToggleRoutine}
          isPremium={profile.isPremium}
        />
      )}

      {/* Tab 4: Gamification, Badges & Viral Social Media Creative */}
      {activeTab === 'gamification' && (
        <GamificationView profile={profile} badges={badges} />
      )}

      {/* Tab 5: Interactive Home-Screen Widgets Gallery */}
      {activeTab === 'widgets' && (
        <WidgetsGallery
          tasks={taskState.tasks}
          categories={categories}
          profile={profile}
          onOpenFocusMode={handleOpenFocusMode}
          onCompleteTask={(id) => handleUpdateTask(id, { status: 'completed', progress: 100 })}
        />
      )}

      {/* Tab 6: Category Identities & Custom Notification Channels */}
      {activeTab === 'categories' && (
        <CategoryManager
          categories={categories}
          onAddCategory={handleAddCategory}
          onUpdateCategory={handleUpdateCategory}
          isPremium={profile.isPremium}
        />
      )}

      {/* Distraction-Free Focus Mode Modal */}
      <FocusModeModal
        task={focusTask}
        category={focusTask ? categoryMap.get(focusTask.categoryId) : undefined}
        isOpen={isFocusOpen}
        onClose={() => setIsFocusOpen(false)}
        onCompleteTask={(id) => handleUpdateTask(id, { status: 'completed', progress: 100 })}
        onFinishSession={handleFinishFocusSession}
      />

      {/* Fullscreen Alarm Heads-Up Notification Modal */}
      <FullscreenAlarmModal
        task={alarmTask}
        category={alarmTask ? categoryMap.get(alarmTask.categoryId) : undefined}
        isOpen={isAlarmOpen}
        onClose={() => setIsAlarmOpen(false)}
        onComplete={handleAlarmComplete}
        onSnooze={handleAlarmSnooze}
      />

      {/* Feature-by-Feature Interactive User Guide */}
      <UserGuideOverlay
        userGuides={profile.userGuides}
        onComplete={(id) => handleGuideAction(id, 'complete')}
        onSkip={(id) => handleGuideAction(id, 'skip')}
        onSkipAll={() => handleGuideAction('', 'skip_all')}
        onResetGuides={() => handleGuideAction('', 'reset')}
        activeFeatureTab={activeTab}
      />

      {/* Profile & 1-Year Free Pro Founder Tier Modal */}
      <ProfileModal
        profile={profile}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onUpdateProfile={async (updates) => {
          const updated = await api.updateProfile(updates);
          setProfile(updated);
        }}
        onResetTour={() => handleGuideAction('', 'reset')}
      />

      {/* Authentication Modal (Strictly Passwordless & Social Logins Only) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(u) => setProfile(u)}
      />
    </FlutterShell>
  );
}
