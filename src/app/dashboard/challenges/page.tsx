/**
 * src/app/dashboard/challenges/page.tsx
 */

import { createClient } from '@/lib/supabase/server'
import ChallengesView from './challenges-view'
import type { Challenge, ChallengeEnrollment } from '@/types/challenges'

export const dynamic = 'force-dynamic'

export default async function ChallengesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', user.id)
    .single()

  if (!profile) return null

  const { data: challenges } = await supabase
    .from('challenges')
    .select('*')
    .order('sort_order', { ascending: true })

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
      authUserId={user.id}
      isMentor={profile.role === 'mentor'}
    />
  )
}