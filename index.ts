// Supabase Edge Function "notify": sends a push notification to the agent's phone when a request is inserted.
import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";

const JOB: Record<string, string> = { deposit: "Deposit", withdraw: "Withdraw", airtime: "Airtime", gooddeal: "Good deal" };
const fmt = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

Deno.serve(async (req) => {
  if (req.headers.get("x-webhook-secret") !== Deno.env.get("WEBHOOK_SECRET")) {
    return new Response("Not allowed", { status: 401 });
  }
  const body = await req.json();
  const r = body.record;
  if (!r || r.status !== "pending") return new Response("skip");

  let job = JOB[r.job] ?? r.job;
  if (r.job === "float") job = r.details?.floatMode === "receive_from_client" ? "Float in" : "Float out";

  webpush.setVapidDetails(
    Deno.env.get("VAPID_SUBJECT")!,
    Deno.env.get("VAPID_PUBLIC_KEY")!,
    Deno.env.get("VAPID_PRIVATE_KEY")!,
  );
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: subs } = await sb.from("push_subscriptions").select("*");

  const payload = JSON.stringify({
    title: `${job} request · ${fmt(r.amt)} FCFA`,
    body: `${r.num}. Tap to open your desk.`,
    tag: `req-${r.id}`,
    url: "agent.html",
  });

  await Promise.all((subs ?? []).map(async (s) => {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload);
    } catch (e) {
      // 404 or 410 means the phone unsubscribed. Remove it so we stop trying.
      if (e.statusCode === 404 || e.statusCode === 410) await sb.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
      else console.error("push failed", e.statusCode, e.body);
    }
  }));
  return new Response("sent");
});
