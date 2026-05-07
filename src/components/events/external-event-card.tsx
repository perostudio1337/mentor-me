"use client";

import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import type { ExternalEvent } from "@/app/api/events/external/route";

interface ExternalEventCardProps {
  event: ExternalEvent;
}

export default function ExternalEventCard({ event }: ExternalEventCardProps) {
  return (
    <a
      href={event.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
      <Card hover className="h-full">
        {/* Thumbnail */}
        {event.thumbnail && (
          <div className="relative -mx-6 -mt-6 mb-4 rounded-t-2xl overflow-hidden">
            <img
              src={event.thumbnail}
              alt={event.title}
              className="w-full h-32 object-cover"
            />
          </div>
        )}

        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">🌐</span>
          <Badge>External</Badge>
        </div>

        <h3 className="font-semibold text-sm mb-1 line-clamp-2">
          {event.title}
        </h3>

        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
          {event.description}
        </p>

        <div className="space-y-0.5 text-xs text-muted-foreground">
          {event.date && <p>📅 {event.date}</p>}
          {event.location && <p className="truncate">📍 {event.location}</p>}
        </div>

        <p className="text-xs text-primary mt-2 font-medium">
          View event →
        </p>
      </Card>
    </a>
  );
}
