# Intern Brief — Risen Results

**Read this first. It takes ten minutes and it will save you a week.**

Last updated: 2026-08-25 · Owner: Ibrahim Khan

---

## 1. What Risen Results is

Risen Results is a **lead-generation business** with a technology platform behind it.

The short version: we run websites that ask visitors to fill in a form. Each
completed form is a **lead** — a real person who wants something (a home
improvement quote, a paid clinical trial, a product). We check the lead is real,
score how good it is, and then sell or hand it to a **buyer** who wants to talk
to that person. We get paid per lead, and sometimes again when the buyer closes
a sale.

The unusual part is that it is **one codebase serving many different brands**.
WindowHound, RatedGutters, Med Trial Match, ReliefOlogist, Genetic Elements,
ClientCrates and others all run on the same software. Each brand has its own
domain, its own look, its own form questions, its own legal copy and its own
buyers — but underneath it is one system. When you write copy or design a funnel,
you are usually writing it for **one brand**, and the pattern gets reused across
others.

There is also an internal side — admin, buyer and client portals — but you will
not touch those. Your work is on the **public-facing funnel** and the **research
that decides what we build next**.

---

## 2. How the money actually works

You need this to understand why some of the tasks look pedantic. They are not.

**Path 1 — we sell the lead.**
Visitor lands → fills the form → we validate and score them → we deliver the lead
to a buyer via an API call → the buyer pays us. If the buyer later closes a sale
they may send back a "converted" signal, which tells us that source was good.

**Path 2 — someone else sent us the traffic (revshare).**
A lot of our traffic comes from **affiliates** and third-party media buyers. They
send visitors to our pages with a tracking code stuck on the URL — a **subID**.
Something like:

```
https://windowhound.com/?sub1=facebook_grp3&sid2=creative_7&clickid=abc123
```

When that person converts, the affiliate is owed a share. Which affiliate gets
paid is decided by **first touch** — whoever sent the person the *first* time
owns them, even if they come back later through a different route. That is why
our system deliberately keeps the subID of the *first* submission and rejects
later duplicates rather than the other way around.

**If a subID is lost anywhere along the chain, someone does not get paid, or the
wrong person gets paid.** There is no way to reconstruct it afterwards. This is
the single most fragile thing in the business, and it is why Lane C exists.

**Path 3 — offer clicks.**
On some brands, after someone submits a form we show them a wall of relevant
offers. When they click through and convert on the partner's site, we earn. Those
clicks go through our own redirect first so we can record who clicked what.

---

## 3. The only number that matters right now

On **2026-08-20** leadership reset the priorities. The full recap is in
`meeting-insights/2026-08-20-precision-risen-daily-standup.md`. The headline:

> Conversion — not platform features — is now the whole job. Site traffic
> converts at ~1% while warming campaigns are about to push real volume, so
> every non-conversion project is paused for at least a week.

The numbers behind it:

| Metric | Where it is | What it should be |
|---|---|---|
| Visit → lead conversion | **~1%** | Direct-response funnels in this space run 5–15% |
| Email open rate | **56%** (good) | — |
| Email click rate | **Unacceptably low** | This is the gap: they open, then do nothing |
| Domain/IP warming ramp | 30–45 days to full volume | In progress now |

Two decisions from that meeting shape everything you do:

> *"Landing pages get an 'in-your-face' CTA as the first element seen."* —
> because the audience responds to direct benefit copy, not polish.

> *"The Precision platform is good enough — stop polishing, start earning."*

**What this means for you:** if your instinct is "this page needs a nicer hero
image and more whitespace", suppress it. The comps we are copying — **Good Labs,
Day One Lab, Bright Fire** — are deliberately ugly and deliberately effective.
Big blunt promise, form immediately, no scrolling required. Study them.

---

## 4. Who we are talking to

For Med Trial Match specifically, and broadly across brands: our visitors are
often **people who need money or need medical help**. They are not sophisticated
web users. They are on a phone, possibly an old one, possibly on a slow
connection, and they are skimming.

That leads to hard rules for copy:

- **Benefit first, in the first 5 words.** "Earn up to $5,000" beats "Discover
  paid research opportunities near you."
- **Plain language.** No industry words. No cleverness. No puns.
- **Say the number.** Dollar amounts, timeframes, "takes 60 seconds".
- **Mobile is the design.** Desktop is the afterthought, not the other way round.
- **One action per screen.** If there are two things to click, you have made it
  worse.

---

## 5. Where you fit — the three lanes

| Lane | Focus | Best fit | Priority |
|---|---|---|---|
| **A — Conversion & Copy** | Landing pages, CTAs, funnel variants, email bodies | Marketing-leaning | **1st** |
| **B — Market & Tooling Research** | Competitor platforms, verification vendors, deliverability | Generalist | 2nd |
| **C — Tracking & Data Specs** | SubID lifecycle, revenue reconciliation, API and provider specs | Dev-leaning | 3rd |

With **three interns**, take one lane each. With **two**, one person takes Lane A
and the other runs B then C in sequence.

Your actual assignments are in [intern-tasks.md](intern-tasks.md). Each task card
tells you exactly what to produce and how we will judge whether it is done.

---

## 6. Ground rules

**Access**

- You do **not** get repository access. You are not writing code, and no task
  requires it. Everything you produce is a document, a spreadsheet, a wireframe
  or a copy deck.
- You do **not** get production data access.
- **Never work with real lead records.** Our lead rows contain real people's
  email addresses and phone numbers. If someone sends you a data sample,
  stop and tell Ibrahim. Where a task needs example data, **invent it** —
  synthetic rows only.

**Deliverables**

- Everything goes in the shared drive, using the **exact filename** the task card
  specifies. Ibrahim integrates your work by hand; consistent names are what make
  that cheap instead of painful.
- Markdown or Google Docs for prose. Google Sheets or CSV for anything tabular.
- **Cite your sources.** A claim about a competitor's pricing without a link is
  not usable — we cannot act on it.
- **Say when you are unsure.** "Vendor does not publish pricing; sales-gated" is
  a useful finding. A confident guess is not.

**Working**

- Weekly check-in with Ibrahim. Bring what you finished and what blocked you.
- **Ask before expanding scope.** Every task card has a "Don't do" line. It is
  there because that work is either already done, already assigned, or not worth
  doing yet. Sticking to the box is the job.
- If a task turns out to be wrong or impossible, say so early. That is a finding,
  not a failure.

---

## 7. What already exists — do not re-specify this

A lot more is built than you would guess. Specifying something that already ships
is the most common way to waste a fortnight here. Check this table before you
start, and ask if you are unsure.

| Thing | Status | Notes |
|---|---|---|
| Capturing subIDs off the URL and storing them on the lead | ✅ **Built** | Handles ~15 parameter naming conventions today |
| First-touch duplicate handling that protects subID credit | ✅ **Built** | The kept lead keeps the credit |
| DNC / TCPA-litigator phone scrubbing (Blacklist Alliance) | ✅ **Built and live** | Fails closed — holds the lead if the check is unreachable |
| TrustedForm certificate verification (ActiveProspect) | ✅ **Built and live** | |
| A/B test engine — split traffic across funnel variants, with a holdback | ✅ **Built** | The plumbing exists; what is missing is the *content* of the variants |
| Step-by-step funnel tracking, including abandonment | ✅ **Built** | We can already see which step people quit on |
| First-party click tracking on offers and partner links | ✅ **Built** | |
| Buyer postbacks — buyers telling us a lead sold/converted | ✅ **Built** | Signed, and it carries a price field |
| Reporting on which traffic source produces revenue | ✅ **Built** | |
| Email sending across SendGrid / Resend / SES, with open and click tracking | ✅ **Built** | |
| Everflow connection | 🟡 **Partial** | We pull the offer catalogue and generate tracking links. We do **not** pull conversions back. → Task C3 |
| Email / phone / IP verification providers | 🟡 **Registered, not working** | 33 providers are wired into the settings screen but the actual API calls are empty placeholders. → Task C4 |
| Tracking an anonymous click *before* a form is submitted | ❌ **Missing** | Today attribution starts at the lead |
| A conversions/revenue table, and uploading revenue by hand | ❌ **Missing** | → Task C2 |
| Inbox-placement / seed-list deliverability tooling | ❌ **Missing** | → Task B3 |

---

## 8. Glossary

| Term | Meaning |
|---|---|
| **Brand** | One white-label site on its own domain (WindowHound, Med Trial Match…). Has its own theme, form questions, legal copy and buyers. |
| **Vertical / sub-vertical** | The category tree above a brand. Vertical = broad (home improvement), sub-vertical = specific (window replacement). A brand's form questions are inherited from these. |
| **Lead** | One submitted form = one real person who wants something. The product we sell. |
| **Buyer** | The company that buys leads from us. |
| **Funnel** | The path from landing on a page to submitting the form. Usually multi-step. |
| **CTA** | Call to action — the button or form we want the visitor to engage with. |
| **SubID** | A tracking code on the URL identifying which affiliate/campaign/creative sent this visitor. Written as `sub1`, `sid2`, `clickid`, `aff_sub3` and about a dozen other spellings depending on the network. |
| **First-touch attribution** | The rule that the *first* source to send a person owns them for revshare, even if they come back via another route later. |
| **Postback** | A server-to-server HTTP call reporting that something happened — e.g. an advertiser telling us "that lead converted, here is the revenue". The alternative to a tracking pixel. |
| **Pixel** | A tracking image/script fired in the browser to report a conversion. Less reliable than a postback; some advertisers use neither, which is why manual revenue upload matters. |
| **Scrub** | Compliance checks run before we contact or sell a lead — is this number on a Do-Not-Call list, is it a known TCPA litigator. |
| **Enrichment** | Adding data we were not given: is this email deliverable, is this phone a mobile or a VoIP number, is this IP a proxy. Feeds the lead score. |
| **Scoring** | Rating lead quality so we route the good ones to the buyers who pay most. |
| **Warming** | Slowly ramping email volume on a new domain/IP over 30–45 days so mailbox providers trust you. Send too much too fast and you land in spam permanently. |
| **10DLC** | US carrier registration required to send business SMS. Without it, texts get blocked. |
| **TrustedForm** | An ActiveProspect product that produces a certificate proving a person really did consent on a real form. Legal protection. |
| **Everflow** | The affiliate-tracking network we benchmark against and partly integrate with. |
| **Precision** | Our email/marketing distribution product. |

---

## 9. Questions

Ask Ibrahim. A question on Monday is cheaper than a wrong deliverable on Friday.
