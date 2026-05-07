import Link from "next/link";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import BookSessionForm from "./book-session-form";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ matchId: string }>;
};

export default async function MatchProfilePage({ params }: Props) {
  const { matchId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return <div className="p-6">Please log in.</div>;

  // fetch current user's profile
  const { data: myProfile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("user_id", user.id)
    .single();

  // fetch match with both profiles (full details)
  const { data: match } = await supabase
    .from("matches")
    .select(
      `
      id, status, score, reasoning, mentor_id, student_id, created_at,
      mentor:profiles!matches_mentor_id_fkey(
        id, name, avatar_url, bio, expertise, availability, email
      ),
      student:profiles!matches_student_id_fkey(
        id, name, avatar_url, bio, idea, problem, availability, email
      )
    `
    )
    .eq("id", matchId)
    .single();

  if (!match) return <div className="p-6">Match not found.</div>;

  // Determine which side I'm on (works for any role)
  const iAmMentor = match.mentor?.id === myProfile?.id;
  const other = iAmMentor ? match.student : match.mentor;
  const otherRole = iAmMentor ? "Student" : "Mentor";

  // Fetch existing sessions for this match
  const { data: sessions } = await supabase
    .from("sessions")
    .select("*")
    .eq("match_id", match.id)
    .order("scheduled_at", { ascending: true });

  const upcomingSessions =
    sessions?.filter(
      (s) =>
        s.status !== "cancelled" &&
        new Date(s.scheduled_at) > new Date()
    ) || [];

  const pastSessions =
    sessions?.filter(
      (s) =>
        s.status !== "cancelled" &&
        new Date(s.scheduled_at) <= new Date()
    ) || [];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        href="/dashboard/matches"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Back to matches
      </Link>

      {/* Profile header */}
      <Card className="text-center p-8">
        <div className="w-20 h-20 rounded-full bg-primary-light text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">
          {other?.name
            ? other.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)
            : "?"}
        </div>
        <h1 className="text-2xl font-bold">{other?.name || "Unknown"}</h1>
        <div className="flex items-center justify-center gap-2 mt-2">
          <Badge>{otherRole}</Badge>
          {match.status === "accepted" && (
            <Badge variant="success">Connected</Badge>
          )}
        </div>
        <p className="text-muted-foreground text-sm mt-3 max-w-md mx-auto">
          {other?.bio || "No bio yet"}
        </p>

        {other?.availability && (
          <p className="text-xs text-muted-foreground mt-2">
            Availability: {other.availability}
          </p>
        )}

        {match.status === "accepted" && (
          <div className="flex items-center justify-center gap-3 mt-5">
            <Link href={`/dashboard/chat?match=${match.id}`}>
              <Button variant="gradient">Open Chat</Button>
            </Link>
          </div>
        )}
      </Card>

      {/* Details */}
      <Card>
        <h2 className="text-lg font-semibold mb-3">About</h2>

        {other?.expertise && Array.isArray(other.expertise) && other.expertise.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">
              Expertise
            </p>
            <div className="flex flex-wrap gap-2">
              {other.expertise.map((e: string) => (
                <Badge key={e}>{e}</Badge>
              ))}
            </div>
          </div>
        )}

        {other?.idea && (
          <div className="mb-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Project / Idea
            </p>
            <p className="text-sm">{other.idea}</p>
          </div>
        )}

        {other?.problem && (
          <div className="mb-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Problem
            </p>
            <p className="text-sm">{other.problem}</p>
          </div>
        )}

        {match.reasoning && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Match Reasoning
            </p>
            <p className="text-sm text-muted-foreground italic">
              {match.reasoning}
            </p>
          </div>
        )}
      </Card>

      {/* Session scheduling — only for accepted matches */}
      {match.status === "accepted" && (
        <Card>
          <h2 className="text-lg font-semibold mb-4">Schedule a Session</h2>
          <BookSessionForm matchId={match.id} otherName={other?.name || "your match"} />
        </Card>
      )}

      {/* Upcoming sessions */}
      {upcomingSessions.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold mb-3">Upcoming Sessions</h2>
          <div className="space-y-3">
            {upcomingSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 rounded-xl glass"
              >
                <div>
                  <p className="text-sm font-medium">
                    📅 {formatDate(session.scheduled_at)}
                  </p>
                  {session.notes && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {session.notes}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      session.status === "confirmed" ? "success" : "default"
                    }
                  >
                    {session.status}
                  </Badge>
                  {session.meeting_link && (
                    <a
                      href={session.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="gradient" size="sm">
                        Join
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Past sessions */}
      {pastSessions.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold mb-3">Past Sessions</h2>
          <div className="space-y-2">
            {pastSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 rounded-xl glass opacity-70"
              >
                <p className="text-sm">📅 {formatDate(session.scheduled_at)}</p>
                <Badge variant={session.status === "completed" ? "success" : "default"}>
                  {session.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
