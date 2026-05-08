"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: string;
  /** Hide from this role — defaults to "show for all" */
  hideFor?: "mentor" | "student";
};

const navItems: NavItem[] = [
  { href: "/dashboard/matches",    label: "Discover",   icon: "🔍" },
  { href: "/dashboard/feed",       label: "Feed",       icon: "📣" },
  { href: "/dashboard/challenges", label: "Challenges", icon: "🏆" },
  { href: "/dashboard/chat",       label: "Chat",       icon: "💬" },
  { href: "/dashboard/events",     label: "Events",     icon: "📅" },
  { href: "/dashboard/profile",    label: "Profile",    icon: "👤" },
];

export default function DashboardNav({ role }: { role: string }) {
  const pathname = usePathname();
  const visible = navItems.filter((i) => i.hideFor !== role);

  return (
    <nav className="sticky bottom-0 z-50 app-bar app-bar--bottom">
      {/* Horizontal-scroll container — guarantees every item stays visible
          even on the narrowest phones; on wider screens it lays out flat. */}
      <div className="max-w-2xl mx-auto h-16 overflow-x-auto no-scrollbar">
        <div className="flex items-center justify-around gap-1 h-full px-2 min-w-full w-max sm:w-auto">
          {visible.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl shrink-0 transition-all duration-200",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span
                  className={cn(
                    "text-xl leading-none",
                    isActive && "scale-110 transition-transform"
                  )}
                >
                  {item.icon}
                </span>
                <span className="text-[11px] font-medium whitespace-nowrap">
                  {item.label}
                </span>
                {isActive && (
                  <div className="w-1 h-1 rounded-full bg-primary mt-0.5" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
