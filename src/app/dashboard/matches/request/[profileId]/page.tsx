// src/app/dashboard/matches/request/[profileId]/page.tsx
//
// [profileId] = profiles.id van de mentor (niet mentor_profiles.id)
// Wordt bereikt vanuit de MentorRequestModal.

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Link from "next/link";
import MatchRequestForm from "./match-request-form";

interface Props {
  params: Promise<{ profileId: string }>;
  searchParams: Promise<{ problem?: string; categories?: string }>;
}

export const dynamic = "force-dynamic";

export default async function MatchRequestPage({ params, searchParams }: Props) {
  const { profileId } = await params;
  const { problem = "", categories = "" } = await searchParams;

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("user_id", user?.id ?? "")
    .single();

  // profileId = profiles.id van de mentor
  const { data: mentor, error } = await supabase
    .from("profiles")
    .select("id, name, bio, expertise, availability, role")
    .eq("id", profileId)
    .eq("role", "mentor")
    .single();

  if (error || !mentor) notFound();

  // Check voor bestaande match
  const { data: existingMatch } = myProfile
    ? await supabase
        .from("matches")
        .select("id, status")
        .eq("student_id", myProfile.id)
        .eq("mentor_id", profileId)
        .maybeSingle()
    : { data: null };

  const expertiseTags: string[] = Array.isArray(mentor.expertise)
    ? mentor.expertise.slice(0, 5)
    : [];

  const initials = mentor.name
    ? mentor.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Link
        href="/dashboard/matches"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
      >
        ← Back to Discover
      </Link>

      {/* Mentor card */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-primary-light text-white font-bold flex items-center justify-center text-xl flex-shrink-0">
            {initials}
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">{mentor.name}</h1>
            <Badge variant={mentor.availability === "flexible" ? "success" : "default"}>
              {mentor.availability ?? "Available"}
            </Badge>
          </div>
        </div>
        {mentor.bio && (
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{mentor.bio}</p>
        )}
        {expertiseTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {expertiseTags.map((tag: string) => (
              <span key={tag} className="text-xs px-3 py-1 rounded-full glass">{tag}</span>
            ))}
          </div>
        )}
      </Card>

      {/* Problem context banner */}
      {problem && (
        <Card className="p-4 border-l-4 border-primary bg-primary/5">
          <p className="text-xs font-semibold text-primary mb-1">Your problem context</p>
          <p className="text-sm text-foreground">{problem}</p>
        </Card>
      )}

      {/* Request form or existing match status */}
      <Card className="p-6">
        {existingMatch ? (
          <div className="text-center py-4">
            <div className="text-3xl mb-2">
              {existingMatch.status === "accepted" ? "✅" : "⏳"}
            </div>
            <p className="font-medium">
              {existingMatch.status === "accepted"
                ? `You're already connected with ${mentor.name}`
                : `You already sent a request to ${mentor.name}`}
            </p>
            {existingMatch.status === "accepted" && (
              <Link href={`/dashboard/matches/${existingMatch.id}/profile`}>
                <button className="mt-3 text-sm text-primary font-medium hover:underline">
                  Go to match profile →
                </button>
              </Link>
            )}
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold mb-4">
              Send a request to {mentor.name}
            </h2>
            <MatchRequestForm
              mentorProfileId={profileId}
              mentorName={mentor.name}
              currentProfileId={myProfile?.id ?? null}
              prefillMessage={
                problem
                  ? `Hi ${mentor.name}!\n\nI'm reaching out because I'm working on the following challenge:\n\n${problem}\n\nI think your expertise could really help me move forward.`
                  : ""
              }
            />
          </>
        )}
      </Card>
    </div>
  );
}
