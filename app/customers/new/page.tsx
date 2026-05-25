"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/app/components/AppShell";
import PageHeader from "@/app/components/PageHeader";
import { createCustomer } from "@/services/customers";
import { extractMessage } from "@/lib/error";

export default function NewCustomerPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!name.trim() || !phone.trim()) return;
    setSaving(true);
    setError("");
    try {
      await createCustomer(name.trim(), phone.trim(), address.trim());
      router.push("/customers");
    } catch (e: unknown) {
      setError(extractMessage(e) || "שגיאה בשמירה");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <PageHeader title="לקוח חדש" back />

      <div className="p-4 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-300 rounded-2xl px-4 py-3 text-red-700 text-sm font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">שם</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="שם הלקוח"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">טלפון</label>
          {/* iOS shows "AutoFill Contact" above the keyboard natively for tel inputs */}
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="050-0000000"
            autoComplete="tel"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            כתובת <span className="text-gray-400 font-normal">(אופציונלי)</span>
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="רחוב, עיר"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !name.trim() || !phone.trim()}
          className="w-full bg-green-600 text-white font-semibold py-4 rounded-2xl text-base disabled:opacity-60"
        >
          {saving ? "שומר..." : "צור לקוח"}
        </button>
      </div>
    </AppShell>
  );
}
