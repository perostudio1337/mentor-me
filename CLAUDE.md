<<<<<<< HEAD
# Mentor.me — Project Context

## What Is This?

Mentor.me is a European mentoring platform built as part of the E³UDRES² alliance / UCLL Innovation Lab. It connects **student startup founders** (who have an idea but face a specific problem) with **experienced mentors** (who want to share expertise in their field). The project originated during Business Booster Week at TalentFunnel.eu and is designed to support entrepreneurship across European rural and urban ecosystems.

## The Problem

People with a startup idea can't find trustworthy, relevant advice in their own environment — so they get stuck and never start. Meanwhile, experienced professionals want to give back but don't know where to find people who need their help.

## Users (Two-Sided Platform)

### Student / Startup Founder (Consumer)
- Has an idea but faces a specific problem (e.g., legal, marketing, funding)
- Wants: concrete steps forward, a mentor who truly listens, access to networks
- Pains: doesn't know where to start, overthinking, no trusted advisors nearby

### Mentor (Producer)
- Professional with 10+ years experience wanting to give back
- Wants: to see the person succeed, gain experience through exchange, recognition
- Pains: uncooperative mentees, distance, unclear expectations, can't find people who need help

## Core Features (MVP — Must Have)

1. **Registration & Auth** — Email signup with role selection (mentor or student), secure login
2. **Profile Creation** — Mentors: expertise field, bio, availability. Students: idea description, problem they face
3. **Matching System** — Algorithm matches students to mentors by sector, problem context, and availability. Shows match % and reasoning. Both sides accept/decline.
4. **Chat (WhatsApp-style)** — Real-time messaging between matched pairs. Content moderation (no inappropriate language).
5. **Event Board** — Users and mentors can post networking events. Events require admin/third-party verification before going live.
6. **Session Scheduling** — Shared calendar for booking meetings between mentor and student.
7. **Admin Moderation** — Admin can manage users, matches, and approve events.
8. **GDPR Compliance** — Data access, deletion, privacy policy.

## Should-Have Features (Post-MVP)

- Match filtering by criteria
- Video call integration (Teams/Zoom/Meet)
- Progress overview (sessions and goals tracker)
- In-app + email notifications
- Profile pause/hide mode
- Match reasoning display

## Could-Have Features (Nice Extras)

- Session notes
- Completion badge/certificate
- Platform analytics dashboard
- Mentor onboarding flow with "warm handover" design

## Vibe & Design Language

- **Professional but playful** — not clinical
- Minimalistic layout
- Pastel accent colors
- Modern typography
- Rounded cards
- "Match Reveal" screen with subtle animations
- Progress bars for the mentorship journey

## Tech Stack

- **Language:** TypeScript (strict mode)
- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS
- **Backend/DB:** Supabase (PostgreSQL + Realtime + Auth)
- **Deployment:** Vercel
- **Integrations:** Microsoft Graph API (calendar/Teams meetings)
- **Content Moderation:** Perspective API (Google) for chat guardrails
- **IDE:** Visual Studio Code

## Project Structure

```
mentor-me/
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── (auth)/           # Login, register, onboarding
│   │   ├── (dashboard)/      # Main app after login
│   │   │   ├── chat/         # Messaging interface
│   │   │   ├── matches/      # Match suggestions & management
│   │   │   ├── events/       # Event board
│   │   │   ├── profile/      # Profile view & edit
│   │   │   └── calendar/     # Session scheduling
│   │   ├── admin/            # Admin panel
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Landing page
│   ├── components/           # Reusable UI components
│   │   ├── ui/               # Base components (Button, Card, Input, etc.)
│   │   ├── chat/             # Chat-specific components
│   │   ├── matching/         # Match card, match reveal
│   │   └── events/           # Event card, event form
│   ├── lib/                  # Utilities & business logic
│   │   ├── supabase/         # Supabase client & helpers
│   │   ├── matching/         # Matching algorithm
│   │   └── utils.ts          # General utilities
│   ├── types/                # TypeScript type definitions
│   └── styles/               # Global styles & Tailwind config
├── supabase/
│   ├── migrations/           # Database schema migrations
│   └── seed.sql              # Seed data for development
├── public/                   # Static assets (images, icons)
├── CLAUDE.md                 # This file
├── STEPS.md                  # Development roadmap & progress
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

## Database Schema (Core Tables)

- `profiles` — user_id, role (mentor/student), name, bio, expertise/problem, avatar, availability, created_at
- `matches` — mentor_id, student_id, score, status (pending/accepted/declined), reasoning, created_at
- `messages` — sender_id, receiver_id, match_id, content, read_at, created_at
- `events` — creator_id, title, description, date, location, status (pending/approved/rejected), created_at
- `sessions` — match_id, scheduled_at, meeting_link, status, notes

## Conventions

- All code in TypeScript strict mode
- Components are functional with hooks
- File naming: kebab-case for files, PascalCase for components
- Commit messages: conventional commits (feat:, fix:, chore:, etc.)
- Environment variables in `.env.local` (never committed)
- All user-facing text should be in English (multi-language support is a future goal)

## Key Design Decisions

1. **Supabase over custom backend** — gives us auth, database, realtime subscriptions, and row-level security out of the box. Massive time savings for an MVP.
2. **Next.js App Router** — server components for fast page loads, API routes for backend logic, all in one project.
3. **Matching algorithm weights problem context > general expertise** — a student with a "tax law" problem should match with a tax specialist, not a general lawyer.
4. **Events require verification** — trusted organizations get "quick-approve" status; others go through admin review.
5. **Chat moderation is proactive** — Perspective API checks messages before they're sent, not after.

## EUDRES Context

This platform is part of the E³UDRES² European University Alliance. It was conceived during Business Booster Week (hosted by TalentFunnel.eu at UCLL) and is intended to serve student entrepreneurs and mentors across the alliance's partner universities. After the initial build, selected students may continue the project during a 2-week exchange at IPS (Setúbal, Portugal) working in real rural startup ecosystems.
=======
@AGENTS.md
>>>>>>> e46fa6f (Initial commit from Create Next App)
