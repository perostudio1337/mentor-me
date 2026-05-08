"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type Notification = {
  id: string;
  type: "session_request" | "session_awaiting" | "session_confirmed" | "session_cancelled" | "match_pending" | "challenge_completed" | "challenge_step" ;
  title: string;
  message: string;
  timestamp: string;
  actionUrl?: string;
  sessionId?: string;
  matchId?: string;
};

const typeConfig = {
  session_request: { icon: "📩", color: "text-primary" },
  session_awaiting: { icon: "⏳", color: "text-amber-500" },
  session_confirmed: { icon: "✅", color: "text-green-600" },
  session_cancelled: { icon: "❌", color: "text-red-500" },
  match_pending: { icon: "🎯", color: "text-primary" },
  challenge_step: { icon: "📈", color: "text-emerald-600" },
  challenge_completed: { icon: "🏆", color: "text-emerald-600" },
};

export default function NotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // silently fail
    }
  }

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function handleSessionAction(sessionId: string, status: "confirmed" | "cancelled") {
    setActionLoading(sessionId);
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        await fetchNotifications();
        router.refresh();
      }
    } catch {
      // silently fail
    } finally {
      setActionLoading(null);
    }
  }

  function timeAgo(timestamp: string) {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
        aria-label="Notifications"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-foreground"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-12 w-80 sm:w-96 max-h-[28rem] overflow-y-auto rounded-2xl glass border border-white/20 shadow-xl z-50">
          <div className="p-4 border-b border-white/10">
            <h3 className="font-semibold text-sm">Notifications</h3>
          </div>

          {notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {notifications.map((n) => {
                const config = typeConfig[n.type];
                const isSessionRequest = n.type === "session_request" && n.sessionId;

                return (
                  <div
                    key={n.id}
                    className={cn(
                      "p-4 hover:bg-white/10 transition-colors",
                      (n.type === "session_request" || n.type === "match_pending") &&
                        "bg-primary/5"
                    )}
                  >
                    <div
                      className={cn(
                        "flex gap-3",
                        n.actionUrl && !isSessionRequest && "cursor-pointer"
                      )}
                      onClick={() => {
                        if (n.actionUrl && !isSessionRequest) {
                          router.push(n.actionUrl);
                          setOpen(false);
                        }
                      }}
                    >
                      <span className="text-lg flex-shrink-0 mt-0.5">
                        {config.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-medium", config.color)}>
                          {n.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {n.message}
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                          {timeAgo(n.timestamp)}
                        </p>
                      </div>
                    </div>

                    {/* Accept / Decline buttons for session requests */}
                    {isSessionRequest && (
                      <div className="flex gap-2 mt-3 ml-8">
                        <button
                          onClick={() =>
                            handleSessionAction(n.sessionId!, "confirmed")
                          }
                          disabled={actionLoading === n.sessionId}
                          className="flex-1 px-3 py-1.5 text-xs font-semibold rounded-full btn-gradient text-white disabled:opacity-50"
                        >
                          {actionLoading === n.sessionId
                            ? "..."
                            : "Accept"}
                        </button>
                        <button
                          onClick={() =>
                            handleSessionAction(n.sessionId!, "cancelled")
                          }
                          disabled={actionLoading === n.sessionId}
                          className="flex-1 px-3 py-1.5 text-xs font-semibold rounded-full border-2 border-red-400 text-red-500 hover:bg-red-50 disabled:opacity-50"
                        >
                          Decline
                        </button>
                      </div>
                    )}

                    {/* View link for match suggestions */}
                    {n.type === "match_pending" && n.actionUrl && (
                      <div className="mt-3 ml-8">
                        <button
                          onClick={() => {
                            router.push(n.actionUrl!);
                            setOpen(false);
                          }}
                          className="px-3 py-1.5 text-xs font-semibold rounded-full btn-gradient text-white"
                        >
                          View Match
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
