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
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
      <div className="flex">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center py-2 pt-3 text-xs font-medium transition-colors ${
                active ? "text-green-600" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 ${active ? "stroke-green-600" : ""}`} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
