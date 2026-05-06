// ─── Priority & Category ───────────────────────────────────────────────────

export type Priority = 'hoch' | 'mittel' | 'niedrig';

export type TaskCategory = 'school' | 'sport' | 'personal' | 'work' | 'reading' | 'other';

// ─── Task Unit & Time-of-Day ───────────────────────────────────────────────

export type TaskUnit = 'none' | 'pages' | 'minutes' | 'count';

export type TaskTimeOfDay = 'any' | 'morning' | 'midday' | 'evening';

// ─── Task ──────────────────────────────────────────────────────────────────

export interface Task {
  id: string;
  user_id?: string;
  title: string;
  description?: string;
  priority: Priority;
  category: TaskCategory;
  done: boolean;
  date: string;         // ISO date — YYYY-MM-DD
  unit: TaskUnit;
  target_amount?: number;
  progress_amount: number;
  time_of_day: TaskTimeOfDay;
  book_id?: string;
  created_at: string;
  updated_at: string;
}

export type TaskInput = Omit<Task, 'id' | 'created_at' | 'updated_at'>;

// ─── Day Stats ─────────────────────────────────────────────────────────────

export interface DayStats {
  date: string;
  total_tasks: number;
  done_tasks: number;
  score: number;        // 0–100
}

// ─── Streak ────────────────────────────────────────────────────────────────

export interface StreakState {
  current_streak: number;
  longest_streak: number;
  last_active_date: string;
}

// ─── User Profile ──────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  display_name: string;
  avatar_url?: string;
  xp: number;
  level: number;
  created_at: string;
}

// ─── Reading ───────────────────────────────────────────────────────────────

export interface ReadingEntry {
  id: string;
  user_id?: string;
  title: string;
  author?: string;
  total_pages?: number;
  current_page: number;
  cover_url?: string;
  status: 'reading' | 'done' | 'paused';
  started_at?: string;
  finished_at?: string;
}

// ─── Learning ──────────────────────────────────────────────────────────────

export interface LearningSession {
  id: string;
  user_id?: string;
  subject: string;
  duration_minutes: number;
  notes?: string;
  date: string;
}

// ─── App State ─────────────────────────────────────────────────────────────

export type AppView = 'home' | 'reading' | 'learning' | 'profile';
