"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import AppShell from "@/app/components/AppShell";
import PageHeader from "@/app/components/PageHeader";
import { getJob, updateJob } from "@/services/jobs";
import { getCustomers } from "@/services/customers";
import type { Customer, Job } from "@/types/database";

const schema = z.object({
  customer_id: z.string().min(1, "בחר לקוח"),
  date: z.string().min(1, "בחר תאריך"),
  price: z.coerce.number().min(0, "מחיר חייב להיות חיובי"),
  description: z.string().optional(),
  recurrence_days: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : Number(v)),
    z.number().int().min(1, "חייב להיות לפחות יום אחד").nullable()
  ),
});

type FormData = z.infer<typeof schema>;

export default function EditJobPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    Promise.all([getJob(id), getCustomers()]).then(([j, c]) => {
      setJob(j);
      setCustomers(c);
      reset({
        customer_id: j.customer_id,
        date: format(new Date(j.date), "yyyy-MM-dd"),
        price: j.price,
        description: j.description ?? "",
        recurrence_days: j.recurrence_days ?? undefined,
      });
    }).finally(() => setLoading(false));
  }, [id, reset]);

  async function onSubmit(data: FormData) {
    if (!job) return;
    setSaving(true);
    setError("");
    try {
      await updateJob(id, {
        customer_id: data.customer_id,
        date: data.date,
        price: data.price,
        description: data.description || null,
        recurrence_days: data.recurrence_days ?? null,
      });
      router.back();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg || "שגיאה בשמירה");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AppShell>
        <PageHeader title="עריכת עבודה" back />
        <div className="text-center text-gray-400 py-20">טוען...</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader title="עריכת עבודה" back />
      <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">לקוח</label>
          <select
            {...register("customer_id")}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">בחר לקוח</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {errors.customer_id && <p className="text-red-500 text-xs mt-1">{errors.customer_id.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">תאריך</label>
          <input
            type="date"
            {...register("date")}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">מחיר (₪)</label>
          <input
            type="number"
            inputMode="decimal"
            {...register("price")}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="0"
          />
          {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">תיאור</label>
          <textarea
            {...register("description")}
            rows={3}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            placeholder="פרטים על העבודה..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            חזרה כל X ימים (ריק = לא חוזר)
          </label>
          <input
            type="number"
            inputMode="numeric"
            {...register("recurrence_days")}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="לדוגמה: 7, 14, 30"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-xl">{error}</p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-green-600 text-white font-semibold py-4 rounded-2xl text-base transition disabled:opacity-60"
        >
          {saving ? "שומר..." : "שמור שינויים"}
        </button>
      </form>
    </AppShell>
  );
}
