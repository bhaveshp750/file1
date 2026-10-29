-- ====================================================================
-- TaskPulse - Supabase PostgreSQL Database Schema & Security Policies
-- Package: com.samdrashti.file1
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- ====================================================================

-- 1. PROFILES TABLE (Linked with Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  avatar TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  bio TEXT DEFAULT 'Mastering life tasks from First-Person View',
  role TEXT DEFAULT 'Software Engineer & Team Lead',
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  focus_sessions_completed INTEGER DEFAULT 0,
  total_focus_minutes INTEGER DEFAULT 0,
  is_premium BOOLEAN DEFAULT TRUE,
  premium_until TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 year'),
  user_guides JSONB DEFAULT '{"completed":[],"skipped":[],"skipAll":false}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  icon TEXT DEFAULT 'Tag',
  is_custom_color BOOLEAN DEFAULT FALSE,
  channel JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TASKS TABLE
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  priority TEXT CHECK (priority IN ('P1', 'P2', 'P3', 'P4')) DEFAULT 'P2',
  status TEXT CHECK (status IN ('todo', 'in_progress', 'completed')) DEFAULT 'todo',
  start_date TIMESTAMPTZ DEFAULT NOW(),
  due_date TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 day'),
  duration_minutes INTEGER DEFAULT 30,
  alarm_enabled BOOLEAN DEFAULT TRUE,
  alarm_time TIMESTAMPTZ,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  dependencies TEXT[] DEFAULT '{}',
  routine_id TEXT,
  is_recurring BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  points_awarded INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ROUTINE TEMPLATES TABLE
CREATE TABLE IF NOT EXISTS public.routines (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category_id TEXT,
  duration_days INTEGER DEFAULT 7,
  times_per_day TEXT[] DEFAULT '{"09:00","13:00","18:00","23:00"}',
  priority TEXT DEFAULT 'P1',
  is_active BOOLEAN DEFAULT FALSE,
  last_activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view & edit only their own profile
CREATE POLICY "Users can manage their own profile"
  ON public.profiles FOR ALL
  USING (auth.uid() = id);

-- Categories: Users can manage only their own categories
CREATE POLICY "Users can manage their own categories"
  ON public.categories FOR ALL
  USING (auth.uid() = user_id);

-- Tasks: Users can manage only their own tasks
CREATE POLICY "Users can manage their own tasks"
  ON public.tasks FOR ALL
  USING (auth.uid() = user_id);

-- Routines: Users can manage only their own routines
CREATE POLICY "Users can manage their own routines"
  ON public.routines FOR ALL
  USING (auth.uid() = user_id);

-- 6. AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, points, is_premium, premium_until)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    100,
    TRUE,
    NOW() + INTERVAL '1 year'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
