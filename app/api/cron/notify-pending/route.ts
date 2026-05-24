import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { format, addDays } from "date-fns";
import { he } from "date-fns/locale";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function sendTelegram(text: string) {
  const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: process.env.TELEGRAM_CHAT_ID,
      text,
      parse_mode: "HTML",
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Telegram error: ${body}`);
  }
}

export async function GET(request: Request) {
  // Vercel automatically sends Authorization: Bearer <CRON_SECRET>
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  const todayStr  = format(today, "yyyy-MM-dd");
  const in7Days   = format(addDays(today, 7), "yyyy-MM-dd");

  const { data: jobs, error } = await supabaseAdmin()
    .from("jobs")
    .select("*, customer:customers(name, phone)")
    .eq("status", "pending")
    .gte("date", todayStr)
    .lte("date", in7Days)
    .order("date", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!jobs || jobs.length === 0) {
    await sendTelegram("✅ אין עבודות ממתינות ב-7 הימים הקרובים");
    return NextResponse.json({ sent: true, count: 0 });
  }

  // Group by date
  const byDate = new Map<string, typeof jobs>();
  for (const job of jobs) {
    const key = (job.date as string).slice(0, 10);
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key)!.push(job);
  }

  let msg = `📋 <b>עבודות ממתינות — 7 ימים קרובים</b>\n\n`;

  for (const [dateKey, dayJobs] of byDate) {
    const dateLabel = format(new Date(dateKey + "T12:00:00"), "EEEE, d בMMMM", { locale: he });
    msg += `📅 <b>${dateLabel}</b>\n`;
    for (const job of dayJobs) {
      const price = `₪${Number(job.price).toLocaleString("he-IL")}`;
      const name  = job.customer?.name ?? "לקוח";
      const desc  = job.description ? ` — ${job.description}` : "";
      msg += `  • ${name} · ${price}${desc}\n`;
    }
    msg += "\n";
  }

  const unpaidCount = jobs.filter((j) => !j.paid).length;
  msg += `סה"כ: <b>${jobs.length} עבודות</b>`;
  if (unpaidCount > 0) msg += ` · ${unpaidCount} לא שולמו`;

  await sendTelegram(msg);
  return NextResponse.json({ sent: true, count: jobs.length });
}
