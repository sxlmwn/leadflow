# Intern Task Cards

Read [intern-brief.md](intern-brief.md) first — it explains the business and the
ground rules. This file is just the work.

Last updated: 2026-08-25 · Owner: Ibrahim Khan

---

## How to read a card

Every card has the same seven lines:

- **Goal** — what you are producing, in one sentence.
- **Why it matters** — the business reason, tied to a real number.
- **Steps** — the route. Follow it; deviate only after asking.
- **Deliverable** — the exact filename and format. Use it verbatim.
- **Done when** — the checklist Ibrahim reviews against.
- **Time box** — if you are past this, stop and raise it.
- **Don't do** — the scope guard. Everything listed is either already built,
  already assigned, or deliberately deferred.

**Nothing here requires writing code or touching production data.**

---

## Assignment and sequencing

| Lane | Owner | Tasks |
|---|---|---|
| **A — Conversion & Copy** | Marketing-leaning intern | A1, A2, A3 |
| **B — Market & Tooling Research** | Generalist intern | B1, B2, B3 |
| **C — Tracking & Data Specs** | Dev-leaning intern | C1, C2, C3, C4 |

**Schedule**

| When | Tasks in flight |
|---|---|
| Week 1–2 | **A1**, **A2**, **B1** |
| Week 3–4 | **A3**, **B2**, **B3**, **C1** |
| Week 5+ | **C2**, **C3**, **C4** |

With only two interns: one takes Lane A, the other runs Lane B first and then
Lane C. Lane C slips rather than running in parallel — Lane A is the priority
under the 2026-08-20 reset and does not slip.

---

# Lane A — Conversion & Copy

> Priority 1. Visit → lead conversion is ~1%. This lane is the direct attack on
> that number, and it is what leadership is asking about in standups.

## A1 — Landing page teardown → copy deck

**Goal**
Produce the copy and above-the-fold layout for a rebuilt landing page, modelled
on the direct-response sites that actually convert in this space.

**Why it matters**
~1% of visitors become leads. Leadership decided on 2026-08-20 that the fix is an
aggressive, immediately-visible CTA — this deck is the raw material for that
rebuild, which is currently blocked on copy.

**Steps**
1. Tear down six direct-response comps. Three are mandatory: **Good Labs**,
   **Day One Lab**, **Bright Fire**. Pick three more in lead-gen, paid trials, or
   home services. For each, screenshot the mobile view above the fold and note:
   the promise in the headline, how many words before the form, how many fields
   are visible without scrolling, what the button says, and what proof elements
   (badges, counts, testimonials) appear and where.
2. Write down the pattern the six share. This is the deliverable's spine — if all
   six put the form above the fold on mobile, that is a rule, not an option.
3. For each of our three brand types (home improvement e.g. WindowHound; paid
   clinical trials e.g. Med Trial Match; health/product e.g. ReliefOlogist),
   write **5 headline variants × 2 sub-headline angles × 3 CTA button labels**.
4. One of the trial headlines must use Jeff and Matt's angle: **"earn up to
   $5,000"**. Build variations around a concrete dollar figure.
5. Draw the mobile above-the-fold layout you are recommending. An annotated
   screenshot, a Figma frame or a labelled box sketch are all fine — the point is
   the stacking order and what is visible without scrolling, not the visual
   design.
6. Rank your variants. Say which single headline + CTA pair you would ship first
   and why.

**Deliverable**
`A1-landing-copy-deck.md` (or Google Doc) + `A1-comp-screenshots/` folder.

**Done when**
- [ ] Six comps torn down, each with a mobile screenshot and the five noted attributes
- [ ] A written "what they all do" pattern list
- [ ] 30 headlines, 12 sub-headlines, 9 CTA labels across the three brand types
- [ ] At least one variant built on a concrete dollar figure
- [ ] One mobile above-the-fold layout recommendation
- [ ] A ranked #1 pick with a stated reason

**Time box** — 6 working days

**Don't do**
Do not design a full page, pick fonts, or produce brand visuals. Do not write
copy for the pages *below* the fold yet. We need the top of the page settled first.

---

## A2 — Funnel A/B variant plan

**Goal**
Specify two complete, competing multi-step funnels — field by field — so they can
be built as `/funnel-a` and `/funnel-b` and split-tested against each other.

**Why it matters**
The A/B engine, traffic splitting, holdback and per-step abandonment tracking are
**already built**. The only thing missing is the content of the two variants.
This card unblocks a test that can start the week it lands.

**Steps**
1. Pick one brand to test on. Med Trial Match is the likely candidate — confirm
   with Ibrahim before starting.
2. Write down the current funnel as-is: every step, every field, exact question
   wording. Ibrahim will give you access to the live page to work from.
3. Design **Variant A** and **Variant B** around *opposing hypotheses*, not
   cosmetic differences. Examples of a real opposition: few long steps vs. many
   short ones; ask for contact details first vs. last; qualifying questions
   before the reward is stated vs. after.
4. For each variant specify, per step: the step's question(s), the exact wording,
   field type (text / choice / date / phone…), whether it is required, the
   button label, and any helper text.
5. State the hypothesis for each variant in one sentence — "B will beat A because…".
6. State the **decision metric** and the stopping rule: which number decides the
   winner (submitted leads per visitor, most likely), and roughly how many
   visitors per arm before we call it.

**Deliverable**
`A2-funnel-variants.md` with a step-by-step table per variant.

**Done when**
- [ ] Current funnel documented as a baseline
- [ ] Two variants specified field-by-field, with exact user-facing wording
- [ ] Hypotheses stated and genuinely opposed
- [ ] Decision metric and rough sample size stated
- [ ] Both variants are buildable from the doc alone — no "and then some
      qualifying questions" hand-waving

**Time box** — 4 working days

**Don't do**
Do not design the tracking, the URL structure, or the traffic split — all built.
Do not specify more than two variants; a three-way test needs traffic we do not
have yet.

---

## A3 — Email click-rate rescue

**Goal**
Rewrite our campaign email bodies so that the 56% of people who open them
actually click.

**Why it matters**
A 56% open rate is strong. The click rate is described as unacceptable. That
combination is diagnostic: **the subject lines are working and the bodies are
not.** With warming ramping volume over the next 30–45 days, fixing the body now
multiplies across every future send.

**Steps**
1. Get the current campaign emails from Ibrahim. For each, note: length, number
   of distinct links, where the first link sits, whether the CTA is a button or
   inline text, and what the reader is actually being asked to do.
2. Diagnose. The usual killers are: too many competing links, the CTA below the
   fold on mobile, a vague ask ("learn more"), and a body that re-sells rather
   than closing what the subject line already sold.
3. Rewrite **10 email bodies**. Hard constraints: one dominant CTA per email,
   that CTA visible without scrolling on a phone, benefit restated in the first
   line, under 150 words unless you can justify longer.
4. Write a **link-placement rubric** — a half-page of rules any future email must
   follow. Number of links, placement, button vs. text, what the label may and
   may not say.
5. Recommend send times and days, with a source. Note explicitly if this is
   general best practice rather than something derived from our own data.

**Deliverable**
`A3-email-rewrites.md` + `A3-link-rubric.md`

**Done when**
- [ ] Current emails audited with the specific failure named for each
- [ ] 10 rewritten bodies, each with exactly one dominant CTA
- [ ] Every rewrite under 150 words or with a written justification
- [ ] Link-placement rubric fits on one page
- [ ] Send-time recommendation with sources cited

**Time box** — 4 working days

**Don't do**
Do not touch subject lines — they are working, leave them alone. Do not design
HTML templates or work on deliverability/warming (that is B3 and Mudassar's
work).

---

# Lane B — Market & Tooling Research

> Covers ticket **CG-3386**. The purpose is not to admire competitors — it is to
> produce a **gap list** telling us what to build next.

## B1 — Lead-management platform matrix

**Goal**
Map what the six lead-management platforms our data brokers use actually do, and
mark which of those capabilities we already have.

**Why it matters**
CG-3386 exists so we can decide what to add to our stack — and, per the ticket,
which of these tools we could make unnecessary. Without the "do we already have
this" column, the research is just brochure summaries.

**Steps**
1. Research all six: **WayPoint** (waypointsoftware.io), **GoHighLevel**,
   **DataHubb** (datahubb.io), **LeadsPedia**, **LeadProsper**, and
   **ActiveProspect LeadConduit**.
2. For each, write a one-page summary: what it is for, who buys it, headline
   features, pricing (or "sales-gated" if unpublished), and whether it has a
   public API. Use their docs, pricing pages, demo videos and G2/Capterra
   listings. Cite everything.
3. Build **one combined feature matrix**: capabilities down the side, the six
   tools across the top, ✅/🟡/❌ in the cells.
4. Add a final column: **"Risen status"** — `have` / `partial` / `missing`. Fill
   it from §7 of [intern-brief.md](intern-brief.md), and ask Ibrahim about
   anything not covered there. **Do not guess this column.**
5. Close with a ranked gap list: the capabilities that appear in most competitors
   and that we do not have, most valuable first. One sentence each on why it
   matters to us specifically.

**Deliverable**
`B1-lead-platform-matrix.xlsx` (or Google Sheet) + `B1-tool-profiles.md`

**Done when**
- [ ] Six one-page profiles with sources cited
- [ ] One matrix, at least 25 capability rows
- [ ] "Risen status" filled for every row, nothing guessed
- [ ] Ranked gap list with a reason per item

**Time box** — 7 working days

**Don't do**
Do not recommend which one to buy — that is Ibrahim and Mike's call, and it needs
commercial context you do not have. Do not sign up for paid trials without
approval.

---

## B2 — Verification tooling

**Goal**
Work out what EmailOversight and SubscriberVerify would add on top of the
verification we already run.

**Why it matters**
Competitors verify leads before delivery, and bad leads cost us buyer
relationships. **Blacklist Alliance is already integrated and live** — so the
real question is narrower than the ticket makes it sound: what do the other two
catch that we currently miss?

**Steps**
1. Profile **EmailOversight**, **SubscriberVerify** and **Blacklist Alliance**.
   For each capture: what exactly it checks, price per check at volume, published
   accuracy claims, typical response latency, whether there is a real-time API or
   batch-only, and whether it is US-only.
2. For Blacklist Alliance, note what we already use it for — DNC and TCPA
   litigator phone scrubbing, run before we contact or sell a lead, and
   deliberately fail-closed (an unreachable provider holds the lead rather than
   risking the call).
3. Build a comparison table across all three.
4. Answer the money question directly: **what do EmailOversight and
   SubscriberVerify catch that Blacklist Alliance does not?** Be specific — check
   types, not marketing language.
5. Note anything about latency that would matter in a live form submission. A
   check that takes 4 seconds cannot sit in the submit path.

**Deliverable**
`B2-verification-tools.md`

**Done when**
- [ ] Three profiles with pricing (or "sales-gated"), latency and API details
- [ ] Comparison table
- [ ] A direct written answer to the overlap question
- [ ] Latency implications called out
- [ ] Sources cited throughout

**Time box** — 4 working days

**Don't do**
Do not design how we would integrate them — that is a later ticket. Do not
duplicate C4 (which covers ZeroBounce, NeverBounce and Kickbox in technical
depth); if you find overlap, note it and move on.

---

## B3 — Deliverability and InboxAlly

**Goal**
Explain how inbox-placement tooling works, what InboxAlly costs, and how it fits
with the domain/IP warming already running.

**Why it matters**
The ticket flags this as valuable for Precision's email distribution. We are 30–45
days into a warming ramp right now, so the timing question — does this help
during warming or only after — is decision-relevant this month.

**Steps**
1. Explain inbox placement in plain terms: what a seed list is, how placement
   testing works, and how it differs from the open/click stats we already
   collect. Assume the reader knows email but not deliverability.
2. Profile **InboxAlly**: what it does mechanically, pricing tiers, what it needs
   from us to run, and what it demonstrably improves.
3. Find and profile two alternatives (GlockApps, MailReach, Warmup Inbox or
   similar) so we are not evaluating a single vendor in isolation.
4. Answer the timing question explicitly: **does this help during a warming ramp,
   or only once warming is complete?** This is the decision Mike needs.
5. List what adopting it would require operationally — accounts, DNS records,
   list changes, ongoing effort, who would own it.
6. Note the risks. Engagement-seeding tools sit in a grey area with some mailbox
   providers; write down what you find honestly, including anything that could
   backfire.

**Deliverable**
`B3-deliverability-research.md`

**Done when**
- [ ] Plain-English explanation of inbox placement and seed lists
- [ ] InboxAlly profiled with real pricing
- [ ] Two alternatives profiled
- [ ] The warming-timing question answered directly
- [ ] Operational requirements listed
- [ ] Risks stated honestly, not glossed

**Time box** — 4 working days

**Don't do**
Do not touch the live warming process — that is Mudassar's, and it is mid-ramp.
Do not sign up for anything.

---

# Lane C — Tracking & Data Specs

> These three tickets are blocked on decisions nobody has written down. Each card
> produces the specification a developer implements from — good enough that they
> never have to reopen the vendor's docs.

## C1 — SubID parameter dictionary and lifecycle spec

**Goal**
Produce the definitive list of tracking parameter names we must capture, and a
map of where the subID travels from first click to final revenue.

**Why it matters**
A subID that is not captured on the first click **cannot be recovered later**, and
the affiliate who earned that lead does not get paid. We currently recognise
around 15 parameter naming conventions. Every network spells them differently.

**Steps**
1. From the six platforms in B1 plus Everflow, collect **every** tracking
   parameter name they emit or accept. Networks use numbered families —
   `sub1`–`sub5`, `sid1`–`sid5`, `aff_sub1`–`aff_sub5`, `s1`–`s5` — plus
   single-value ones like `clickid`, `gclid`, `affid`, `pubid`, `srcid`, `oid`.
   Include every variation you find, even ones that look redundant.
2. Build the dictionary as a table: parameter name · which networks use it ·
   what it means · example value.
3. We already capture these (given as a plain list, for comparison):
   `sub1`–`sub99`, `sid1`–`sid99`, `cid1`–`cid99`, `s1`–`s99`, `afs1`–`afs99`,
   `aff_sub1`–`aff_sub99`, `subid`, `sub_id`, `affid`, `aff_id`, `affiliate_id`,
   `clickid`, `click_id`, `pubid`, `publisher_id`, `srcid`, `src_id`, `oid`.
   **Mark clearly which of your findings are new.** The new ones are the point of
   the exercise.
4. Draw the lifecycle: `anonymous click → landing page → form submitted (lead) →
   remarketing email → conversion → revenue recorded`. At each hop, state which
   identifier carries the attribution and what breaks it. Flag the hops where we
   currently have nothing.
5. Write the **fallback rules**: when no subID is present, what do we attribute
   to instead? Define the fallback ladder — e.g. subID → campaign → source →
   brand → unattributed — and say exactly when each rung applies.
6. Write the **first-touch rule** in plain language, including what happens when
   the same person submits twice via different affiliates. (Our system keeps the
   first submission's credit. Confirm this matches how the researched networks
   behave, and note any that differ.)

**Deliverable**
`C1-subid-dictionary.xlsx` + `C1-attribution-lifecycle.md` (diagram may be a
drawing, a Mermaid block, or a clearly labelled sketch)

**Done when**
- [ ] Dictionary covers all six platforms plus Everflow
- [ ] New-vs-already-captured marked for every entry
- [ ] Lifecycle diagram names the carrying identifier at every hop
- [ ] Gaps in the current chain explicitly flagged
- [ ] Fallback ladder defined with trigger conditions per rung
- [ ] First-touch rule written out, with any network deviations noted

**Time box** — 5 working days

**Don't do**
Do not design database tables or write code. Do not specify the admin UI for
viewing this.

---

## C2 — Manual revenue reconciliation template

**Goal**
Define the spreadsheet format and matching rules for uploading conversion revenue
from advertisers who do not fire a pixel or postback.

**Why it matters**
Some advertisers simply email a spreadsheet of conversions at month end. Today we
have no defined way to take that money and attribute it back to the affiliate who
earned it. This spec is what makes that possible.

**Steps**
1. Define the CSV columns an advertiser upload must contain. Think about: what
   identifies the person or click, when it happened, how much it is worth,
   currency, the advertiser's own reference, and the conversion type. Mark each
   column required or optional.
2. Define the **match key precedence** — the order we try to attach a row to
   something we already know. Suggested starting ladder, refine it: subID →
   our click ID → hashed email → phone → date + campaign bucket. Say what
   confidence level each match carries.
3. Define **duplicate handling**. The same advertiser re-uploading last month's
   file must not double-count revenue. Specify what makes two rows the same row.
4. Define **unmatched-row behaviour**. A row matching nothing is not an error —
   per the ticket, revenue tracks to the closest parent bucket available. Say
   what that means concretely and how it appears in reporting.
5. Cover the edge cases: refunds and negative amounts, non-USD currency,
   conversions dated before the click, partial payouts, an advertiser correcting
   a prior file.
6. Produce **20 rows of synthetic sample data** demonstrating a clean subID
   match, a fallback match, a duplicate, an unmatched row, and a refund.
   **Invent every value — no real data.**

**Deliverable**
`C2-revenue-upload-spec.md` + `C2-sample-upload.csv`

**Done when**
- [ ] Column spec complete, each marked required/optional with format and example
- [ ] Match precedence ladder with a confidence level per rung
- [ ] Duplicate rule defined precisely enough to implement
- [ ] Unmatched-row behaviour defined
- [ ] All six edge cases addressed
- [ ] 20 synthetic rows covering the five listed scenarios

**Time box** — 4 working days

**Don't do**
Do not design the upload UI or the database schema. Do not use any real
advertiser file, even redacted.

---

## C3 — Everflow API endpoint map

**Goal**
Document Everflow's conversion and reporting API well enough that a developer can
build a scheduled conversion pull without reopening Everflow's docs.

**Why it matters**
Everflow is the benchmark for the attribution system we want. We already talk to
their API — but only to pull the offer catalogue and generate tracking links. We
have never pulled conversions back, which is the half that produces revenue data.

**Steps**
1. Work through Everflow's public API documentation. Note what we already use:
   the paged offers catalogue endpoint, the single-offer detail fetch, and the
   click tracking-link generation endpoint, all authenticated with an
   `X-Eflow-API-Key` header against `api.eflow.team/v1/`.
2. Map the **conversion** endpoints: how conversions are reported into Everflow,
   how they are queried back out, what filters and date ranges are supported,
   and what one conversion record actually contains field by field.
3. Map the **reporting** endpoints: what aggregate reports exist, what dimensions
   you can group by, and what the response looks like.
4. Document the **postback URL macros** — the `{transaction_id}`-style tokens
   Everflow substitutes when calling a partner's postback URL. List every macro
   with its meaning. This is the vocabulary our own postback endpoint has to
   speak.
5. Document **authentication, rate limits and paging**. Note the published
   request-per-second cap and how paging is signalled in responses. (We currently
   self-throttle below their cap — confirm the cap and note if it has changed.)
6. Answer the practical question in writing: **to pull yesterday's conversions on
   a schedule, exactly which endpoint would we call, with what parameters, and
   what comes back?** Include a worked example request and response.

**Deliverable**
`C3-everflow-api-map.md`

**Done when**
- [ ] Conversion endpoints documented with full request/response field lists
- [ ] Reporting endpoints documented with available dimensions
- [ ] Complete postback macro list
- [ ] Auth, rate limits and paging documented
- [ ] A worked "pull yesterday's conversions" example, request and response
- [ ] Every endpoint has a link to the source doc page

**Time box** — 4 working days

**Don't do**
Do not call the live API — we do not hand out API keys, and the account is
IP-restricted. This is documentation research. Do not design our own conversion
schema; that is C1 and C2.

---

## C4 — Enrichment provider spec sheets

**Goal**
Write an implementation-ready spec sheet for each verification provider, so a
developer can write the integration from the sheet alone.

**Why it matters**
Thirty-three providers are already wired into our settings screen, but every one
of the actual API calls is an empty placeholder that throws "not implemented".
Enrichment is what tells us whether an email is real and whether a phone number is
a mobile — which drives lead score, which drives what buyers pay. This card
converts the ticket "implement lead enrichment" from a research problem into a
typing problem.

**Steps**
1. Write one sheet for each of: **ZeroBounce**, **NeverBounce**, **Kickbox**
   (email verification); **Twilio Lookup**, **IPQS** (phone); **ipinfo** (IP).
2. Each sheet must contain: authentication method (header name, key format);
   the exact request — URL, method, every parameter; the **exact response JSON**,
   copied from their docs, with every field explained; error responses and what
   each status code means; rate limits; and cost per call at volume.
3. Then the important part — the **field mapping**. Our scoring system reads a
   fixed set of normalised fields regardless of which provider produced them:

   | Our field | Type | Meaning |
   |---|---|---|
   | `email_deliverable` | true/false | Will mail to this address actually arrive |
   | `email_catchall` | true/false | Domain accepts everything, so we cannot really tell |
   | `phone_line_type` | `mobile` / `landline` / `voip` / `tollfree` / `unknown` | |
   | `ip_country` | 2-letter code or null | |
   | `ip_is_proxy` | true/false | VPN, proxy or datacentre IP |

   For each provider, state **exactly which response field maps to which of ours,
   and how the values translate**. Provider status strings vary — ZeroBounce
   returns things like `valid` / `invalid` / `catch-all`, others use different
   vocabularies. Write the translation table explicitly, including what an
   unrecognised value should map to.
4. Note the **latency** of each provider. Anything slower than ~2.5 seconds
   cannot run inside a live form submission and would have to run afterwards.
   Flag which providers fall on which side of that line.
5. Recommend one provider per category — email, phone, IP — with a stated reason.
   Cost, accuracy and latency are the three axes.

**Deliverable**
`C4-enrichment-specs.md` — one clearly separated section per provider.

**Done when**
- [ ] Six sheets, each with auth, exact request, exact response, errors, rate
      limits and cost
- [ ] A field-mapping table per provider covering all five of our normalised fields
- [ ] Value-translation table per provider, including the unrecognised-value case
- [ ] Latency noted, with the ~2.5s threshold applied
- [ ] One recommendation per category with a reason
- [ ] A developer could write the integration from your sheet without opening the
      vendor's docs — test this by reading it back cold

**Time box** — 6 working days

**Don't do**
Do not write code or pseudocode. Do not spec the other 27 registered providers —
these six are the ones that matter now. Do not sign up for paid plans.

---

## Ticket coverage

For Ibrahim's reference — how these cards map back to the tickets they serve.

| Ticket | Covered by |
|---|---|
| **CG-3386** — research email/lead management and verification tools | B1, B2, B3 |
| **SubID conversion lifecycle tracking** | C1, C2 |
| **Implement lead enrichment from pipeline findings** | C4 |
| **Everflow API investigation** | C3 |
| **2026-08-20 conversion reset** (standing priority) | A1, A2, A3 |
