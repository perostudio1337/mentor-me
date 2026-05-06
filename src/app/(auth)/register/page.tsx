"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Card from "@/components/ui/card";
import type { UserRole } from "@/types";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!role) {
      setError("Please select whether you are a mentor or a student.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    router.push("/onboarding");
  }

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center px-4 py-12">
      {/* Decorative blobs */}
      <div className="fixed top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-secondary/15 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-gradient">
            Mentor.me
          </Link>
          <p className="text-muted-foreground mt-2">
            Create your account and start your journey
          </p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-3">
                I want to...
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 text-center cursor-pointer ${
                    role === "student"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/30 bg-white/30"
                  }`}
                >
                  <div className="text-2xl mb-1">🚀</div>
                  <div className="font-semibold text-sm">Find a Mentor</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    I have an idea
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("mentor")}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 text-center cursor-pointer ${
                    role === "mentor"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/30 bg-white/30"
                  }`}
                >
                  <div className="text-2xl mb-1">🎓</div>
                  <div className="font-semibold text-sm">Be a Mentor</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    I have experience
                  </div>
                </button>
              </div>
            </div>

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Type your password again"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            {error && (
              <div className="text-sm text-error bg-error/10 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary font-medium hover:underline"
            >
              Log in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
