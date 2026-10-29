/**
 * Slash Command Parser for TaskPulse Scratchpad
 * Parses inline /commands like /p1, /remind 2h, /office, /sadhana, /due tomorrow
 * Decoupled, pure, and deterministic
 */

import { Priority, Category } from '../types/index';

export interface ParsedScratchItem {
  rawText: string;
  cleanTitle: string;
  categoryId: string;
  categoryName?: string;
  categoryColor?: string;
  priority: Priority;
  alarmEnabled: boolean;
  reminderMinutes?: number;
  alarmTime?: string;
  dueDate?: string;
  tags: string[];
}

export const SLASH_COMMAND_SUGGESTIONS = [
  { command: '/p1', description: 'Urgent & Important Priority', type: 'priority' },
  { command: '/p2', description: 'Important Priority', type: 'priority' },
  { command: '/p3', description: 'Normal Priority', type: 'priority' },
  { command: '/p4', description: 'Someday / Low Priority', type: 'priority' },
  { command: '/remind 30m', description: 'Alarm siren in 30 minutes', type: 'reminder' },
  { command: '/remind 2h', description: 'Alarm siren in 2 hours', type: 'reminder' },
  { command: '/remind tomorrow', description: 'Alarm siren tomorrow at 9 AM', type: 'reminder' },
  { command: '/office', description: 'Assign to Office & Work', type: 'category' },
  { command: '/sadhana', description: 'Assign to Workout & Sadhana', type: 'category' },
  { command: '/chores', description: 'Assign to Household Chores', type: 'category' },
  { command: '/family', description: 'Assign to Friends & Family', type: 'category' },
  { command: '/learning', description: 'Assign to Study & Learning', type: 'category' },
  { command: '/events', description: 'Assign to Events & Festivals', type: 'category' },
];

/**
 * Parses raw scratch text and extracts structured task attributes
 */
export function parseScratchCommand(text: string, categories: Category[]): ParsedScratchItem {
  let cleanText = text;
  let priority: Priority = 'P2';
  let categoryId = categories[0]?.id || 'cat-office';
  let alarmEnabled = false;
  let reminderMinutes: number | undefined;
  let alarmTime: string | undefined;
  let dueDate: string | undefined;
  const tags: string[] = [];

  // 1. Detect Priority (/p1, /p2, /p3, /p4)
  const priorityMatch = text.match(/\/(p[1-4])\b/i);
  if (priorityMatch) {
    priority = priorityMatch[1].toUpperCase() as Priority;
    cleanText = cleanText.replace(priorityMatch[0], '');
  }

  // 2. Detect Category by alias or /cat name
  const categoryAliases: Record<string, string> = {
    office: 'cat-office',
    work: 'cat-office',
    sadhana: 'cat-sadhana',
    workout: 'cat-sadhana',
    yoga: 'cat-sadhana',
    chores: 'cat-chores',
    home: 'cat-chores',
    family: 'cat-family',
    friends: 'cat-family',
    learning: 'cat-learning',
    study: 'cat-learning',
    events: 'cat-events',
    festival: 'cat-events',
  };

  // Check /office, /sadhana, /chores etc.
  for (const [alias, catId] of Object.entries(categoryAliases)) {
    const aliasRegex = new RegExp(`\\/${alias}\\b`, 'i');
    if (aliasRegex.test(text)) {
      categoryId = catId;
      cleanText = cleanText.replace(aliasRegex, '');
      break;
    }
  }

  // Also match generic /cat [name]
  const catGenericMatch = text.match(/\/cat\s+([a-zA-Z0-9_-]+)/i);
  if (catGenericMatch) {
    const requestedName = catGenericMatch[1].toLowerCase();
    const matchedCategory = categories.find(
      (c) => c.name.toLowerCase().includes(requestedName) || c.id.toLowerCase().includes(requestedName)
    );
    if (matchedCategory) {
      categoryId = matchedCategory.id;
    }
    cleanText = cleanText.replace(catGenericMatch[0], '');
  }

  // 3. Detect Reminder / Alarm (/remind 30m, /remind 2h, /remind tomorrow, /alarm)
  const remindTimeMatch = text.match(/\/remind\s+(\d+)(m|h|d)/i);
  if (remindTimeMatch) {
    alarmEnabled = true;
    const val = parseInt(remindTimeMatch[1], 10);
    const unit = remindTimeMatch[2].toLowerCase();

    const now = new Date();
    if (unit === 'm') {
      reminderMinutes = val;
      now.setMinutes(now.getMinutes() + val);
    } else if (unit === 'h') {
      reminderMinutes = val * 60;
      now.setHours(now.getHours() + val);
    } else if (unit === 'd') {
      reminderMinutes = val * 1440;
      now.setDate(now.getDate() + val);
    }
    alarmTime = now.toISOString();
    cleanText = cleanText.replace(remindTimeMatch[0], '');
  } else if (/\/(remind\s+tomorrow|alarm\s+tomorrow)/i.test(text)) {
    alarmEnabled = true;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0); // default 9 AM
    alarmTime = tomorrow.toISOString();
    reminderMinutes = Math.max(1, Math.round((tomorrow.getTime() - Date.now()) / 60000));
    cleanText = cleanText.replace(/\/(remind\s+tomorrow|alarm\s+tomorrow)/i, '');
  } else if (/\/(remind|alarm)\b/i.test(text)) {
    alarmEnabled = true;
    const inOneHour = new Date(Date.now() + 3600000);
    alarmTime = inOneHour.toISOString();
    reminderMinutes = 60;
    cleanText = cleanText.replace(/\/(remind|alarm)\b/i, '');
  }

  // 4. Detect Due Date (/due tomorrow, /due 2d)
  const dueMatch = text.match(/\/due\s+(\d+)(d|h)/i);
  if (dueMatch) {
    const val = parseInt(dueMatch[1], 10);
    const unit = dueMatch[2].toLowerCase();
    const d = new Date();
    if (unit === 'd') d.setDate(d.getDate() + val);
    if (unit === 'h') d.setHours(d.getHours() + val);
    dueDate = d.toISOString();
    cleanText = cleanText.replace(dueMatch[0], '');
  } else if (/\/due\s+tomorrow/i.test(text)) {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(18, 0, 0, 0);
    dueDate = d.toISOString();
    cleanText = cleanText.replace(/\/due\s+tomorrow/i, '');
  }

  // 5. Clean up extra whitespaces
  let cleanTitle = cleanText.replace(/\s+/g, ' ').trim();
  if (!cleanTitle) {
    cleanTitle = 'Quick Scratch Note';
  }

  const matchedCat = categories.find((c) => c.id === categoryId);

  return {
    rawText: text,
    cleanTitle,
    categoryId,
    categoryName: matchedCat?.name,
    categoryColor: matchedCat?.color,
    priority,
    alarmEnabled,
    reminderMinutes,
    alarmTime,
    dueDate,
    tags,
  };
}
