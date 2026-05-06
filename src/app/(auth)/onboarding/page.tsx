"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Card from "@/components/ui/card";
import type { UserRole } from "@/types";

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

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(1);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form fields
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [expertise, setExpertise] = useState<string[]>([]);
  const [idea, setIdea] = useState("");
  const [problem, setProblem] = useState("");
  const [availability, setAvailability] = useState("flexible");

  const totalSteps = role === "mentor" ? 3 : 4;

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        setRole(profile.role as UserRole);
        if (profile.name) setName(profile.name);
        if (profile.bio) setBio(profile.bio);
        if (profile.expertise?.length) setExpertise(profile.expertise);
        if (profile.idea) setIdea(profile.idea);
        if (profile.problem) setProblem(profile.problem);
        if (profile.availability) setAvailability(profile.availability);

        if (profile.onboarding_complete) {
          window.location.href = "/dashboard/matches";
          return;
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

  async function handleFinish() {
    setError("");
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      return;
    }

    const { error: updateError, count } = await supabase
      .from("profiles")
      .update({
        name,
        bio,
        expertise,
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

    // Hard redirect to bypass middleware cache
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
      {/* Decorative blobs */}
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

        {/* Step 1: Name & Bio */}
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

        {/* Step 2: Expertise (both roles) */}
        {step === 2 && (
          <Card className="p-8">
            <h1 className="text-3xl font-bold mb-2">
              {role === "mentor" ? "Your expertise" : "What area do you need help with?"}
            </h1>
            <p className="text-muted-foreground mb-8">
              {role === "mentor"
                ? "Select the fields where you can offer guidance."
                : "Select the areas related to your problem."}
            </p>

            <div className="flex flex-wrap gap-2">
              {EXPERTISE_OPTIONS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggleExpertise(item)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer ${
                    expertise.includes(item)
                      ? "bg-primary text-white shadow-sm"
                      : "glass hover:bg-white/60"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* Step 3 for Student: Idea & Problem */}
        {step === 3 && role === "student" && (
          <Card className="p-8">
            <h1 className="text-3xl font-bold mb-2">Tell us about your vision</h1>
            <p className="text-muted-foreground mb-8">
              Describe your idea and the problem you&apos;re facing — this helps us
              find the right mentor for you.
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

              {/* Tip card */}
              <div className="glass rounded-xl p-4 flex gap-3">
                <div className="text-2xl">💡</div>
                <div>
                  <p className="text-sm font-semibold">Need help with your pitch?</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Focus on the &quot;why&quot; of your project. Mentors look for
                    passion and a clear mission.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Last step: Availability */}
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

        {/* Navigation buttons */}
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

        {/* Footer text */}
        <p className="text-center text-xs text-muted-foreground mt-10 uppercase tracking-widest">
          Mentor.me Onboarding Experience
        </p>
      </div>
    </div>
  );
}
