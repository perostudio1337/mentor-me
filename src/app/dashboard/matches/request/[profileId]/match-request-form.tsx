"use client";

// src/app/dashboard/matches/request/[profileId]/match-request-form.tsx

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/button";

interface Props {
  mentorProfileId: string; // profiles.id van de mentor
  mentorName: string;
  currentProfileId: string | null; // profiles.id van de student
  prefillMessage: string;
}

export default function MatchRequestForm({
  mentorProfileId,
  mentorName,
  currentProfileId,
  prefillMessage,
}: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [message, setMessage] = useState(prefillMessage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentProfileId) { setError("Please log in to send a request."); return; }
    if (!message.trim()) { setError("Please write a short message."); return; }

    setLoading(true);
    setError("");

    const { error: insertError } = await supabase.from("matches").insert({
      student_id: currentProfileId,  // profiles.id van student
      mentor_id: mentorProfileId,    // profiles.id van mentor
      score: 0,
      status: "pending",
      reasoning: message.trim(),
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    router.refresh();
  }

  if (success) {
    return (
      <div className="text-center py-6">
        <div className="text-4xl mb-3">🎯</div>
        <p className="font-semibold text-foreground">Request sent to {mentorName}!</p>
        <p className="text-sm text-muted-foreground mt-1">
          You&apos;ll be notified when they respond.
        </p>
        <button
          type="button"
          onClick={() => router.push("/dashboard/matches")}
          className="mt-4 text-sm text-primary font-medium hover:underline"
        >
          Back to Discover →
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">
          Your message to {mentorName}
          {prefillMessage && (
            <span className="ml-2 text-xs text-primary font-normal">
              (pre-filled from your request)
            </span>
          )}
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          placeholder="Introduce yourself and explain what you need help with..."
          className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none transition-colors"
        />
      </div>

      {error && <p className="text-sm text-error">{error}</p>}

      <Button
        type="submit"
        variant="gradient"
        disabled={loading || !message.trim()}
        className="w-full"
      >
        {loading ? "Sending…" : `Send request to ${mentorName}`}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        {mentorName} will accept or decline your request. Once accepted, you can schedule sessions together.
      </p>
    </form>
  );
}
