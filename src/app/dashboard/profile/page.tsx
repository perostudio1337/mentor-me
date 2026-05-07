"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import type { Profile } from "@/types";

interface SessionWithMatch {
  id: string;
  scheduled_at: string;
  status: string;
  meeting_link: string | null;
  notes: string | null;
  match: {
    id: string;
    mentor: { name: string };
    student: { name: string };
    mentor_id: string;
    student_id: string;
  };
}

const EXPERTISE_OPTIONS = [
  "Marketing",
  "Finance",
  "Legal",
  "Technology",
  "Design",
  "Sales",
  "Operations",
  "HR & People",
  "Product Management",
  "Data & Analytics",
  "Branding",
  "Supply Chain",
];

const AVAILABILITY_OPTIONS = [
  { value: "flexible", label: "Flexible" },
  { value: "weekdays", label: "Weekdays" },
  { value: "evenings", label: "Evenings" },
  { value: "weekends", label: "Weekends" },
];

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sessions, setSessions] = useState<SessionWithMatch[]>([]);

  // Editable fields
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [expertise, setExpertise] = useState<string[]>([]);
  const [idea, setIdea] = useState("");
  const [problem, setProblem] = useState("");
  const [availability, setAvailability] = useState("flexible");

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setProfile(data as Profile);
        setName(data.name);
        setBio(data.bio);
        setExpertise(data.expertise || []);
        setIdea(data.idea);
        setProblem(data.problem);
        setAvailability(data.availability);

        // Fetch sessions for this profile's accepted matches
        const { data: matchData } = await supabase
          .from("matches")
          .select("id")
          .or(`mentor_id.eq.${data.id},student_id.eq.${data.id}`)
          .eq("status", "accepted");

        if (matchData && matchData.length > 0) {
          const matchIds = matchData.map((m: { id: string }) => m.id);
          const { data: sessionData } = await supabase
            .from("sessions")
            .select(`
              id, scheduled_at, status, meeting_link, notes,
              match:matches!sessions_match_id_fkey (
                id, mentor_id, student_id,
                mentor:profiles!matches_mentor_id_fkey (name),
                student:profiles!matches_student_id_fkey (name)
              )
            `)
            .in("match_id", matchIds)
            .gte("scheduled_at", new Date().toISOString())
            .order("scheduled_at", { ascending: true })
            .limit(5);

          if (sessionData) setSessions(sessionData as SessionWithMatch[]);
        }
      }

      setLoading(false);
    }

    loadProfile();
  }, []);

  function toggleExpertise(item: string) {
    setExpertise((prev) =>
      prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]
    );
  }

  async function handleSave() {
    setError("");
    setSuccess("");
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ name, bio, expertise, idea, problem, availability })
      .eq("user_id", user.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess("Profile saved successfully!");
      setProfile((prev) =>
        prev ? { ...prev, name, bio, expertise, idea, problem, availability } : prev
      );
      setEditing(false);
    }

    setSaving(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-muted-foreground">Loading profile...</div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card className="text-center p-8">
        <div className="w-20 h-20 rounded-full bg-primary-light text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">
          {name
            ? name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)
            : "?"}
        </div>
        <h1 className="text-2xl font-bold">{name || "Your Name"}</h1>
        <div className="flex items-center justify-center gap-2 mt-2">
          <Badge variant={profile.role === "mentor" ? "default" : "success"}>
  {profile.role === "mentor" ? "🎓 Mentor" : "🚀 Student"}
</Badge>
<Badge>{availability}</Badge>
{profile.role === "student" && (
  <a href="/profile/journey">
    <Badge variant="default">🗺️ View Journey</Badge>
  </a>
)}
        </div>
        <p className="text-muted-foreground text-sm mt-3 max-w-md mx-auto">
          {bio || "No bio yet"}
        </p>
      </Card>

      {/* Profile Details */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Profile Details</h2>
          {!editing && (
            <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
              Edit
            </Button>
          )}
        </div>

        {editing ? (
          <div className="space-y-5">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
              />
            </div>

            {/* Expertise */}
            <div>
              <label className="text-sm font-medium block mb-2">
                {profile.role === "mentor" ? "Expertise" : "Areas of Interest"}
              </label>
              <div className="flex flex-wrap gap-2">
                {EXPERTISE_OPTIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleExpertise(item)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                      expertise.includes(item)
                        ? "bg-primary text-white"
                        : "glass hover:bg-white/60"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Student-only fields */}
            {profile.role === "student" && (
              <>
                <Input
                  label="Project / Idea"
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">Problem you&apos;re facing</label>
                  <textarea
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
                  />
                </div>
              </>
            )}

            {/* Availability */}
            <div>
              <label className="text-sm font-medium block mb-2">Availability</label>
              <div className="grid grid-cols-2 gap-2">
                {AVAILABILITY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setAvailability(option.value)}
                    className={`py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                      availability === option.value
                        ? "bg-primary text-white"
                        : "glass hover:bg-white/60"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="text-sm text-error bg-error/10 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="gradient" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setEditing(false);
                  // Reset to original
                  setName(profile.name);
                  setBio(profile.bio);
                  setExpertise(profile.expertise);
                  setIdea(profile.idea);
                  setProblem(profile.problem);
                  setAvailability(profile.availability);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Expertise
              </p>
              <div className="flex flex-wrap gap-1.5">
                {expertise.length > 0 ? (
                  expertise.map((e) => <Badge key={e}>{e}</Badge>)
                ) : (
                  <span className="text-sm text-muted-foreground">Not set</span>
                )}
              </div>
            </div>

            {profile.role === "student" && (
              <>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Project / Idea
                  </p>
                  <p className="text-sm">{idea || "Not set"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    Problem
                  </p>
                  <p className="text-sm">{problem || "Not set"}</p>
                </div>
              </>
            )}

            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                Availability
              </p>
              <p className="text-sm capitalize">{availability}</p>
            </div>
          </div>
        )}
      </Card>

      {success && (
        <div className="text-sm text-success bg-success/10 rounded-xl px-4 py-3 text-center">
          {success}
        </div>
      )}

      {/* My Sessions */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">📆 My Sessions</h2>
          <Link href="/dashboard/sessions">
            <Button variant="ghost" size="sm">Full calendar →</Button>
          </Link>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground mb-3">No upcoming sessions.</p>
            <Link href="/dashboard/sessions">
              <Button variant="gradient" size="sm">Book a session</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => {
              const isMentor = profile?.id === session.match?.mentor_id;
              const partner = isMentor
                ? session.match?.student?.name
                : session.match?.mentor?.name;
              const label = isMentor ? "Student" : "Mentor";
              const statusColors: Record<string, string> = {
                pending: "bg-amber-100 text-amber-700",
                confirmed: "bg-green-100 text-green-700",
                cancelled: "bg-red-100 text-red-700",
                completed: "bg-gray-100 text-gray-500",
              };
              return (
                <div
                  key={session.id}
                  className="flex items-center justify-between rounded-xl glass px-4 py-3 gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      Session with {partner}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {label} · {new Date(session.scheduled_at).toLocaleString("en-GB", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {session.meeting_link && (
                      <a
                        href={session.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline truncate block"
                      >
                        Join meeting →
                      </a>
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${statusColors[session.status] ?? "bg-gray-100 text-gray-500"}`}
                  >
                    {session.status}
                  </span>
                </div>
              );
            })}
            <div className="pt-1">
              <Link href="/dashboard/sessions">
                <Button variant="ghost" size="sm" className="w-full">
                  Book a new session
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Card>

      {/* Danger Zone */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-sm">Log out</p>
            <p className="text-xs text-muted-foreground">
              Sign out of your Mentor.me account
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </Card>
    </div>
  );
}