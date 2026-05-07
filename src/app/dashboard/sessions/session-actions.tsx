"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SessionActions({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleAction(status: "confirmed" | "cancelled") {
    setLoading(status);
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch {
      // silently fail
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex gap-2 flex-shrink-0">
      <button
        onClick={() => handleAction("confirmed")}
        disabled={loading !== null}
        className="px-4 py-1.5 text-xs font-semibold rounded-full btn-gradient text-white disabled:opacity-50"
      >
        {loading === "confirmed" ? "..." : "Accept"}
      </button>
      <button
        onClick={() => handleAction("cancelled")}
        disabled={loading !== null}
        className="px-4 py-1.5 text-xs font-semibold rounded-full border-2 border-red-400 text-red-500 hover:bg-red-50 disabled:opacity-50"
      >
        {loading === "cancelled" ? "..." : "Decline"}
      </button>
    </div>
  );
}
