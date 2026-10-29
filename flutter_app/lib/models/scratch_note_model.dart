// TaskPulse Scratch Note Model
// Package: com.samdrashti.file1
// Uses copy_with_extension for immutable state and json_annotation for serialization

import 'package:copy_with_extension/copy_with_extension.dart';
import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';

part 'scratch_note_model.g.dart';

@CopyWith()
@JsonSerializable(explicitToJson: true)
class ScratchNote extends Equatable {
  final String id;
  final String content;
  final String rawText;
  @JsonKey(name: 'categoryId')
  final String? categoryId;
  final String? priority;
  @JsonKey(name: 'reminderMinutes')
  final int? reminderMinutes;
  @JsonKey(name: 'dueHours')
  final int? dueHours;
  final List<String> tags;
  @JsonKey(name: 'createdAt')
  final DateTime createdAt;

  const ScratchNote({
    required this.id,
    required this.content,
    required this.rawText,
    this.categoryId,
    this.priority,
    this.reminderMinutes,
    this.dueHours,
    this.tags = const [],
    required this.createdAt,
  });

  factory ScratchNote.fromJson(Map<String, dynamic> json) =>
      _$ScratchNoteFromJson(json);

  Map<String, dynamic> toJson() => _$ScratchNoteToJson(this);

  @override
  List<Object?> get props => [
        id,
        content,
        rawText,
        categoryId,
        priority,
        reminderMinutes,
        dueHours,
        tags,
        createdAt,
      ];
}
