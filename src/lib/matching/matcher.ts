// ============================================================
// MENTOR ME – Matcher
// src/lib/matching/matcher.ts
//
// Haalt data op uit Supabase, roept scorer aan,
// en slaat de resultaten op in de matches tabel.
// ============================================================

import { createClient } from '@/lib/supabase/client'
import { rankMentors } from './scorer'
import type {
  StudentProfileFull,
  MentorProfileFull,
  MatchCandidate,
} from '@/types/database'

// ------------------------------------------------------------
// Haal het volledige student profiel op (met relaties)
// ------------------------------------------------------------

export async function getStudentProfile(
  profileId: string
): Promise<StudentProfileFull | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('student_profiles')
    .select(`
      *,
      profile:profiles(*),
      category:categories(*),
      sub_skill:sub_skills(*),
      context:contexts(*)
    `)
    .eq('profile_id', profileId)
    .single()

  if (error || !data) {
    console.error('Student profiel ophalen mislukt:', error?.message)
    return null
  }

  return data as StudentProfileFull
}

// ------------------------------------------------------------
// Haal alle beschikbare mentors op (met expertise relaties)
// ------------------------------------------------------------

export async function getAvailableMentors(): Promise<MentorProfileFull[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('mentor_profiles')
    .select(`
      *,
      profile:profiles(*),
      expertise:mentor_expertise(
        *,
        category:categories(*),
        sub_skill:sub_skills(*),
        context:contexts(*)
      )
    `)
    .eq('available', true)

  if (error || !data) {
    console.error('Mentors ophalen mislukt:', error?.message)
    return []
  }

  return data as MentorProfileFull[]
}

// ------------------------------------------------------------
// Sla de berekende matches op in de database
// (overschrijft bestaande matches voor deze student)
// ------------------------------------------------------------

export async function saveMatches(
  studentId: string,
  candidates: MatchCandidate[]
): Promise<boolean> {
  const supabase = createClient()

  // Verwijder oude matches voor deze student eerst
  await supabase
    .from('matches')
    .delete()
    .eq('student_id', studentId)

  if (candidates.length === 0) return true

  const rows = candidates.map(candidate => ({
    student_id: studentId,
    mentor_id:  candidate.mentor.id,
    score:      candidate.score,
    status:     'pending' as const,
  }))

  const { error } = await supabase.from('matches').insert(rows)

  if (error) {
    console.error('Matches opslaan mislukt:', error.message)
    return false
  }

  return true
}

// ------------------------------------------------------------
// Hoofd functie: run de volledige matching voor een student
// Aanroepen na profielaanmaak of profielwijziging
// ------------------------------------------------------------

export async function runMatchingForStudent(profileId: string): Promise<{
  success: boolean
  matches: MatchCandidate[]
  error?: string
}> {
  // 1. Haal student op
  const student = await getStudentProfile(profileId)
  if (!student) {
    return { success: false, matches: [], error: 'Student profiel niet gevonden' }
  }

  // 2. Haal alle beschikbare mentors op
  const mentors = await getAvailableMentors()
  if (mentors.length === 0) {
    return { success: true, matches: [], error: 'Geen beschikbare mentors gevonden' }
  }

  // 3. Bereken scores en rank
  const ranked = rankMentors(student, mentors)

  // 4. Sla op in database
  const saved = await saveMatches(student.id, ranked)
  if (!saved) {
    return { success: false, matches: [], error: 'Matches konden niet worden opgeslagen' }
  }

  return { success: true, matches: ranked }
}

// ------------------------------------------------------------
// Haal bestaande matches op voor een student (voor de UI)
// ------------------------------------------------------------

export async function getMatchesForStudent(profileId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      mentor:mentor_profiles(
        *,
        profile:profiles(*),
        expertise:mentor_expertise(
          *,
          category:categories(*),
          sub_skill:sub_skills(*),
          context:contexts(*)
        )
      )
    `)
    .eq('student_id', (
      await supabase
        .from('student_profiles')
        .select('id')
        .eq('profile_id', profileId)
        .single()
    ).data?.id ?? '')
    .order('score', { ascending: false })

  if (error) {
    console.error('Matches ophalen mislukt:', error.message)
    return []
  }

  return data ?? []
}
