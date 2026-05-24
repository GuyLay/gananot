"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek, isSameMonth, isSameDay, isToday,
  addMonths, subMonths,
} from "date-fns";
import { he } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus, LogOut } from "lucide-react";
import AppShell from "@/app/components/AppShell";
import StatusBadge from "@/app/components/StatusBadge";
import { getJobs } from "@/services/jobs";
import { supabase } from "@/lib/supabase";
import type { Job } from "@/types/database";

const STATUS_DOT: Record<string, string> = {
  pending:   "#f59e0b",
  approved:  "#3b82f6",
  completed: "#22c55e",
  cancelled: "#ef4444",
};

// Sunday–Saturday in Hebrew abbreviations
const WEEK_DAYS = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];

export default function CalendarPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [month, setMonth] = useState(() => new Date());
  const [selected, setSelected] = useState<Date>(() => new Date());

  useEffect(() => {
    getJobs().then(setJobs).catch(console.error);
  }, []);

  const monthStart = startOfMonth(month);
  const monthEnd   = endOfMonth(month);
  const gridStart  = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd    = endOfWeek(monthEnd,     { weekStartsOn: 0 });
  const days       = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const byDate: Record<string, Job[]> = {};
  for (const job of jobs) {
    const key = job.date.slice(0, 10);
    (byDate[key] ??= []).push(job);
  }

  const selectedKey  = format(selected, "yyyy-MM-dd");
  const selectedJobs = byDate[selectedKey] ?? [];

  function selectDay(day: Date) {
    setSelected(day);
    if (!isSameMonth(day, month)) setMonth(day);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <AppShell>
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-2 flex items-center min-h-[52px]">
        <h1 className="flex-1 text-lg font-bold text-gray-800">יומן עבודות</h1>
        <button
          onClick={() => router.push(`/jobs/new?date=${selectedKey}`)}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center bg-green-600 text-white rounded-full shadow active:opacity-80 ml-1"
          aria-label="עבודה חדשה"
        >
          <Plus className="w-5 h-5" />
        </button>
        <button
          onClick={handleLogout}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 active:opacity-60"
          aria-label="יציאה"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* ── Calendar card ── */}
      <div className="bg-white shadow-sm">

        {/* Month navigation — in RTL flex: first child = right side, last child = left side */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          {/* RIGHT: next month */}
          <button
            onClick={() => setMonth(m => addMonths(m, 1))}
            className="w-10 h-10 flex items-center justify-center rounded-full active:bg-gray-100"
          >
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </button>

          <div className="text-center">
            <p className="text-base font-bold text-gray-900">
              {format(month, "MMMM", { locale: he })}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{format(month, "yyyy")}</p>
          </div>

          {/* LEFT: prev month */}
          <button
            onClick={() => setMonth(m => subMonths(m, 1))}
            className="w-10 h-10 flex items-center justify-center rounded-full active:bg-gray-100"
          >
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Week-day headers (RTL grid: Sun on right, Sat on left) */}
        <div className="grid grid-cols-7 px-3 pb-1">
          {WEEK_DAYS.map(d => (
            <div key={d} className="text-center text-[11px] font-medium text-gray-400 py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 px-3 pb-3 gap-y-1">
          {days.map(day => {
            const key     = format(day, "yyyy-MM-dd");
            const dayJobs = byDate[key] ?? [];
            const inMonth = isSameMonth(day, month);
            const isSel   = isSameDay(day, selected);
            const isCur   = isToday(day);

            return (
              <button
                key={key}
                onClick={() => selectDay(day)}
                className={[
                  "flex flex-col items-center py-1.5 rounded-xl transition-colors active:scale-95",
                  isSel
                    ? "bg-green-600"
                    : isCur
                    ? "bg-green-50 ring-1 ring-green-300"
                    : "active:bg-gray-100",
                ].join(" ")}
              >
                <span
                  className={[
                    "text-sm font-semibold leading-none mb-1.5",
                    isSel
                      ? "text-white"
                      : isCur
                      ? "text-green-600"
                      : inMonth
                      ? "text-gray-800"
                      : "text-gray-300",
                  ].join(" ")}
                >
                  {format(day, "d")}
                </span>

                {/* Status dots — up to 3 */}
                <div className="flex gap-[3px] h-[6px] items-center">
                  {dayJobs.slice(0, 3).map((j, i) => (
                    <span
                      key={i}
                      className="w-[5px] h-[5px] rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: isSel
                          ? "rgba(255,255,255,0.75)"
                          : STATUS_DOT[j.status],
                      }}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* Status legend */}
        <div className="flex justify-center gap-5 py-2.5 border-t border-gray-100 text-[11px] text-gray-400">
          {[
            { label: "ממתין",  color: "#f59e0b" },
            { label: "מאושר",  color: "#3b82f6" },
            { label: "הושלם",  color: "#22c55e" },
            { label: "בוטל",   color: "#ef4444" },
          ].map(({ label, color }) => (
            <span key={label} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Day detail ── */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isToday(selected) && (
              <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                היום
              </span>
            )}
          </div>
          <h2 className="text-base font-bold text-gray-700">
            {format(selected, "EEEE, d בMMMM", { locale: he })}
          </h2>
        </div>

        {selectedJobs.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">אין עבודות ביום זה</p>
        ) : (
          selectedJobs.map(job => (
            <button
              key={job.id}
              onClick={() => router.push(`/jobs/${job.id}`)}
              className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 text-right flex flex-col gap-1.5 active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center justify-between">
                <StatusBadge status={job.status} />
                <span className="font-bold text-gray-800 text-base">{job.customer?.name}</span>
              </div>
              {(job.price > 0 || job.description) && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-green-700 font-semibold text-sm">
                    ₪{job.price.toLocaleString()}
                  </span>
                  {job.description && (
                    <span className="text-gray-500 text-sm line-clamp-1 text-right flex-1">
                      {job.description}
                    </span>
                  )}
                </div>
              )}
            </button>
          ))
        )}

        <button
          onClick={() => router.push(`/jobs/new?date=${selectedKey}`)}
          className="w-full border-2 border-dashed border-gray-200 rounded-2xl py-3.5 text-gray-400 text-sm active:border-green-300 active:text-green-500 transition-colors"
        >
          + הוסף עבודה ביום זה
        </button>
      </div>
    </AppShell>
  );
}
