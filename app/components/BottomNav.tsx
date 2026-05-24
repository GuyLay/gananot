"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, List, Users } from "lucide-react";

const navItems = [
  { href: "/calendar", label: "יומן", icon: Calendar },
  { href: "/jobs/status", label: "עבודות", icon: List },
  { href: "/customers", label: "לקוחות", icon: Users },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 safe-area-bottom shadow-[0_-1px_0_rgba(0,0,0,0.06)]">
      <div className="flex">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center py-2 pt-3 min-h-[56px] text-xs font-medium transition-colors active:opacity-60 ${
                active ? "text-green-600" : "text-gray-400"
              }`}
            >
              <Icon
                className={`w-6 h-6 mb-0.5 ${active ? "stroke-green-600" : "stroke-gray-400"}`}
                strokeWidth={active ? 2.2 : 1.8}
              />
              <span className={active ? "font-semibold" : ""}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
