import { createClient } from "@/lib/supabase/server";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import SessionActions from "./session-actions";

export const dynamic = "force-dynamic";

type SessionRow = {
  id: string;
  scheduled_at: string;
  status: string;
  meeting_link: string | null;
  notes: string | null;
  created_by: string | null;
  matches: {
    id: string;
    mentor_id: string;
    student_id: string;
    mentor: { id: string; name: string }[];
    student: { id: string; name: string }[];
  }[];
};

export default async function SessionsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("user_id", user?.id ?? "")
    .single();

  const profileId = myProfile?.id ?? null;

  // Fetch all sessions for user's matches
  const { data: allMatches } = profileId
    ? await supabase
        .from("matches")
        .select("id")
        .or(`mentor_id.eq.${profileId},student_id.eq.${profileId}`)
        .eq("status", "accepted")
    : { data: [] };

  const matchIds = allMatches?.map((m) => m.id) || [];

  const { data: sessions } = matchIds.length > 0
    ? await supabase
        .from("sessions")
        .select(
          `
          *,
          matches!inner(
            id, mentor_id, student_id,
            mentor:profiles!matches_mentor_id_fkey(id, name),
            student:profiles!matches_student_id_fkey(id, name)
          )
        `
        )
        .in("match_id", matchIds)
        .order("scheduled_at", { ascending: true })
    : { data: [] as SessionRow[] };

  const now = new Date();

  const upcoming =
    sessions?.filter(
      (s) => s.status !== "cancelled" && new Date(s.scheduled_at) > now
    ) || [];

  const pendingRequests =
    sessions?.filter((s) => s.status === "pending") || [];

  const past =
    sessions?.filter(
      (s) => new Date(s.scheduled_at) <= now || s.status === "cancelled"
    ) || [];

  function getOtherName(session: SessionRow) {
    const match = Array.isArray(session.matches) ? session.matches[0] : session.matches;
    if (!match) return "Unknown";
    const mentor = Array.isArray(match.mentor) ? match.mentor[0] : match.mentor;
    const student = Array.isArray(match.student) ? match.student[0] : match.student;
    const iAmMentor = mentor?.id === profileId;
    return iAmMentor ? student?.name || "Student" : mentor?.name || "Mentor";
  }

  function getMatchId(session: SessionRow) {
    const match = Array.isArray(session.matches) ? session.matches[0] : session.matches;
    return match?.id;
  }

  const statusConfig: Record<string, { variant: "success" | "default" | "error"; label: string }> = {
    pending: { variant: "default", label: "Pending" },
    confirmed: { variant: "success", label: "Confirmed" },
    cancelled: { variant: "error", label: "Cancelled" },
    completed: { variant: "success", label: "Completed" },
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Sessions</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your mentorship sessions
          </p>
        </div>
      </div>

      {/* Pending requests that need action */}
      {pendingRequests.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Needs your attention</h2>
          <div className="space-y-3">
            {pendingRequests.map((session) => {
              const otherName = getOtherName(session);
              const matchId = getMatchId(session);
              const iCreatedThis = session.created_by === profileId;

              return (
                <Card key={session.id} className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-sm">
                        Session with {otherName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        📅{" "}
                        {new Date(session.scheduled_at).toLocaleString("en-GB", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {session.notes && (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          &quot;{session.notes}&quot;
                        </p>
                      )}
                    </div>
                    {iCreatedThis ? (
                      <span className="text-xs text-muted-foreground italic flex-shrink-0">
                        Waiting for response...
                      </span>
                    ) : (
                      <SessionActions sessionId={session.id} />
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming confirmed sessions */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Upcoming</h2>
        {upcoming.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-4xl mb-3">📅</div>
            <p className="text-muted-foreground text-sm mb-4">
              No upcoming sessions. Visit a match profile to book one.
            </p>
            <Link href="/dashboard/matches">
              <Button variant="gradient" size="sm">
                Go to Matches
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {upcoming.map((session) => {
              const otherName = getOtherName(session);
              const matchId = getMatchId(session);
              const config = statusConfig[session.status] || statusConfig.pending;

              return (
                <Card key={session.id} hover className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{otherName}</p>
                        <Badge variant={config.variant}>{config.label}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        📅{" "}
                        {new Date(session.scheduled_at).toLocaleString("en-GB", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {session.notes && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {session.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
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
                      {matchId && (
                        <Link href={`/dashboard/matches/${matchId}/profile`}>
                          <Button variant="outline" size="sm">
                            Profile
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Past sessions */}
      {past.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 text-muted-foreground">
            Past
          </h2>
          <div className="space-y-2">
            {past.map((session) => {
              const otherName = getOtherName(session);
              const config = statusConfig[session.status] || statusConfig.pending;

              return (
                <Card key={session.id} className="p-3 opacity-60">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm">{otherName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(session.scheduled_at)}
                      </p>
                    </div>
                    <Badge variant={config.variant}>{config.label}</Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
