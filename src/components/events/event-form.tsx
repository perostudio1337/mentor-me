"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { EVENT_CATEGORIES, type EventCategory } from "@/types";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Card from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EventFormProps {
  profileId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EventForm({
  profileId,
  onSuccess,
  onCancel,
}: EventFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<EventCategory>("networking");
  const [date, setDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [link, setLink] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!title.trim() || !description.trim() || !date) {
      setError("Please fill in the title, description, and date.");
      setLoading(false);
      return;
    }

    if (description.trim().length < 10) {
      setError("Description must be at least 10 characters.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: insertError } = await supabase.from("events").insert({
      creator_id: profileId,
      title: title.trim(),
      description: description.trim(),
      category,
      date: new Date(date).toISOString(),
      end_date: endDate ? new Date(endDate).toISOString() : null,
      location: location.trim(),
      link: link.trim(),
      status: "pending",
    });

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      onSuccess?.();
    }, 1500);
  }

  if (success) {
    return (
      <Card className="p-8 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="text-xl font-bold mb-2">Event submitted!</h3>
        <p className="text-muted-foreground text-sm">
          Your event is pending review. It will appear on the board once
          approved.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 md:p-8">
      <h3 className="text-xl font-bold mb-1">Submit an Event</h3>
      <p className="text-muted-foreground text-sm mb-6">
        Share an event with the community. It will go live after a quick review.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Event Title"
          placeholder="e.g. Startup Pitch Night Leuven"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          required
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">
            Description
          </label>
          <textarea
            placeholder="What's the event about? Who should attend?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={2000}
            rows={4}
            required
            className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
          />
          <p className="text-xs text-muted-foreground text-right">
            {description.length}/2000 {description.trim().length < 10 && description.length > 0 && <span className="text-error">· min 10 chars</span>}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as EventCategory)}
            className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          >
            {EVENT_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Start Date & Time"
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <Input
            label="End Date & Time (optional)"
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <Input
          label="Location"
          placeholder="e.g. UCLL Campus Leuven, Room A301"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          maxLength={140}
        />

        <Input
          label="External Link (optional)"
          placeholder="https://eventbrite.com/..."
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          maxLength={500}
        />

        {error && (
          <p className="text-sm text-error bg-error/10 rounded-lg px-4 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="submit" variant="gradient" disabled={loading}>
            {loading ? "Submitting..." : "Submit for Review"}
          </Button>
          {onCancel && (
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
