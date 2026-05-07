// ============================================================
// MENTOR ME – Matcher (client versie)
// src/lib/matching/matcher.ts
//
// Gebruik in Client Components en na onboarding.
// Voor API routes gebruik matcher-server.ts
// ============================================================

import { createClient } from '@/lib/supabase/client'
import { rankMentors } from './scorer'
import type {
  StudentProfileFull,
  MentorProfileFull,
  MatchCandidate,
} from '@/types/database.types'

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
//
// FIX: matches.mentor_id is a FK to profiles.id
//      so we use candidate.mentor.profile_id, NOT candidate.mentor.id
// ------------------------------------------------------------

export async function saveMatches(
  studentProfileId: string,   // profiles.id of the student
  candidates: MatchCandidate[]
): Promise<boolean> {
  const supabase = createClient()

  // Verwijder oude matches voor deze student
  await supabase
    .from('matches')
    .delete()
    .eq('student_id', studentProfileId)

  if (candidates.length === 0) return true

  const rows = candidates.map(candidate => ({
    student_id: studentProfileId,               // profiles.id ✓
    mentor_id:  candidate.mentor.profile_id,    // profiles.id ✓ (was: mentor.id ✗)
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
// profileId = profiles.id
// ------------------------------------------------------------

export async function runMatchingForStudent(profileId: string): Promise<{
  success: boolean
  matches: MatchCandidate[]
  error?: string
}> {
  const student = await getStudentProfile(profileId)
  if (!student) {
    return { success: false, matches: [], error: 'Student profiel niet gevonden' }
  }

  const mentors = await getAvailableMentors()
  if (mentors.length === 0) {
    return { success: true, matches: [], error: 'Geen beschikbare mentors gevonden' }
  }

  const ranked = rankMentors(student, mentors)

  // Gebruik profileId (profiles.id), niet student.id (student_profiles.id)
  const saved = await saveMatches(profileId, ranked)
  if (!saved) {
    return { success: false, matches: [], error: 'Matches konden niet worden opgeslagen' }
  }

  return { success: true, matches: ranked }
}

// ------------------------------------------------------------
// Haal bestaande matches op voor een student (voor de UI)
// profileId = profiles.id
// ------------------------------------------------------------

export async function getMatchesForStudent(profileId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      mentor:profiles!matches_mentor_id_fkey(
        id, name, avatar_url, bio, expertise
      ),
      student:profiles!matches_student_id_fkey(
        id, name, avatar_url, bio, idea, problem
      )
    `)
    .eq('student_id', profileId)
    .order('score', { ascending: false })

  if (error) {
    console.error('Matches ophalen mislukt:', error.message)
    return []
  }

  return data ?? []
}