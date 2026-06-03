import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function reply(chat_id: string | number, text: string) {
  await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id, text }),
    }
  );
}

export async function POST(request: Request) {
  // Verify request comes from Telegram
  const secret = request.headers.get("x-telegram-bot-api-secret-token");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const message = body?.message;
  if (!message) return NextResponse.json({ ok: true });

  const chat_id = String(message.chat?.id);
  const text = message.text ?? "";
  const first_name = message.from?.first_name ?? null;
  const username = message.from?.username ?? null;

  const db = supabaseAdmin();

  if (text.startsWith("/start")) {
    await db.from("telegram_subscribers").upsert({ chat_id, first_name, username });
    await reply(chat_id, "נרשמת בהצלחה! 🎉\nתקבל עדכונים יומיים על עבודות ממתינות.\n\nלהסרה שלח /stop");
  } else if (text.startsWith("/stop")) {
    await db.from("telegram_subscribers").delete().eq("chat_id", chat_id);
    await reply(chat_id, "הוסרת מרשימת העדכונים. 👋\nלהרשמה מחדש שלח /start");
  }

  return NextResponse.json({ ok: true });
}
