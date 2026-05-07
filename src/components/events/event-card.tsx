"use client";

import Link from "next/link";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import { type MentorEvent, EVENT_CATEGORIES } from "@/types";
import { formatDate } from "@/lib/utils";

interface EventCardProps {
  event: MentorEvent;
}

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

export default function EventCard({ event }: EventCardProps) {
  const categoryLabel =
    EVENT_CATEGORIES.find((c) => c.value === event.category)?.label ||
    event.category;
  const emoji = categoryEmoji[event.category] || "📌";

  const eventDate = new Date(event.date);
  const isPast = eventDate < new Date();

  return (
    <Link href={`/dashboard/events/${event.id}`}>
      <Card hover className={`transition-all ${isPast ? "opacity-60" : ""}`}>
        <div className="flex gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">{emoji}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-base font-semibold truncate">{event.title}</h3>
              <Badge className="flex-shrink-0 text-xs">
                {categoryLabel}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {event.description}
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>📅 {formatDate(event.date)}</span>
              {event.location && <span>📍 {event.location}</span>}
              {typeof event.rsvp_count === "number" && (
                <span>👥 {event.rsvp_count} interested</span>
              )}
              {isPast && <span className="text-warning font-medium">Past event</span>}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
