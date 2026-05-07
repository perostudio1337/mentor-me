// ============================================================
// MENTOR ME — Matches Page  (updated)
// src/app/dashboard/matches/page.tsx
//
// Wijzigingen t.o.v. origineel:
//  1. Import getAvailableMentors + RequestMentorButton
//  2. Laad mentors server-side
//  3. Voeg "Request a mentor" knop toe naast de header
//  Alle bestaande logica is ONGEWIJZIGD.
// ============================================================

import { createClient } from "@/lib/supabase/server";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
// ★ NEW imports
import { getAvailableMentors } from "@/lib/matching/matcher-server";
import RequestMentorButton from "@/components/discovery/request-mentor-button";
import { AcceptDeclineButtons } from "@/components/matches/accept-decline-buttons";

export const dynamic = "force-dynamic";

export default async function MatchesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user?.id ?? "")
    .single();

  const isStudent = profile?.role === "student";
  const profileId = profile?.id ?? null;

  // Fetch next 3 upcoming approved events (unchanged)
  const { data: upcomingEvents } = await supabase
    .from("events")
    .select("id, title, category, date, location")
    .eq("status", "approved")
    .gte("date", new Date().toISOString())
    .order("date", { ascending: true })
    .limit(3);

  // Fetch matches (unchanged)
  const { data: matches } = profileId
    ? await supabase
        .from("matches")
        .select(
          `
          *,
          mentor:profiles!matches_mentor_id_fkey(
            id, name, avatar_url, bio, expertise
          ),
          student:profiles!matches_student_id_fkey(
            id, name, avatar_url, bio, idea, problem
          )
        `
        )
        .or(`student_id.eq.${profileId},mentor_id.eq.${profileId}`)
        .order("score", { ascending: false })
    : { data: [] };

  // ★ NEW: load mentors for the Request Modal (only for students)
  const availableMentors = isStudent ? await getAvailableMentors() : [];

  const pendingMatches = matches?.filter((m) => m.status === "pending") || [];
  const acceptedMatches = matches?.filter((m) => m.status === "accepted") || [];

  return (
    <div>
      {/* Welcome header — ★ UPDATED: added Request a Mentor button */}
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold mb-1">
            Welcome{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}! 👋
          </h1>
          <p className="text-muted-foreground">
            {isStudent
              ? "Here are your mentor matches and suggestions."
              : "Here are students looking for your expertise."}
          </p>
        </div>

        {/* ★ NEW: Only show for students */}
        {isStudent && (
          <RequestMentorButton
            mentors={availableMentors}
            existingMatches={(matches || []).map((m) => ({
              mentor_id: m.mentor_id,
              match_id: m.id,
              status: m.status,
            }))}
          />
        )}
      </div>

      {/* Quick stats (unchanged) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-gradient">{pendingMatches.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Pending</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-gradient">{acceptedMatches.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Active</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-gradient">0</p>
          <p className="text-xs text-muted-foreground mt-1">Sessions</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-gradient">0</p>
          <p className="text-xs text-muted-foreground mt-1">Messages</p>
        </Card>
      </div>

      {/* Matches list (unchanged) */}
      {matches && matches.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            {isStudent ? "Your Matches" : "Students Matched With You"}
          </h2>
          {matches.map((match) => {
            const iAmMentor = match.mentor?.id === profileId;
            const otherPerson = iAmMentor ? match.student : match.mentor;
            const fullName = otherPerson?.name ?? "Unknown";
            const bio = iAmMentor
              ? otherPerson?.idea ?? otherPerson?.bio ?? "No bio yet"
              : otherPerson?.bio ?? "No bio yet";

            const initials = fullName
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            const expertiseTags: string[] =
              !iAmMentor && Array.isArray(match.mentor?.expertise)
                ? match.mentor.expertise.slice(0, 3)
                : [];

            const studentProblem =
              iAmMentor && match.student?.problem ? match.student.problem : null;

            return (
              <Card key={match.id} hover className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary-light text-white font-bold flex items-center justify-center text-lg flex-shrink-0">
                  {initials || "?"}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold truncate">{fullName}</h3>
                    <Badge
                      variant={
                        match.status === "accepted"
                          ? "success"
                          : match.status === "declined"
                          ? "error"
                          : "default"
                      }
                    >
                      {match.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{bio}</p>

                  {studentProblem && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      <span className="font-medium">Problem: </span>
                      {studentProblem}
                    </p>
                  )}

                  {/* Reasoning — shown to both sides */}
                  {match.reasoning && (
                    <p className="text-xs text-primary mt-1.5 italic truncate">
                      💬 {match.reasoning}
                    </p>
                  )}

                  {expertiseTags.length > 0 && (
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {expertiseTags.map((tag: string) => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full glass">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="text-right flex-shrink-0 flex flex-col items-end gap-2">
                  
                    <div>
                      <div className="text-lg font-bold text-gradient">
                          {match.score > 0 ? `${match.score}%` : "New"}
                      </div>
                     <p className="text-xs text-muted-foreground">match</p>
                    </div>
                  
                  {/* Pending: mentor sees Accept/Decline, student sees "Waiting" */}
                  {match.status === "pending" && (
                    iAmMentor ? (
                      <AcceptDeclineButtons matchId={match.id} />
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Waiting for response…</span>
                    )
                  )}
                  {match.status === "accepted" && (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Link href={`/dashboard/chat?match=${match.id}`}>
                        <Button variant="gradient" size="sm">Chat →</Button>
                      </Link>
                      <Link href={`/dashboard/matches/${match.id}/profile`}>
                        <Button variant="outline" size="sm">View Profile</Button>
                      </Link>
                    </div>
                  )}
                  {match.status === "declined" && (
                    <span className="text-xs text-error">Declined</span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="text-5xl mb-4">🎯</div>
          <h2 className="text-xl font-semibold mb-2">No matches yet</h2>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
            {isStudent
              ? "Complete your profile to get matched with the right mentors."
              : "Make sure your profile is complete so students can find you."}
          </p>
          {isStudent && (
          <RequestMentorButton
            mentors={availableMentors}
            existingMatches={(matches || []).map((m) => ({
              mentor_id: m.mentor_id,
              match_id: m.id,
              status: m.status,
            }))}
          />
        )}
        </Card>
      )}

      {/* Upcoming events (unchanged) */}
      {upcomingEvents && upcomingEvents.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Upcoming Events</h2>
            <Link href="/dashboard/events">
              <Button variant="ghost" size="sm">See all →</Button>
            </Link>
          </div>
          <div className="grid gap-3">
            {upcomingEvents.map((event) => (
              <Card key={event.id} hover className="flex items-center gap-4 p-4">
                <div className="text-2xl">
                  {event.category === "workshop" ? "🛠️" :
                   event.category === "networking" ? "🤝" :
                   event.category === "hackathon" ? "💻" : "📅"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(event.date)} · {event.location}
                  </p>
                </div>
                <Link href="/dashboard/events">
                  <Button variant="outline" size="sm">View</Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
