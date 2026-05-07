// ============================================================
// Mentor.me — Core Type Definitions
// ============================================================

// --- User & Profile Types ---

export type UserRole = "mentor" | "student";

export type Profile = {
  id: string;
  user_id: string;
  role: UserRole;
  name: string;
  email: string;
  avatar_url: string | null;
  bio: string;
  expertise: string[]; // mentor: fields of expertise
  problem: string; // student: the problem they face
  idea: string; // student: their startup idea
  availability: string; // e.g. "weekdays", "evenings", "flexible"
  is_visible: boolean; // profile pause/hide mode
  created_at: string;
  updated_at: string;
};

// --- Matching Types ---

export type MatchStatus = "pending" | "accepted" | "declined";

export type Match = {
  id: string;
  mentor_id: string;
  student_id: string;
  score: number; // 0-100 match percentage
  status: MatchStatus;
  reasoning: string; // why this match was suggested
  created_at: string;
  // Joined data (optional, populated by queries)
  mentor?: Profile;
  student?: Profile;
};

// --- Chat / Messages Types ---

export type Message = {
  id: string;
  match_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
};

// --- Events Types ---

export type EventStatus = "pending" | "approved" | "rejected";

export type EventCategory =
  | "pitch-night"
  | "workshop"
  | "hackathon"
  | "networking"
  | "bootcamp"
  | "meetup"
  | "conference"
  | "lecture"
  | "career-fair"
  | "webinar"
  | "office-hours"
  | "other";

export const EVENT_CATEGORIES: { value: EventCategory; label: string }[] = [
  { value: "pitch-night", label: "Pitch Night" },
  { value: "workshop", label: "Workshop" },
  { value: "hackathon", label: "Hackathon" },
  { value: "networking", label: "Networking" },
  { value: "bootcamp", label: "Bootcamp" },
  { value: "meetup", label: "Meetup" },
  { value: "conference", label: "Conference" },
  { value: "lecture", label: "Lecture" },
  { value: "career-fair", label: "Career Fair" },
  { value: "webinar", label: "Webinar" },
  { value: "office-hours", label: "Office Hours" },
  { value: "other", label: "Other" },
];

export type MentorEvent = {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  category: EventCategory;
  date: string;
  end_date: string | null;
  location: string;
  link: string;
  status: EventStatus;
  created_at: string;
  updated_at: string;
  // Joined data
  creator?: Profile;
  rsvp_count?: number;
  user_has_rsvpd?: boolean;
};

export type EventRsvp = {
  id: string;
  event_id: string;
  user_id: string;
  created_at: string;
};

// --- Session / Scheduling Types ---

export type SessionStatus = "scheduled" | "completed" | "cancelled";

export type Session = {
  id: string;
  match_id: string;
  scheduled_at: string;
  meeting_link: string | null;
  status: SessionStatus;
  notes: string | null;
  created_at: string;
};
