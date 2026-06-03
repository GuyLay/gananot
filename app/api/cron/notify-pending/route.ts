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

// Business days = Sunday (0) through Thursday (4). Skip Friday (5) and Saturday (6).
function getNext4BusinessDays(from: Date): Date[] {
  const result: Date[] = [];
  let cursor = addDays(from, 1);
  while (result.length < 4) {
    if (cursor.getDay() !== 5 && cursor.getDay() !== 6) {
      result.push(new Date(cursor));
    }
    cursor = addDays(cursor, 1);
  }
  return result;
}

async function sendTelegramToAll(text: string) {
  const { data: subscribers } = await supabaseAdmin()
    .from("telegram_subscribers")
    .select("chat_id");

  const chatIds = subscribers?.map((s) => s.chat_id) ?? [];
  if (chatIds.length === 0) return;

  await Promise.all(
    chatIds.map(async (chat_id) => {
      const res = await fetch(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id, text, parse_mode: "HTML" }),
        }
      );
      if (!res.ok) console.error(`Telegram error for ${chat_id}: ${await res.text()}`);
    })
  );
}

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  const businessDays = getNext4BusinessDays(today);
  const dateStrings = businessDays.map((d) => format(d, "yyyy-MM-dd"));

  const { data: jobs, error } = await supabaseAdmin()
    .from("jobs")
    .select("*, customer:customers(name, phone)")
    .eq("status", "pending")
    .in("date", dateStrings)
    .order("date", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!jobs || jobs.length === 0) {
    await sendTelegramToAll("בוקר טוב! ☀️\n\nאין עבודות ממתינות בארבעת ימי העסקים הבאים ✅");
    return NextResponse.json({ sent: true, count: 0 });
  }

  // Group by date key
  const byDate = new Map<string, typeof jobs>();
  for (const d of dateStrings) byDate.set(d, []);
  for (const job of jobs) {
    const key = (job.date as string).slice(0, 10);
    byDate.get(key)?.push(job);
  }

  let msg = `בוקר טוב! ☀️\n\n`;
  msg += `יש לך ${jobs.length} עבודות ממתינות בארבעת ימי העסקים הבאים:\n`;

  for (const [dateKey, dayJobs] of byDate) {
    if (dayJobs.length === 0) continue;
    const dayName = format(new Date(dateKey + "T12:00:00"), "EEEE, d בMMMM", { locale: he });
    msg += `\n<b>${dayName}:</b>\n`;
    for (const job of dayJobs) {
      const name  = job.customer?.name  ?? "לקוח";
      const phone = job.customer?.phone ?? "";
      msg += `${name} - ${phone}\n`;
    }
  }

  msg += `\nאנא אשר את העבודות הבאות מול הלקוחות`;

  await sendTelegramToAll(msg);
  return NextResponse.json({ sent: true, count: jobs.length });
}
