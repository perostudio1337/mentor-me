// ============================================================
// MENTOR ME – Problem-Based Scorer
// src/lib/matching/problem-scorer.ts
//
// Uitbreiding op scorer.ts voor de "Request a Mentor" modal
// op /dashboard/matches.
// Gebruikt dezelfde CATEGORIES als onboarding/page.tsx.
// ============================================================

import type { MentorProfileFull } from '@/types/database.types'
import { calculateScore } from './scorer'

// ── Taxonomy (identiek aan onboarding/page.tsx) ───────────────
export const PROBLEM_CATEGORIES = [
  { id: 1, name: 'Marketing' },
  { id: 2, name: 'Finance' },
  { id: 3, name: 'Technology' },
  { id: 4, name: 'Legal' },
  { id: 5, name: 'Operations' },
  { id: 6, name: 'Product' },
  { id: 7, name: 'Sales' },
  { id: 8, name: 'HR & People' },
] as const

export type ProblemCategoryId = (typeof PROBLEM_CATEGORIES)[number]['id']
export type ProblemCategoryName = (typeof PROBLEM_CATEGORIES)[number]['name']

// ── Request type ──────────────────────────────────────────────

export interface ProblemRequest {
  problemDescription: string
  selectedCategoryIds: ProblemCategoryId[]
}

// ── Result type ───────────────────────────────────────────────

export interface ProblemMatchCandidate {
  mentor: MentorProfileFull
  /** 0–100 */
  score: number
  /** "Best match because of your Marketing & Sales tags." */
  matchReason: string
  matchedCategoryNames: ProblemCategoryName[]
}

// ── Weights ───────────────────────────────────────────────────

const W = {
  categoryOverlap: 55, // geselecteerde categorieën vs mentor expertise
  keywordMatch:    20, // keywords uit probleembeschrijving in mentor bio/tagline
  baseAlgorithm:  25, // bestaande scorer (category_id + sub_skill_id + context_id)
}

function keywordScore(problem: string, mentor: MentorProfileFull): number {
  const haystack = [
    mentor.tagline ?? '',
    ...mentor.expertise.map((e) => e.category?.name ?? ''),
    ...mentor.expertise.map((e) => e.sub_skill?.name ?? ''),
    ...mentor.expertise.map((e) => e.context?.name ?? ''),
  ]
    .join(' ')
    .toLowerCase()

  const words = problem
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 3) // skip short words

  if (words.length === 0) return 0
  const hits = words.filter((w) => haystack.includes(w))
  return hits.length / words.length
}

// ── Main export ───────────────────────────────────────────────

export function rankMentorsForProblem(
  mentors: MentorProfileFull[],
  request: ProblemRequest,
  limit = 5,
): ProblemMatchCandidate[] {
  const selectedIds = new Set(request.selectedCategoryIds.map(Number))
  const catNameById = new Map(PROBLEM_CATEGORIES.map((c) => [c.id, c.name] as const))

  return mentors
    .filter((m) => m.available)
    .map((mentor) => {
      // 1. Category overlap — force both sides to numbers to avoid "4" !== 4
      const mentorCatIds = new Set(mentor.expertise.map((e) => Number(e.category_id)).filter(Boolean))
      const overlapping = [...selectedIds].filter((id) => mentorCatIds.has(Number(id)))
      const catRatio = selectedIds.size > 0 ? overlapping.length / selectedIds.size : 0
      const catPoints = Math.round(catRatio * W.categoryOverlap)

      // 2. Keyword match
      const kwPoints = Math.round(keywordScore(request.problemDescription, mentor) * W.keywordMatch)

      // 3. Existing algorithm — use first selected category as fake student profile
      const fakeStudent = {
        category_id: request.selectedCategoryIds[0] ?? null,
        sub_skill_id: null,
        context_id: null,
      } as Parameters<typeof calculateScore>[0]
      const baseTotal = calculateScore(fakeStudent, mentor).total
      const basePoints = Math.round((baseTotal / 100) * W.baseAlgorithm)

      const score = Math.min(catPoints + kwPoints + basePoints, 100)

      const matchedNames = overlapping
        .map((id) => catNameById.get(id as ProblemCategoryId))
        .filter(Boolean) as ProblemCategoryName[]

      const matchReason = buildReason(matchedNames)

      return { mentor, score, matchReason, matchedCategoryNames: matchedNames }
    })
    .filter((c) => c.score >= 15)
    .sort((a, b) =>
      b.score !== a.score
        ? b.score - a.score
        : ((a.mentor.profile as any)?.full_name || (a.mentor.profile as any)?.name || '').localeCompare((b.mentor.profile as any)?.full_name || (b.mentor.profile as any)?.name || ''),
    )
    .slice(0, limit)
}

function buildReason(names: ProblemCategoryName[]): string {
  if (names.length === 0) return 'Strong overall match for your challenge.'
  const list =
    names.length === 1
      ? names[0]
      : names.slice(0, -1).join(', ') + ' & ' + names[names.length - 1]
  return `Best match because of your ${list} tag${names.length > 1 ? 's' : ''}.`
}