'use client'

/**
 * src/app/dashboard/matches/[matchId]/profile/page.tsx  — NEW (Step 5.6)
 *
 * Mentor view of a matched startup's profile.
 * Mirrors the pattern from matches/[matchId]/page.tsx but adds:
 *   • Full profile details
 *   • Challenge Progress section via <ChallengeProgressCard isMentorView>
 *
 * Route: /dashboard/matches/[matchId]/profile
 * (The existing /dashboard/matches/[matchId] page shows the journey/milestones.)
 */

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import Card from '@/components/ui/card'
import Badge from '@/components/ui/badge'
import ChallengeProgressCard from '@/components/challenges/challenge-progress-card'
import type { ChallengeEnrollment, Challenge } from '@/types/challenges'

type EnrollmentWithChallenge = ChallengeEnrollment & { challenge: Challenge }

type StartupProfile = {
  id: string
  name: string
  bio: string
  idea: string
  problem: string
  expertise: string[]
  availability: string
}

export default function MenteeProfilePage() {
  const { matchId } = useParams()
  const supabase = createClient()

  const [profile, setProfile] = useState<StartupProfile | null>(null)
  const [enrollments, setEnrollments] = useState<EnrollmentWithChallenge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      // Get student_id from the match
      const { data: match } = await supabase
        .from('matches')
        .select('student_id')
        .eq('id', matchId)
        .single()

      if (!match) return

      // Fetch startup profile
      const { data: p } = await supabase
        .from('profiles')
        .select('id, name, bio, idea, problem, expertise, availability')
        .eq('id', match.student_id)
        .single()

      if (!p) return
      setProfile(p)

      // Fetch challenge enrolments joined with challenge details
      const { data: eData } = await supabase
        .from('challenge_enrollments')
        .select('*, challenge:challenges(*)')
        .eq('profile_id', p.id)
        .order('enrolled_at', { ascending: true })

      if (eData) setEnrollments(eData as EnrollmentWithChallenge[])
      setLoading(false)
    }

    fetchData()
  }, [matchId])

  if (loading) return <div className="p-8 text-center">Loading...</div>
  if (!profile) return null

  const initials = profile.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6" style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>

      {/* ── Profile header ── */}
      <Card className="text-center p-8">
        <div className="w-16 h-16 rounded-full bg-primary-light text-white text-xl font-bold flex items-center justify-center mx-auto mb-3">
          {initials}
        </div>
        <h1 className="text-2xl font-bold">{profile.name}</h1>
        <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
          <Badge variant="success">🚀 Startup</Badge>
          <Badge>{profile.availability}</Badge>
        </div>
        {profile.bio && (
          <p className="text-muted-foreground text-sm mt-3 max-w-md mx-auto">{profile.bio}</p>
        )}
      </Card>

      {/* ── Startup details ── */}
      {(profile.idea || profile.problem) && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Their Startup</h2>
          {profile.idea && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                Idea / Project
              </p>
              <p className="text-sm">{profile.idea}</p>
            </div>
          )}
          {profile.problem && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                Problem they face
              </p>
              <p className="text-sm">{profile.problem}</p>
            </div>
          )}
        </Card>
      )}

      {/* ── Challenge Progress — mentor view ── */}
      <ChallengeProgressCard
        enrollments={enrollments}
        isMentorView={true}
      />
    </div>
  )
}
