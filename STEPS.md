# Mentor.me — Development Steps

> This file tracks our step-by-step progress building the Mentor.me MVP.
> Status: [ ] = not started, [~] = in progress, [x] = done

---

## Phase 0: Project Setup
- [x] **Step 0.1** — Initialize Next.js project with TypeScript & Tailwind CSS
- [x] **Step 0.2** — Set up project structure (folders, config files)
- [x] **Step 0.3** — Set up Supabase project (database, auth, environment variables)
- [x] **Step 0.4** — Create base UI components (Button, Card, Input, Avatar, Badge)
- [x] **Step 0.5** — Build the landing page (hero, features, CTA)
- [x] **Step 0.6** — Redesign landing page to glassmorphism style

## Phase 1: Authentication & Profiles
- [x] **Step 1.1** — Registration flow (email + role selection)
- [x] **Step 1.2** — Login / logout with Supabase Auth
- [x] **Step 1.3** — Profile setup wizard (multi-step onboarding)
- [x] **Step 1.4** — `profiles` table with RLS + auto-create trigger
- [x] **Step 1.5** — Profile view and edit page
- [x] **Step 1.6** — Auth middleware (route protection, onboarding enforcement)
- [x] **Step 1.7** — Auth-aware landing page nav
- [x] **Step 1.8** — Onboarding redirect fix + dashboard skeleton

## Phase 2: Matching System
- [x] **Step 2.1** — Matching algorithm (problem-context > expertise weighting)
- [x] **Step 2.2** — `matches` table + RLS policies + indexes
- [x] **Step 2.3** — Match suggestions page (% score + reasoning)
- [x] **Step 2.4** — Accept / decline match flow
- [x] **Step 2.5** — Match Reveal screen (subtle animations)
- [x] **Step 2.6** — Manual match request flow (`/dashboard/matches/request/[profileId]`)

## Phase 3: Chat System
- [x] **Step 3.1** — `messages` table with RLS
- [x] **Step 3.2** — Chat interface (WhatsApp-style) at `/dashboard/chat`
- [x] **Step 3.3** — Supabase Realtime subscriptions for live messages
- [x] **Step 3.4** — Read receipts (`markAsRead`)
- [x] **Step 3.5** — Content moderation hook (`moderateMessage`) — Perspective API ready
- [x] **Step 3.6** — Site-wide AI chat widget (`ChatWidget` powered by Gemini)

## Phase 4: Events Board
- [x] **Step 4.1** — `events` table + `event_rsvps` table
- [x] **Step 4.2** — Event creation form (`event-form.tsx`)
- [x] **Step 4.3** — Events page with search, category and time filters
- [x] **Step 4.4** — External events feed (`/api/events/external` via SerpAPI)
- [x] **Step 4.5** — RSVP support
- [x] **Step 4.6** — Auto-publish community events (no admin moderation step)

## Phase 5: Session Scheduling
- [x] **Step 5.1** — `sessions` table
- [x] **Step 5.2** — Shared calendar view (`/dashboard/calendar`)
- [x] **Step 5.3** — Book-a-session flow (`book-session-form`)
- [x] **Step 5.4** — Sessions list with status pills (scheduled / completed / cancelled)
- [x] **Step 5.5** — Notification bell + `/api/notifications`
- [x] **Step 5.6** — Startup journey + challenge progress (milestones, goals, challenge enrolments)

## Phase 6: Milestone Feed & Journal
- [x] **Step 6.1** — Migration `013_milestone_posts.sql` (posts, likes, comments, storage bucket)
- [x] **Step 6.2** — `share-milestone-modal` component (text + image + attached challenge)
- [x] **Step 6.3** — Auto-open the modal on challenge completion (one-click "Mark complete")
- [x] **Step 6.4** — `/dashboard/feed` community feed with likes & comments
- [x] **Step 6.5** — Journal section on `/dashboard/profile/journey` listing the user's posts
- [x] **Step 6.6** — Feed + Challenges added to bottom nav
- [ ] **Step 6.7** — Run `013_milestone_posts.sql` in Supabase SQL Editor
- [ ] **Step 6.8** — Run `014_events_auto_approve.sql` in Supabase SQL Editor
- [ ] **Step 6.9** — Verify the `post-images` storage bucket exists and is public

## Phase 7: Polish & Launch Prep
- [x] **Step 7.1** — Replace transparent header/footer with solid `app-bar` for legibility
- [ ] **Step 7.2** — Responsive design pass (mobile, tablet, desktop)
- [ ] **Step 7.3** — Error handling and loading states throughout
- [ ] **Step 7.4** — GDPR compliance (privacy policy, data deletion, cookie consent)
- [ ] **Step 7.5** — Performance optimization (lazy loading, image optimization)
- [ ] **Step 7.6** — End-to-end testing of all core flows
- [ ] **Step 7.7** — Deploy to Vercel

---

## Progress Log

| Date       | Step | What was done |
|------------|------|---------------|
| 2026-05-06 | 0.1  | Initialized Next.js project with TypeScript, Tailwind, App Router |
| 2026-05-06 | 0.2  | Folder structure, types, Supabase clients, utils, design tokens; installed `@supabase/ssr` |
| 2026-05-06 | 0.3  | Supabase project created, `.env.local` configured |
| 2026-05-06 | 0.4  | Built base UI components: Button, Card, Input, Avatar, Badge |
| 2026-05-06 | 0.5  | Built landing page (hero, how-it-works, features, CTA, nav, footer) |
| 2026-05-06 | 0.6  | Glassmorphism redesign of landing page |
| 2026-05-06 | 1.1  | Registration page with role selection |
| 2026-05-06 | 1.2  | Login + logout |
| 2026-05-06 | 1.3  | Multi-step onboarding wizard |
| 2026-05-06 | 1.4  | `profiles` table, RLS, auto-create trigger |
| 2026-05-06 | 1.5  | Profile view & edit |
| 2026-05-06 | 1.6  | Auth middleware (route protection, onboarding gate) |
| 2026-05-06 | 1.7  | Landing nav adapts to auth state |
| 2026-05-06 | 1.8  | Onboarding hard redirect; dashboard matches page with welcome + stats |
| 2026-05-06 | 2.2  | `002_matches.sql` migration with RLS + indexes |
| 2026-05-07 | 2.x  | Matching algorithm + match request + accept/decline flow live |
| 2026-05-07 | 3.x  | Chat interface, Realtime, content-moderation hook, AI ChatWidget |
| 2026-05-07 | 4.x  | Events board (categories, RSVPs, external events, search/filter) |
| 2026-05-07 | 5.x  | Sessions, calendar, journey/journal, challenges (Phase 5.6) |
| 2026-05-08 | 6.1  | `013_milestone_posts.sql` — posts/likes/comments + storage bucket |
| 2026-05-08 | 6.2  | `ShareMilestoneModal` (text + image upload + challenge chip) |
| 2026-05-08 | 6.3  | Challenge "Mark complete" tick triggers the share modal |
| 2026-05-08 | 6.4  | `/dashboard/feed` community feed with likes + comments |
| 2026-05-08 | 6.5  | Journal entries on `/dashboard/profile/journey` |
| 2026-05-08 | 6.6  | Bottom nav widened to 6 items: Discover, Feed, Challenges, Chat, Events, Profile |
| 2026-05-08 | 4.6  | `014_events_auto_approve.sql` — community events go live immediately, no admin needed |
| 2026-05-08 | 7.1  | Header & bottom nav switched from `glass` to opaque `app-bar` for readability |
| 2026-05-08 | —    | Removed planned Admin Panel phase (out of MVP scope) |

---

## Known Issues / TODO

- [ ] Run `013_milestone_posts.sql` in Supabase SQL Editor (creates feed tables + storage bucket)
- [ ] Run `014_events_auto_approve.sql` in Supabase SQL Editor (publishes existing pending events)
- [ ] Disable "Confirm email" in Supabase Auth → Providers → Email
- [ ] If you see `getaddrinfo ENOTFOUND rgljnrypdolbwagrvlbc.supabase.co`, see [SUPABASE_DNS_FIX.md](SUPABASE_DNS_FIX.md)

---

## Notes

- The original Phase 6 was an Admin Panel. We dropped it: events now auto-publish, and content moderation is community-driven (Perspective API on chat, future "report" buttons on posts).
- Tech stack: Next.js 16 + TypeScript (strict) + Tailwind v4 + Supabase + Gemini API.
- Priority order follows the Canvas 3 "Must Have" requirements.
