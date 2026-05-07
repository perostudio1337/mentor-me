'use client'

/**
 * src/app/dashboard/profile/journey/page.tsx  — UPDATED (Step 5.6)
 *
 * Changes from original:
 * • Imports + renders <ChallengeProgressCard> replacing the static placeholder.
 * • Fetches challenge_enrollments joined with challenges for the current student.
 * • Everything else (milestones timeline) is untouched.
 */

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import ChallengeProgressCard from '@/components/challenges/challenge-progress-card'
import type { ChallengeEnrollment } from '@/types/challenges'
import type { Challenge } from '@/types/challenges'

type Milestone = {
  id: string
  title: string
  description: string | null
  stage: string
  achieved_at: string | null
  created_at: string
}

const stageLabels: Record<string, string> = {
  idea: '💡 Idea',
  validated: '✅ Validated',
  first_customer: '🤝 First Customer',
  funding: '💰 Funding',
  scaling: '🚀 Scaling',
  other: '⭐ Other',
}

type EnrollmentWithChallenge = ChallengeEnrollment & { challenge: Challenge }

export default function JourneyPage() {
  const supabase = createClient()
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [enrollments, setEnrollments] = useState<EnrollmentWithChallenge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.user.id)
        .single()

      if (!profile) return

      // Milestones (unchanged)
      const { data: mData, error: mError } = await supabase
        .from('startup_milestones')
        .select('*')
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: true })

      if (!mError && mData) setMilestones(mData)

      // Challenge enrolments — join with challenges table
      const { data: eData } = await supabase
        .from('challenge_enrollments')
        .select('*, challenge:challenges(*)')
        .eq('profile_id', profile.id)
        .order('enrolled_at', { ascending: true })

      if (eData) setEnrollments(eData as EnrollmentWithChallenge[])

      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) return <div className="p-8 text-center">Laden...</div>

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">My Startup Journey</h1>
      <p className="text-gray-500 mb-8">Track your progress as a founder.</p>

      {/* ── Milestones timeline (unchanged) ── */}
      {milestones.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-2xl shadow">
          <div className="text-5xl mb-4">🗺️</div>
          <h2 className="text-xl font-semibold mb-2">No milestones yet</h2>
          <p className="text-gray-400 text-sm">
            Add your first milestone to start tracking your journey.
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Progress line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-blue-100" />
          <div className="space-y-6">
            {milestones.map((milestone) => (
              <div key={milestone.id} className="relative flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs shrink-0 z-10">
                  ✓
                </div>
                <div className="bg-white rounded-2xl shadow p-4 flex-1">
                  <span className="text-xs text-blue-500 font-medium">
                    {stageLabels[milestone.stage] ?? milestone.stage}
                  </span>
                  <h3 className="font-semibold mt-1">{milestone.title}</h3>
                  {milestone.description && (
                    <p className="text-gray-500 text-sm mt-1">{milestone.description}</p>
                  )}
                  {milestone.achieved_at && (
                    <p className="text-gray-400 text-xs mt-2">
                      {new Date(milestone.achieved_at).toLocaleDateString('de-DE')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Step 5.6 — Challenge Progress (replaces placeholder) ── */}
      <div className="mt-10">
        <ChallengeProgressCard
          enrollments={enrollments}
          isMentorView={false}
        />
      </div>
    </div>
  )
}
