import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateTaskPoints,
  calculateUserLevel,
  evaluateBadges,
  generateRoutineTasks,
  evaluateFeatureFlag,
  INITIAL_BADGES,
} from './rules';
import { RoutineTemplate } from '../types/index';

test('calculateTaskPoints correctly awards priority, streak, and routine bonus', () => {
  // P1 base is 50, streak 2 -> 50 + 10 = 60
  const pointsP1 = calculateTaskPoints('P1', 2, false);
  assert.equal(pointsP1, 60);

  // P3 base is 20, streak 5 -> 20 + 25 = 45, plus routine 15 -> 60
  const pointsP3 = calculateTaskPoints('P3', 5, true);
  assert.equal(pointsP3, 60);

  // Streak capped at +50
  const pointsCapped = calculateTaskPoints('P4', 20, false);
  assert.equal(pointsCapped, 10 + 50);
});

test('calculateUserLevel accurately computes level tiers and percentage progress', () => {
  const lvl1 = calculateUserLevel(50);
  assert.equal(lvl1.level, 1);
  assert.equal(lvl1.progressPercent, 50);

  const lvl2 = calculateUserLevel(150);
  assert.equal(lvl2.level, 2);
  // Tier 2 is 100 to 300 (range 200). 150 is 50 into 200 => 25%
  assert.equal(lvl2.progressPercent, 25);
});

test('evaluateBadges unlocks Task Master, Streak Keeper, and On-Call Sentinel when criteria met', () => {
  const updatedBadges = evaluateBadges(
    {
      completedTasksCount: 16,
      currentStreak: 6,
      focusSessionsCompleted: 4,
      hasCompletedOnCall: true,
      hasEarlyMorningTask: false,
      learningTasksCompleted: 2,
    },
    INITIAL_BADGES
  );

  const taskMaster = updatedBadges.find((b) => b.id === 'task-master');
  const streakKeeper = updatedBadges.find((b) => b.id === 'streak-keeper');
  const deepFocus = updatedBadges.find((b) => b.id === 'deep-focus-hero');
  const onCall = updatedBadges.find((b) => b.id === 'on-call-sentinel');
  const earlyBird = updatedBadges.find((b) => b.id === 'early-bird');

  assert.ok(taskMaster?.unlockedAt, 'Task Master should be unlocked');
  assert.ok(streakKeeper?.unlockedAt, 'Streak Keeper should be unlocked');
  assert.ok(deepFocus?.unlockedAt, 'Deep Focus Hero should be unlocked');
  assert.ok(onCall?.unlockedAt, 'On-Call Sentinel should be unlocked');
  assert.equal(earlyBird?.unlockedAt, null, 'Early bird should remain locked');
});

test('generateRoutineTasks produces exactly durationDays * timesPerDay tasks with valid alarm and schedules', () => {
  const routine: RoutineTemplate = {
    id: 'routine-oncall',
    title: 'On-Call Rotation Monitoring',
    description: '4x daily system sanity & queue monitoring',
    categoryId: 'cat-office',
    durationDays: 7,
    timesPerDay: ['09:00', '13:00', '18:00', '23:00'],
    priority: 'P1',
    isActive: true,
  };

  const startDate = new Date('2026-11-01T00:00:00.000Z');
  const generated = generateRoutineTasks(routine, startDate, 'user-123');

  // 7 days * 4 times = 28 tasks
  assert.equal(generated.length, 28);
  assert.equal(generated[0].title.includes('Day 1 Check #1 (09:00)'), true);
  assert.equal(generated[27].title.includes('Day 7 Check #4 (23:00)'), true);
  assert.equal(generated[0].alarmEnabled, true);
  assert.equal(generated[0].priority, 'P1');
  assert.equal(generated[0].routineId, 'routine-oncall');
});

test('evaluateFeatureFlag allows Pro members and restricts Free members with helpful reason', () => {
  const proProfile = {
    isPremium: true,
    premiumUntil: new Date(Date.now() + 86400000 * 300).toISOString(),
  };

  const freeProfile = {
    isPremium: false,
    premiumUntil: new Date(Date.now() - 1000).toISOString(),
  };

  const proAllowed = evaluateFeatureFlag('custom_category_colors', proProfile);
  assert.equal(proAllowed.allowed, true);

  const freeBlocked = evaluateFeatureFlag('custom_category_colors', freeProfile);
  assert.equal(freeBlocked.allowed, false);
  assert.ok(freeBlocked.reason?.includes('TaskPulse Pro'));

  const routineBlocked = evaluateFeatureFlag('on_call_routine_generator', freeProfile);
  assert.equal(routineBlocked.allowed, false);
});
