import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import EventDetail from "./event-detail";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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

  // Fetch event with creator info
  const { data: event } = await supabase
    .from("events")
    .select("*, creator:profiles!creator_id(id, name, avatar_url, role)")
    .eq("id", id)
    .single();

  if (!event) notFound();

  // Only show approved events (or own events)
  if (event.status !== "approved" && event.creator_id !== profile.id) {
    notFound();
  }

  // Fetch RSVPs for this event
  const { data: rsvps } = await supabase
    .from("event_rsvps")
    .select("user_id, profiles:profiles!user_id(name, avatar_url)")
    .eq("event_id", id);

  const rsvpCount = rsvps?.length || 0;
  const userHasRsvpd = rsvps?.some((r) => r.user_id === profile.id) || false;

  return (
    <EventDetail
      event={{ ...event, rsvp_count: rsvpCount, user_has_rsvpd: userHasRsvpd }}
      profileId={profile.id}
      rsvpUsers={
        rsvps?.map((r) => {
          const p = r.profiles as unknown as { name: string; avatar_url: string | null } | null;
          return {
            name: p?.name || "User",
            avatar_url: p?.avatar_url || null,
          };
        }) || []
      }
    />
  );
}
