import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get profile
    const { data: myProfile } = await supabase
      .from("profiles")
      .select("id, role, name")
      .eq("user_id", user.id)
      .single();

    if (!myProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const notifications: {
      id: string;
      type: "session_request" | "session_awaiting" | "session_confirmed" | "session_cancelled" | "match_pending" | "challenge_step" | "challenge_completed";
      title: string;
      message: string;
      timestamp: string;
      actionUrl?: string;
      sessionId?: string;
      matchId?: string;
    }[] = [];

    // 1. Pending match requests (matches where I haven't accepted yet)
    const { data: pendingMatches } = await supabase
      .from("matches")
      .select(
        `
        id, status, created_at,
        mentor:profiles!matches_mentor_id_fkey(id, name),
        student:profiles!matches_student_id_fkey(id, name)
      `
      )
      .or(`mentor_id.eq.${myProfile.id},student_id.eq.${myProfile.id}`)
      .eq("status", "pending");

    if (pendingMatches) {
      for (const m of pendingMatches) {
        const mentor = Array.isArray(m.mentor) ? m.mentor[0] : m.mentor;
        const student = Array.isArray(m.student) ? m.student[0] : m.student;
        const iAmMentor = mentor?.id === myProfile.id;
        const otherName = iAmMentor ? student?.name : mentor?.name;
        notifications.push({
          id: `match-${m.id}`,
          type: "match_pending",
          title: "New match suggestion",
          message: `You have a pending match with ${otherName || "someone"}`,
          timestamp: m.created_at,
          actionUrl: `/dashboard/matches/${m.id}/profile`,
          matchId: m.id,
        });
      }
    }

    // 2. Session requests (pending sessions for my matches)
    const { data: mySessions } = await supabase
      .from("sessions")
      .select(
        `
        id, status, scheduled_at, notes, created_at, created_by,
        matches!inner(
          id, mentor_id, student_id,
          mentor:profiles!matches_mentor_id_fkey(id, name),
          student:profiles!matches_student_id_fkey(id, name)
        )
      `
      )
      .or(
        `mentor_id.eq.${myProfile.id},student_id.eq.${myProfile.id}`,
        { referencedTable: "matches" }
      )
      .order("created_at", { ascending: false })
      .limit(20);

    if (mySessions) {
      for (const s of mySessions) {
        const match = Array.isArray(s.matches) ? s.matches[0] : s.matches;
        if (!match) continue;

        const mentor = Array.isArray(match.mentor) ? match.mentor[0] : match.mentor;
        const student = Array.isArray(match.student) ? match.student[0] : match.student;
        const iAmMentor = mentor?.id === myProfile.id;
        const otherName = iAmMentor
          ? student?.name
          : mentor?.name;

        if (s.status === "pending") {
          const iCreatedThis = s.created_by === myProfile.id;
          notifications.push({
            id: `session-${s.id}`,
            type: iCreatedThis ? "session_awaiting" : "session_request",
            title: iCreatedThis ? "Awaiting response" : "Session request",
            message: iCreatedThis
              ? `Waiting for ${otherName || "your match"} to respond to your session on ${new Date(s.scheduled_at).toLocaleDateString("en-GB", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`
              : `${otherName || "Someone"} wants to meet on ${new Date(s.scheduled_at).toLocaleDateString("en-GB", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}`,
            timestamp: s.created_at,
            actionUrl: `/dashboard/matches/${match.id}/profile`,
            sessionId: iCreatedThis ? undefined : s.id,
            matchId: match.id,
          });
        } else if (s.status === "confirmed") {
          // Only show recent confirmations (last 7 days)
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          if (new Date(s.created_at) > weekAgo) {
            notifications.push({
              id: `session-confirmed-${s.id}`,
              type: "session_confirmed",
              title: "Session confirmed",
              message: `Session with ${otherName || "your match"} on ${new Date(s.scheduled_at).toLocaleDateString("en-GB", { weekday: "short", month: "short", day: "numeric" })} is confirmed`,
              timestamp: s.created_at,
              actionUrl: `/dashboard/matches/${match.id}/profile`,
              matchId: match.id,
            });
          }
        } else if (s.status === "cancelled") {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          if (new Date(s.created_at) > weekAgo) {
            notifications.push({
              id: `session-cancelled-${s.id}`,
              type: "session_cancelled",
              title: "Session cancelled",
              message: `Session with ${otherName || "your match"} was cancelled`,
              timestamp: s.created_at,
              matchId: match.id,
            });
          }
        }
      }
    }

    // 3. Challenge progress notifications (only for mentors)
   if (myProfile.role === "mentor") {
      // Find all accepted matches where I am the mentor
      const { data: myMatches } = await supabase
        .from("matches")
        .select("id, student_id, student:profiles!matches_student_id_fkey(id, name)")
        .eq("mentor_id", myProfile.id)
        .eq("status", "accepted");

      if (myMatches) {
        for (const match of myMatches) {
          const student = Array.isArray(match.student) ? match.student[0] : match.student;

          // Fetch recent enrollment updates for this student (last 7 days)
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);

          const { data: enrollments } = await supabase
            .from("challenge_enrollments")
            .select("*, challenge:challenges(title, icon, total_steps)")
            .eq("profile_id", match.student_id)
            .gt("updated_at", weekAgo.toISOString())
            .order("updated_at", { ascending: false });

          if (enrollments) {
            for (const e of enrollments) {
              const challenge = Array.isArray(e.challenge) ? e.challenge[0] : e.challenge;
              if (!challenge) continue;

              if (e.completed_at && new Date(e.completed_at) > weekAgo) {
                // Challenge completed
                notifications.push({
                  id: `challenge-completed-${e.id}`,
                  type: "challenge_completed",
                  title: "Challenge completed! 🏆",
                  message: `${student?.name || "Your startup"} completed "${challenge.icon} ${challenge.title}"`,
                  timestamp: e.completed_at,
                  actionUrl: `/dashboard/matches/${match.id}/profile`,
                  matchId: match.id,
                });
              } else if (e.steps_done > 0) {
                // Step advanced
                notifications.push({
                  id: `challenge-step-${e.id}-${e.steps_done}`,
                  type: "challenge_step",
                  title: "Challenge progress",
                  message: `${student?.name || "Your startup"} is at step ${e.steps_done}/${challenge.total_steps} of "${challenge.icon} ${challenge.title}"`,
                  timestamp: e.updated_at,
                  actionUrl: `/dashboard/matches/${match.id}/profile`,
                  matchId: match.id,
                });
              }
            }
          }
        }
      }
    }

    // Sort by timestamp, newest first
    notifications.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({
      notifications,
      unreadCount: notifications.filter(
        (n) => n.type === "session_request" || n.type === "match_pending"
      ).length,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
