"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Phone, ChevronLeft } from "lucide-react";
import AppShell from "@/app/components/AppShell";
import PageHeader from "@/app/components/PageHeader";
import { getCustomers, createCustomer, updateCustomer } from "@/services/customers";
import { extractMessage } from "@/lib/error";
import { useKeyboardOffset } from "@/hooks/useKeyboardOffset";
import type { Customer } from "@/types/database";

export default function CustomersPage() {
  const router = useRouter();
  const kbOffset = useKeyboardOffset();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getCustomers().then(setCustomers).catch(() => setError("שגיאה בטעינת לקוחות"));
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  function openAdd() {
    setEditCustomer(null);
    setName("");
    setPhone("");
    setError("");
    setShowForm(true);
  }

  function openEdit(c: Customer) {
    setEditCustomer(c);
    setName(c.name);
    setPhone(c.phone);
    setError("");
    setShowForm(true);
  }

  async function handleSave() {
    if (!name.trim() || !phone.trim()) return;
    setSaving(true);
    setError("");
    try {
      if (editCustomer) {
        const updated = await updateCustomer(editCustomer.id, name.trim(), phone.trim());
        setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      } else {
        const created = await createCustomer(name.trim(), phone.trim());
        setCustomers((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name, "he")));
      }
      setShowForm(false);
    } catch (e: unknown) {
      setError(extractMessage(e) || "שגיאה בשמירה");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="לקוחות"
        action={
          <button onClick={openAdd} className="bg-green-600 text-white rounded-full p-2 shadow">
            <Plus className="w-5 h-5" />
          </button>
        }
      />

      <div className="p-4 space-y-3">
        <div className="relative">
          <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חיפוש לפי שם או טלפון..."
            className="w-full border border-gray-300 rounded-xl pr-10 pl-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {filtered.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            {search ? "לא נמצאו לקוחות" : "אין לקוחות עדיין"}
          </div>
        )}

        {filtered.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 flex items-stretch overflow-hidden active:opacity-80 transition-opacity"
          >
            <div
              role="button"
              tabIndex={0}
              onClick={() => router.push(`/customers/${c.id}`)}
              onKeyDown={(e) => e.key === "Enter" && router.push(`/customers/${c.id}`)}
              className="flex-1 p-4 flex items-center gap-3 cursor-pointer"
            >
              <div className="flex-1 text-right">
                <div className="font-semibold text-gray-800 text-base">{c.name}</div>
                <div className="flex items-center gap-1 text-gray-500 text-sm mt-0.5">
                  <Phone className="w-4 h-4" />
                  {c.phone}
                </div>
              </div>
              <ChevronLeft className="w-4 h-4 text-gray-300 flex-shrink-0" />
            </div>
            <button
              onClick={() => openEdit(c)}
              className="px-4 text-sm text-blue-600 font-medium border-r border-gray-100 bg-blue-50 active:bg-blue-100"
            >
              עריכה
            </button>
          </div>
        ))}
      </div>

      {showForm && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end"
          style={{ paddingBottom: kbOffset }}
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-white w-full rounded-t-3xl p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] space-y-4 overflow-y-auto"
            style={{ maxHeight: `calc(100dvh - ${kbOffset}px - 24px)` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto -mt-2 mb-2" />

            <h2 className="text-xl font-bold text-gray-800">
              {editCustomer ? "עריכת לקוח" : "לקוח חדש"}
            </h2>

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
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="050-0000000"
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-xl">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 border border-gray-300 text-gray-700 font-semibold py-4 rounded-xl text-base"
              >
                ביטול
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !name.trim() || !phone.trim()}
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
