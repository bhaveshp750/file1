# TaskPulse - Important Development & Delivery Roadmap (important-todo.md)

## Critical Commercial & Feature Deadlines

This document tracks upcoming requirements, feature flags, and billing integrations that must be delivered before user grace periods expire.

---

### 1. Premium Access & Monetization Deadline
- **Current Policy**: All newly registered users are provisioned with **1 Year Premium Access** by default (`premium_until = Date.now() + 365 days`).
- **Critical Deliverable**: Integrate real payment gateway (Stripe / Google Play Billing / Apple In-App Purchases) before the 1-year grace period expires.
- **Consequence of Delay**: If billing/checkout is not delivered before expiration:
  - Expired users will have `is_premium = false`.
  - Backend feature flags will enforce restrictions:
    - Limited to 4 categories maximum.
    - Custom hex category color picker will be locked (default palette only).
    - Automated On-Call batch routine generation will be restricted.
    - Advanced Gantt chart timeline exports will be locked.
  - Users must have an active subscription option or grace extension to avoid being blocked from premium workflows.

---

### 2. Backend Feature Flags & Enforcement Matrix

| Feature Flag | Free Tier | Pro / Premium Tier (1-Yr Active) | Backend Enforcement Endpoint |
|---|---|---|---|
| `custom_category_colors` | 4 Default Colors | Unlimited Hex & Gradients | `POST /api/categories` |
| `max_categories` | Up to 4 Categories | Unlimited | `POST /api/categories` |
| `on_call_routine_generator` | Manual Single Tasks | Multi-Day One-Toggle Rotations | `POST /api/routines/activate` |
| `custom_notification_channels` | Default Notification Tone | Custom Alarms & Fullscreen HUD | `PUT /api/channels/:id` |
| `advanced_gantt_export` | View Only | High-Res PNG / PDF Timeline Export | `GET /api/gantt/export` |
| `unlimited_widgets` | 1 Pinned Widget | Unlimited Widget Board | `POST /api/widgets/pin` |

---

### 3. Immediate Action Items & TODOs

- [x] **Cross-Platform Flutter Design System**: Build high-performance mobile (Android/iOS) and desktop (macOS/Windows) viewport frames with flavor switching (`dev`, `staging`, `prod` under package `com.samdrashti.file1`).
- [x] **Supabase + Node Backend**: Node/Express backend with Supabase client adapter supporting Passwordless (Magic Link / OTP / WebAuthn) & Social Logins (Google, GitHub) only.
- [x] **First-Person View (FPV) Life Cockpit**: Daily tasks, category color-coding (Office, Chores, Workout/Sadhana, Family, Events, Learning), priority matrices.
- [x] **Interactive Gantt Chart & Calendar View**: Timeline visualization with task completion tracking, milestones, and drag/pan timeline.
- [x] **Focus Mode**: Distraction-free single task view with Pomodoro timer, ambient sound pulse, and notification silencing.
- [x] **On-Call & Multi-Day Repeated Routine Engine**: One-toggle generator for software dev on-call rotations (e.g. 4x daily monitoring over 7 days) and personal habit sprints.
- [x] **Alarm Scheduling & Fullscreen Notification HUD**: Web Audio chime alarm with fullscreen urgent alert modal and customizable notification channels per category.
- [x] **Gamification & Social Media Image Creative**: Points, streaks, milestone badges (Task Master, Streak Keeper, Deep Focus Hero, On-Call Sentinel), and viral high-res lead-gen social creative generator.
- [x] **Feature-by-Feature User Guide**: Contextual onboarding with "Skip" (shows persistent guide badge) and "Skip All" options, synced with backend.
- [x] **Home-Screen Widgets Gallery**: 4 widget formats (Quick Completer, Focus Cockpit, Category Progress Ring, Streak Trophy) with live preview and pinning.
- [ ] **Phase 2 In-App Billing Bridge**: Connect Stripe Webhooks and mobile store purchase tokens to `/api/subscription/webhook`.
- [ ] **Phase 3 Push Service Worker**: Connect Web Push (VAPID) / FCM for background alarms when application window is minimized.
