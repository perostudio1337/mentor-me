# Mentor.me — Development Steps

> This file tracks our step-by-step progress building the Mentor.me MVP.
> Each step will be reviewed before moving to the next.
> Status: [ ] = not started, [~] = in progress, [x] = done

---

## Phase 0: Project Setup
- [x] **Step 0.1** — Initialize Next.js project with TypeScript & Tailwind CSS
- [x] **Step 0.2** — Set up project structure (folders, config files)
- [x] **Step 0.3** — Set up Supabase project (database, auth, environment variables)
- [x] **Step 0.4** — Create base UI components (Button, Card, Input, Avatar, Badge)
- [x] **Step 0.5** — Build the landing page (hero, features, CTA)
- [x] **Step 0.6** — Redesign landing page to glassmorphism style (matching uploaded designs)

## Phase 1: Authentication & Profiles
- [x] **Step 1.1** — Implement registration flow (email + role selection: mentor or student)
- [x] **Step 1.2** — Implement login / logout with Supabase Auth
- [x] **Step 1.3** — Build profile setup wizard (multi-step onboarding)
- [x] **Step 1.4** — Create database tables: `profiles` (SQL run in Supabase)
- [x] **Step 1.5** — Profile view and edit page
- [x] **Step 1.6** — Auth middleware (route protection, onboarding enforcement)
- [x] **Step 1.7** — Auth-aware landing page nav (shows account when logged in)
- [x] **Step 1.8** — Admin role added to profiles (role constraint updated)
- [~] **Step 1.9** — Fix onboarding save redirect & rename (dashboard) folder *(in progress)*

## Phase 2: Matching System
- [ ] **Step 2.1** — Design the matching algorithm (weighted scoring: problem context > expertise)
- [x] **Step 2.2** — Create database tables: `matches` (SQL ready, needs to be run)
- [ ] **Step 2.3** — Build match suggestions page (list of matches with % score and reasoning)
- [ ] **Step 2.4** — Accept / decline match flow
- [ ] **Step 2.5** — "Match Reveal" UI with playful animations

## Phase 3: Chat System
- [ ] **Step 3.1** — Create database tables: `messages`
- [ ] **Step 3.2** — Build real-time chat interface (WhatsApp-style)
- [ ] **Step 3.3** — Supabase Realtime subscriptions for live message delivery
- [ ] **Step 3.4** — Read receipts and online status indicators
- [ ] **Step 3.5** — Content moderation (Perspective API integration)

## Phase 4: Events Board
- [ ] **Step 4.1** — Create database tables: `events`
- [ ] **Step 4.2** — Event creation form (title, description, date, location)
- [ ] **Step 4.3** — Event listing page with search/filter
- [ ] **Step 4.4** — Admin verification workflow (pending → approved / rejected)

## Phase 5: Session Scheduling
- [ ] **Step 5.1** — Create database tables: `sessions`
- [ ] **Step 5.2** — Shared calendar view between matched mentor & student
- [ ] **Step 5.3** — Book a session flow (date/time picker, confirmation)
- [ ] **Step 5.4** — Email/notification reminders for upcoming sessions

## Phase 6: Admin Panel
- [ ] **Step 6.1** — Admin dashboard (overview of users, matches, events)
- [ ] **Step 6.2** — User management (view, deactivate accounts)
- [ ] **Step 6.3** — Event approval queue
- [ ] **Step 6.4** — Match oversight and intervention tools

## Phase 7: Polish & Launch Prep
- [ ] **Step 7.1** — Responsive design pass (mobile, tablet, desktop)
- [ ] **Step 7.2** — Error handling and loading states throughout
- [ ] **Step 7.3** — GDPR compliance (privacy policy, data deletion, cookie consent)
- [ ] **Step 7.4** — Performance optimization (lazy loading, image optimization)
- [ ] **Step 7.5** — End-to-end testing of all core flows
- [ ] **Step 7.6** — Deploy to Vercel

---

## Progress Log

| Date | Step | What was done |
|------|------|---------------|
| 2026-05-06 | 0.1 | Initialized Next.js project with TypeScript, Tailwind, App Router |
| 2026-05-06 | 0.2 | Created folder structure, types, Supabase clients, utils, design tokens, installed @supabase/ssr |
| 2026-05-06 | 0.3 | Supabase project created, .env.local configured with project URL and anon key |
| 2026-05-06 | 0.4 | Built base UI components: Button, Card, Input, Avatar, Badge |
| 2026-05-06 | 0.5 | Built landing page with hero, how-it-works, features, CTA, nav & footer |
| 2026-05-06 | 0.6 | Redesigned landing page to glassmorphism style matching uploaded designs |
| 2026-05-06 | 1.1 | Registration page with role selection (mentor/student), email & password |
| 2026-05-06 | 1.2 | Login page, logout functionality |
| 2026-05-06 | 1.3 | Multi-step onboarding wizard (name, bio, expertise, idea/problem, availability) |
| 2026-05-06 | 1.4 | Profiles table created in Supabase with RLS policies & auto-create trigger |
| 2026-05-06 | 1.5 | Profile view & edit page with all fields editable |
| 2026-05-06 | 1.6 | Auth middleware: protects /dashboard/*, redirects logged-in users from /login, enforces onboarding |
| 2026-05-06 | 1.7 | Landing page nav now shows "My Dashboard" + "Sign out" when logged in |
| 2026-05-06 | 1.8 | Admin role added to profiles table constraint, Robert set as admin |
| 2026-05-06 | 1.9 | Fixed onboarding save (hard redirect), dashboard matches page with welcome + stats |
| 2026-05-06 | 2.2 | 002_matches.sql migration created with RLS policies and indexes |

---

## Known Issues / TODO

- [ ] Rename `(dashboard)` folder to `dashboard` in VS Code (remove parentheses)
- [ ] Run `002_matches.sql` in Supabase SQL Editor
- [ ] Disable "Confirm email" in Supabase Auth → Providers → Email

---

## Notes

- We build one step at a time. Each step gets reviewed before we proceed.
- The STEPS.md file will be updated as we go — steps may be added, split, or reordered.
- Tech stack: Next.js + TypeScript + Tailwind CSS + Supabase
- Priority order follows the Canvas 3 "Must Have" requirements.
- Robert's account (r.pervushen@gmail.com) is set as admin role.
