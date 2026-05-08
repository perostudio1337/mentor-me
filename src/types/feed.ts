// ============================================================
// Mentor.me — Feed / Milestone Post Types  (Phase 6)
// ============================================================

import type { Challenge } from './challenges'

export type MilestonePostKind =
  | 'milestone'
  | 'challenge_complete'
  | 'event'
  | 'update'

/** Mirrors the `milestone_posts` table */
export type MilestonePost = {
  id: string
  author_id: string
  content: string
  image_url: string | null
  challenge_enrollment_id: string | null
  challenge_id: string | null
  kind: MilestonePostKind
  created_at: string
  updated_at: string
}

export type PostLike = {
  post_id: string
  profile_id: string
  created_at: string
}

export type PostComment = {
  id: string
  post_id: string
  author_id: string
  content: string
  created_at: string
}

/** Author preview for feed cards */
export type PostAuthor = {
  id: string
  name: string
  avatar_url: string | null
  role: 'student' | 'mentor'
}

/** Hydrated row used by the feed UI */
export type MilestonePostFull = MilestonePost & {
  author: PostAuthor
  challenge: Challenge | null
  like_count: number
  comment_count: number
  liked_by_me: boolean
}

export const POST_KIND_LABELS: Record<MilestonePostKind, string> = {
  milestone:          '🏁 Milestone',
  challenge_complete: '🏆 Challenge Completed',
  event:              '📅 Event',
  update:             '📣 Update',
}
