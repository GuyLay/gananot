"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Phone, CheckCircle } from "lucide-react";
import AppShell from "@/app/components/AppShell";
import PageHeader from "@/app/components/PageHeader";
import StatusBadge from "@/app/components/StatusBadge";
import { getJobsByStatus, getUnpaidJobs } from "@/services/jobs";
import type { Job, JobStatus } from "@/types/database";

type TabId = JobStatus | "unpaid";

const TABS: { id: TabId; label: string }[] = [
  { id: "pending",   label: "ממתין"    },
  { id: "approved",  label: "מאושר"    },
  { id: "completed", label: "הושלם"    },
  { id: "unpaid",    label: "לא שולם"  },
  { id: "cancelled", label: "בוטל"     },
];

const TAB_ACTIVE: Record<TabId, string> = {
  pending:   "border-yellow-500 text-yellow-700",
  approved:  "border-blue-500 text-blue-700",
  completed: "border-green-600 text-green-700",
  unpaid:    "border-orange-500 text-orange-700",
  cancelled: "border-red-500 text-red-700",
};

export default function JobsStatusPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("pending");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetch = activeTab === "unpaid"
      ? getUnpaidJobs()
      : getJobsByStatus(activeTab);
    fetch.then(setJobs).finally(() => setLoading(false));
  }, [activeTab]);

  return (
    <AppShell>
      <PageHeader title="עבודות" />

      {/* Tabs — scrollable so all 5 fit on narrow screens */}
      <div className="flex border-b border-gray-200 bg-white sticky top-[52px] z-30 overflow-x-auto">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-shrink-0 flex-1 min-w-[64px] py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === id ? TAB_ACTIVE[id] : "border-transparent text-gray-400"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-3">
        {loading && (
          <div className="text-center text-gray-400 py-12">טוען...</div>
        )}
        {!loading && jobs.length === 0 && (
          <div className="text-center text-gray-400 py-12">אין עבודות</div>
        )}
        {jobs.map((job) => (
          <button
            key={job.id}
            onClick={() => router.push(`/jobs/${job.id}`)}
            className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-right flex flex-col gap-1.5 active:opacity-80 transition-opacity"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Show paid badge on non-unpaid tabs */}
                {activeTab !== "unpaid" && job.paid && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    שולם
                  </span>
                )}
                {/* On unpaid tab, show the job's status instead */}
                {activeTab === "unpaid" && (
                  <StatusBadge status={job.status} />
                )}
              </div>
              <span className="font-semibold text-gray-800 text-base">
                {job.customer?.name}
              </span>
            </div>

            <div className="text-sm text-gray-500">
              {format(new Date(job.date), "EEEE, d בMMMM yyyy", { locale: he })}
            </div>

            <div className="flex items-center justify-between mt-1">
              <span className="text-green-700 font-bold text-base">
                ₪{job.price.toLocaleString()}
              </span>
              {job.customer?.phone && (
                <a
                  href={`tel:${job.customer.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-blue-600 text-sm"
                >
                  <Phone className="w-4 h-4" />
                  {job.customer.phone}
                </a>
              )}
            </div>

            {job.description && (
              <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{job.description}</p>
            )}
          </button>
        ))}
      </div>
    </AppShell>
  );
}
