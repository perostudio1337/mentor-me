"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard/matches", label: "Discover", icon: "🔍" },
  { href: "/dashboard/chat", label: "Messages", icon: "💬" },
  { href: "/dashboard/sessions", label: "Sessions", icon: "📆" },
  { href: "/dashboard/events", label: "Events", icon: "📅" },
  { href: "/dashboard/profile", label: "Profile", icon: "👤" },
];

export default function DashboardNav({ role }: { role: string }) {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-50 glass border-t border-white/20">
      <div className="max-w-lg mx-auto flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className={cn("text-xl", isActive && "scale-110 transition-transform")}>
                {item.icon}
              </span>
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-primary mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
