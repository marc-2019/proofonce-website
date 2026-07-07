# ProofOnce — Product Design (2026-07-08)

**Status:** DESIGN (no code exists; the only ProofOnce artifact today is the coming-soon
landing page in this repo). Companion doc: `proofonce-nemo-build-plan-2026-07-08.md`
(scaffold spec + engine increment table).

**Company:** Instilligent Limited (NZ company 5775307, NZBN 9429041896853).

**Portfolio-tier note (important):** the canonical
`cortexforge/docs/vision/organic-growth-strategy-2026-07-07.md` currently places
proofonce in **Tier 2 — "Surfaces & channels: keep green, no growth investment."**
Marc is *electively activating* ProofOnce with this design. Activation implies
Tier-1-style treatment (BUILD + brand record + claim audit + MARKET), which is a
strategy-doc amendment — a **Marc decision** that should be recorded in the growth
strategy doc when he confirms. Until then this design is staged work, not a tier
promotion.

---

## 1. The seed, restated honestly

> "Document and identity verification: prove something once, reuse the proof across
> multiple consumers without re-presenting source documents."

Two honest corrections to the seed before designing anything:

1. **v1 is credential verification, not identity verification.** Identity verification
   in NZ is now formally regulated territory: the AML/CFT **Identity Verification Code
   of Practice 2026** was gazetted 28 May 2026 and commenced 1 July 2026, and it
   recognises accredited **Digital Identity Services Trust Framework (DISTF)** services
   as a standalone identity-verification pathway
   ([Digital Identity NZ, 2026-06-24](https://digitalidentity.nz/2026/06/24/what-the-new-aml-cft-identity-verification-code-means-for-digital-identity-in-aotearoa/)).
   Playing in that space means accreditation/licensing analysis we have not done.
   **v1 explicitly does not verify who a person is** — it verifies that a named person's
   *credentials* check out against their issuing registers. This is stated in-product
   (see §7 claim language).

2. **"Prove once, reuse many" is the durable idea; the wedge must be a niche where the
   re-presenting pain is concrete and the proofs are checkable.** Generic "verify
   anything" competes with the NZ government's own verifiable-credentials programme
   ([DIA](https://www.digitalidentity.dia.govt.nz/services/verifiable-credentials))
   and the coming government digital wallet
   ([Biometric Update, Dec 2025](https://www.biometricupdate.com/202512/tech-new-zealand-aims-to-be-digital-ecosystem-hub-as-govt-rolls-out-wallet-to-be)).
   We do not out-build the Crown on identity rails. We can out-build everyone on a
   niche workflow.

---

## 2. Wedge decision

### Candidates scored (1–5 per criterion, higher = better)

| Criterion | (a) Tradie credential proof | (b) Tenant/employment doc pack | (c) B2B compliance evidence sharing |
|---|---|---|---|
| Time-to-first-dollar | **4** — same buyer BossBoard already reaches; coffee-money impulse price; organic channels exist | 2 — consumers pay reluctantly and churn out the moment they sign a lease | 2 — B2B sales cycle with a zero-customer portfolio and no references |
| Engine-buildability (Nemo one-file increments) | **4** — CRUD + file hash + server-rendered pages; no document parsing, no bank feeds | 3 — income/bank-statement handling drags in parsing and redaction complexity | 3 — multi-tenant orgs, roles, and audit trails from day one |
| Legal surface | **4** — facts checked against *public* registers; no identity docs; low-sensitivity PII | 2 — income, bank statements, IDs = high-sensitivity PII; rental-application data collection is an active OPC scrutiny area (landlords may only collect what's necessary — [CAB](https://www.cab.org.nz/article/KB00041124), [Tenancy Services](https://www.tenancy.govt.nz/starting-a-tenancy/new-to-tenancy/pre-tenancy-applications/)) | 3 — corporate data + contractual liability for evidence integrity |
| Portfolio synergy | **5** — BossBoard already has a certifications module (self-asserted, expiry-reminded); same audience; MC's SHA-256 evidence-immutability pattern reuses directly | 1 — no adjacency | 4 — MC-adjacent, but that's also a cannibalisation risk |
| Competition (see §3) | **4** — no direct "individual tradie credential passport" product found; adjacent players solve different problems | 2 — myRent/Tenant.co.nz already offer reusable online rental applications | 2 — Tōtika/SiteWise/PREQUAL ecosystem is entrenched at the company level |
| **Total** | **21** | **10** | **14** |

### Decision: **(a) Tradie credential proof — the "Proof Page" for NZ trade businesses.**

**One paragraph why.** A working NZ tradie holds 4–8 separate credentials — LBP or
EWRB/PGDB licence, Site Safety Card (2-year expiry — [Site Safe](https://www.sitesafe.org.nz/training/site-safety-card/)),
first-aid cert, work tickets (EWP, scaffolding), public liability insurance
certificate, NZBN/GST status — and gets asked to re-present them constantly: in
quotes to homeowners, at every main-contractor site induction, to councils. Each ask
is answered today with photos and photocopies that are self-asserted and go stale.
The individual pieces are *individually* checkable (the LBP register is free and
public with QR digital licences — [lbp.govt.nz](https://www.lbp.govt.nz/for-lbps/your-licence/digital-licences/)),
but nobody aggregates them into one living, dated, method-stamped, shareable page.
The buyer is the same tradie BossBoard already serves (BossBoard's certifications
module is the self-asserted version of exactly this), the price point is the same
proven coffee-money band, the legal surface is minimal because we verify *credentials
against public registers* rather than *identities against government databases*, and
every feature decomposes into the one-file additive increments the CF engine ships
reliably.

**What ProofOnce is NOT (v1):** not identity verification, not AML/CFT CDD, not a
background check, not company-level H&S prequalification (that's Tōtika's lane), not
a government register replacement, not a tenant/employment doc service.

---

## 3. Competition read (searched 2026-07-08)

| Player | What they do | Why the wedge survives |
|---|---|---|
| **MBIE LBP public register** ([lbp.govt.nz](https://www.lbp.govt.nz/for-lbps/your-licence/)) | Free public search; digital licences carry a QR that resolves to the register | Single credential, single register. Solves "is this LBP number real", not "show me your whole credential set, current, in one place". We *build on* it: it's our Level-1 verification source for LBP items. |
| **Tōtika** ([totika.org](https://www.totika.org/)) + SiteWise/PREQUAL/SHE Pre-Qual ([prequals.co.nz](https://www.prequals.co.nz/prequal-options/), [sheprequal.co.nz](https://www.sheprequal.co.nz/totika/)) | Company-level H&S prequalification; "prequalify once" for the supply chain. From ~$280 (sole trader, SHE Pre-Qual) to $450/2yr (Cat 1) up to $1,459/yr (Cat 3) | Same "once, reused" thesis — validating for the model — but it audits a company's H&S *management system*, costs hundreds, and doesn't produce an individual's shareable credential page. ProofOnce is the individual/sole-trader layer underneath it, at ~1/10th the price. |
| **Checkmate** ([checkmate.tech](https://www.checkmate.tech/countries/new-zealand)) | Employer-side background screening (MoJ, credit, visa, references) + ongoing licence monitoring of *employees* | B2B HR tooling bought by employers about candidates. ProofOnce is owned by the tradie about themselves. Different buyer, different data controller posture. |
| **CentraPass / Futureverse** ([LinkedIn](https://nz.linkedin.com/company/centrapass), [AndNow case study](https://www.andnow.co.nz/case-studies/centrapass)) | Decentralised-identity toolkit; rolled into Futureverse in 2022 | Enterprise identity infrastructure, not a tradie workflow product. Confirms the identity layer is contested — another reason v1 avoids it. |
| **NZ Govt: DISTF verifiable credentials + wallet** ([DIA](https://www.digitalidentity.dia.govt.nz/services/verifiable-credentials), [Confirmation Service](https://www.digital.govt.nz/products-and-services/products-and-services-a-z/confirmation-service)) | Official reusable credentials, accredited providers, wallet rollout in progress | Long-term commoditisation risk (§11 R3). Mitigation: stay at the *workflow* layer (aggregation, sharing UX, expiry lifecycle, BossBoard integration) so official VCs become an input, not a competitor. |
| **myRent / Tenant.co.nz** ([myrent.co.nz](https://www.myrent.co.nz/viewings-and-applications), [tenant.co.nz](https://www.tenant.co.nz/)) | Reusable online rental applications | Evidence wedge (b) is already served — supports rejecting it. |
| **CheckMyBuilder** ([checkmybuilder.co.nz](https://checkmybuilder.co.nz/answers/what-is-the-lbp-register-and-how-do-i-use-it)) | Consumer-education content on checking builders | Content/SEO player, not a product. Validates homeowner-side demand for "check your tradie"; also a model for our organic content channel. |

**Honest gap statement:** no NZ product found (2026-07-08 searches) that gives an
individual tradie a single verified, current, shareable credential profile. Closest
analogues solve the company (Tōtika), the employer (Checkmate), or the single
credential (LBP register). The gap is real but modest — which is why this ships at
coffee-money price on engine labour, not at venture scale.

---

## 4. Personas

1. **Dave — self-employed builder (buyer).** LBP Carpentry, Site Safety Card, First
   Aid, $2M public liability. Quotes 3–5 renovation jobs/month against cheaper
   unlicensed competition. Wants the quote that looks *provably* legitimate. Pays if
   it wins him one job a year. Phone-first, patience for admin ≈ zero.
2. **Priya — HSE/site coordinator at a main contractor (viewer v1, buyer v2).**
   Collects subbies' tickets at induction into a spreadsheet, chases expiries by
   text. In v1 she just *receives* ProofOnce links; a team dashboard for her is the
   v2 upsell, not MVP.
3. **Sarah — homeowner (viewer only, never an account).** Comparing three quotes.
   Clicks the "Verified credentials" link in Dave's quote, sees the Proof Page,
   understands the badges without explanation. Her trust is the product's whole value;
   the claim language (§7) is written for her.

---

## 5. Core object model

```
users            – tradie accounts (email, password hash, name, trade, business name,
                   NZBN optional, handle for public page, role: user|operator, plan)
credentials      – typed items owned by a user
                   (type, label, identifier e.g. licence number, issuer, expires_at)
documents        – uploaded evidence files attached to a credential
                   (sha256, mime, size, storage path, discarded_at nullable)
verifications    – APPEND-ONLY ledger of checks performed on a credential
                   (method, source_name, source_url, outcome, matched_fields,
                    evidence_sha256, checked_by, checked_at, stale_after)
proofs           – DERIVED, not stored: credential + latest verification + clock
                   → display status (see §7). Computed by a pure function.
shares           – revocable tokens exposing a credential set
                   (token, label e.g. "Quote #1042", scope: all|subset, revoked_at)
share_views      – log of public views (share_id, viewed_at, user_agent, ip_hash)
```

Design rules:

- **Verifications are immutable.** Corrections are new rows; the ledger is the
  defensibility story (mirrors Modular Compliance's SHA-256 evidence pattern).
- **Proof status is derived, never stored** — one pure function owns the mapping from
  (credential, latest verification, now) to display status, so claim language can't
  drift between surfaces. This function is also the COMPLY test target.
- **Documents are optional and discardable.** The differentiating privacy posture:
  after a credential is register-checked, the user may discard the source document;
  the hash and the verification row remain. "We keep the proof, not your paperwork."

### Credential type catalogue (v1)

| Type | Register / source | Level-1 checkable v1? |
|---|---|---|
| LBP licence | MBIE public LBP register (free, public) | Yes |
| Electrical worker licence | EWRB public register | Yes |
| Plumber/gasfitter/drainlayer | PGDB public register | Yes |
| Site Safety Card | Site Safe (no public register found — [sitesafe.org.nz](https://www.sitesafe.org.nz/training/site-safety-card/)) | No — Document-held only in v1; issuer-confirmation is v2 |
| First-aid certificate | Training providers (no unified register) | No — Document-held |
| Public liability insurance certificate | Insurer document | No — Document-held |
| NZBN / GST registration | NZBN public register | Yes |
| Work tickets (EWP, scaffolding, etc.) | Provider-issued | No — Document-held |
| Custom / other | — | No — Document-held |

Being explicit that most types start at "Document held" is part of the truth
discipline: the page never implies a check that didn't happen.

---

## 6. MVP feature list (ruthless)

1. **Account + profile** — email/password auth, trade type, business name, public
   handle. (No OAuth, no MFA in v1 — password policy + rate limiting only.)
2. **Credentials + documents** — add typed credentials, upload evidence files,
   SHA-256 recorded at upload, expiry dates.
3. **Verification ledger (operator-performed)** — an operator (Marc/ops) checks
   register-checkable credentials against the public register and records an
   immutable verification row with evidence hash + timestamp + matched fields.
   *Deliberately human-in-the-loop for v1*: no register scraping, no ToS exposure,
   and the operator queue IS the demand signal. Automation is a later increment.
4. **Proof Page + shares** — public server-rendered page per share token (and an
   opt-in public profile at `/p/:handle`), per-credential status badges in the exact
   §7 vocabulary, QR code, revocable links, view log.
5. **Expiry + staleness lifecycle** — reminder emails at 30/14/7/1 days before
   credential expiry (mirrors BossBoard's cron); register checks go stale after 90
   days and degrade to "Check overdue" until re-checked.
6. **Billing + measurement** — Stripe checkout (free tier + Pro), server-side GA4
   events from day one (signup, credential added, verification recorded, share
   created, share viewed, checkout completed).

**Explicitly out of v1:** identity verification of any kind; AML/CFT use; automated
register scraping; issuer-confirmation workflows; team/company dashboards; mobile
app; BossBoard API integration (v1 synergy = tradies paste their ProofOnce link into
BossBoard quotes; the certifications-screen deep link is a one-line BossBoard change
later); document OCR/parsing; API for third parties.

---

## 7. Claim language (truth discipline — normative)

"Verified" must mean something specific and defensible. The vocabulary below is the
**only** status language permitted on any surface (page, badge, email, marketing).
It ships as a code module with tests (see build plan increment N-22) so drift is a
test failure, and it is mirrored in `marketing-truths.json`.

### Status vocabulary (exact strings)

| Status | Display | Meaning (shown on hover/detail) |
|---|---|---|
| Level 0 | **Document held** | "A copy of this document is on record with ProofOnce (SHA-256 fingerprint recorded &lt;date&gt;). ProofOnce has not checked it with the issuer or a register." |
| Level 1 | **Register-checked** | "Checked against the &lt;register name&gt; (public register) on &lt;date&gt; by a ProofOnce operator. Matched: &lt;fields, e.g. name, licence number, class, status&gt;. Registers change — last checked &lt;date&gt;." |
| Degraded | **Check overdue** | "This item was register-checked on &lt;date&gt; but the check is older than 90 days. Treat as unconfirmed until re-checked." |
| Expiry | **Expired** | "The credential's own expiry date (&lt;date&gt;) has passed." |
| — | **Removed by owner** | Shown if a shared item was deleted/revoked. |

Every status line always shows **method + date + who checked**. No bare green ticks.

### Forbidden vocabulary (hard-fail in claim lint)

"certified", "accredited", "government approved", "officially verified",
"guaranteed", "background checked", "identity verified", "police checked",
"vetted", "licensed by ProofOnce", any implication ProofOnce is a register,
regulator, or issuer.

### Standing disclaimers (every public proof surface)

- "ProofOnce checks credentials against public registers and records document
  fingerprints. It does not verify identity, and a ProofOnce page is not a
  substitute for the official registers, which remain the authoritative source."
- "Not for AML/CFT customer due diligence. ProofOnce is not an accredited identity
  verification service under the Digital Identity Services Trust Framework."

### The residual honesty gap, stated

Level-1 verification confirms *a credential exists on a register matching the name
and number the user supplied*. It does not confirm the account holder **is** that
person. This is disclosed (first disclaimer above), and is why "identity verified"
is forbidden vocabulary. Closing that gap (photo-on-licence comparison, DISTF-
accredited identity binding) is a deliberate v2+ decision with its own legal
analysis, not something v1 quietly implies.

---

## 8. Privacy & retention design (NZ Privacy Act 2020)

ProofOnce is an "agency" under the Act. IPP mapping:

| IPP | Design response |
|---|---|
| 1 (purpose/necessity) | Collect only credential data + evidence docs. **No passports, no driver licences, no bank statements, no IDs** — v1 has no lawful-need story for identity documents, so it refuses them (upload UI says so; credential types don't include them). |
| 3 (transparency) | Privacy notice states purposes, the operator-check process, offshore hosting, retention, rights. Written before launch, Marc-approved (customer-facing copy gate). |
| 5 (security) | Bcrypt, JWT, helmet, rate limiting (BossBoard's proven middleware patterns); documents stored outside web root; hashes not reversible. |
| 6/7 (access/correction) | Users see and edit everything they hold; verification ledger rows are visible but immutable (corrections = new rows, disclosed as such). |
| 9 (retention) | **Proof-not-documents:** users may discard source docs post-verification (hash retained). Credential deletion removes its documents. Account deletion cascades everything except an anonymised billing-required stub. Share-view logs keep hashed IPs, 12-month cap. |
| 12 (cross-border) | Railway hosting is offshore (US region unless configured otherwise — same posture as BossBoard's `DATA_RESIDENCY_IMPLEMENTATION_NOTES.md`). Disclosed in the privacy notice; comparable-safeguards reasoning documented. Region choice is a Phase-0 decision. |
| 13 (unique identifiers) | We record register-issued identifiers (LBP numbers etc.) as data *about* credentials; we do not assign or require government identifiers as our own keys. |
| Breach duties (Part 6) | Serious-harm assessment + NotifyUs playbook documented pre-launch; ledger design limits blast radius (docs discardable, no identity docs held at all). |

**AML/CFT posture:** ProofOnce v1 does not perform identity verification for
financial purposes and expressly disclaims AML/CFT CDD use (§7). Should ProofOnce
ever move toward identity, the Identity Verification Code of Practice 2026 / DISTF
accreditation pathway is the gate, preceded by licensing analysis — a Marc decision.

---

## 9. Business shape

- **Buyer:** NZ sole-trader and small-crew trade businesses (same ~100–150k SME pool
  BossBoard targets). The tradie pays; the homeowner/site coordinator consumes.
- **Price hypothesis (NZD, GST-inclusive):**
  - **Free** — 2 credentials, "Document held" only, proof page, expiry reminders.
    (The free page is the viral surface: every shared link markets the product.)
  - **Pro — $3.99/week equivalent, billed $16.99/month or $149/year** — unlimited
    credentials, register-checked verifications (quarterly re-checks included),
    share links + QR, view log. Anchors: BossBoard $4.99–9.99/wk band; ~1/10th of
    the cheapest company prequal (SHE Pre-Qual sole trader ~$280 — [sheprequal.co.nz](https://www.sheprequal.co.nz/totika/)).
  - Operator labour bounds the margin at v1 scale: a register check is ~3 min; at
    even 50 Pro users × 5 checkable credentials × quarterly ≈ 12 hrs/yr. Fine until
    automation (post-MVP increment).
- **First-dollar path (organic, no ads):**
  1. **BossBoard cross-sell** — BossBoard beta users already maintain a
     certifications list; "get these verified and share them on your quotes" is a
     one-screen pitch. (BossBoard-side deep link is a later one-line change.)
  2. **Landing-page waitlist** — proofonce.com already has GA4 (G-7VP1WGGG7F) and a
     mailto notify CTA; replace with a real signup at launch.
  3. **Content SEO** — homeowner-side "how to check your builder/electrician in NZ"
     content (CheckMyBuilder proves the query demand), truth-gated through the
     marketing pipeline.
  4. **Trade community organic** — FB groups/forums, the same channel that produced
     the only portfolio revenue ever (Courses).
- **Launch-ready (per the launch-readiness contract):** (a) approved **brand record**
  for ProofOnce (none exists — only ONN has one), (b) **GA4** set up (landing: done;
  product app: increment N-33/34), (c) claim audit green on all customer-facing copy
  (`customer-facing-copy-requires-product-claim-audit`), (d) privacy notice + terms
  published (Marc-approved). Beta gate mirrors BossBoard: `BETA_MODE=true` = free
  for all; flip to paid after validated beta users.
- **Kill/validate criteria (pre-registered):** if after 90 days of launch-ready the
  funnel shows &lt;20 activated free accounts or 0 paid conversions from ≥100 proof-page
  views, park it back to Tier 2 rather than invest further — consistent with the
  organic-growth doc's "no growth investment" default for this product.

---

## 10. Synergies (concrete, not hand-wavy)

- **BossBoard:** same buyer; certifications module is the self-asserted precursor;
  v1 synergy is link-pasting into quotes, v2 is a deep link from BossBoard's
  certifications screen and embedding the badge in BossBoard invoice/quote PDFs.
- **Modular Compliance:** the SHA-256 immutable-evidence pattern and attestation
  framing are lifted directly; if MC customers ever need individual-credential
  evidence, ProofOnce is the supplier, not a competitor.
- **CortexForge:** the whole build plan is shaped for the engine (companion doc);
  operator queue + verification ledger give CF observable work items rather than
  free-text ops.

## 11. Risks

| # | Risk | Mitigation |
|---|---|---|
| R1 | **Demand risk (top):** individual register checks are free; tradies may not feel enough pain to pay for aggregation + currency. | Pre-registered kill criteria (§9); validate against BossBoard beta users + waitlist before building past Phase 4; free tier keeps the viral surface alive even if Pro conversion is slow. |
| R2 | **Trust/FTA risk:** a wrong or stale "Register-checked" badge could mislead a homeowner — Fair Trading Act s13 exposure and brand damage. | Immutable ledger with evidence hashes; 90-day staleness degradation; claim-language module with hard tests; operator (not model) performs checks in v1; forbidden-vocabulary lint in CI + marketing-truth hooks. |
| R3 | **Government commoditisation:** DISTF verifiable credentials + the govt wallet could make official reusable credentials ubiquitous. | Stay at the workflow layer (aggregation, lifecycle, sharing UX, BossBoard integration); treat official VCs as a future Level-2+ *input*; revisit at each launch-readiness review. |
| R4 | Engine-capability risk: increments that quietly need 3+ files bounce off Nemo. | Stub-first scaffold (build plan §2) makes every increment an *edit* to existing files; EDPs are pre-enumerated per increment. |
| R5 | Operator bottleneck / process drift in manual verification. | Operator queue is a first-class feature with SLAs visible in-product ("check pending"); automation increment is staged behind real volume. |
| R6 | Privacy incident with credential documents. | No identity docs accepted at all; discard-after-verification; docs outside web root; breach playbook pre-launch; carries_pii tagging in CF guardrails. |

## 12. Sources

- [Digital Identity NZ — AML/CFT Identity Verification Code 2026](https://digitalidentity.nz/2026/06/24/what-the-new-aml-cft-identity-verification-code-means-for-digital-identity-in-aotearoa/)
- [DIA — Verifiable credentials](https://www.digitalidentity.dia.govt.nz/services/verifiable-credentials) · [DIA — Confirmation Service](https://www.digital.govt.nz/products-and-services/products-and-services-a-z/confirmation-service)
- [Biometric Update — NZ govt wallet rollout (Dec 2025)](https://www.biometricupdate.com/202512/tech-new-zealand-aims-to-be-digital-ecosystem-hub-as-govt-rolls-out-wallet-to-be)
- [LBP — Your licence / digital licences (QR verification)](https://www.lbp.govt.nz/for-lbps/your-licence/) · [Auckland Council — check tradespeople licences](https://www.aucklandcouncil.govt.nz/en/building-and-consents/building-consents/prepare-building-consent-application/check-tradespeople-licences.html)
- [Tōtika scheme](https://www.totika.org/) · [SHE Pre-Qual Tōtika pricing](https://www.sheprequal.co.nz/totika/) · [Prequal options comparison](https://www.prequals.co.nz/prequal-options/)
- [Site Safe — Site Safety Card (2-year currency)](https://www.sitesafe.org.nz/training/site-safety-card/)
- [Checkmate — NZ employment screening](https://www.checkmate.tech/countries/new-zealand)
- [CentraPass — LinkedIn](https://nz.linkedin.com/company/centrapass) · [AndNow case study](https://www.andnow.co.nz/case-studies/centrapass)
- [myRent — viewings and applications](https://www.myrent.co.nz/viewings-and-applications) · [Tenant Portal](https://www.tenant.co.nz/)
- [Tenancy Services — pre-tenancy applications](https://www.tenancy.govt.nz/starting-a-tenancy/new-to-tenancy/pre-tenancy-applications/) · [CAB — what landlords can ask](https://www.cab.org.nz/article/KB00041124)
- [CheckMyBuilder — LBP register explainer](https://checkmybuilder.co.nz/answers/what-is-the-lbp-register-and-how-do-i-use-it)
