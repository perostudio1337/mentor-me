

/**
 * src/app/dashboard/challenges/page.tsx
 *
 * Discovery tab for Challenges.
 * – Startups browse the catalogue and can Join / Continue / View challenges.
 * – Mentor accounts see a read-only catalogue (they cannot enrol).
 * – Uses the same Supabase client + profile_id pattern as
 *   src/app/dashboard/profile/journey/page.tsx
 */

import { createClient } from '@/lib/supabase/client'
import ChallengesView from './challenges-view'
import type { Challenge, ChallengeEnrollment } from '@/types/challenges'

export default async function ChallengesPage() {
  const supabase = createClient()

  // ── Auth & profile ──────────────────────────────────────────
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', user.id)
    .single()

  if (!profile) return null

  // ── Fetch catalogue ─────────────────────────────────────────
  const { data: challenges } = await supabase
    .from('challenges')
    .select('*')
    .order('sort_order', { ascending: true })

  // ── Fetch enrolments (students only) ────────────────────────
  let enrollments: ChallengeEnrollment[] = []
  if (profile.role === 'student') {
    const { data } = await supabase
      .from('challenge_enrollments')
      .select('*')
      .eq('profile_id', profile.id)
    enrollments = data ?? []
  }

  return (
    <ChallengesView
      challenges={(challenges ?? []) as Challenge[]}
      enrollments={enrollments}
      profileId={profile.id}
      isMentor={profile.role === 'mentor'}
    />
  )
}
