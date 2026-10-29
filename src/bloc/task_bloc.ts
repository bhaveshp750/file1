/**
 * TaskBloc - Business Logic Component for Task Operations
 * Follows flutter_bloc architecture with immutable Events and States
 * Easily decoupled for mock testing and dependency injection
 */

import { Bloc } from './core';
import { Task, Priority } from '../types/index';
import { api } from '../services/api';

// --- TASK EVENTS ---
export type TaskEvent =
  | { type: 'TASK_FETCH_REQUESTED' }
  | { type: 'TASK_CREATED'; taskData: Partial<Task> }
  | { type: 'TASK_UPDATED'; id: string; updates: Partial<Task> }
  | { type: 'TASK_DELETED'; id: string }
  | { type: 'TASK_FILTER_CATEGORY_CHANGED'; categoryId: string }
  | { type: 'TASK_FILTER_PRIORITY_CHANGED'; priority: string }
  | { type: 'TASK_SEARCH_QUERY_CHANGED'; query: string };

// --- TASK STATE ---
export interface TaskState {
  status: 'initial' | 'loading' | 'success' | 'failure';
  tasks: Task[];
  selectedCategoryId: string;
  selectedPriority: string;
  searchQuery: string;
  errorMessage?: string;
  lastPointsEarned?: number;
}

export const initialTaskState: TaskState = {
  status: 'initial',
  tasks: [],
  selectedCategoryId: 'all',
  selectedPriority: 'all',
  searchQuery: '',
};

export class TaskBloc extends Bloc<TaskEvent, TaskState> {
  constructor(initialState: TaskState = initialTaskState) {
    super(initialState, 'TaskBloc');
  }

  async onEvent(event: TaskEvent): Promise<void> {
    switch (event.type) {
      case 'TASK_FETCH_REQUESTED': {
        this.emit({ ...this.state, status: 'loading' });
        try {
          const tasks = await api.getTasks();
          this.emit({ ...this.state, status: 'success', tasks });
        } catch (err) {
          this.emit({
            ...this.state,
            status: 'failure',
            errorMessage: err instanceof Error ? err.message : 'Failed to fetch tasks',
          });
        }
        break;
      }

      case 'TASK_CREATED': {
        try {
          const created = await api.createTask(event.taskData);
          this.emit({
            ...this.state,
            tasks: [created, ...this.state.tasks],
            status: 'success',
          });
        } catch (err) {
          this.emit({
            ...this.state,
            status: 'failure',
            errorMessage: err instanceof Error ? err.message : 'Failed to create task',
          });
        }
        break;
      }

      case 'TASK_UPDATED': {
        try {
          // Optimistic local update
          const updatedList = this.state.tasks.map((t) =>
            t.id === event.id ? { ...t, ...event.updates } : t
          );
          this.emit({ ...this.state, tasks: updatedList });

          const res = await api.updateTask(event.id, event.updates);
          this.emit({
            ...this.state,
            tasks: this.state.tasks.map((t) => (t.id === event.id ? res.task : t)),
            lastPointsEarned: res.pointsEarned,
          });
        } catch (err) {
          console.error('TaskBloc update failed:', err);
        }
        break;
      }

      case 'TASK_DELETED': {
        try {
          await api.deleteTask(event.id);
          this.emit({
            ...this.state,
            tasks: this.state.tasks.filter((t) => t.id !== event.id),
          });
        } catch (err) {
          console.error('TaskBloc delete failed:', err);
        }
        break;
      }

      case 'TASK_FILTER_CATEGORY_CHANGED': {
        this.emit({ ...this.state, selectedCategoryId: event.categoryId });
        break;
      }

      case 'TASK_FILTER_PRIORITY_CHANGED': {
        this.emit({ ...this.state, selectedPriority: event.priority });
        break;
      }

      case 'TASK_SEARCH_QUERY_CHANGED': {
        this.emit({ ...this.state, searchQuery: event.query });
        break;
      }
    }
  }
}
