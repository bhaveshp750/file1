import test from 'node:test';
import assert from 'node:assert/strict';
import { parseScratchCommand } from './commandParser';
import { DEFAULT_CATEGORIES } from './rules';

test('parseScratchCommand extracts priority, category, and reminder correctly', () => {
  const input = '/p1 /office /remind 2h Verify ingress failover metrics';
  const parsed = parseScratchCommand(input, DEFAULT_CATEGORIES as any);

  assert.equal(parsed.cleanTitle, 'Verify ingress failover metrics');
  assert.equal(parsed.priority, 'P1');
  assert.equal(parsed.categoryId, 'cat-office');
  assert.equal(parsed.alarmEnabled, true);
  assert.equal(parsed.reminderMinutes, 120);
  assert.ok(parsed.alarmTime);
});

test('parseScratchCommand parses sadhana category and p3 priority', () => {
  const input = '/p3 /sadhana Morning Pranayama and stillness practice';
  const parsed = parseScratchCommand(input, DEFAULT_CATEGORIES as any);

  assert.equal(parsed.cleanTitle, 'Morning Pranayama and stillness practice');
  assert.equal(parsed.priority, 'P3');
  assert.equal(parsed.categoryId, 'cat-sadhana');
  assert.equal(parsed.alarmEnabled, false);
});

test('parseScratchCommand handles reminder tomorrow and chore alias', () => {
  const input = '/chores /remind tomorrow Pick up air filter replacements';
  const parsed = parseScratchCommand(input, DEFAULT_CATEGORIES as any);

  assert.equal(parsed.cleanTitle, 'Pick up air filter replacements');
  assert.equal(parsed.categoryId, 'cat-chores');
  assert.equal(parsed.alarmEnabled, true);
  assert.ok(parsed.alarmTime);
});
