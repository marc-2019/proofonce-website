# ProofOnce — Nemo Build Plan (2026-07-08)

Companion to `proofonce-product-design-2026-07-08.md`. That doc says WHAT; this doc
says HOW the CortexForge engine builds it.

**Engine constraint this plan is shaped around (proven 2026-07-08):** the local
engine (Nemo) reliably ships **one-file additive increments with concrete EDPs**;
multi-file features bounce. Therefore:

1. **Phase 0 (Fable/human session) builds the entire skeleton**, including **stub
   files for every file the increment table names**, each wired into `index.ts` and
   each with a passing placeholder test. Every subsequent increment is then an
   *edit to existing files* — this deliberately sidesteps the engine's known
   new-file capability gap.
2. Every increment lists its **exact EDP** (1 implementation file + its test file,
   occasionally a migration `.sql`), a one-sentence spec, an acceptance check, and
   dependencies. Increments are independently committable and testable.
3. Migrations are **additive-only** (`CREATE TABLE` / `CREATE INDEX` / `ADD COLUMN`
   / seed `INSERT`) — this keeps them out of the destructive-SQL TIER-A class by
   content-gated detection. Any migration needing `DROP`/`GRANT`/`REVOKE`/triggers
   is a Marc-gated exception, not an engine task.

---

## 1. Phase 0 — Repo scaffold (Fable/human session, NOT engine work)

### 1.0 Repo decision (Marc-gated)

New repo **`proofonce`** at `/home/marc/projects/proofonce` (app), keeping
`proofonce-website` as the marketing site. **Creating the GitHub remote is an
irreversible remote action → requires explicit Marc-yes** (pre-action rule:
"Any irreversible action on a remote (… repo create …)"). Local scaffold can be
built and committed locally ahead of that decision.

### 1.1 Stack (mirrors BossBoard's proven conventions)

| Layer | Choice | Provenance |
|---|---|---|
| Runtime | Node 20+, TypeScript strict | bossboard `apps/api` |
| Framework | Express 4 + zod + helmet + express-rate-limit | bossboard `apps/api/package.json` |
| DB | PostgreSQL 16, `pg` pool, raw SQL | bossboard |
| Auth | bcryptjs + jsonwebtoken (JWT access/refresh) | bossboard `middleware/auth.ts`, `routes/auth.ts` |
| Tests | jest + ts-jest + supertest | bossboard |
| Files | multer, disk storage outside web root | bossboard `routes/photos.ts` |
| Email | Resend, hard allowlist in non-prod | bossboard `services/email.ts` + CF outbound-allowlist rule |
| Billing | Stripe Checkout + webhook | bossboard `services/stripe.ts` (metadata key: `proofonce_user_id`) |
| Analytics | GA4 Measurement Protocol, server-side | bossboard `checkout_completed` pattern (commit ad88515) |
| Cron | node-cron | bossboard `services/cron.ts` |
| Deploy | Railway (`railway.toml`, `Dockerfile`) | bossboard `Dockerfile.api` / `railway.toml` |
| Public pages | Server-rendered HTML from template functions in TS | bossboard `routes/public.ts` (one-file friendly by design) |

**Simplification vs BossBoard:** single package, **no npm workspaces, no mobile app,
no Redis** in v1. Less structure = fewer files per feature = better engine fit.

### 1.2 Migration runner — carry the cwd fix verbatim

`src/services/migrate.ts` is copied from BossBoard **including commit `a43f5be`**
(`fix(api): migration runner resolves database/ dir robustly, fails loud`, branch
`fix/migrations-dir-resolution`): a `resolveMigrationsDir(cwd)` export that tries
`cwd/database` then `cwd/../../database`, logs the resolved dir, and **throws
instead of silently skipping** when neither exists. Root cause it prevents: in the
Docker image (WORKDIR under `/app/...`) the cwd-only resolution found nothing and
the runner reported "already up to date" having applied nothing — a prod-only
silent failure. For ProofOnce's flat layout the candidates are `cwd/database` and
`cwd/../database`; keep the throw-loud behaviour and the exported-for-tests shape.
Per-migration transactions + `_migrations` tracking table as in BossBoard. Keep
`init.sql` free of unguarded `CREATE TRIGGER`/seed users (the pre-deploy trap noted
in that commit).

### 1.3 Ports (avoid collisions; record in PORTS.md)

CF owns 28000–28099; BossBoard owns 29000–29099 (+29379/29432). ProofOnce takes
**29100–29199**: API **29100**, Postgres **29132**. No Redis.

### 1.4 Repo layout (Phase 0 creates ALL of this, stubs included)

```
proofonce/
├── src/
│   ├── index.ts                    # express app, route mounting, startServer
│   ├── config/index.ts             # env parsing (zod), DATABASE_URL, JWT secrets, BETA_MODE
│   ├── db.ts                       # pg pool singleton
│   ├── services/
│   │   ├── migrate.ts              # REAL (BossBoard + a43f5be fix, adapted candidates)
│   │   ├── password.ts             # stub
│   │   ├── tokens.ts               # stub
│   │   ├── hash.ts                 # stub
│   │   ├── credential-types.ts     # stub
│   │   ├── verifications.ts        # stub
│   │   ├── proof-status.ts         # stub
│   │   ├── claim-language.ts       # stub
│   │   ├── shares.ts               # stub
│   │   ├── email.ts                # stub (allowlist scaffolded)
│   │   ├── cron.ts                 # stub (registered, no jobs)
│   │   ├── analytics.ts            # stub
│   │   └── stripe.ts               # stub
│   ├── routes/
│   │   ├── health.ts               # REAL (GET /health)
│   │   ├── auth.ts                 # stub (mounted, returns 501)
│   │   ├── users.ts                # stub
│   │   ├── credentials.ts          # stub
│   │   ├── documents.ts            # stub
│   │   ├── verifications.ts        # stub
│   │   ├── shares.ts               # stub
│   │   ├── billing.ts              # stub
│   │   └── public.ts               # stub
│   ├── middleware/
│   │   ├── auth.ts                 # stub
│   │   ├── operator.ts             # stub
│   │   └── plan.ts                 # stub
│   ├── pages/
│   │   └── proof-page.ts           # stub (HTML template fn)
│   └── __tests__/                  # one placeholder test per stub, all passing
│       ├── health.test.ts          # REAL
│       ├── migrate.test.ts         # REAL (resolveMigrationsDir unit tests)
│       └── ... (one per stub file, `describe.todo`-style placeholder)
├── database/
│   ├── init.sql                    # extensions + _migrations bootstrap comment only
│   └── migrations/                 # empty; engine adds 001..N
├── uploads/                        # gitignored, outside any static-serving path
├── docs/product/                   # symlink-free copies/pointers to these two docs
├── marketing-truths.json           # seeded day one (see §3.2)
├── .git-hooks/                     # vendored marketing-truth hook + brand-name-dictionary
│                                   #   (install via ~/cf-research/marketing-truth-hook/install.sh)
├── llms.txt / PORTS.md / README.md / CLAUDE.md (project brain, seeded from design doc)
├── .env.example / .gitignore
├── docker-compose.yml              # proofonce-postgres:29132 only
├── Dockerfile                      # mirror Dockerfile.api; WORKDIR note ties to §1.2
├── railway.toml
├── package.json / tsconfig.json / jest.config.js / eslint.config.mjs
└── .github/workflows/test.yml      # npm ci && npm test on PR/push
```

**Stub contract (what makes increments engine-safe):** every stub compiles, is
mounted/exported, returns 501 (routes) or throws `NotImplemented` (services), and
has a placeholder test asserting exactly that. An increment's acceptance is
"placeholder test replaced by real tests; suite green."

**Phase 0 exit checklist:** `npm test` green (health + migrate real tests, all
placeholders passing) · `docker compose up -d && npm run dev` serves `/health` ·
migration runner applies zero migrations loudly-correctly · git hooks installed ·
GA4 property decision recorded in `.env.example` (`GA4_MEASUREMENT_ID`,
`GA4_MP_API_SECRET`) · brand-name dictionary contains `ProofOnce` casing.

---

## 2. Increment table (engine work, in order)

Legend: **EDP** = exact file list Nemo may touch (tests included). All routes/
services/middleware files already exist as stubs. `NNN_*.sql` files are the only
new-file EDPs — additive-only SQL, the one new-file shape the engine handles when
the spec includes full file content; if migrations bounce in practice, pre-create
empty numbered files at Phase 0. "Deps" reference increment numbers.

### Phase 1 — Auth & accounts

| # | Title | Spec (one sentence) | EDP | Acceptance | Deps |
|---|---|---|---|---|---|
| 1 | Users migration | Create `users` (id uuid pk, email unique, password_hash, name, trade, business_name, nzbn, handle unique nullable, role default 'user', plan default 'free', timestamps). | `database/migrations/001_users.sql`, `src/__tests__/migrations.test.ts` | Migration applies on fresh DB; test asserts columns via information_schema. | — |
| 2 | Password service | bcrypt hash/verify with cost 12 and a max-length guard. | `src/services/password.ts`, `src/__tests__/password.test.ts` | Round-trip + wrong-password + >72-byte input tests pass. | — |
| 3 | Token service | Sign/verify JWT access (15m) + refresh (30d) tokens with distinct secrets from config. | `src/services/tokens.ts`, `src/__tests__/tokens.test.ts` | Sign→verify round-trip; expired/garbage tokens rejected. | — |
| 4 | Register endpoint | `POST /api/v1/auth/register` validates with zod, hashes password, inserts user, returns tokens. | `src/routes/auth.ts`, `src/__tests__/auth.test.ts` | supertest: 201 + tokens; duplicate email 409; weak input 400. | 1,2,3 |
| 5 | Login + refresh | `POST /api/v1/auth/login` and `/refresh` issue new token pairs. | `src/routes/auth.ts`, `src/__tests__/auth.test.ts` | Valid login 200; bad creds 401 (no user-enumeration in message); refresh rotates. | 4 |
| 6 | Auth middleware | `authenticate` verifies Bearer access token and attaches `req.user`. | `src/middleware/auth.ts`, `src/__tests__/auth-middleware.test.ts` | 401 without/with-bad token; passes with good token. | 3 |
| 7 | Profile endpoints | `GET/PUT /api/v1/users/me` (name, trade, business_name, nzbn, handle with uniqueness check). | `src/routes/users.ts`, `src/__tests__/users.test.ts` | Get/update round-trip; handle collision 409; no email/role change via PUT. | 6 |

### Phase 2 — Credentials & documents

| # | Title | Spec | EDP | Acceptance | Deps |
|---|---|---|---|---|---|
| 8 | Credential type catalogue | Typed constant map of the 9 v1 credential types with `registerName`, `registerUrl`, `level1Checkable` flags per the design doc §5 table. | `src/services/credential-types.ts`, `src/__tests__/credential-types.test.ts` | Tests pin the exact type ids + checkable flags; unknown type lookup throws. | — |
| 9 | Credentials migration | Create `credentials` (id, user_id fk, type, label, identifier, issuer, expires_at, timestamps) + index on user_id. | `database/migrations/002_credentials.sql`, `src/__tests__/migrations.test.ts` | Applies cleanly; FK enforced. | 1 |
| 10 | Create credential | `POST /api/v1/credentials` zod-validated against the catalogue. | `src/routes/credentials.ts`, `src/__tests__/credentials.test.ts` | 201; unknown type 400; unauthenticated 401. | 6,8,9 |
| 11 | List/get credentials | `GET /api/v1/credentials` (owner-scoped) and `/:id` (404 for other users' rows). | `src/routes/credentials.ts`, `src/__tests__/credentials.test.ts` | Owner sees own only; cross-user access 404. | 10 |
| 12 | Update/delete credential | `PUT`/`DELETE /api/v1/credentials/:id`, delete cascades documents. | `src/routes/credentials.ts`, `src/__tests__/credentials.test.ts` | Update round-trip; delete removes rows + files. | 11,15 |
| 13 | Documents migration | Create `documents` (id, credential_id fk, sha256, mime, size_bytes, storage_path, discarded_at nullable, created_at). | `database/migrations/003_documents.sql`, `src/__tests__/migrations.test.ts` | Applies cleanly. | 9 |
| 14 | Hash service | Compute SHA-256 hex of a Buffer/stream. | `src/services/hash.ts`, `src/__tests__/hash.test.ts` | Known-vector test (empty + fixed string). | — |
| 15 | Document upload | `POST /api/v1/credentials/:id/documents` (multer, 10MB cap, pdf/jpg/png only, sha256 recorded at write). | `src/routes/documents.ts`, `src/__tests__/documents.test.ts` | Upload stores file under `uploads/`, row has correct hash; oversize/wrong-mime 400; **identity-document mime/filename heuristic returns the §7 refusal message**. | 13,14 |
| 16 | Document get/delete/discard | Owner download, delete, and `POST .../discard` (deletes file, keeps row + hash, sets discarded_at). | `src/routes/documents.ts`, `src/__tests__/documents.test.ts` | Discard removes file from disk but keeps hash row; download of discarded doc 410. | 15 |

### Phase 3 — Verification ledger

| # | Title | Spec | EDP | Acceptance | Deps |
|---|---|---|---|---|---|
| 17 | Verifications migration | Create append-only `verifications` (id, credential_id fk, method, source_name, source_url, outcome, matched_fields jsonb, evidence_sha256, checked_by fk users, checked_at, stale_after) — no UPDATE path in app code. | `database/migrations/004_verifications.sql`, `src/__tests__/migrations.test.ts` | Applies cleanly. | 9 |
| 18 | Verification service | `recordVerification()` validates method ∈ {register_check, document_sighted}, requires source+evidence fields for register_check, computes stale_after = checked_at + 90d. | `src/services/verifications.ts`, `src/__tests__/verifications.test.ts` | Valid insert returns row; register_check without evidence throws; rows never updated. | 17 |
| 19 | Operator middleware | `requireOperator` gates on `users.role = 'operator'`. | `src/middleware/operator.ts`, `src/__tests__/operator.test.ts` | 403 for plain users; passes for operator. | 6 |
| 20 | Record-verification endpoint | `POST /api/v1/credentials/:id/verifications` (operator-only) calling the service. | `src/routes/verifications.ts`, `src/__tests__/verifications-routes.test.ts` | Operator 201; user 403; only level1Checkable types accept register_check. | 18,19,8 |
| 21 | Proof status derivation | Pure function `deriveProofStatus(credential, latestVerification, now)` → {status, level} per design doc §7 (document_held / register_checked / check_overdue / expired precedence: expired > overdue > checked > held). | `src/services/proof-status.ts`, `src/__tests__/proof-status.test.ts` | Table-driven tests cover all transitions incl. 90-day staleness boundary and expiry-beats-checked precedence. | 18 |
| 22 | Claim-language module | Exported exact display strings + detail templates for every status, plus `FORBIDDEN_TERMS` list and a lint helper; the §7 disclaimers as constants. | `src/services/claim-language.ts`, `src/__tests__/claim-language.test.ts` | Tests assert exact strings match design doc §7 and that no template contains a forbidden term. | 21 |
| 23 | Operator queue endpoint | `GET /api/v1/verifications/queue` (operator-only): credentials awaiting first check or past stale_after, oldest first. | `src/routes/verifications.ts`, `src/__tests__/verifications-routes.test.ts` | Queue contains never-checked checkable credential; drops it post-verification; re-adds after staleness. | 20,21 |

### Phase 4 — Sharing & public pages

| # | Title | Spec | EDP | Acceptance | Deps |
|---|---|---|---|---|---|
| 24 | Shares migration | Create `shares` (id, user_id fk, token unique, label, scope jsonb nullable = all, revoked_at, created_at) + `share_views` (id, share_id fk, viewed_at, user_agent, ip_hash). | `database/migrations/005_shares.sql`, `src/__tests__/migrations.test.ts` | Applies cleanly. | 1 |
| 25 | Share service | Create (crypto-random 32-byte token) / revoke / resolve shares; resolve returns owner + in-scope credentials or null if revoked. | `src/services/shares.ts`, `src/__tests__/shares.test.ts` | Token entropy length asserted; revoked share resolves null. | 24 |
| 26 | Share endpoints | `POST /api/v1/shares`, `GET /api/v1/shares` (with view counts), `POST /api/v1/shares/:id/revoke`. | `src/routes/shares.ts`, `src/__tests__/shares-routes.test.ts` | CRUD round-trip; revoke idempotent; cross-user 404. | 25,6 |
| 27 | Proof page template | Pure function rendering the public proof HTML: owner name/trade, per-credential §7 status badges with method+date+checker, both standing disclaimers, no forbidden terms — no external assets. | `src/pages/proof-page.ts`, `src/__tests__/proof-page.test.ts` | Rendered HTML contains exact claim-language strings + both disclaimers; forbidden-term scan of output passes; XSS-escapes owner-supplied fields. | 22 |
| 28 | Public share route | `GET /s/:token` renders the proof page (no auth), 404s revoked/unknown tokens, logs a share_view with hashed IP. | `src/routes/public.ts`, `src/__tests__/public.test.ts` | 200 with badges for valid token; 404 revoked; view row written with ip_hash ≠ raw ip. | 25,27 |
| 29 | Public profile route | `GET /p/:handle` renders the same page for users who opted in (`handle` set + `profile_public` flag added additively to users). | `database/migrations/006_profile_public.sql`, `src/routes/public.ts`, `src/__tests__/public.test.ts` | Opt-in 200; non-opted 404. | 28 |
| 30 | QR endpoint | `GET /api/v1/shares/:id/qr` returns a PNG QR of the share URL (`qrcode` lib). | `src/routes/shares.ts`, `src/__tests__/shares-routes.test.ts` | Response is image/png, decodes to the share URL. | 26 |

### Phase 5 — Lifecycle & comms

| # | Title | Spec | EDP | Acceptance | Deps |
|---|---|---|---|---|---|
| 31 | Email service | Resend-backed `sendEmail` that hard-refuses recipients outside the allowlist unless `NODE_ENV=production` (CF outbound-safety pattern). | `src/services/email.ts`, `src/__tests__/email.test.ts` | Non-allowlisted recipient throws in dev/test; payload shape asserted with mocked client. | — |
| 32 | Expiry reminder cron | Daily job emailing owners at 30/14/7/1 days before `credentials.expires_at` (BossBoard cadence), idempotent per day via a `reminders_sent` jsonb column added additively. | `database/migrations/007_reminders_sent.sql`, `src/services/cron.ts`, `src/__tests__/cron.test.ts` | Fake-timer test: each threshold fires once; no dupes on re-run. | 31 |
| 33 | GA4 MP service | Fire-and-forget server-side GA4 Measurement Protocol events (inert unless `GA4_MP_API_SECRET` set — BossBoard pattern). | `src/services/analytics.ts`, `src/__tests__/analytics.test.ts` | No-op without secret; correct payload with secret (mocked fetch); never throws into callers. | — |
| 34 | Wire analytics events | Emit `sign_up`, `credential_added`, `verification_recorded`, `share_created`, `share_viewed` from the relevant routes. | `src/routes/auth.ts` + `src/routes/public.ts` (2-file edit; split if it bounces), `src/__tests__/analytics-events.test.ts` | Spy asserts each event fires on its route. | 33 |

### Phase 6 — Billing & gating

| # | Title | Spec | EDP | Acceptance | Deps |
|---|---|---|---|---|---|
| 35 | Stripe service | Checkout-session creation for Pro monthly/annual with `proofonce_user_id` metadata; customer-portal link helper. | `src/services/stripe.ts`, `src/__tests__/stripe.test.ts` | Mocked Stripe: session params (price id, metadata, success/cancel URLs) asserted. | — |
| 36 | Billing routes + webhook | `POST /api/v1/billing/checkout`, `GET .../portal`, `POST /webhooks/stripe` (signature-verified) flipping `users.plan` on subscription events. | `src/routes/billing.ts`, `src/__tests__/billing.test.ts` | Webhook with valid signature updates plan; invalid signature 400; checkout requires auth. | 35 |
| 37 | Plan gating middleware | `requirePlan('pro')` honouring `BETA_MODE=true` (everyone gets pro — BossBoard beta pattern); free tier capped at 2 credentials via `checkCredentialLimit`. | `src/middleware/plan.ts`, `src/__tests__/plan.test.ts` | Free user 402 on 3rd credential when BETA_MODE=false; unrestricted when true. | 36 |
| 38 | Apply gating | Mount `checkCredentialLimit` on credential creation and `requirePlan` on verification-request + QR routes. | `src/routes/credentials.ts`, `src/__tests__/credentials.test.ts` | Gating asserted per route with BETA_MODE both ways. | 37,10 |

### Phase 7 — Privacy & truth closure

| # | Title | Spec | EDP | Acceptance | Deps |
|---|---|---|---|---|---|
| 39 | Account deletion | `DELETE /api/v1/users/me` cascades credentials/documents/shares (files unlinked), anonymises the user row (keeps id + plan history stub for billing records). | `src/routes/users.ts`, `src/__tests__/users.test.ts` | Post-delete: login fails, files gone, shares 404, verifications remain hash-only orphan-safe. | 12,26 |
| 40 | Share-view retention job | Extend cron: purge `share_views` older than 12 months (IPP9 cap). | `src/services/cron.ts`, `src/__tests__/cron.test.ts` | Rows >12mo deleted; newer retained. | 32 |
| 41 | Privacy notice + terms pages | Serve static `GET /privacy` and `/terms` (content drafted by Fable, **Marc-approved before launch** — customer-facing gate; not Nemo-authored copy). | `src/routes/public.ts`, `src/__tests__/public.test.ts` | Pages 200 and contain the IPP12 offshore-hosting disclosure marker. | 28 |

**Count: 41 increments** (Phase 1: 7 · Phase 2: 9 · Phase 3: 7 · Phase 4: 7 ·
Phase 5: 4 · Phase 6: 4 · Phase 7: 3). Post-MVP backlog (not scheduled): automated
LBP/EWRB/PGDB register lookups (ToS review first), issuer-confirmation (Level 2),
BossBoard certifications deep link (1-line BossBoard change), team dashboard,
DISTF-accredited identity binding (Marc-gated licensing analysis).

---

## 3. CF wiring steps

### 3.1 Project registration — **TIER-A note**

- Adding `proofonce` to the canonical `PROJECT_PATHS` map lives in
  `mcp/compound/task_executor.py`, which is a **TIER A critical-path file**
  (`~/.claude/CLAUDE.md`: "Compound orchestration core: … mcp/compound/task_executor.py").
  That edit requires **pre-edit eye-pair + Marc-yes** — do not let an engine task or
  a casual session make it.
- Per `cortexforge/CLAUDE.md` "Managed Projects": also add `proofonce` (lowercased
  compound of ProofOnce, which has an internal capital) to `_STOP` in
  `mcp/compound/planner.py` so the planner's relevance guard doesn't treat the brand
  name as a specific-file token. `planner.py` is not on the TIER A list — it flows
  through the writeq arbiter post-edit.
- Insert the `projects` table row (slug `proofonce`, path `/home/marc/projects/proofonce`)
  via the standard registration path; single-row insert, not a mass DB change.

### 3.2 Marketing-truths + brand hygiene (day one)

- Seed the app repo's `marketing-truths.json` at Phase 0 with: product status
  ("in development, not launched"), the §7 status-vocabulary claims (verdict
  PLANNED until code exists — audit-before-copy), the company legal-identity claim
  (NZBN 9429041896853, verdict ACCURATE), and the two standing disclaimers.
- Vendor the marketing-truth pre-commit hook + `brand-name-dictionary.json`
  (add `ProofOnce` exact casing) via `~/cf-research/marketing-truth-hook/install.sh`.
- Update **this repo's** (`proofonce-website`) `marketing-truths.json` only when the
  landing page copy changes — the coming-soon claims stay accurate until launch.

### 3.3 Guardrail applicability

- `customer-facing-copy-requires-product-claim-audit` — applies from the first
  public page (increment 27); the claim-language module (increment 22) is the
  code-side enforcement of the same truths.
- `e2e-test-data-lifecycle` — applies; credential documents are personal
  information: tag ProofOnce tasks `carries_pii=true` per the standard
  compliance_brand treatment in `cortexforge/CLAUDE.md`.
- FTA claim linting (`fta_lint` surface globs) — extend to ProofOnce public pages
  + landing when the product goes live.
- Launch-readiness contract — brand record for ProofOnce (none exists) + GA4
  (landing already live: G-7VP1WGGG7F; app: increments 33–34) are both hard gates
  before any MARKET-stage content.

### 3.4 Engine operating rules for this repo

- Engine commits target `main` unless the repo is protected (then auto branch+PR,
  standard executor behaviour). Increments are one-commit-each; EDP is the allowlist.
- Migrations: additive-only as specified; anything matching the destructive-SQL
  regex is TIER-A by content-gate and must not be engine-shipped.
- No engine edits to: `marketing-truths.json`, `.git-hooks/`, privacy/terms copy,
  `Dockerfile`/`docker-compose*`/`.env*` (infra = wholesale TIER-A per standing
  rules), or this docs pair.
