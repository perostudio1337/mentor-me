import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DashboardNav from "@/components/ui/dashboard-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, role, avatar_url")
    .eq("user_id", user?.id ?? "")
    .single();

  return (
    <div className="min-h-screen bg-mesh flex flex-col">
      {/* Top navbar */}
      <header className="w-full sticky top-0 z-50 glass">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard/matches" className="text-xl font-bold text-gradient">
            Mentor.me
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {profile?.name || user?.email}
            </span>
            <Link
              href="/dashboard/profile"
              className="w-9 h-9 rounded-full bg-primary-light text-white font-semibold flex items-center justify-center text-sm"
            >
              {profile?.name
                ? profile.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)
                : "?"}
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        {children}
      </main>

      {/* Bottom navigation (mobile-style like the design) */}
      <DashboardNav role={profile?.role || "student"} />
    </div>
  );
}
