"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Phone, Plus, Edit } from "lucide-react";
import AppShell from "@/app/components/AppShell";
import PageHeader from "@/app/components/PageHeader";
import StatusBadge from "@/app/components/StatusBadge";
import { getCustomer, updateCustomer } from "@/services/customers";
import { getJobsByCustomer } from "@/services/jobs";
import { extractMessage } from "@/lib/error";
import type { Customer, Job } from "@/types/database";

export default function CustomerDetailsPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    setLoadError(null);
    Promise.all([getCustomer(id), getJobsByCustomer(id)])
      .then(([c, j]) => {
        setCustomer(c);
        setJobs(j);
        setName(c.name);
        setPhone(c.phone);
      })
      .catch((e: unknown) => {
        setLoadError(extractMessage(e) || "שגיאה בטעינת פרטי לקוח");
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSave() {
    if (!name.trim() || !phone.trim()) return;
    setSaving(true);
    setSaveError("");
    try {
      const updated = await updateCustomer(id, name.trim(), phone.trim());
      setCustomer(updated);
      setShowEdit(false);
    } catch (e: unknown) {
      setSaveError(extractMessage(e) || "שגיאה בשמירה");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <PageHeader title="פרטי לקוח" back />
        <div className="text-center text-gray-400 py-20">טוען...</div>
      </AppShell>
    );
  }

  if (loadError || !customer) {
    return (
      <AppShell>
        <PageHeader title="פרטי לקוח" back />
        <div className="p-6 text-center space-y-3">
          <p className="text-red-500 text-base">{loadError ?? "הלקוח לא נמצא"}</p>
          <button
            onClick={() => router.back()}
            className="text-green-600 font-semibold underline"
          >
            חזור
          </button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="פרטי לקוח"
        back
        action={
          <button onClick={() => setShowEdit(true)} className="p-2 text-gray-500">
            <Edit className="w-5 h-5" />
          </button>
        }
      />

      <div className="p-4 space-y-4">
        {/* Customer info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-2">
          <h2 className="text-xl font-bold text-gray-800">{customer.name}</h2>
          <a
            href={`tel:${customer.phone}`}
            className="flex items-center gap-2 text-blue-600 text-base"
          >
            <Phone className="w-5 h-5" />
            {customer.phone}
          </a>
        </div>

        {/* Add job button */}
        <button
          onClick={() => router.push(`/jobs/new?customer_id=${customer.id}`)}
          className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-semibold py-3.5 rounded-2xl"
        >
          <Plus className="w-5 h-5" />
          עבודה חדשה
        </button>

        {/* Jobs list */}
        <div>
          <h3 className="font-semibold text-gray-600 mb-2 text-sm">
            עבודות ({jobs.length})
          </h3>
          {jobs.length === 0 && (
            <div className="text-center text-gray-400 py-8">אין עבודות עדיין</div>
          )}
          <div className="space-y-2">
            {jobs.map((job) => (
              <button
                key={job.id}
                onClick={() => router.push(`/jobs/${job.id}`)}
                className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-right flex flex-col gap-1 active:scale-[0.98] transition-transform"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {format(new Date(job.date), "d בMMM yyyy", { locale: he })}
                  </span>
                  <StatusBadge status={job.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-green-700 font-bold">₪{job.price.toLocaleString()}</span>
                  {job.description && (
                    <span className="text-gray-500 text-sm line-clamp-1">{job.description}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Edit modal */}
      {showEdit && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end"
          onClick={() => setShowEdit(false)}
        >
          <div
            className="bg-white w-full rounded-t-3xl p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto -mt-2 mb-2" />
            <h2 className="text-xl font-bold text-gray-800">עריכת לקוח</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">שם</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">טלפון</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {saveError && (
              <p className="text-red-600 text-sm bg-red-50 border border-red-200 px-3 py-2 rounded-xl">
                {saveError}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowEdit(false)}
                className="flex-1 border border-gray-300 text-gray-700 font-semibold py-4 rounded-xl text-base"
              >
                ביטול
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-green-600 text-white font-semibold py-4 rounded-xl text-base disabled:opacity-60"
              >
                {saving ? "שומר..." : "שמור"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
