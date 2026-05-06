import { createClient } from "@/lib/supabase/server";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Link from "next/link";
import Button from "@/components/ui/button";

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

  // Get pending matches for this user
  const profileId = profile?.id;
  const isStudent = profile?.role === "student";

  const { data: matches } = profileId
    ? await supabase
        .from("matches")
        .select("*, mentor:mentor_id(*), student:student_id(*)")
        .or(`mentor_id.eq.${profileId},student_id.eq.${profileId}`)
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

      {/* Matches list */}
      {matches && matches.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Matches</h2>
          {matches.map((match) => {
            const otherPerson = isStudent ? match.mentor : match.student;
            return (
              <Card key={match.id} hover className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary-light text-white font-bold flex items-center justify-center text-lg flex-shrink-0">
                  {otherPerson?.name
                    ? otherPerson.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    : "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">
                      {otherPerson?.name || "Unknown"}
                    </h3>
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
                  <p className="text-sm text-muted-foreground truncate">
                    {otherPerson?.bio || "No bio yet"}
                  </p>
                  {otherPerson?.expertise?.length > 0 && (
                    <div className="flex gap-1 mt-1.5">
                      {otherPerson.expertise.slice(0, 3).map((e: string) => (
                        <span
                          key={e}
                          className="text-xs px-2 py-0.5 rounded-full glass"
                        >
                          {e}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-lg font-bold text-gradient">
                    {match.score}%
                  </div>
                  <p className="text-xs text-muted-foreground">match</p>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Empty state */
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
    </div>
  );
}
