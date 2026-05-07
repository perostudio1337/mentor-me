// ============================================================
// Mentor.me — Challenge & Progress Types  (Step 5.6)
// Append these to / replace the "Could-Have" section of
// src/types/index.ts, or import from this file directly.
// ============================================================

export type ChallengeTopic =
  | 'marketing'
  | 'finance'
  | 'technology'
  | 'legal'
  | 'operations'
  | 'product'
  | 'sales'
  | 'hr'
  | 'general';

export type ChallengeDifficulty = 'beginner' | 'intermediate' | 'advanced';

/** Mirrors the `challenges` table (static catalogue). */
export type Challenge = {
  id: string;
  slug: string;
  title: string;
  description: string;
  topic: ChallengeTopic;
  icon: string;
  total_steps: number;
  duration_label: string;
  difficulty: ChallengeDifficulty;
  sort_order: number;
  created_at: string;
};

/** Mirrors the `challenge_enrollments` table (per-student progress). */
export type ChallengeEnrollment = {
  id: string;
  profile_id: string;
  challenge_id: string;
  steps_done: number;
  completed_at: string | null;
  enrolled_at: string;
  updated_at: string;
  // Joined
  challenge?: Challenge;
};

/** Derived view — used in UI components. */
export type ChallengeWithProgress = Challenge & {
  enrollment: ChallengeEnrollment | null;
  /** 0–100 */
  progress_pct: number;
  is_enrolled: boolean;
  is_completed: boolean;
};

// ── Label helpers ────────────────────────────────────────────

export const CHALLENGE_TOPIC_LABELS: Record<ChallengeTopic, string> = {
  marketing:   '📣 Marketing',
  finance:     '💰 Finance',
  technology:  '⚙️ Technology',
  legal:       '⚖️ Legal',
  operations:  '🔧 Operations',
  product:     '💡 Product',
  sales:       '🤝 Sales',
  hr:          '👥 HR & People',
  general:     '🌐 General',
};

export const CHALLENGE_DIFFICULTY_LABELS: Record<ChallengeDifficulty, string> = {
  beginner:     '🟢 Beginner',
  intermediate: '🟡 Intermediate',
  advanced:     '🔴 Advanced',
};