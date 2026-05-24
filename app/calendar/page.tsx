"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import heLocale from "@fullcalendar/core/locales/he";
import type { EventClickArg } from "@fullcalendar/core";
import { Plus, LogOut } from "lucide-react";
import AppShell from "@/app/components/AppShell";
import { getJobs } from "@/services/jobs";
import { supabase } from "@/lib/supabase";
import type { Job } from "@/types/database";

const STATUS_COLORS = {
  pending: "#eab308",
  approved: "#3b82f6",
  completed: "#22c55e",
  cancelled: "#ef4444",
};

export default function CalendarPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const calendarRef = useRef<FullCalendar>(null);

  useEffect(() => {
    getJobs().then(setJobs).catch(console.error);
  }, []);

  const events = jobs.map((job) => ({
    id: job.id,
    title: job.customer?.name ?? "לקוח",
    date: job.date,
    backgroundColor: STATUS_COLORS[job.status],
    borderColor: STATUS_COLORS[job.status],
    textColor: "#fff",
    classNames: [`fc-event-${job.status}`],
    extendedProps: { job },
  }));

  function handleEventClick(info: EventClickArg) {
    router.push(`/jobs/${info.event.id}`);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <AppShell>
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center">
        <h1 className="flex-1 text-lg font-bold text-gray-800">יומן עבודות</h1>
        <button
          onClick={() => router.push("/jobs/new")}
          className="bg-green-600 text-white rounded-full p-2 ml-2 shadow"
          aria-label="עבודה חדשה"
        >
          <Plus className="w-5 h-5" />
        </button>
        <button
          onClick={handleLogout}
          className="p-2 text-gray-500"
          aria-label="יציאה"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      <div className="px-2 py-3">
        {/* Status legend */}
        <div className="flex gap-3 flex-wrap px-2 mb-3 text-xs">
          {[
            { label: "ממתין", color: "#eab308" },
            { label: "מאושר", color: "#3b82f6" },
            { label: "הושלם", color: "#22c55e" },
            { label: "בוטל", color: "#ef4444" },
          ].map(({ label, color }) => (
            <span key={label} className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: color }} />
              {label}
            </span>
          ))}
        </div>

        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={heLocale}
          direction="rtl"
          headerToolbar={{
            start: "next,prev today",
            center: "title",
            end: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          buttonText={{
            today: "היום",
            month: "חודש",
            week: "שבוע",
            day: "יום",
          }}
          events={events}
          eventClick={handleEventClick}
          height="auto"
          eventDisplay="block"
          dayMaxEvents={3}
        />
      </div>
    </AppShell>
  );
}
