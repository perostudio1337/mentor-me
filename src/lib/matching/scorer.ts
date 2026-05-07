// ============================================================
// MENTOR ME – Scoringsalgoritme
// src/lib/matching/scorer.ts
//
// Puur functie — geen database calls, makkelijk te testen.
// ============================================================

import type {
  StudentProfileFull,
  MentorProfileFull,
  MatchCandidate,
  ScoreBreakdown,
} from '@/types/database'

// ------------------------------------------------------------
// Gewichten (samen altijd 100)
// ------------------------------------------------------------

const WEIGHTS = {
  CATEGORY:  20,  // Zelfde vakgebied
  SUB_SKILL: 50,  // Zelfde specifieke skill — zwaarst gewogen
  CONTEXT:   30,  // Zelfde context (B2B, startup, etc.)
} as const

// Minimale score om als match te tellen
export const MIN_MATCH_SCORE = 20

// Maximaal aantal matches teruggeven aan de student
export const MAX_MATCHES = 5

// ------------------------------------------------------------
// Bereken score tussen één student en één mentor
// ------------------------------------------------------------

export function calculateScore(
  student: StudentProfileFull,
  mentor: MentorProfileFull
): ScoreBreakdown {
  // Een mentor heeft meerdere expertisegebieden.
  // We nemen de hoogste score over alle expertise rijen.
  let best: ScoreBreakdown = {
    category_points:  0,
    sub_skill_points: 0,
    context_points:   0,
    total:            0,
  }

  for (const expertise of mentor.expertise) {
    const category_points =
      student.category_id !== null &&
      expertise.category_id === student.category_id
        ? WEIGHTS.CATEGORY
        : 0

    const sub_skill_points =
      student.sub_skill_id !== null &&
      expertise.sub_skill_id !== null &&
      expertise.sub_skill_id === student.sub_skill_id
        ? WEIGHTS.SUB_SKILL
        : 0

    const context_points =
      student.context_id !== null &&
      expertise.context_id !== null &&
      expertise.context_id === student.context_id
        ? WEIGHTS.CONTEXT
        : 0

    const total = category_points + sub_skill_points + context_points

    // Bewaar de beste expertise match van deze mentor
    if (total > best.total) {
      best = { category_points, sub_skill_points, context_points, total }
    }
  }

  return best
}

// ------------------------------------------------------------
// Rank een lijst mentors voor een student
// Geeft gesorteerde lijst terug, alleen boven de drempelwaarde
// ------------------------------------------------------------

export function rankMentors(
  student: StudentProfileFull,
  mentors: MentorProfileFull[]
): MatchCandidate[] {
  const candidates: MatchCandidate[] = mentors
    .filter(mentor => mentor.available)
    .map(mentor => ({
      mentor,
      score: 0,
      breakdown: calculateScore(student, mentor),
    }))
    .map(candidate => ({
      ...candidate,
      score: candidate.breakdown.total,
    }))
    .filter(candidate => candidate.score >= MIN_MATCH_SCORE)

  // Sorteer op score (hoog → laag), bij gelijkspel op naam
  candidates.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return a.mentor.profile.full_name.localeCompare(b.mentor.profile.full_name)
  })

  return candidates.slice(0, MAX_MATCHES)
}
