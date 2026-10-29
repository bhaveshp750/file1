/**
 * Flutter Cross-Platform App Shell & Design System
 * Simulates high-performance Mobile (Android/iOS) and Desktop (macOS/Windows) runtimes
 * Package: com.samdrashti.file1 | BLoC State Architecture
 */

import React, { useState } from 'react';
import { AppFlavor, DeviceFrame, UserProfile } from '../types/index';
import {
  Activity,
  Award,
  Bell,
  Calendar,
  CheckCircle2,
  Code,
  Compass,
  Cpu,
  Crown,
  FileText,
  Flame,
  Laptop,
  Layers,
  LayoutGrid,
  Maximize2,
  Moon,
  Palette,
  Power,
  RotateCcw,
  Smartphone,
  Sparkles,
  Sun,
  Trophy,
  User,
  Zap,
} from 'lucide-react';

interface FlutterShellProps {
  currentFlavor: AppFlavor;
  onFlavorChange: (flavor: AppFlavor) => void;
  deviceFrame: DeviceFrame;
  onDeviceFrameChange: (frame: DeviceFrame) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  activeTab: 'cockpit' | 'gantt' | 'routines' | 'gamification' | 'widgets' | 'categories';
  onTabChange: (tab: 'cockpit' | 'gantt' | 'routines' | 'gamification' | 'widgets' | 'categories') => void;
  profile: UserProfile;
  onOpenProfile: () => void;
  onOpenAuth: () => void;
  onOpenScratchpad?: () => void;
  scratchNotesCount?: number;
  children: React.ReactNode;
}

export const FlutterShell: React.FC<FlutterShellProps> = ({
  currentFlavor,
  onFlavorChange,
  deviceFrame,
  onDeviceFrameChange,
  isDarkMode,
  onToggleTheme,
  activeTab,
  onTabChange,
  profile,
  onOpenProfile,
  onOpenAuth,
  onOpenScratchpad,
  scratchNotesCount = 0,
  children,
}) => {
  const [showBlocInspector, setShowBlocInspector] = useState(false);
  const [showFlutterCodeModal, setShowFlutterCodeModal] = useState(false);

  const flavorPackageId =
    currentFlavor === 'prod'
      ? 'com.samdrashti.file1'
      : `com.samdrashti.file1.${currentFlavor}`;

  const navItems = [
    { id: 'cockpit', label: 'Life Cockpit', icon: Zap },
    { id: 'gantt', label: 'Gantt Timeline', icon: Layers },
    { id: 'routines', label: 'On-Call & Routines', icon: RotateCcw },
    { id: 'gamification', label: 'Badges & XP', icon: Trophy },
    { id: 'widgets', label: 'Widgets', icon: LayoutGrid },
    { id: 'categories', label: 'Categories', icon: Palette },
  ] as const;

  return (
    <div
      className={`min-h-screen transition-colors duration-300 font-sans selection:bg-indigo-500 selection:text-white ${
        isDarkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-slate-100 text-slate-800'
      }`}
    >
      {/* Top Cross-Platform Flutter Simulator Navigation Bar */}
      <header
        className={`sticky top-0 z-30 border-b backdrop-blur-md px-4 py-2.5 transition-colors ${
          isDarkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white/90 border-slate-200'
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Logo & Package Info */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <Zap className="w-5 h-5 fill-white" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight text-white">TaskPulse</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  Flutter BLoC Engine
                </span>
              </div>
              <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5">
                <span>Pkg:</span>
                <span className="text-indigo-400 font-bold">{flavorPackageId}</span>
              </div>
            </div>
          </div>

          {/* Center Platform & Flavor Controls */}
          <div className="flex items-center gap-2">
            {/* Flavor Selector */}
            <div
              className={`flex rounded-xl p-1 text-xs font-bold border ${
                isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-200 border-slate-300'
              }`}
            >
              {(['dev', 'staging', 'prod'] as AppFlavor[]).map((f) => (
                <button
                  key={f}
                  onClick={() => onFlavorChange(f)}
                  className={`px-2.5 py-1 rounded-lg uppercase text-[10px] tracking-wider transition-all ${
                    currentFlavor === f
                      ? f === 'prod'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : f === 'staging'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-indigo-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Device Viewport Frame Selector (Mobile / Desktop / Fullscreen) */}
            <div
              className={`hidden sm:flex rounded-xl p-1 text-xs border ${
                isDarkMode ? 'bg-zinc-950 border-zinc-800' : 'bg-slate-200 border-slate-300'
              }`}
            >
              <button
                onClick={() => onDeviceFrameChange('mobile')}
                className={`p-1.5 rounded-lg transition-all ${
                  deviceFrame === 'mobile'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Mobile App Frame (Flutter Android / iOS)"
              >
                <Smartphone className="w-4 h-4" />
              </button>

              <button
                onClick={() => onDeviceFrameChange('desktop')}
                className={`p-1.5 rounded-lg transition-all ${
                  deviceFrame === 'desktop'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Desktop App Frame (Flutter macOS / Windows)"
              >
                <Laptop className="w-4 h-4" />
              </button>

              <button
                onClick={() => onDeviceFrameChange('fullscreen')}
                className={`p-1.5 rounded-lg transition-all ${
                  deviceFrame === 'fullscreen'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title="Fullscreen Responsive View"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Action Tools: Scratchpad, Dark/Light Mode, BLoC stream, Profile */}
          <div className="flex items-center gap-2">
            {/* Quick Scratchpad Button */}
            {onOpenScratchpad && (
              <button
                onClick={onOpenScratchpad}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all active:scale-95 shadow-sm"
                title="Quick Scratchpad (/commands to convert to tasks)"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Scratchpad</span>
                {scratchNotesCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-zinc-950 text-[10px] font-black">
                    {scratchNotesCount}
                  </span>
                )}
              </button>
            )}

            {/* Dart BLoC Code Export */}
            <button
              onClick={() => setShowFlutterCodeModal(true)}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
                isDarkMode
                  ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
              title="View Flutter Dart BLoC Code"
            >
              <Code className="w-4 h-4 text-cyan-400" />
              <span className="hidden md:inline">Dart BLoC</span>
            </button>

            {/* Dark & Light Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-xl border transition-colors ${
                isDarkMode
                  ? 'bg-zinc-800 border-zinc-700 text-amber-400 hover:bg-zinc-700'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
              aria-label="Toggle theme mode"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* User Profile / Auth Button */}
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl bg-indigo-600/10 border border-indigo-500/30 hover:bg-indigo-600/20 transition-all text-xs font-bold text-white"
            >
              <img
                src={profile.avatar}
                alt={profile.username}
                className="w-6 h-6 rounded-lg object-cover ring-1 ring-indigo-500"
              />
              <span className="hidden sm:inline">{profile.username}</span>
              <span className="px-1.5 py-0.2 rounded-md bg-amber-500 text-zinc-950 text-[9px] font-black">
                PRO
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container Rendering Frame */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex justify-center">
        {/* Device Frame Simulation: MOBILE */}
        {deviceFrame === 'mobile' ? (
          <div className="w-full max-w-md rounded-[48px] bg-zinc-900 border-[10px] border-zinc-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden relative flex flex-col min-h-[820px]">
            {/* Phone Top Notch / Dynamic Island */}
            <div className="h-8 bg-zinc-950 flex items-center justify-between px-6 pt-1 text-[11px] font-mono text-zinc-400">
              <span>9:41</span>
              <div className="w-20 h-4 bg-zinc-900 rounded-full border border-zinc-800/80 mx-auto" />
              <span>5G 100%</span>
            </div>

            {/* Mobile App Body Content */}
            <main className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">{children}</main>

            {/* Mobile Flutter Bottom Navigation Bar */}
            <nav className="absolute bottom-0 inset-x-0 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800/80 px-2 py-2 flex items-center justify-around z-20">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isSelected = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
                      isSelected ? 'text-indigo-400 scale-105' : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[9px] font-semibold tracking-tight">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        ) : deviceFrame === 'desktop' ? (
          /* Device Frame Simulation: DESKTOP */
          <div className="w-full rounded-3xl bg-zinc-900 border border-zinc-700/80 shadow-[0_25px_70px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col min-h-[760px]">
            {/* Desktop Window Title Bar */}
            <div className="h-10 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-4">
              {/* Traffic Light Window Buttons */}
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-mono text-zinc-400 ml-2">TaskPulse Desktop (macOS / Windows)</span>
              </div>

              <div className="text-[11px] font-mono text-zinc-500">Flutter Engine v3.22 • {currentFlavor}</div>
            </div>

            {/* Desktop App Layout with Sidebar Rail */}
            <div className="flex flex-1 overflow-hidden">
              {/* Desktop Left Rail Navigation */}
              <aside className="w-56 bg-zinc-950/70 border-r border-zinc-800/80 p-3 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500 block mb-2">
                    Workspaces
                  </span>
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isSelected = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => onTabChange(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
                    <Crown className="w-3.5 h-3.5" />
                    <span>Founder Pro</span>
                  </div>
                  <p className="text-[10px] text-zinc-400">All premium feature flags active for 1 year.</p>
                </div>
              </aside>

              {/* Main Desktop Workspace Body */}
              <main className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">{children}</main>
            </div>
          </div>
        ) : (
          /* Fullscreen Responsive Frame */
          <div className="w-full space-y-6">
            {/* Top Responsive Navigation Tabs */}
            <nav className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-zinc-800">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isSelected = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : isDarkMode
                        ? 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                        : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <main>{children}</main>
          </div>
        )}
      </div>

      {/* Flutter Dart BLoC & Rest-Dio Code Modal */}
      {showFlutterCodeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-3xl max-h-[88vh] overflow-y-auto rounded-3xl bg-zinc-900 border border-zinc-700 p-6 sm:p-8 shadow-2xl relative text-zinc-100">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-4">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white">Flutter BLoC + Rest-Dio + CopyWith Architecture</h3>
              </div>
              <button
                onClick={() => setShowFlutterCodeModal(false)}
                className="p-1.5 rounded-full bg-zinc-800 text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-400 mb-4">
              Exported Dart codebase under <span className="text-indigo-400 font-mono font-bold">com.samdrashti.file1</span> using <strong>copy_with_extension</strong>, <strong>json_annotation</strong>, <strong>rest-dio (Dio + Retrofit)</strong>, and <strong>flutter_bloc</strong>.
            </p>

            <div className="space-y-4 text-xs font-mono">
              {/* Tab 1: Model with CopyWith & JsonSerializable */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-zinc-500">
                  <span>// lib/models/task_model.dart (@CopyWith & @JsonSerializable)</span>
                  <span className="text-emerald-400 text-[10px]">copy_with_extension + json_annotation</span>
                </div>
                <pre className="text-indigo-300 overflow-x-auto leading-relaxed">
{`@CopyWith()
@JsonSerializable(explicitToJson: true)
class Task extends Equatable {
  final String id;
  final String title;
  @JsonKey(name: 'categoryId')
  final String categoryId;
  final Priority priority;
  final TaskStatus status;
  @JsonKey(name: 'dueDate')
  final DateTime dueDate;
  final int progress;
  @JsonKey(name: 'alarmEnabled')
  final bool alarmEnabled;
  final String? routineId;

  const Task({
    required this.id,
    required this.title,
    required this.categoryId,
    required this.priority,
    required this.status,
    required this.dueDate,
    this.progress = 0,
    this.alarmEnabled = true,
    this.routineId,
  });

  factory Task.fromJson(Map<String, dynamic> json) => _$TaskFromJson(json);
  Map<String, dynamic> toJson() => _$TaskToJson(this);
}`}
                </pre>
              </div>

              {/* Tab 2: REST API with Dio & Retrofit */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-zinc-500">
                  <span>// lib/services/api_service.dart (Rest-Dio Client)</span>
                  <span className="text-cyan-400 text-[10px]">dio: ^5.4.1 + retrofit: ^4.1.0</span>
                </div>
                <pre className="text-cyan-300 overflow-x-auto leading-relaxed">
{`@RestApi(baseUrl: "http://localhost:3000/api")
abstract class RestApiClient {
  factory RestApiClient(Dio dio, {String baseUrl}) = _RestApiClient;

  @GET("/tasks")
  Future<List<Task>> getTasks();

  @POST("/tasks")
  Future<Task> createTask(@Body() Map<String, dynamic> taskData);

  @PUT("/tasks/{id}")
  Future<Map<String, dynamic>> updateTask(@Path("id") String id, @Body() Map<String, dynamic> updates);

  @POST("/routines/activate")
  Future<Map<String, dynamic>> activateRoutine(@Body() Map<String, dynamic> body);
}`}
                </pre>
              </div>

              {/* Tab 3: BLoC State Management */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-zinc-500">
                  <span>// lib/blocs/task_bloc.dart (flutter_bloc)</span>
                  <span className="text-purple-400 text-[10px]">flutter_bloc: ^8.1.3</span>
                </div>
                <pre className="text-purple-300 overflow-x-auto leading-relaxed">
{`class TaskBloc extends Bloc<TaskEvent, TaskState> {
  final RestApiClient apiClient;
  TaskBloc({required this.apiClient}) : super(const TaskState()) {
    on<LoadTasksEvent>(_onLoadTasks);
    on<CreateTaskEvent>(_onCreateTask);
    on<UpdateTaskEvent>(_onUpdateTask);
  }
}`}
                </pre>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between pt-4 border-t border-zinc-800">
              <span className="text-[11px] text-zinc-400">
                All files available in <code className="text-white">flutter_app/lib/</code> directory.
              </span>
              <button
                onClick={() => setShowFlutterCodeModal(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
