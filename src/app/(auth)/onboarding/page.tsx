"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Card from "@/components/ui/card";
import type { UserRole } from "@/types";
import { runMatchingForStudent } from "@/lib/matching/matcher";

// ── Taxonomy (matches je database) ──────────────────────────
const CATEGORIES = [
  { id: 1, name: "Marketing" },
  { id: 2, name: "Finance" },
  { id: 3, name: "Technology" },
  { id: 4, name: "Legal" },
  { id: 5, name: "Operations" },
  { id: 6, name: "Product" },
  { id: 7, name: "Sales" },
  { id: 8, name: "HR & People" },
];

const SUB_SKILLS: Record<number, { id: number; name: string }[]> = {
  1: [
    { id: 1, name: "SEO" },
    { id: 2, name: "Content marketing" },
    { id: 3, name: "Paid ads" },
    { id: 4, name: "Brand strategy" },
  ],
  2: [
    { id: 5, name: "Tax law" },
    { id: 6, name: "Fundraising" },
    { id: 7, name: "Accounting" },
    { id: 8, name: "Financial modeling" },
  ],
  3: [
    { id: 10, name: "Mobile development" },
    { id: 11, name: "AI / ML" },
    { id: 12, name: "Cloud infrastructure" },
  ],
  4: [
    { id: 14, name: "IP & patents" },
    { id: 15, name: "GDPR compliance" },
  ],
  5: [
    { id: 16, name: "Supply chain" },
    { id: 17, name: "Process optimization" },
  ],
  6: [
    { id: 18, name: "Product strategy" },
    { id: 19, name: "User research" },
    { id: 20, name: "Roadmapping" },
  ],
  7: [
    { id: 21, name: "B2B sales" },
    { id: 22, name: "Partnerships" },
  ],
  8: [
    { id: 23, name: "Recruiting" },
    { id: 24, name: "Team culture" },
  ],
};

const AVAILABILITY_OPTIONS = [
  { value: "flexible", label: "Flexible" },
  { value: "weekdays", label: "Weekdays" },
  { value: "evenings", label: "Evenings" },
  { value: "weekends", label: "Weekends" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(1);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Basic fields
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [availability, setAvailability] = useState("flexible");

  // Mentor fields
  const [mentorExpertise, setMentorExpertise] = useState<string[]>([]);

  // Student fields
  const [idea, setIdea] = useState("");
  const [problem, setProblem] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedSubSkillId, setSelectedSubSkillId] = useState<number | null>(null);

  // Steps: mentor = 3, student = 4
  const totalSteps = role === "mentor" ? 3 : 4;

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        setRole(profile.role as UserRole);
        if (profile.name) setName(profile.name);
        if (profile.bio) setBio(profile.bio);
        if (profile.availability) setAvailability(profile.availability);
        if (profile.idea) setIdea(profile.idea);
        if (profile.problem) setProblem(profile.problem);
        if (profile.expertise?.length) setMentorExpertise(profile.expertise);
        if (profile.onboarding_complete) {
          window.location.href = "/dashboard/matches";
          return;
        }
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  function toggleMentorExpertise(item: string) {
    setMentorExpertise((prev) =>
      prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]
    );
  }

  async function handleFinish() {
    setError("");
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    // 1. Update the main profiles table
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        name,
        bio,
        expertise: mentorExpertise,
        idea,
        problem,
        availability,
        onboarding_complete: true,
      })
      .eq("user_id", user.id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    // 2. Fetch the profiles.id (needed for student_profiles and matching)
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!profile) {
      setError("Could not load profile after saving.");
      setSaving(false);
      return;
    }

    
    // ★ NIEUW — mentor_profiles + mentor_expertise aanmaken
    if (role === "mentor") {
      const { data: existingMp } = await supabase
        .from("mentor_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .maybeSingle();

      let mentorProfileId: string | null = existingMp?.id ?? null;

      if (!existingMp) {
        const { data: newMp, error: mpError } = await supabase
          .from("mentor_profiles")
          .insert({ profile_id: profile.id, available: true })
          .select("id")
          .single();

        if (mpError) {
          console.error("mentor_profiles insert mislukt:", mpError.message);
        } else {
          mentorProfileId = newMp.id;
        }
      }

      if (mentorProfileId && mentorExpertise.length > 0) {
        await supabase
          .from("mentor_expertise")
          .delete()
          .eq("mentor_id", mentorProfileId);

        const expertiseRows = mentorExpertise.map((name) => {
          const cat = CATEGORIES.find((c) => c.name === name);
          return { mentor_id: mentorProfileId!, category_id: cat?.id ?? 1 };
        });

        await supabase.from("mentor_expertise").insert(expertiseRows);
      }
    }

    if (role === "student") {
      // 3. Create or update student_profiles row with category/sub_skill IDs
      const { error: spError } = await supabase
        .from("student_profiles")
        .upsert(
          {
            profile_id: profile.id,
            idea_title: idea,
            idea_desc: "",
            problem: problem,
            category_id: selectedCategoryId,
            sub_skill_id: selectedSubSkillId,
            context_id: null,
          },
          { onConflict: "profile_id" }
        );

      if (spError) {
        console.error("student_profiles upsert mislukt:", spError.message);
        // Non-fatal: ga toch door naar matching
      }

      // 4. Run matching with the correct profiles.id
      await runMatchingForStudent(profile.id);
    }

    window.location.href = "/dashboard/matches";
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mesh flex flex-col items-center justify-center px-4 py-12">
      <div className="fixed top-10 left-1/4 w-80 h-80 bg-primary/15 rounded-full blur-3xl" />
      <div className="fixed bottom-10 right-1/4 w-72 h-72 bg-secondary/15 rounded-full blur-3xl" />
      <div className="fixed top-1/2 right-10 w-60 h-60 bg-accent/10 rounded-full blur-3xl" />

      <div className="relative w-full max-w-lg">
        {/* Step indicator */}
        <div className="text-center mb-2">
          <span className="text-sm font-medium text-primary glass px-4 py-1.5 rounded-full">
            Step {step} of {totalSteps}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-2 mb-8">
          <div
            className="stat-bar h-2 transition-all duration-500"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        {/* ── Step 1: Name & Bio ── */}
        {step === 1 && (
          <Card className="p-8">
            <h1 className="text-3xl font-bold mb-2">Tell us about you</h1>
            <p className="text-muted-foreground mb-8">
              Let&apos;s start with the basics so others can get to know you.
            </p>
            <div className="space-y-5">
              <Input
                label="Full Name"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">
                  Short Bio
                </label>
                <textarea
                  placeholder={
                    role === "mentor"
                      ? "Tell students about your background and what drives you..."
                      : "Tell mentors about yourself and what you're working on..."
                  }
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
                />
              </div>
            </div>
          </Card>
        )}

        {/* ── Step 2: Mentor = expertise tags, Student = idea & problem ── */}
        {step === 2 && role === "mentor" && (
          <Card className="p-8">
            <h1 className="text-3xl font-bold mb-2">Your expertise</h1>
            <p className="text-muted-foreground mb-8">
              Select the fields where you can offer guidance.
            </p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleMentorExpertise(cat.name)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                    mentorExpertise.includes(cat.name)
                      ? "bg-primary text-white shadow-sm"
                      : "glass hover:bg-white/60"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </Card>
        )}

        {step === 2 && role === "student" && (
          <Card className="p-8">
            <h1 className="text-3xl font-bold mb-2">Tell us about your vision</h1>
            <p className="text-muted-foreground mb-8">
              Describe your idea and the problem you&apos;re facing.
            </p>
            <div className="space-y-5">
              <Input
                label="Project Name"
                placeholder="What's your initiative called?"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-foreground">
                  What problem are you facing?
                </label>
                <textarea
                  placeholder="What's the problem you're trying to solve, and where are you stuck?"
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none"
                />
              </div>
            </div>
          </Card>
        )}

        {/* ── Step 3: Student = category & sub_skill ── */}
        {step === 3 && role === "student" && (
          <Card className="p-8">
            <h1 className="text-3xl font-bold mb-2">What do you need help with?</h1>
            <p className="text-muted-foreground mb-6">
              Pick a topic area, then the specific skill — this is how we find your best mentor match.
            </p>

            {/* Category picker */}
            <div className="mb-6">
              <p className="text-sm font-medium mb-3">Topic area</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategoryId(cat.id);
                      setSelectedSubSkillId(null); // reset sub_skill when category changes
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                      selectedCategoryId === cat.id
                        ? "bg-primary text-white shadow-sm"
                        : "glass hover:bg-white/60"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Sub-skill picker — only shown after category is selected */}
            {selectedCategoryId && (
              <div>
                <p className="text-sm font-medium mb-3">Specific skill</p>
                <div className="flex flex-wrap gap-2">
                  {(SUB_SKILLS[selectedCategoryId] || []).map((skill) => (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => setSelectedSubSkillId(skill.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                        selectedSubSkillId === skill.id
                          ? "bg-secondary text-white shadow-sm"
                          : "glass hover:bg-white/60"
                      }`}
                    >
                      {skill.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tip */}
            <div className="glass rounded-xl p-4 flex gap-3 mt-6">
              <div className="text-2xl">🎯</div>
              <div>
                <p className="text-sm font-semibold">Be specific for better matches</p>
                <p className="text-xs text-muted-foreground mt-1">
                  The more specific your skill, the better your mentor match. A tax law problem goes to a tax specialist, not a general lawyer.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* ── Last step: Availability ── */}
        {step === totalSteps && (
          <Card className="p-8">
            <h1 className="text-3xl font-bold mb-2">Your availability</h1>
            <p className="text-muted-foreground mb-8">
              When are you typically free for mentoring sessions?
            </p>
            <div className="grid grid-cols-2 gap-3">
              {AVAILABILITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setAvailability(option.value)}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 text-center cursor-pointer ${
                    availability === option.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/30 bg-white/30"
                  }`}
                >
                  <div className="font-semibold text-sm">{option.label}</div>
                </button>
              ))}
            </div>
            {error && (
              <div className="text-sm text-error bg-error/10 rounded-xl px-4 py-3 mt-5">
                {error}
              </div>
            )}
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              ← Back
            </button>
          ) : (
            <div />
          )}

          {step < totalSteps ? (
            <Button variant="gradient" size="lg" onClick={() => setStep(step + 1)}>
              Next step →
            </Button>
          ) : (
            <Button
              variant="gradient"
              size="lg"
              onClick={handleFinish}
              disabled={saving}
            >
              {saving ? "Saving..." : "Complete Setup →"}
            </Button>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-10 uppercase tracking-widest">
          Mentor.me Onboarding Experience
        </p>
      </div>
    </div>
  );
}
