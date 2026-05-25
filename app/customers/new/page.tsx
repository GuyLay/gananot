"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookUser } from "lucide-react";
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

  function normalizePhone(raw: string): string {
    const s = raw.replace(/\s/g, "");
    // +972XXXXXXXXX → 0XXXXXXXXX
    if (s.startsWith("+972")) return "0" + s.slice(4);
    // 972XXXXXXXXX (no plus) → 0XXXXXXXXX
    if (s.startsWith("972") && s.length >= 11) return "0" + s.slice(3);
    // 9 bare digits like 544381584 → 0544381584
    if (/^\d{9}$/.test(s)) return "0" + s;
    return raw;
  }

  async function pickContact() {
    // Contact Picker API — supported on iOS Safari 14.5+ and Android Chrome
    if (!("contacts" in navigator)) return;
    try {
      // @ts-expect-error contacts API not yet in TS lib
      const results = await navigator.contacts.select(["name", "tel"], { multiple: false });
      if (!results.length) return;
      const contact = results[0];
      if (contact.tel?.[0]) setPhone(normalizePhone(contact.tel[0]));
      if (!name.trim() && contact.name?.[0]) setName(contact.name[0]);
    } catch {
      // user dismissed or permission denied — do nothing
    }
  }

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
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="050-0000000"
            />
            {"contacts" in navigator && (
              <button
                type="button"
                onClick={pickContact}
                className="flex items-center gap-1.5 px-4 py-3 bg-gray-100 border border-gray-300 rounded-xl text-sm text-gray-600 font-medium active:opacity-70 whitespace-nowrap"
              >
                <BookUser className="w-4 h-4" />
                אנשי קשר
              </button>
            )}
          </div>
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
