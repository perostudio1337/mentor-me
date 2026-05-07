'use client'

/**
 * src/components/challenges/challenge-progress-card.tsx
 *
 * Reusable "Challenge Progress" section used in:
 *   1. src/app/dashboard/profile/page.tsx          (student's own profile)
 *   2. src/app/dashboard/matches/[matchId]/profile (mentor view of a startup)
 *
 * Props
 * ─────
 * enrollments  – array of ChallengeEnrollment joined with challenge data
 * isMentorView – when true shows a "knowledge level" label and hides CTAs
 */

import Link from 'next/link'
import Card from '@/components/ui/card'
import Badge from '@/components/ui/badge'
import type { ChallengeEnrollment } from '@/types/challenges'

interface ChallengeProgressCardProps {
  enrollments: (ChallengeEnrollment & { challenge: import('@/types/challenges').Challenge })[]
  isMentorView?: boolean
}

export default function ChallengeProgressCard({
  enrollments,
  isMentorView = false,
}: ChallengeProgressCardProps) {
  const active    = enrollments.filter((e) => !e.completed_at)
  const completed = enrollments.filter((e) => e.completed_at !== null)

  if (enrollments.length === 0) {
    return (
      <Card className="p-6" style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>
        <SectionHeader isMentorView={isMentorView} count={0} />
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🏆</div>
          {isMentorView ? (
            <p className="text-muted-foreground text-sm">No challenges started yet.</p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Complete bite-sized challenges to build momentum.
              </p>
              <Link
                href="/dashboard/challenges"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Browse Challenges →
              </Link>
            </>
          )}
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6" style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>
      <SectionHeader isMentorView={isMentorView} count={enrollments.length} />

      {/* ── Active challenges ── */}
      {active.length > 0 && (
        <div className="space-y-4 mb-5">
          {active.map((e) => {
            const pct = Math.round((e.steps_done / e.challenge.total_steps) * 100)
            return (
              <div key={e.id}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-lg">{e.challenge.icon}</span>
                  <span className="text-sm font-semibold flex-1 truncate">
                    {e.challenge.title}
                  </span>
                  <span
                    className="text-xs font-bold tabular-nums"
                    style={{ color: 'var(--success)' }}
                  >
                    {pct}%
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full transition-all duration-700"
                    style={{
                      width: `${pct}%`,
                      background: 'linear-gradient(90deg, #10b981, #34d399)',
                    }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-muted-foreground">
                    {e.challenge.duration_label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {e.steps_done} / {e.challenge.total_steps} steps
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Completed strip ── */}
      {completed.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Completed ({completed.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {completed.map((e) => (
              <div
                key={e.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                style={{
                  background: 'rgba(16,185,129,0.12)',
                  color: 'var(--success)',
                  border: '1px solid rgba(16,185,129,0.25)',
                }}
              >
                <span>{e.challenge.icon}</span>
                <span>{e.challenge.title}</span>
                <span>✓</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CTA for student's own view ── */}
      {!isMentorView && (
        <div className="mt-5 pt-4 border-t border-border/40">
          <Link
            href="/dashboard/challenges"
            className="text-sm font-medium text-primary hover:underline"
          >
            Browse more challenges →
          </Link>
        </div>
      )}
    </Card>
  )
}

// ── Section header ──────────────────────────────────────────

function SectionHeader({
  isMentorView,
  count,
}: {
  isMentorView: boolean
  count: number
}) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div>
        <h2 className="text-lg font-semibold">
          {isMentorView ? "Startup's Challenge Progress" : 'Challenge Progress'}
        </h2>
        {isMentorView && count > 0 && (
          <p className="text-xs text-muted-foreground mt-0.5">
            Shows current knowledge level before your session
          </p>
        )}
      </div>
      {count > 0 && (
        <Badge variant="success">{count} active</Badge>
      )}
    </div>
  )
}
