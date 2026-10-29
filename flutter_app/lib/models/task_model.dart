// TaskPulse Task Model
// Package: com.samdrashti.file1
// Uses copy_with_extension for immutable updates & json_annotation for serialization

import 'package:copy_with_extension/copy_with_extension.dart';
import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';

part 'task_model.g.dart';

enum Priority {
  @JsonValue('P1')
  p1,
  @JsonValue('P2')
  p2,
  @JsonValue('P3')
  p3,
  @JsonValue('P4')
  p4,
}

enum TaskStatus {
  @JsonValue('todo')
  todo,
  @JsonValue('in_progress')
  inProgress,
  @JsonValue('completed')
  completed,
}

@CopyWith()
@JsonSerializable(explicitToJson: true)
class Task extends Equatable {
  final String id;
  final String title;
  final String description;
  @JsonKey(name: 'categoryId')
  final String categoryId;
  final Priority priority;
  final TaskStatus status;
  @JsonKey(name: 'dueDate')
  final DateTime dueDate;
  @JsonKey(name: 'startDate')
  final DateTime startDate;
  final int progress;
  @JsonKey(name: 'alarmEnabled')
  final bool alarmEnabled;
  @JsonKey(name: 'routineId')
  final String? routineId;
  @JsonKey(name: 'completedAt')
  final DateTime? completedAt;

  const Task({
    required this.id,
    required this.title,
    this.description = '',
    required this.categoryId,
    required this.priority,
    required this.status,
    required this.dueDate,
    required this.startDate,
    this.progress = 0,
    this.alarmEnabled = true,
    this.routineId,
    this.completedAt,
  });

  factory Task.fromJson(Map<String, dynamic> json) => _$TaskFromJson(json);

  Map<String, dynamic> toJson() => _$TaskToJson(this);

  @override
  List<Object?> get props => [
        id,
        title,
        description,
        categoryId,
        priority,
        status,
        dueDate,
        startDate,
        progress,
        alarmEnabled,
        routineId,
        completedAt,
      ];
}
