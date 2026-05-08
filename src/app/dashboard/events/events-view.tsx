"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { type MentorEvent, EVENT_CATEGORIES, type EventCategory } from "@/types";
import type { ExternalEvent } from "@/app/api/events/external/route";
import EventCard from "@/components/events/event-card";
import ExternalEventCard from "@/components/events/external-event-card";
import EventForm from "@/components/events/event-form";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import ScrollReveal from "@/components/ui/scroll-reveal";

interface EventsViewProps {
  events: MentorEvent[];
  profileId: string;
}

export default function EventsView({
  events,
  profileId,
}: EventsViewProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<EventCategory | "all">(
    "all"
  );
  const [timeFilter, setTimeFilter] = useState<"upcoming" | "past" | "all">(
    "upcoming"
  );
  const [externalEvents, setExternalEvents] = useState<ExternalEvent[]>([]);
  const [externalLoading, setExternalLoading] = useState(true);

  // Fetch external events on mount
  useEffect(() => {
    async function fetchExternal() {
      try {
        const res = await fetch("/api/events/external");
        const data = await res.json();
        setExternalEvents(data.events || []);
      } catch {
        // Silently fail — external events are optional
      } finally {
        setExternalLoading(false);
      }
    }
    fetchExternal();
  }, []);

  const now = new Date();

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const eventDate = new Date(e.date);
      if (timeFilter === "upcoming" && eventDate < now) return false;
      if (timeFilter === "past" && eventDate >= now) return false;
      if (categoryFilter !== "all" && e.category !== categoryFilter)
        return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches =
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [events, search, categoryFilter, timeFilter]);

  // Filter external events by search too
  const filteredExternal = useMemo(() => {
    if (categoryFilter !== "all") return []; // External events don't have our categories
    if (timeFilter === "past") return []; // External events are assumed upcoming
    if (!search.trim()) return externalEvents;
    const q = search.toLowerCase();
    return externalEvents.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q)
    );
  }, [externalEvents, search, categoryFilter, timeFilter]);

  const hasAnyResults = filtered.length > 0 || filteredExternal.length > 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Events</h1>
          <p className="text-muted-foreground text-sm">
            Discover workshops, pitch nights, and meetups near you.
          </p>
        </div>
        <Button variant="gradient" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Close" : "+ Post Event"}
        </Button>
      </div>

      {/* Submit form (collapsible) */}
      {showForm && (
        <div className="mb-8">
          <EventForm
            profileId={profileId}
            onSuccess={() => {
              setShowForm(false);
              router.refresh();
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
        />

        <select
          value={categoryFilter}
          onChange={(e) =>
            setCategoryFilter(e.target.value as EventCategory | "all")
          }
          className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
        >
          <option value="all">All categories</option>
          {EVENT_CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>

        <select
          value={timeFilter}
          onChange={(e) =>
            setTimeFilter(e.target.value as "upcoming" | "past" | "all")
          }
          className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
        >
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
          <option value="all">All time</option>
        </select>
      </div>

      {/* Community events */}
      {filtered.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Community Events</h2>
          <div className="grid gap-4">
            {filtered.map((event, i) => (
              <ScrollReveal key={event.id} delay={i * 60}>
                <EventCard event={event} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      )}

      {/* External events */}
      {filteredExternal.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-lg font-semibold">Discover Nearby</h2>
            <Badge>External</Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredExternal.map((event, i) => (
              <ScrollReveal key={event.id} delay={i * 60}>
                <ExternalEventCard event={event} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      )}

      {/* Loading state for external */}
      {externalLoading && filtered.length === 0 && (
        <Card className="p-6 text-center mb-6">
          <p className="text-muted-foreground text-sm">
            Loading events from around the web...
          </p>
        </Card>
      )}

      {/* Empty state */}
      {!hasAnyResults && !externalLoading && (
        <Card className="p-12 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold mb-2">No events found</h2>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            {search || categoryFilter !== "all"
              ? "Try adjusting your filters or search terms."
              : "Be the first to submit an event for the community!"}
          </p>
        </Card>
      )}
    </div>
  );
}
