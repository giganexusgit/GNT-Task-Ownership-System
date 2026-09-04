import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase configuration
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://rshefuocexrhiklqqfkx.supabase.co';
export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_xJu9t38fPE6YxIKRkC0v5w_p03V1MtY';

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL &&
  SUPABASE_ANON_KEY &&
  !SUPABASE_URL.includes('your-project') &&
  !SUPABASE_ANON_KEY.includes('your-anon-key')
);

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Health check test for Supabase connection
 */
export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  url: string;
  latencyMs?: number;
  error?: string;
}> {
  const start = performance.now();
  try {
    // Attempt a lightweight ping query
    const { error } = await supabase.from('projects').select('id').limit(1);
    const latencyMs = Math.round(performance.now() - start);

    if (error && error.code !== 'PGRST116') {
      // If table doesn't exist yet, connection is still valid but schema is pending
      if (error.code === '42P01' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        return {
          connected: true,
          url: SUPABASE_URL,
          latencyMs,
          error: 'Connected, but database tables need to be created using the SQL schema below.',
        };
      }
      return {
        connected: false,
        url: SUPABASE_URL,
        latencyMs,
        error: error.message,
      };
    }

    return {
      connected: true,
      url: SUPABASE_URL,
      latencyMs,
    };
  } catch (err: any) {
    return {
      connected: false,
      url: SUPABASE_URL,
      error: err.message || 'Network request failed',
    };
  }
}

/**
 * Full PostgreSQL schema script for GNT Workboard
 * Copy-pasteable into Supabase SQL Editor
 */
export const SUPABASE_SQL_SCHEMA = `-- GNT Workboard Database Schema for Supabase
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'MANAGER', 'EMPLOYEE')),
  pin TEXT NOT NULL DEFAULT '123456',
  active BOOLEAN NOT NULL DEFAULT true,
  avatar TEXT,
  initials TEXT NOT NULL,
  department TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  project_name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'ON_HOLD', 'ARCHIVED')),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  assigned_employee_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  assigned_employee_name TEXT NOT NULL,
  created_by_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  created_by_name TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'NOT_STARTED' CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'REVIEW', 'BLOCKED', 'DONE')),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  blocker TEXT,
  next_action TEXT NOT NULL,
  notes TEXT,
  reference_link TEXT,
  estimated_effort TEXT,
  expected_completion_date DATE,
  attachments JSONB DEFAULT '[]'::jsonb,
  completed_at TIMESTAMPTZ,
  completed_by TEXT,
  carried_forward BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Task Activity Audit Log Table
CREATE TABLE IF NOT EXISTS public.activities (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  task_title TEXT,
  user_id TEXT,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL,
  action TEXT NOT NULL,
  previous_value TEXT,
  new_value TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  task_id TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS) & Public Access Policies for Web Client
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access projects" ON public.projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access tasks" ON public.tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access activities" ON public.activities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
`;
