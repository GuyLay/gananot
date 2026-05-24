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
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-2">
      {back && (
        <button onClick={() => router.back()} className="p-1 -mr-1 text-gray-500">
          <ChevronRight className="w-6 h-6" />
        </button>
      )}
      <h1 className="flex-1 text-lg font-bold text-gray-800">{title}</h1>
      {action}
    </header>
  );
}
