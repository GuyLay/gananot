"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import AppShell from "@/app/components/AppShell";
import PageHeader from "@/app/components/PageHeader";
import StatusBadge from "@/app/components/StatusBadge";
import { getJobsByStatus } from "@/services/jobs";
import type { Job, JobStatus } from "@/types/database";
import { Phone } from "lucide-react";

const TABS: { status: JobStatus; label: string }[] = [
  { status: "pending", label: "ממתין" },
  { status: "approved", label: "מאושר" },
  { status: "completed", label: "הושלם" },
  { status: "cancelled", label: "בוטל" },
];

const TAB_ACTIVE_COLORS: Record<JobStatus, string> = {
  pending: "border-yellow-500 text-yellow-700",
  approved: "border-blue-500 text-blue-700",
  completed: "border-green-600 text-green-700",
  cancelled: "border-red-500 text-red-700",
};

export default function JobsStatusPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<JobStatus>("pending");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getJobsByStatus(activeTab)
      .then(setJobs)
      .finally(() => setLoading(false));
  }, [activeTab]);

  return (
    <AppShell>
      <PageHeader title="עבודות לפי סטטוס" />

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white sticky top-[57px] z-30">
        {TABS.map(({ status, label }) => (
          <button
            key={status}
            onClick={() => setActiveTab(status)}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === status
                ? TAB_ACTIVE_COLORS[status]
                : "border-transparent text-gray-500"
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
              <span className="font-semibold text-gray-800 text-base">
                {job.customer?.name}
              </span>
              <StatusBadge status={job.status} />
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
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{job.description}</p>
            )}
          </button>
        ))}
      </div>
    </AppShell>
  );
}
