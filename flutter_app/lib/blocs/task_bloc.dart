// TaskPulse Flutter BLoC Architecture
// Package: com.samdrashti.file1
// Designed for high testability with flutter_bloc and bloc_test

import 'dart:async';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

// --- DATA MODEL ---
enum Priority { p1, p2, p3, p4 }
enum TaskStatus { todo, inProgress, completed }

class Task extends Equatable {
  final String id;
  final String title;
  final String description;
  final String categoryId;
  final Priority priority;
  final TaskStatus status;
  final DateTime dueDate;
  final int progress;
  final bool alarmEnabled;
  final String? routineId;

  const Task({
    required this.id,
    required this.title,
    this.description = '',
    required this.categoryId,
    required this.priority,
    required this.status,
    required this.dueDate,
    this.progress = 0,
    this.alarmEnabled = true,
    this.routineId,
  });

  Task copyWith({
    String? id,
    String? title,
    String? description,
    String? categoryId,
    Priority? priority,
    TaskStatus? status,
    DateTime? dueDate,
    int? progress,
    bool? alarmEnabled,
    String? routineId,
  }) {
    return Task(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      categoryId: categoryId ?? this.categoryId,
      priority: priority ?? this.priority,
      status: status ?? this.status,
      dueDate: dueDate ?? this.dueDate,
      progress: progress ?? this.progress,
      alarmEnabled: alarmEnabled ?? this.alarmEnabled,
      routineId: routineId ?? this.routineId,
    );
  }

  @override
  List<Object?> get props => [id, title, description, categoryId, priority, status, dueDate, progress, alarmEnabled, routineId];
}

// --- ABSTRACT REPOSITORY INTERFACE (Easy to Mock in Unit Tests) ---
abstract class ITaskRepository {
  Future<List<Task>> getTasks();
  Future<Task> createTask(Task task);
  Future<Task> updateTask(Task task);
  Future<void> deleteTask(String id);
}

// --- BLOC EVENTS ---
abstract class TaskEvent extends Equatable {
  const TaskEvent();
  @override
  List<Object?> get props => [];
}

class LoadTasksEvent extends TaskEvent {}

class CreateTaskEvent extends TaskEvent {
  final Task task;
  const CreateTaskEvent(this.task);
  @override
  List<Object?> get props => [task];
}

class UpdateTaskEvent extends TaskEvent {
  final Task task;
  const UpdateTaskEvent(this.task);
  @override
  List<Object?> get props => [task];
}

class DeleteTaskEvent extends TaskEvent {
  final String id;
  const DeleteTaskEvent(this.id);
  @override
  List<Object?> get props => [id];
}

class FilterCategoryEvent extends TaskEvent {
  final String categoryId;
  const FilterCategoryEvent(this.categoryId);
  @override
  List<Object?> get props => [categoryId];
}

// --- BLOC STATES ---
enum TaskBlocStatus { initial, loading, success, failure }

class TaskState extends Equatable {
  final TaskBlocStatus status;
  final List<Task> tasks;
  final String selectedCategoryId;
  final String? errorMessage;

  const TaskState({
    this.status = TaskBlocStatus.initial,
    this.tasks = const [],
    this.selectedCategoryId = 'all',
    this.errorMessage,
  });

  TaskState copyWith({
    TaskBlocStatus? status,
    List<Task>? tasks,
    String? selectedCategoryId,
    String? errorMessage,
  }) {
    return TaskState(
      status: status ?? this.status,
      tasks: tasks ?? this.tasks,
      selectedCategoryId: selectedCategoryId ?? this.selectedCategoryId,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  @override
  List<Object?> get props => [status, tasks, selectedCategoryId, errorMessage];
}

// --- FLUTTER BLOC IMPLEMENTATION ---
class TaskBloc extends Bloc<TaskEvent, TaskState> {
  final ITaskRepository repository;

  TaskBloc({required this.repository}) : super(const TaskState()) {
    on<LoadTasksEvent>(_onLoadTasks);
    on<CreateTaskEvent>(_onCreateTask);
    on<UpdateTaskEvent>(_onUpdateTask);
    on<DeleteTaskEvent>(_onDeleteTask);
    on<FilterCategoryEvent>(_onFilterCategory);
  }

  Future<void> _onLoadTasks(LoadTasksEvent event, Emitter<TaskState> emit) async {
    emit(state.copyWith(status: TaskBlocStatus.loading));
    try {
      final tasks = await repository.getTasks();
      emit(state.copyWith(status: TaskBlocStatus.success, tasks: tasks));
    } catch (e) {
      emit(state.copyWith(status: TaskBlocStatus.failure, errorMessage: e.toString()));
    }
  }

  Future<void> _onCreateTask(CreateTaskEvent event, Emitter<TaskState> emit) async {
    try {
      final created = await repository.createTask(event.task);
      emit(state.copyWith(
        status: TaskBlocStatus.success,
        tasks: [created, ...state.tasks],
      ));
    } catch (e) {
      emit(state.copyWith(status: TaskBlocStatus.failure, errorMessage: e.toString()));
    }
  }

  Future<void> _onUpdateTask(UpdateTaskEvent event, Emitter<TaskState> emit) async {
    try {
      final updated = await repository.updateTask(event.task);
      final newTasks = state.tasks.map((t) => t.id == updated.id ? updated : t).toList();
      emit(state.copyWith(tasks: newTasks));
    } catch (e) {
      emit(state.copyWith(status: TaskBlocStatus.failure, errorMessage: e.toString()));
    }
  }

  Future<void> _onDeleteTask(DeleteTaskEvent event, Emitter<TaskState> emit) async {
    try {
      await repository.deleteTask(event.id);
      final newTasks = state.tasks.where((t) => t.id != event.id).toList();
      emit(state.copyWith(tasks: newTasks));
    } catch (e) {
      emit(state.copyWith(status: TaskBlocStatus.failure, errorMessage: e.toString()));
    }
  }

  void _onFilterCategory(FilterCategoryEvent event, Emitter<TaskState> emit) {
    emit(state.copyWith(selectedCategoryId: event.categoryId));
  }
}
