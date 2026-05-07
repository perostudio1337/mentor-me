// ============================================================
// MENTOR ME – TypeScript Types
// Gebruik in je Next.js project: src/types/database.ts
// ============================================================

// ------------------------------------------------------------
// Basis entiteiten
// ------------------------------------------------------------

export type Role = 'student' | 'mentor'

export type MatchStatus = 'pending' | 'accepted' | 'declined' | 'completed'

export interface Profile {
  id: string
  role: Role
  full_name: string
  avatar_url: string | null
  bio: string | null
  linkedin_url: string | null
  created_at: string
  updated_at: string
}

// ------------------------------------------------------------
// Taxonomie
// ------------------------------------------------------------

export interface Category {
  id: number
  name: string
}

export interface SubSkill {
  id: number
  category_id: number
  name: string
}

export interface Context {
  id: number
  name: string
}

// ------------------------------------------------------------
// Student profiel
// ------------------------------------------------------------

export interface StudentProfile {
  id: string
  profile_id: string
  idea_title: string
  idea_desc: string
  problem: string
  category_id: number | null
  sub_skill_id: number | null
  context_id: number | null
  created_at: string
  updated_at: string
}

// Student profiel met alle relaties ingeladen (voor UI)
export interface StudentProfileFull extends StudentProfile {
  profile: Profile
  category: Category | null
  sub_skill: SubSkill | null
  context: Context | null
}

// ------------------------------------------------------------
// Mentor profiel
// ------------------------------------------------------------

export interface MentorProfile {
  id: string
  profile_id: string
  tagline: string | null
  available: boolean
  created_at: string
  updated_at: string
}

export interface MentorExpertise {
  id: string
  mentor_id: string
  category_id: number
  sub_skill_id: number | null
  context_id: number | null
  years_exp: number | null
}

// Mentor profiel met alle relaties ingeladen (voor UI en matching)
export interface MentorProfileFull extends MentorProfile {
  profile: Profile
  expertise: MentorExpertiseResolved[]
}

export interface MentorExpertiseResolved extends MentorExpertise {
  category: Category
  sub_skill: SubSkill | null
  context: Context | null
}

// ------------------------------------------------------------
// Matching
// ------------------------------------------------------------

export interface Match {
  id: string
  student_id: string
  mentor_id: string
  score: number
  status: MatchStatus
  matched_at: string
}

// Match met volledige profieldata (voor de match reveal UI)
export interface MatchFull extends Match {
  student: StudentProfileFull
  mentor: MentorProfileFull
}

// Tussenresultaat van het scoringsalgoritme (nog niet opgeslagen)
export interface MatchCandidate {
  mentor: MentorProfileFull
  score: number
  breakdown: ScoreBreakdown
}

export interface ScoreBreakdown {
  category_points: number   // max 20
  sub_skill_points: number  // max 50
  context_points: number    // max 30
  total: number             // max 100
}

// ------------------------------------------------------------
// Supabase Database type (voor de client)
// Gebruik met: createClient<Database>(url, key)
// ------------------------------------------------------------

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      student_profiles: {
        Row: StudentProfile
        Insert: Omit<StudentProfile, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<StudentProfile, 'id' | 'profile_id' | 'created_at'>>
      }
      mentor_profiles: {
        Row: MentorProfile
        Insert: Omit<MentorProfile, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<MentorProfile, 'id' | 'profile_id' | 'created_at'>>
      }
      mentor_expertise: {
        Row: MentorExpertise
        Insert: Omit<MentorExpertise, 'id'>
        Update: Partial<Omit<MentorExpertise, 'id' | 'mentor_id'>>
      }
      matches: {
        Row: Match
        Insert: Omit<Match, 'id' | 'matched_at'>
        Update: Pick<Match, 'status'>
      }
      categories: {
        Row: Category
        Insert: Omit<Category, 'id'>
        Update: Partial<Omit<Category, 'id'>>
      }
      sub_skills: {
        Row: SubSkill
        Insert: Omit<SubSkill, 'id'>
        Update: Partial<Omit<SubSkill, 'id'>>
      }
      contexts: {
        Row: Context
        Insert: Omit<Context, 'id'>
        Update: Partial<Omit<Context, 'id'>>
      }
    }
  }
}
