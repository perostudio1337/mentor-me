import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import EventsView from "./events-view";

export default async function EventsPage() {
  const supabase = await createClient();

  // Get current user + profile
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) redirect("/onboarding");

  // Fetch approved events (upcoming first)
  const { data: events } = await supabase
    .from("events")
    .select("*, creator:profiles!creator_id(id, name, avatar_url, role)")
    .eq("status", "approved")
    .order("date", { ascending: true });

  // Fetch RSVP counts per event
  const eventIds = (events || []).map((e) => e.id);
  let rsvpCounts: Record<string, number> = {};
  let userRsvps: Set<string> = new Set();

  if (eventIds.length > 0) {
    const { data: rsvps } = await supabase
      .from("event_rsvps")
      .select("event_id, user_id")
      .in("event_id", eventIds);

    if (rsvps) {
      for (const r of rsvps) {
        rsvpCounts[r.event_id] = (rsvpCounts[r.event_id] || 0) + 1;
        if (r.user_id === profile.id) {
          userRsvps.add(r.event_id);
        }
      }
    }
  }

  // Merge RSVP data into events
  const enrichedEvents = (events || []).map((e) => ({
    ...e,
    rsvp_count: rsvpCounts[e.id] || 0,
    user_has_rsvpd: userRsvps.has(e.id),
  }));

  // Also fetch user's own pending events
  const { data: myPending } = await supabase
    .from("events")
    .select("*")
    .eq("creator_id", profile.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  return (
    <EventsView
      events={enrichedEvents}
      myPendingEvents={myPending || []}
      profileId={profile.id}
    />
  );
}
