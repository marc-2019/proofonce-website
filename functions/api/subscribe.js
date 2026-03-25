/**
 * CF Pages Function: POST /api/subscribe
 *
 * Validates an email address and stores it as a lead in the CortexForge
 * Context Store. Set CORTEXFORGE_URL in the CF Pages environment variables
 * to point at your publicly-accessible CortexForge instance.
 *
 * Required env var:
 *   CORTEXFORGE_URL  – base URL of CortexForge (e.g. https://cortex.example.com)
 *                      Falls back to http://localhost:28005 for local dev via
 *                      `wrangler pages dev`.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function onRequestPost(context) {
  const { request, env } = context;

  // Parse body
  let email;
  try {
    const body = await request.json();
    email = typeof body.email === 'string' ? body.email.trim() : '';
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  if (!EMAIL_RE.test(email)) {
    return json({ error: 'Invalid email address' }, 400);
  }

  // Forward to CortexForge Context Store
  const baseUrl = (env.CORTEXFORGE_URL || 'http://localhost:28005').replace(/\/$/, '');

  let cortexRes;
  try {
    cortexRes = await fetch(`${baseUrl}/context/discoveries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: 'lead',
        content: email,
        source: 'proofonce.com',
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (err) {
    console.error('[subscribe] CortexForge unreachable:', err.message);
    return json({ error: 'Could not store lead — backend unreachable' }, 502);
  }

  if (!cortexRes.ok) {
    const detail = await cortexRes.text().catch(() => '');
    console.error(`[subscribe] CortexForge returned ${cortexRes.status}: ${detail}`);
    return json({ error: `Backend error ${cortexRes.status}` }, 502);
  }

  return json({ ok: true });
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
