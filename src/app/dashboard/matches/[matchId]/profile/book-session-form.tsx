"use client";

import { useState } from "react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useRouter } from "next/navigation";

type Props = {
  matchId: string;
  otherName: string;
};

export default function BookSessionForm({ matchId, otherName }: Props) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date || !time) {
      setError("Please select a date and time.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const scheduledAt = new Date(`${date}T${time}`).toISOString();

      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          match_id: matchId,
          scheduled_at: scheduledAt,
          meeting_link: meetingLink || null,
          notes: notes || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to book session");
      }

      setSuccess(true);
      setDate("");
      setTime("");
      setMeetingLink("");
      setNotes("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="text-3xl mb-2">✅</div>
        <p className="font-medium">Session booked with {otherName}!</p>
        <p className="text-sm text-muted-foreground mt-1">
          They&apos;ll see it on their end.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={() => setSuccess(false)}
        >
          Book another
        </Button>
      </div>
    );
  }

  // Minimum date is today
  const today = new Date().toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Date"
          type="date"
          min={today}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <Input
          label="Time"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
        />
      </div>

      <Input
        label="Meeting link (optional)"
        type="url"
        placeholder="https://meet.google.com/..."
        value={meetingLink}
        onChange={(e) => setMeetingLink(e.target.value)}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">
          Notes (optional)
        </label>
        <textarea
          className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
          rows={2}
          placeholder="What would you like to discuss?"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-error">{error}</p>}

      <Button type="submit" variant="gradient" disabled={loading} className="w-full">
        {loading ? "Booking..." : `Book Session with ${otherName}`}
      </Button>
    </form>
  );
}
