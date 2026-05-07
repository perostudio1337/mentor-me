'use client'

/**
 * src/app/dashboard/challenges/challenges-view.tsx
 *
 * Client component for Challenge Discovery.
 * Design: glassmorphism cards, Hanken Grotesk font (loaded via CSS),
 * --success (#10b981) progress bars — matches the project's design tokens.
 */

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import Card from '@/components/ui/card'
import Badge from '@/components/ui/badge'
import Button from '@/components/ui/button'
import ScrollReveal from '@/components/ui/scroll-reveal'
import type {
  Challenge,
  ChallengeEnrollment,
  ChallengeWithProgress,
  ChallengeTopic,
} from '@/types/challenges'
import { CHALLENGE_TOPIC_LABELS, CHALLENGE_DIFFICULTY_LABELS } from '@/types/challenges'

interface ChallengesViewProps {
  challenges: Challenge[]
  enrollments: ChallengeEnrollment[]
  profileId: string
  isMentor: boolean
}

export default function ChallengesView({
  challenges,
  enrollments,
  profileId,
  isMentor,
}: ChallengesViewProps) {
  const supabase = createClient()

  // ── Local state ─────────────────────────────────────────────
  const [localEnrollments, setLocalEnrollments] =
    useState<ChallengeEnrollment[]>(enrollments)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [topicFilter, setTopicFilter] = useState<ChallengeTopic | 'all'>('all')

  // ── Merge catalogue with enrolment data ─────────────────────
  const items: ChallengeWithProgress[] = useMemo(() => {
    return challenges.map((c) => {
      const enr = localEnrollments.find((e) => e.challenge_id === c.id) ?? null
      const pct = enr ? Math.round((enr.steps_done / c.total_steps) * 100) : 0
      return {
        ...c,
        enrollment: enr,
        progress_pct: pct,
        is_enrolled: enr !== null,
        is_completed: enr?.completed_at !== null && enr?.completed_at !== undefined,
      }
    })
  }, [challenges, localEnrollments])

  const filtered = useMemo(() => {
    if (topicFilter === 'all') return items
    return items.filter((i) => i.topic === topicFilter)
  }, [items, topicFilter])

  const active = items.filter((i) => i.is_enrolled && !i.is_completed)
  const completed = items.filter((i) => i.is_completed)

  // ── Join / Start a challenge ─────────────────────────────────
  async function handleJoin(challengeId: string) {
    setBusyId(challengeId)
    const { data, error } = await supabase
      .from('challenge_enrollments')
      .insert({
        profile_id: profileId,
        challenge_id: challengeId,
        steps_done: 0,
      })
      .select()
      .single()

    if (!error && data) {
      setLocalEnrollments((prev) => [...prev, data as ChallengeEnrollment])
    }
    setBusyId(null)
  }

  // ── Simulate advancing one step (demo interaction) ───────────
  async function handleAdvanceStep(item: ChallengeWithProgress) {
    if (!item.enrollment) return
    const newDone = Math.min(item.enrollment.steps_done + 1, item.total_steps)
    setBusyId(item.id)

    const { data, error } = await supabase
      .from('challenge_enrollments')
      .update({ steps_done: newDone })
      .eq('id', item.enrollment.id)
      .select()
      .single()

    if (!error && data) {
      setLocalEnrollments((prev) =>
        prev.map((e) => (e.id === item.enrollment!.id ? (data as ChallengeEnrollment) : e))
      )
    }
    setBusyId(null)
  }

  // ── Unique topics for filter ─────────────────────────────────
  const availableTopics = useMemo(
    () => [...new Set(challenges.map((c) => c.topic))] as ChallengeTopic[],
    [challenges]
  )

  return (
    <div className="max-w-3xl mx-auto space-y-8" style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>

      {/* ── Header ── */}
      <div>
        <h1 className="text-3xl font-bold mb-1">
          {isMentor ? 'Challenge Catalogue' : 'Challenges'}
        </h1>
        <p className="text-muted-foreground text-sm">
          {isMentor
            ? 'Browse the challenges your startups can work through.'
            : 'Small courses on essential startup topics. Complete them to level up.'}
        </p>
      </div>

      {/* ── Active progress summary (student only) ── */}
      {!isMentor && active.length > 0 && (
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            In Progress ({active.length})
          </h2>
          <div className="space-y-3">
            {active.map((item) => (
              <ActiveBar key={item.id} item={item} />
            ))}
          </div>
        </Card>
      )}

      {/* ── Topic filter ── */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setTopicFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
            topicFilter === 'all' ? 'bg-primary text-white shadow-sm' : 'glass hover:bg-white/60'
          }`}
        >
          All topics
        </button>
        {availableTopics.map((t) => (
          <button
            key={t}
            onClick={() => setTopicFilter(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              topicFilter === t ? 'bg-primary text-white shadow-sm' : 'glass hover:bg-white/60'
            }`}
          >
            {CHALLENGE_TOPIC_LABELS[t]}
          </button>
        ))}
      </div>

      {/* ── Catalogue grid ── */}
      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((item, i) => (
          <ScrollReveal key={item.id} delay={i * 50}>
            <ChallengeCard
              item={item}
              isMentor={isMentor}
              busy={busyId === item.id}
              onJoin={() => handleJoin(item.id)}
              onAdvance={() => handleAdvanceStep(item)}
            />
          </ScrollReveal>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card className="p-12 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-muted-foreground text-sm">No challenges in this topic yet.</p>
        </Card>
      )}

      {/* ── Completed ── */}
      {!isMentor && completed.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Completed 🏆</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {completed.map((item) => (
              <Card key={item.id} className="p-4 opacity-75">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="font-semibold text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Completed {item.enrollment?.completed_at
                        ? new Date(item.enrollment.completed_at).toLocaleDateString('en-GB')
                        : ''}
                    </p>
                  </div>
                  <Badge variant="success" className="ml-auto">Done ✓</Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────

function ChallengeCard({
  item,
  isMentor,
  busy,
  onJoin,
  onAdvance,
}: {
  item: ChallengeWithProgress
  isMentor: boolean
  busy: boolean
  onJoin: () => void
  onAdvance: () => void
}) {
  return (
    <Card className="p-5 flex flex-col gap-3 h-full">
      {/* Title row */}
      <div className="flex items-start gap-3">
        <span className="text-3xl leading-none">{item.icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm leading-snug">{item.title}</h3>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <Badge>{CHALLENGE_DIFFICULTY_LABELS[item.difficulty]}</Badge>
            <span className="text-xs text-muted-foreground">{item.duration_label}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-muted-foreground leading-relaxed flex-1">
        {item.description}
      </p>

      {/* Progress bar (only when enrolled) */}
      {item.is_enrolled && (
        <ProgressBar pct={item.progress_pct} stepsDone={item.enrollment?.steps_done ?? 0} total={item.total_steps} />
      )}

      {/* CTA — hidden for mentors */}
      {!isMentor && (
        <div className="mt-auto pt-1">
          {item.is_completed ? (
            <span className="text-xs font-medium text-success">✓ Completed</span>
          ) : item.is_enrolled ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onAdvance}
              // @ts-ignore
              disabled={busy}
            >
              {busy ? 'Saving…' : `Continue → Step ${(item.enrollment?.steps_done ?? 0) + 1}/${item.total_steps}`}
            </Button>
          ) : (
            <Button
              variant="gradient"
              size="sm"
              onClick={onJoin}
              // @ts-ignore
              disabled={busy}
            >
              {busy ? 'Joining…' : 'Start Challenge'}
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}

function ProgressBar({
  pct,
  stepsDone,
  total,
}: {
  pct: number
  stepsDone: number
  total: number
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-muted-foreground">Progress</span>
        <span className="text-xs font-semibold" style={{ color: 'var(--success)' }}>
          {stepsDone}/{total} steps · {pct}%
        </span>
      </div>
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #10b981, #34d399)',
          }}
        />
      </div>
    </div>
  )
}

function ActiveBar({ item }: { item: ChallengeWithProgress }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xl">{item.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium truncate">{item.title}</span>
          <span className="text-xs font-semibold ml-2 shrink-0" style={{ color: 'var(--success)' }}>
            {item.progress_pct}%
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
          <div
            className="h-1.5 rounded-full transition-all duration-500"
            style={{
              width: `${item.progress_pct}%`,
              background: 'linear-gradient(90deg, #10b981, #34d399)',
            }}
          />
        </div>
      </div>
    </div>
  )
}
