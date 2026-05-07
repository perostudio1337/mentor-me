"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { type MentorEvent, EVENT_CATEGORIES } from "@/types";
import { formatDate } from "@/lib/utils";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import Avatar from "@/components/ui/avatar";

interface EventDetailProps {
  event: MentorEvent;
  profileId: string;
  rsvpUsers: { name: string; avatar_url: string | null }[];
}

export default function EventDetail({
  event,
  profileId,
  rsvpUsers,
}: EventDetailProps) {
  const router = useRouter();
  const [rsvpd, setRsvpd] = useState(event.user_has_rsvpd || false);
  const [rsvpCount, setRsvpCount] = useState(event.rsvp_count || 0);
  const [loading, setLoading] = useState(false);

  const categoryLabel =
    EVENT_CATEGORIES.find((c) => c.value === event.category)?.label ||
    event.category;

  const eventDate = new Date(event.date);
  const isPast = eventDate < new Date();

  async function toggleRsvp() {
    setLoading(true);
    const supabase = createClient();

    if (rsvpd) {
      await supabase
        .from("event_rsvps")
        .delete()
        .eq("event_id", event.id)
        .eq("user_id", profileId);
      setRsvpd(false);
      setRsvpCount((c) => Math.max(0, c - 1));
    } else {
      await supabase.from("event_rsvps").insert({
        event_id: event.id,
        user_id: profileId,
      });
      setRsvpd(true);
      setRsvpCount((c) => c + 1);
    }

    setLoading(false);
    router.refresh();
  }

  return (
    <div>
      {/* Back link */}
      <Link
        href="/dashboard/events"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        ← Back to events
      </Link>

      <Card className="p-6 md:p-8">
        {/* Status badge for own pending events */}
        {event.status === "pending" && (
          <Badge variant="warning" className="mb-4">
            Pending review
          </Badge>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div>
            <Badge className="mb-2">{categoryLabel}</Badge>
            <h1 className="text-2xl md:text-3xl font-bold">{event.title}</h1>
          </div>

          {!isPast && event.status === "approved" && (
            <Button
              variant={rsvpd ? "primary" : "gradient"}
              onClick={toggleRsvp}
              disabled={loading}
              className="flex-shrink-0"
            >
              {rsvpd ? "✓ Interested" : "I'm Interested"}
            </Button>
          )}

          {isPast && (
            <Badge variant="warning" className="flex-shrink-0">
              Past event
            </Badge>
          )}
        </div>

        {/* Details grid */}
        <div className="grid gap-4 sm:grid-cols-2 mb-6">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-xl">📅</span>
            <div>
              <p className="font-medium">
                {eventDate.toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <p className="text-muted-foreground">
                {eventDate.toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {event.end_date &&
                  ` – ${new Date(event.end_date).toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`}
              </p>
            </div>
          </div>

          {event.location && (
            <div className="flex items-center gap-3 text-sm">
              <span className="text-xl">📍</span>
              <p className="font-medium">{event.location}</p>
            </div>
          )}

          <div className="flex items-center gap-3 text-sm">
            <span className="text-xl">👥</span>
            <p className="font-medium">
              {rsvpCount} {rsvpCount === 1 ? "person" : "people"} interested
            </p>
          </div>

          {event.link && (
            <div className="flex items-center gap-3 text-sm">
              <span className="text-xl">🔗</span>
              <a
                href={event.link}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline truncate"
              >
                External link →
              </a>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            About this event
          </h2>
          <p className="text-foreground whitespace-pre-wrap leading-relaxed">
            {event.description}
          </p>
        </div>

        {/* Creator info */}
        {event.creator && (
          <div className="flex items-center gap-3 mb-8 pt-4 border-t border-border">
            <Avatar
              name={event.creator.name}
              src={event.creator.avatar_url || undefined}
              size="sm"
            />
            <div className="text-sm">
              <p className="font-medium">Posted by {event.creator.name}</p>
              <p className="text-muted-foreground">
                {formatDate(event.created_at)}
              </p>
            </div>
          </div>
        )}

        {/* Interested users */}
        {rsvpUsers.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              People interested
            </h2>
            <div className="flex flex-wrap gap-2">
              {rsvpUsers.map((u, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-muted rounded-full px-3 py-1.5 text-sm"
                >
                  <Avatar
                    name={u.name}
                    src={u.avatar_url || undefined}
                    size="sm"
                  />
                  <span>{u.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
