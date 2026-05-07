"use client";

// src/components/matches/accept-decline-buttons.tsx
// Upgraded: Match Reveal animation on accept

import { useState } from "react";
import Button from "@/components/ui/button";
import { useRouter } from "next/navigation";

type Props = {
  matchId: string;
};

export function AcceptDeclineButtons({ matchId }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [revealed, setRevealed] = useState(false);

  async function updateStatus(status: "accepted" | "declined") {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/matches/${matchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error("Unable to update match status");

      if (status === "accepted") {
        // Show match reveal animation briefly, then refresh
        setRevealed(true);
        setTimeout(() => {
          router.refresh();
        }, 1800);
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  }

  if (revealed) {
    return (
      <div className="flex items-center gap-2 animate-pulse">
        <span className="text-lg">🎉</span>
        <span className="text-xs font-semibold text-gradient">It&apos;s a match!</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => updateStatus("declined")}
        disabled={isLoading}
        className="text-error border-error/30 hover:bg-error/5"
      >
        Decline
      </Button>
      <Button
        variant="gradient"
        size="sm"
        onClick={() => updateStatus("accepted")}
        disabled={isLoading}
      >
        {isLoading ? "…" : "Accept ✓"}
      </Button>
    </div>
  );
}
