// TaskPulse Main Flutter Entrypoint
// Package: com.samdrashti.file1
// Clean Flutter Architecture with BLoC State Management & Material 3

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'blocs/task_bloc.dart';

void main() {
  runApp(const TaskPulseApp());
}

class TaskPulseApp extends StatelessWidget {
  const TaskPulseApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'TaskPulse',
      debugShowCheckedModeBanner: false,
      themeMode: ThemeMode.dark,
      darkTheme: ThemeData.dark(useMaterial3: true).copyWith(
        scaffoldBackgroundColor: const Color(0xFF09090B),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF6366F1),
          brightness: Brightness.dark,
        ),
      ),
      home: const Scaffold(
        body: Center(
          child: Text(
            'TaskPulse Life Cockpit (com.samdrashti.file1)\nPowered by flutter_bloc',
            textAlign: TextAlign.center,
          ),
        ),
      ),
    );
  }
}
