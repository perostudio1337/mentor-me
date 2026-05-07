'use client'

// ============================================================
// MENTOR ME — MentorRequestModal
// src/components/discovery/mentor-request-modal.tsx
//
// Glassmorphism overlay — styling 100% consistent met
// globals.css tokens (--primary, --secondary, .glass, etc.)
// ============================================================

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/button'
import type { MentorProfileFull } from '@/types/database.types'
import {
  PROBLEM_CATEGORIES,
  rankMentorsForProblem,
  type ProblemRequest,
  type ProblemMatchCandidate,
  type ProblemCategoryId,
} from '@/lib/matching/problem-scorer'

// ── Props ─────────────────────────────────────────────────────
interface Props {
  isOpen: boolean
  onClose: () => void
  mentors: MentorProfileFull[]
  /** Bestaande matches van de student: { mentor_id, match_id, status } */
  existingMatches?: { mentor_id: string; match_id: string; status: string }[]
}

// ── Category pill ─────────────────────────────────────────────
function CategoryPill({
  name,
  selected,
  onClick,
}: {
  name: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        px-4 py-2 rounded-full text-sm font-medium
        transition-all duration-200 cursor-pointer select-none
        ${selected
          ? 'bg-primary text-white shadow-sm scale-105'
          : 'glass hover:bg-white/60 text-foreground'}
      `}
    >
      {name}
    </button>
  )
}

// ── Score badge ───────────────────────────────────────────────
function ScoreBadge({ score }: { score: number }) {
  const cls =
    score >= 75 ? 'bg-green-100 text-green-700' :
    score >= 45 ? 'bg-purple-100 text-purple-700' :
                  'bg-gray-100 text-gray-500'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {score}% match
    </span>
  )
}

// ── Result card ───────────────────────────────────────────────
function ResultCard({
  candidate,
  onBook,
}: {
  candidate: ProblemMatchCandidate
  onBook: () => void
}) {
  const { mentor, score, matchReason, matchedCategoryNames } = candidate
  // profiles table uses 'name' in src/types/index.ts — handle both name variants
  const p = mentor.profile as any
  const displayName: string = p?.full_name || p?.name || 'Mentor'
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?'

  return (
    <div className="glass rounded-2xl p-4 flex items-start gap-3 hover:bg-white/70 transition-colors duration-150">
      <div className="w-11 h-11 rounded-full bg-primary-light text-white font-bold flex items-center justify-center text-sm flex-shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm text-foreground">
            {displayName}
          </span>
          <ScoreBadge score={score} />
        </div>
        {mentor.tagline && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{mentor.tagline}</p>
        )}
        <p className="text-xs text-primary font-medium mt-1.5">{matchReason}</p>
        {matchedCategoryNames.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {matchedCategoryNames.map((name) => (
              <span key={name} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                {name}
              </span>
            ))}
          </div>
        )}
      </div>
      <Button variant="gradient" size="sm" onClick={onBook} className="flex-shrink-0">
        Book
      </Button>
    </div>
  )
}

// ── Main modal ────────────────────────────────────────────────
export default function MentorRequestModal({ isOpen, onClose, mentors, existingMatches = [] }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<'form' | 'results'>('form')
  const [problem, setProblem] = useState('')
  const [selectedIds, setSelectedIds] = useState<ProblemCategoryId[]>([])
  const [results, setResults] = useState<ProblemMatchCandidate[]>([])
  const [loading, setLoading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Focus on open
  useEffect(() => {
    if (isOpen && step === 'form') {
      setTimeout(() => textareaRef.current?.focus(), 150)
    }
  }, [isOpen, step])

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setProblem('')
      setSelectedIds([])
      setResults([])
      setStep('form')
    }
  }, [isOpen])

  function toggle(id: ProblemCategoryId) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  async function handleFind() {
    if (problem.trim().length < 10 || selectedIds.length === 0) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 500))
    const request: ProblemRequest = {
      problemDescription: problem.trim(),
      selectedCategoryIds: selectedIds,
    }
    setResults(rankMentorsForProblem(mentors, request, 5))
    setLoading(false)
    setStep('results')
  }

  /**
   * Navigate to the existing match profile page.
   * The problem description is passed as a ?problem= query param
   * so the BookSessionForm can pre-fill its notes field.
   *
   * If there's no existing match yet we navigate to a new
   * request page (see matches/request/[profileId]/page.tsx).
   */
  function handleBook(mentor: MentorProfileFull) {
    const params = new URLSearchParams({
      problem: problem.trim(),
      categories: selectedIds.join(','),
    })

    // mentor.profile_id = profiles.id (FK) — this is what matches.mentor_id uses
    // mentor.id = mentor_profiles.id — do NOT use this for routing
    const mentorProfilesId = mentor.profile_id

    if (!mentorProfilesId) {
      console.error('mentor.profile_id is null — cannot route')
      return
    }

    const existingMatch = existingMatches.find(
      (m) => m.mentor_id === mentorProfilesId && m.status === 'accepted'
    )

    if (existingMatch) {
      // Already connected — go straight to booking
      router.push(`/dashboard/matches/${existingMatch.match_id}/profile?${params}`)
    } else {
      // Send a match request first
      router.push(`/dashboard/matches/request/${mentorProfilesId}?${params}`)
    }
    onClose()
  }

  if (!isOpen) return null

  const canSubmit = problem.trim().length >= 10 && selectedIds.length > 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(26,26,46,0.55)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.93)',
          boxShadow: '0 24px 64px rgba(124,58,237,0.18)',
          maxHeight: '90vh',
        }}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/50">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {step === 'form' ? 'Request a mentor' : 'Suggested mentors'}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {step === 'form'
                  ? "Describe your challenge — we'll find the right match."
                  : `${results.length} mentor${results.length !== 1 ? 's' : ''} matched your problem.`}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-gray-100 transition-colors ml-3 flex-shrink-0"
            >
              ✕
            </button>
          </div>
          {/* Step bar */}
          <div className="flex gap-2 mt-4">
            <div className="h-1 flex-1 rounded-full bg-primary" />
            <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${step === 'results' ? 'bg-primary' : 'bg-black/10'}`} />
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 130px)' }}>

          {/* ── Step 1: Form ── */}
          {step === 'form' && (
            <div className="px-6 py-5 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  What problem are you facing?
                </label>
                <textarea
                  ref={textareaRef}
                  value={problem}
                  onChange={(e) => setProblem(e.target.value.slice(0, 500))}
                  rows={4}
                  placeholder="e.g. We're launching next month but have no idea how to price our SaaS or structure first sales conversations..."
                  className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">{problem.length} / 500</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">
                  Which area(s) does this relate to?
                </label>
                <p className="text-xs text-muted-foreground mb-3">
                  Select all that apply — this sharpens your match.
                </p>
                <div className="flex flex-wrap gap-2">
                  {PROBLEM_CATEGORIES.map((cat) => (
                    <CategoryPill
                      key={cat.id}
                      name={cat.name}
                      selected={selectedIds.includes(cat.id)}
                      onClick={() => toggle(cat.id)}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-1">
                <Button
                  variant={canSubmit ? 'gradient' : 'outline'}
                  onClick={handleFind}
                  disabled={!canSubmit || loading}
                  className="w-full"
                >
                  {loading ? 'Finding your matches…' : 'Find mentors →'}
                </Button>
                {!canSubmit && (
                  <p className="text-center text-xs text-muted-foreground mt-2">
                    Add a description (min. 10 chars) and at least one area.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── Step 2: Results ── */}
          {step === 'results' && (
            <div className="px-6 py-5 space-y-3">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-1 transition-colors"
              >
                ← Edit request
              </button>

              {results.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="text-sm text-muted-foreground">
                    No mentors matched. Try different categories.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStep('form')}
                    className="mt-4 text-sm text-primary font-medium hover:underline"
                  >
                    Go back
                  </button>
                </div>
              ) : (
                results.map((c) => (
                  <ResultCard key={c.mentor.id} candidate={c} onBook={() => handleBook(c.mentor)} />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
