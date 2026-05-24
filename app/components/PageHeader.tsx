"use client";

import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";

interface PageHeaderProps {
  title: string;
  back?: boolean;
  action?: React.ReactNode;
}

export default function PageHeader({ title, back = false, action }: PageHeaderProps) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-3 py-2 flex items-center gap-1 min-h-[52px]">
      {back && (
        <button
          onClick={() => router.back()}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-500 active:opacity-60"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}
      <h1 className="flex-1 text-lg font-bold text-gray-800 px-1">{title}</h1>
      {action}
    </header>
  );
}
