// Cloudflare Pages Function — POST /api/waitlist
//
// Replaces the mailto-only notify CTA with a real backend. Receives the
// email + optional source label, validates, and forwards to Instilligent
// via the Resend API. Degrades to 503 until RESEND_API_KEY is configured
// (never fakes success — the 2026-04-30 recall removed the old form
// precisely because it silently discarded submissions).
//
// REQUIRED CLOUDFLARE PAGES ENV VARS:
//   RESEND_API_KEY  — Instilligent Resend key (instilligent.com verified).
//                     proofonce-website → Settings → Environment variables
//                     → Production. (Encrypted)
// OPTIONAL:
//   WAITLIST_TO     — recipient (default: info@instilligent.com)
//   WAITLIST_FROM   — from header (default: ProofOnce Waitlist
//                                  <noreply@instilligent.com>)

interface Env {
  RESEND_API_KEY?: string;
  WAITLIST_TO?: string;
  WAITLIST_FROM?: string;
}

interface WaitlistPayload {
  email?: unknown;
  source?: unknown;   // 'hero' | 'cta' | unknown — for analytics
  website?: unknown;  // honeypot — bots fill it, humans don't see it
}

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });

const isString = (v: unknown): v is string => typeof v === "string";
const trim = (v: unknown): string => (isString(v) ? v.trim() : "");

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let payload: WaitlistPayload;
  try {
    payload = (await request.json()) as WaitlistPayload;
  } catch {
    return json(400, { error: "Invalid JSON body" });
  }

  // Honeypot — silently succeed on bot submissions.
  if (trim(payload.website)) {
    return json(200, { ok: true });
  }

  const email = trim(payload.email);
  const source = trim(payload.source) || "unknown";

  if (!email) {
    return json(400, { error: "email is required" });
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json(400, { error: "invalid email" });
  }
  if (email.length > 320 || source.length > 50) {
    return json(400, { error: "field too long" });
  }

  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) {
    return json(503, { error: "waitlist service is not configured" });
  }

  const to = env.WAITLIST_TO || "info@instilligent.com";
  const from = env.WAITLIST_FROM || "ProofOnce Waitlist <noreply@instilligent.com>";

  const subject = `ProofOnce waitlist signup: ${email}`;
  const body =
    `New ProofOnce waitlist signup\n` +
    `\n` +
    `Email:  ${email}\n` +
    `Source: ${source} (form id on the site)\n` +
    `IP:     ${request.headers.get("CF-Connecting-IP") || "unknown"}\n` +
    `UA:     ${(request.headers.get("User-Agent") || "").slice(0, 200)}\n` +
    `Ref:    ${request.headers.get("Referer") || "(none)"}\n` +
    `\n` +
    `--\n` +
    `Sent from proofonce.com /api/waitlist Pages Function.\n` +
    `Reply directly to add this person to your waitlist record.\n`;

  let resendResp: Response;
  try {
    resendResp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [to], reply_to: email, subject, text: body }),
    });
  } catch (err) {
    return json(502, { error: "upstream send failed", detail: String(err).slice(0, 200) });
  }

  if (!resendResp.ok) {
    const detail = await resendResp.text().catch(() => "");
    return json(502, { error: "send failed", status: resendResp.status, detail: detail.slice(0, 300) });
  }

  return json(200, { ok: true });
};

export const onRequestOptions: PagesFunction = async () =>
  new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });

export const onRequest: PagesFunction = async () =>
  new Response("Method Not Allowed", { status: 405, headers: { Allow: "POST, OPTIONS" } });
