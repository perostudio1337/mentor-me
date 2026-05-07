"use client"

import Button from "@/components/ui/button";
import { useState } from "react";

type AcceptDeclineButtonsProps = {
  matchId: string;
};

export function AcceptDeclineButtons({ matchId }: AcceptDeclineButtonsProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function updateStatus(status: "accepted" | "declined") {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/matches/${matchId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Unable to update match status");
      }

      window.location.reload();
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => updateStatus("declined")}
        disabled={isLoading}
      >
        ✕
      </Button>
      <Button
        variant="gradient"
        size="sm"
        onClick={() => updateStatus("accepted")}
        disabled={isLoading}
      >
        Accept
      </Button>
    </>
  );
}
