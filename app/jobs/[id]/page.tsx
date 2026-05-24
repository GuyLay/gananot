"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Phone, Edit, Calendar, RefreshCw, Trash2, CheckCircle, Circle } from "lucide-react";
import AppShell from "@/app/components/AppShell";
import PageHeader from "@/app/components/PageHeader";
import StatusBadge from "@/app/components/StatusBadge";
import { getJob, changeJobStatus, deleteJob, toggleJobPaid } from "@/services/jobs";
import type { Job, JobStatus } from "@/types/database";

const STATUS_ACTIONS: Record<JobStatus, { label: string; newStatus: JobStatus; color: string }[]> = {
  pending: [
    { label: "אשר עבודה", newStatus: "approved", color: "bg-blue-600" },
    { label: "בטל עבודה", newStatus: "cancelled", color: "bg-red-500" },
  ],
  approved: [
    { label: "סמן כהושלם", newStatus: "completed", color: "bg-green-600" },
    { label: "בטל עבודה", newStatus: "cancelled", color: "bg-red-500" },
  ],
  completed: [
    { label: "החזר לאושר", newStatus: "approved", color: "bg-blue-600" },
  ],
  cancelled: [
    { label: "שחזר עבודה", newStatus: "approved", color: "bg-blue-600" },
  ],
};

export default function JobDetailsPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [togglingPaid, setTogglingPaid] = useState(false);

  useEffect(() => {
    getJob(id)
      .then(setJob)
      .catch(() => router.back())
      .finally(() => setLoading(false));
  }, [id, router]);

  async function handleAction(newStatus: JobStatus) {
    if (!job || acting) return;
    setActing(true);
    try {
      await changeJobStatus(job, newStatus);
      const updated = await getJob(id);
      setJob(updated);
    } finally {
      setActing(false);
    }
  }

  async function handleTogglePaid() {
    if (!job || togglingPaid) return;
    setTogglingPaid(true);
    try {
      const updated = await toggleJobPaid(id, !job.paid);
      setJob(updated);
    } finally {
      setTogglingPaid(false);
    }
  }

  async function handleDelete() {
    if (!job) return;
    if (!confirm("האם למחוק עבודה זו?")) return;
    await deleteJob(job.id);
    router.back();
  }

  if (loading || !job) {
    return (
      <AppShell>
        <PageHeader title="פרטי עבודה" back />
        <div className="text-center text-gray-400 py-20">טוען...</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="פרטי עבודה"
        back
        action={
          <button
            onClick={() => router.push(`/jobs/${id}/edit`)}
            className="p-2 text-gray-500 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <Edit className="w-5 h-5" />
          </button>
        }
      />

      <div className="p-4 space-y-4">
        {/* Customer card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-gray-800">{job.customer?.name}</h2>
            <StatusBadge status={job.status} />
          </div>
          {job.customer?.phone && (
            <a
              href={`tel:${job.customer.phone}`}
              className="flex items-center gap-2 text-blue-600 text-base"
            >
              <Phone className="w-5 h-5" />
              {job.customer.phone}
            </a>
          )}
        </div>

        {/* Details card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-5 h-5 text-green-600" />
            <span className="text-base">
              {format(new Date(job.date), "EEEE, d בMMMM yyyy", { locale: he })}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-500">מחיר</span>
            <span className="text-green-700 font-bold text-xl">₪{job.price.toLocaleString()}</span>
          </div>

          {/* Paid toggle row */}
          <div className="flex items-center justify-between pt-1 border-t border-gray-100">
            <span className="text-gray-500">תשלום</span>
            <button
              onClick={handleTogglePaid}
              disabled={togglingPaid}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors disabled:opacity-60 ${
                job.paid
                  ? "bg-green-100 text-green-700 active:bg-green-200"
                  : "bg-orange-100 text-orange-700 active:bg-orange-200"
              }`}
            >
              {job.paid ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  שולם
                </>
              ) : (
                <>
                  <Circle className="w-4 h-4" />
                  לא שולם
                </>
              )}
            </button>
          </div>

          {job.recurrence_days && (
            <div className="flex items-center gap-2 text-gray-600">
              <RefreshCw className="w-5 h-5 text-purple-500" />
              <span>חוזר כל {job.recurrence_days} ימים</span>
            </div>
          )}

          {job.description && (
            <div>
              <span className="text-gray-500 text-sm">תיאור</span>
              <p className="text-gray-700 mt-1">{job.description}</p>
            </div>
          )}

          {job.auto_generated && (
            <div className="text-xs text-purple-600 bg-purple-50 px-3 py-1.5 rounded-lg">
              נוצר אוטומטית
            </div>
          )}
        </div>

        {/* Status actions */}
        <div className="space-y-2">
          {STATUS_ACTIONS[job.status].map(({ label, newStatus, color }) => (
            <button
              key={newStatus}
              onClick={() => handleAction(newStatus)}
              disabled={acting}
              className={`w-full ${color} text-white font-semibold py-4 rounded-2xl text-base transition disabled:opacity-60`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Delete */}
        <button
          onClick={handleDelete}
          className="w-full flex items-center justify-center gap-2 min-h-[44px] py-3 text-red-400 text-sm active:opacity-60"
        >
          <Trash2 className="w-4 h-4" />
          מחק עבודה
        </button>
      </div>
    </AppShell>
  );
}
