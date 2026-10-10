// Cloudflare Pages middleware: stop repo-only files leaking from the publish root.
//
// This site deploys the repository root as its static asset directory, so
// dotfiles, docs, tests and internal registers were publicly downloadable.
// Pages `_redirects` cannot 404-rewrite ("Rewrites (other status codes)" are
// unsupported), so a real 404 needs a Function.
//
// `_routes.json` includes "/*" (only known-public static assets are excluded),
// so percent-encoded variants such as /%2egitignore always reach this code.
// The path is decoded repeatedly until it stops changing, lower-cased, and
// each segment loses ';' parameters plus trailing dots and spaces. Dot
// segments are normalised BEFORE matching. A basename that starts with
// "marketing-truths" or another blocked file name is blocked too. A hit
// returns 404.
//
// Asserted by tests/smoke_site.mjs (loads normalizePath / isBlocked without
// a TypeScript import, so plain `node --test` works on Node 22.14).

/** Top-level directories that must never be served. */
const BLOCKED_DIRS: string[] = ["docs", "tests", "scripts", "tools", "functions", "marketing-audits"];

/** Exact files (lower-case, normalised) that must never be served. */
const BLOCKED_FILES: string[] = ["/marketing-truths.json", "/_routes.json", "/_redirects", "/_headers", "/package.json", "/package-lock.json"];

/** Drop ';' path-params, then trailing dots and spaces. `..` is left intact. */
function cleanSegment(seg: string): string {
  const semi = seg.indexOf(";");
  if (semi >= 0) seg = seg.slice(0, semi);
  seg = seg.replace(/ +$/g, "");
  if (seg === "." || seg === "..") return seg;
  return seg.replace(/[. ]+$/g, "");
}

export function normalizePath(pathname: string): string {
  let p = pathname;
  for (let i = 0; i < 10; i++) {
    let d: string;
    try {
      d = decodeURIComponent(p);
    } catch {
      break;
    }
    if (d === p) break;
    p = d;
  }
  p = p.replace(/\\/g, "/").toLowerCase();
  const out: string[] = [];
  for (const raw of p.split("/")) {
    const seg = cleanSegment(raw);
    if (seg === "" || seg === ".") continue;
    if (seg === "..") {
      out.pop();
      continue;
    }
    out.push(seg);
  }
  return "/" + out.join("/");
}

export function isBlocked(pathname: string): boolean {
  const n = normalizePath(pathname);
  const segs = n.split("/").filter(Boolean);
  // Any dot-segment (dotfile or dot-directory) except /.well-known/.
  if (segs.some((s) => s.startsWith(".") && s !== ".well-known")) return true;
  if (segs.length > 0 && BLOCKED_DIRS.includes(segs[0])) return true;
  if (BLOCKED_FILES.includes(n)) return true;
  const base = segs.length > 0 ? segs[segs.length - 1] : "";
  if (base.startsWith("marketing-truths")) return true;
  if (BLOCKED_FILES.some((f) => base.startsWith(f.slice(1)))) return true;
  // Markdown is never a public page on this site.
  if (n.endsWith(".md")) return true;
  return false;
}

interface Env {
  ASSETS: { fetch: (input: Request | string) => Promise<Response> };
}

export const onRequest = async (ctx: {
  request: Request;
  next: () => Promise<Response>;
  env: Env;
}): Promise<Response> => {
  const { request, next } = ctx;
  if (!isBlocked(new URL(request.url).pathname)) {
    return next();
  }
  return new Response("Not Found", {
    status: 404,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Robots-Tag": "noindex",
      "Cache-Control": "no-store",
    },
  });
};
