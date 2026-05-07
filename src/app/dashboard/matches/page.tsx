import { createClient } from "@/lib/supabase/server";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import Link from "next/link";
import { EVENT_CATEGORIES } from "@/types";
import { formatDate } from "@/lib/utils";

const categoryEmoji: Record<string, string> = {
  "pitch-night": "🎤",
  workshop: "🛠️",
  hackathon: "💻",
  networking: "🤝",
  bootcamp: "🏕️",
  meetup: "☕",
  conference: "🎪",
  lecture: "📚",
  "career-fair": "💼",
  webinar: "🖥️",
  "office-hours": "🕐",
  other: "📌",
};


export default async function MatchesPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user?.id ?? "")
    .single();

 const isStudent = profile?.role === "student";
let profileRowId: string | null = null;

  // Fetch next 3 upcoming approved events
  const { data: upcomingEvents } = await supabase
    .from("events")
    .select("id, title, category, date, location")
    .eq("status", "approved")
    .gte("date", new Date().toISOString())
    .order("date", { ascending: true })
    .limit(3);

  // Fetch matches for the current mentor or student profile ID
  const { data: matches } = profileRowId
    ? await supabase
        .from("matches")
        .select(`
          *,
          mentor:profiles!matches_mentor_id_fkey(
            id,
            name,
            avatar_url,
            bio,
            expertise,
            idea,
            problem
          ),
          student:profiles!matches_student_id_fkey(
            id,
            name,
            avatar_url,
            bio,
            expertise,
            idea,
            problem
          )
        `)
        .or(
          isStudent
            ? `student_id.eq.${profileRowId}`
            : `mentor_id.eq.${profileRowId}`
        )
        .order("score", { ascending: false })
    : { data: [] };

  const pendingMatches = matches?.filter((m) => m.status === "pending") || [];
  const acceptedMatches = matches?.filter((m) => m.status === "accepted") || [];

  return (
    <div>
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">
          Welcome{profile?.name ? `, ${profile.name.split(" ")[0]}` : ""}! 👋
        </h1>
        <p className="text-muted-foreground">
          {isStudent
            ? "Here are your mentor matches and suggestions."
            : "Here are students looking for your expertise."}
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-gradient">
            {pendingMatches.length}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Pending</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-gradient">
            {acceptedMatches.length}
          </p>
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

      {/* Matches lijst */}
      {matches && matches.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Matches</h2>
          {matches.map((match) => {
            const otherPerson = isStudent ? match.mentor : match.student;
            const fullName = otherPerson?.name ?? "Unknown";
            const bio = isStudent
              ? otherPerson?.bio ?? "No bio yet"
              : otherPerson?.idea ?? otherPerson?.bio ?? "No bio yet";
            const initials = fullName
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            const expertiseTags: string[] =
              isStudent && Array.isArray(match.mentor?.expertise)
                ? match.mentor.expertise.slice(0, 3)
                : [];

            return (
              <Card key={match.id} hover className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-14 h-14 rounded-full bg-primary-light text-white font-bold flex items-center justify-center text-lg flex-shrink-0">
                  {initials || "?"}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
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
                  {expertiseTags.length > 0 && (
                    <div className="flex gap-1 mt-1.5">
                      {expertiseTags.map((tag: string) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 rounded-full glass"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Score + actie */}
                <div className="text-right flex-shrink-0 flex flex-col items-end gap-2">
                  <div>
                    <div className="text-lg font-bold text-gradient">
                      {match.score}%
                    </div>
                    <p className="text-xs text-muted-foreground">match</p>
                  </div>
                  {match.status === "accepted" && (
                    <Link href={`/dashboard/chat?match=${match.id}`}>
                      <Button variant="gradient" size="sm">
                        Chat →
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Lege staat */
        <Card className="p-12 text-center">
          <div className="text-5xl mb-4">🎯</div>
          <h2 className="text-xl font-semibold mb-2">No matches yet</h2>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
            {isStudent
              ? "We're looking for the best mentors for your situation. Make sure your profile is complete to get better matches."
              : "Students will appear here once they match with your expertise. Make sure your profile is up to date."}
          </p>
          <Link href="/dashboard/profile">
            <Button variant="gradient">Complete Your Profile</Button>
          </Link>
        </Card>
      )}

      {/* Upcoming Events */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Upcoming Events</h2>
          <Link
            href="/dashboard/events"
            className="text-sm font-medium text-primary hover:underline"
          >
            View all →
          </Link>
        </div>

        {upcomingEvents && upcomingEvents.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-3">
            {upcomingEvents.map((event) => {
              const emoji = categoryEmoji[event.category] || "📌";
              const catLabel =
                EVENT_CATEGORIES.find((c) => c.value === event.category)
                  ?.label || event.category;
              return (
                <Link key={event.id} href={`/dashboard/events/${event.id}`}>
                  <Card hover className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xl">{emoji}</span>
                      <span className="text-xs font-medium text-primary">
                        {catLabel}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm truncate mb-1">
                      {event.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      📅 {formatDate(event.date)}
                    </p>
                    {event.location && (
                      <p className="text-xs text-muted-foreground truncate">
                        📍 {event.location}
                      </p>
                    )}
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground text-sm">
              No upcoming events yet.{" "}
              <Link
                href="/dashboard/events"
                className="text-primary hover:underline"
              >
                Submit one
              </Link>{" "}
              for the community!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}