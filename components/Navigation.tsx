"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  ClipboardCheck,
  Calendar,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Consult", icon: MessageSquare },
  { href: "/assess", label: "Assess", icon: ClipboardCheck },
  { href: "/bulletin", label: "Bulletin", icon: Calendar },
  { href: "/wiki", label: "Wiki", icon: BookOpen },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/80 backdrop-blur-md border-t border-secondary">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-foreground/60 hover:text-foreground"
                )}
              >
                <Icon size={20} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop Top Navigation Bar */}
      <nav className="hidden md:flex items-center justify-between px-6 py-4 border-b border-secondary bg-background">
        <Link href="/" className="text-xl font-serif font-bold text-primary">
          AI Immigration
        </Link>
        <div className="flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors relative",
                  isActive
                    ? "text-primary"
                    : "text-foreground/70 hover:text-foreground"
                )}
              >
                {item.label}
                {isActive && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
