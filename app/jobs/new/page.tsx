"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import AppShell from "@/app/components/AppShell";
import PageHeader from "@/app/components/PageHeader";
import { createJob } from "@/services/jobs";
import { getCustomers } from "@/services/customers";
import { extractMessage } from "@/lib/error";
import type { Customer } from "@/types/database";

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

function NewJobForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      customer_id: searchParams.get("customer_id") ?? "",
      date: searchParams.get("date") ?? format(new Date(), "yyyy-MM-dd"),
    },
  });

  useEffect(() => {
    getCustomers()
      .then(setCustomers)
      .finally(() => setLoading(false));
  }, []);

  async function onSubmit(data: FormData) {
    setSaving(true);
    setError("");
    try {
      const job = await createJob({
        customer_id: data.customer_id,
        date: data.date,
        price: data.price,
        description: data.description,
        recurrence_days: data.recurrence_days ?? undefined,
      });
      router.push(`/jobs/${job.id}`);
    } catch (e: unknown) {
      setError(extractMessage(e) || "שגיאה בשמירה");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-center text-gray-400 py-20">טוען...</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-300 rounded-2xl px-4 py-3 text-red-700 text-sm font-medium">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">לקוח</label>
        <select
          {...register("customer_id")}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">בחר לקוח</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>
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

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-green-600 text-white font-semibold py-4 rounded-2xl text-base transition disabled:opacity-60"
      >
        {saving ? "שומר..." : "צור עבודה"}
      </button>
    </form>
  );
}

export default function NewJobPage() {
  return (
    <AppShell>
      <PageHeader title="עבודה חדשה" back />
      <Suspense fallback={<div className="text-center text-gray-400 py-20">טוען...</div>}>
        <NewJobForm />
      </Suspense>
    </AppShell>
  );
}
