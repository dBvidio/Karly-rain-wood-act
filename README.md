# Karly Rain Wood Act — #Pass5245

A single-page, mobile-first advocacy site whose one job is converting visitors
into people who contact their members of Congress in support of the Karly
Rain Wood Act (S. 5245). Built with Next.js (App Router) + Tailwind CSS.

## Quick start

```bash
npm install
cp .env.example .env.local   # then fill in GEOCODIO_API_KEY (see below)
npm run dev                  # http://localhost:3000
```

`npm run build && npm run start` for a production build locally.

**Deployment recommendation:** Vercel. This is a standard Next.js app (App
Router + two small API routes), which is exactly what Vercel is built for —
zero-config deploys, free tier covers this traffic easily, and it's the
natural home for the Vercel KV upgrade noted below. Netlify also works via
its Next.js runtime if preferred.

---

## How Amber updates content (no code required)

Almost everything on the page — headlines, the pre-written letter, prompt
chips, bill status, endorsements, press mentions, FAQ, donate copy, footer
links — lives in **one file**: `content/site-content.json`.

- Open the file, find the text you want to change, edit the value (the part
  in quotes after the colon), save.
- **Never** edit the keys (the part before the colon) — only the values.
- Search the file for `[Amber:` to find every placeholder that still needs
  real content before launch (see the full list at the bottom of this
  README).
- `billStatus.stage` / `billStatus.statusNote` / `billStatus.lastUpdated`
  is the bill-tracker section — update those three fields any time the
  bill's status in Congress changes.
- `endorsements.items` and `press.items` are arrays — copy an existing
  `{ ... }` block inside the `[ ]` and edit it to add a new endorser or
  press mention.

**Judgment call (flagged for review):** the brief allowed either "a
lightweight CMS or a structured content file/admin panel." I chose the
structured JSON file because it needs no new login, no monthly cost, and no
new system for Amber to learn — she (or anyone with GitHub access) edits one
plain-text file and the site rebuilds automatically on deploy. The
tradeoff: it requires being comfortable opening a file and editing text
between quotes, and every change needs a deploy (near-instant on Vercel,
~1 minute). **If Amber would rather log into a visual editor**, the natural
upgrade path is Tina CMS or Sanity pointed at this same JSON shape — both
can be layered on top without restructuring the site; flag it if that's
wanted and it can be added.

---

## How the "find my lawmakers" lookup works

**Provider: [Geocodio](https://www.geocod.io)** — a paid address-geocoding
API with a congressional-district lookup add-on.

Three options were weighed (per the brief):

| Option | Tradeoff |
|---|---|
| **Action Network / VoterVoice** (full advocacy platform) | Fastest to a fully turnkey flow — they handle lookup, message delivery, and campaign tracking. But recurring platform fees (typically $100s–$1000s/year), and the send step is usually an embed/iframe, which fights the custom, emotional, branded design this brief asks for. |
| **Cicero** (cicerodata.com) | Accurate, well-documented, but priced per lookup (~3–4¢/address at low volume) with no real free tier. Fine at scale, expensive to just get started. |
| **Geocodio — chosen** | Free account to start, transparent pay-as-you-go pricing that's cheap at this traffic scale, and — the deciding factor — its congressional-district data returns each legislator's **official contact-form URL directly**, which is exactly what the send flow below needs. |

One important note: **Google's Civic Information "representatives"
endpoint** — the option a lot of older tutorials point to — was **permanently
retired by Google in April 2025** and can't be used at all anymore. If you
see a tutorial or AI suggestion referencing it, it's out of date.

**Setup:** create a free account at geocod.io, generate an API key, put it
in `.env.local` (or your host's environment variables) as
`GEOCODIO_API_KEY`. Nothing else to configure — `lib/lookup.ts` is the only
file that talks to the provider, so swapping providers later means editing
that one file.

**If the API key isn't set, or a lookup fails or can't resolve a district**,
the page never silently fails — it shows a clear error message and a link
to Congress.gov's own official lookup tool, per the brief's requirement.

### Diagnosing a "find my lawmakers" failure

If FIND MY LAWMAKERS fails, the API route (`app/api/lookup/route.ts`)
always returns a `code` telling you exactly why — nothing fails silently.
The three possible codes, and now the message each shows the visitor:

| `code` | What it means | Message shown |
|---|---|---|
| `NOT_CONFIGURED` | **`GEOCODIO_API_KEY` isn't set** in the environment | "Lookup service not configured yet — our team needs to finish setting this up." |
| `NO_MATCH` | Key is set, but Geocodio couldn't match the address/ZIP to a district | "We couldn't match that to a congressional district..." |
| everything else | A real Geocodio API/network error | "Something went wrong on our end looking that up." |

Previously `NOT_CONFIGURED` and a real provider error both showed the same
generic message, which is almost certainly what the screenshot showed —
that's fixed now (`lookupStep.errorNotConfigured` in
`content/site-content.json`, wired up in `components/ActionFlow.tsx`), so
a missing key is now unambiguous on-screen instead of looking like an
unknown bug.

I confirmed locally (no key set) that the route returns exactly
`{"error":"Lookup failed.","code":"NOT_CONFIGURED"}`, and that this is the
*only* explanation needed here — the route, request handling, and response
shape all built and ran cleanly under Next 16 with no other errors. **The
environment variable name the code expects is `GEOCODIO_API_KEY`** (see
`.env.example` and `lib/lookup.ts`) — add it in Vercel under Project
Settings → Environment Variables and redeploy, and the lookup should work
immediately with no other changes needed.

---

## How "send to my lawmakers" works

Congressional offices, almost without exception, do **not** accept direct
email through a generic address — they require their own secure webform
(often with CAPTCHA and required fields like topic/category), specifically
to block mass/automated submissions. That means a single "true one-tap
send to all three offices" isn't something any provider — Geocodio,
Cicero, or even a paid platform like Action Network — can fully deliver;
even paid platforms solve this by owning long-term relationships with
individual congressional IT offices, not through automation. **Hard
constraint honored throughout:** nothing here ever fires a network request
that submits the visitor's message anywhere. Every path — contact-form tab
or `mailto:` — leaves the visitor looking at a filled-in draft they still
click "send" on themselves, on the office's own site or in their own email
client.

1. Visitor writes/personalizes their letter.
2. Tapping **SEND TO MY LAWMAKERS** does two things in one tap: copies the
   finished message to the clipboard, and opens *one* office's page in a
   new tab (never more than one automatically — Safari and other mobile
   browsers block multiple simultaneous `window.open()` calls from a
   single tap, which is why the pattern below stays one-auto-open +
   individual per-office buttons).
3. **Every official gets a visible action, never silently dropped.**
   (Previously, an official with no `contactFormUrl` in the lookup data
   just didn't get a button at all — that's what "only one lawmaker's
   contact info surfaces" turned out to be, not a lookup bug: all
   officials were always listed above, but only ones with that one field
   populated got a way to act on them. `bestLink()` in
   `components/ActionFlow.tsx` now always resolves to *something* real:
   their contact form, or their official site, or a Congress.gov search
   as a last resort — and the button's label changes accordingly, so a
   fallback link is never presented as if it were confirmed to be their
   contact form.)
4. If Geocodio returns a public email for an office, an **"Email
   directly"** button also appears — a `mailto:` link with the subject and
   full message pre-filled in the body. This is the one channel that's
   *guaranteed* to prefill correctly everywhere, since `mailto:` is a
   browser/OS-level standard, not dependent on any particular office's
   website.
5. A standalone **COPY MESSAGE** button is always available too, and each
   official's card repeats the "message copied — paste it in, nothing is
   sent automatically" note so it's never ambiguous what tapping a button
   does.

**What I could not verify, and why (flagged, not glossed over):** you
asked for real testing of 3-4 actual congressional offices' contact-form
URLs — whether each one truly is the contact page (not a homepage),
whether it accepts pre-fill via query parameters, and whether a direct
email exists. **This build environment has no network access to
`api.geocod.io`, `house.gov`, or `senate.gov`** — confirmed three separate
ways (direct `curl`, the network proxy's own status log, and `WebFetch`),
all returning the same organization-policy 403, not a transient failure.
I'm not fabricating a results table for pages I never loaded. What I *did*
verify, without needing that access: the UI now correctly handles every
data-completeness shape a real API response could plausibly send (full
data, missing contact form, missing everything but email) — tested across
3 simulated addresses, confirmed via Playwright that every official gets a
correctly-linked action, `mailto:` hrefs contain the real encoded
subject+body, the clipboard actually contains the message, zero unexpected
outbound `POST` requests fire (checked via the network tab, not assumed —
the only `POST`s are this app's own `/api/lookup`, which submits just the
ZIP/address, and `/api/counter`; neither ever carries the visitor's
message), and nothing advances without a manual click.

**Still open, needs one of:**
1. Grant this environment network access to `api.geocod.io` /
   `house.gov` / `senate.gov` so I can do the real per-office testing.
2. Visit a few offices yourself and tell me: is the `contactFormUrl` each
   one currently opens actually their message form (not a homepage), and
   does appending something like `?subject=X&message=Y` to it visibly
   pre-fill anything? Real per-office results, even for just 2-3 offices,
   would tell me whether query-param pre-fill is worth building for
   contact forms generally or is office-specific enough to skip.
3. Paste a raw JSON response from a real `/api/lookup` call (or the
   Geocodio API directly) so I can see exactly what data shape real
   addresses actually return, which would confirm or rule out the
   `bestLink()` fallback fix above as the complete explanation for "only
   one lawmaker's contact info surfaces."

---

## How the self-endorsement flow works

Under Endorsements, the "Endorse This Campaign" button opens a form
(`components/EndorseForm.tsx`) collecting Name, City, Group/business
(optional), Email, Phone (optional), and how they'd like to help (Get
involved / Donate / Both). Submitting posts to this app's own
`app/api/endorse/route.ts`, which validates the required fields server-side
and forwards the submission to a **Google Apps Script Web App** — chosen
for the same reason `content/site-content.json` was chosen over a paid CMS
(see above): no new login, no monthly cost, no new system for Amber to
learn beyond a Google Sheet she likely already has.

**What it does:** appends each submission as a new row in a Google Sheet
*and* emails a confirmation to `StandForKarlyRain@gmail.com` — both in one
Apps Script `doPost` call, no separate email service or paid API needed.

**Setup (Amber, ~10 minutes, no coding):** the full paste-and-deploy script
and step-by-step instructions are in
[`google-apps-script/endorsements.gs`](./google-apps-script/endorsements.gs)
— open a Google Sheet, paste that file into its Extensions -> Apps Script
editor, set your own secret string, deploy as a Web App, and put the
resulting URL + your secret into Vercel as `ENDORSEMENT_WEBHOOK_URL` and
`ENDORSEMENT_WEBHOOK_SECRET` (see `.env.example`).

**If those env vars aren't set yet**, the form still renders normally but
submitting shows a clear "aren't configured yet" error instead of silently
failing or crashing — same honesty-over-silent-failure pattern as the
lookup step above.

**Why a shared secret:** the Apps Script Web App URL, once deployed, is a
public URL (Apps Script has no simpler built-in auth for this use case).
Without a secret, anyone who found that URL could POST directly to it and
spam the sheet/inbox, bypassing this app's validation entirely. The secret
is generated by Amber, lives only in the Apps Script source and Vercel's
env vars (never in this repo, never client-side), and every request must
include the matching value or the script silently rejects it.

**Not yet verified end-to-end** — same caveat as Geocodio below: I wrote
and locally exercised the route's validation (missing fields, bad email,
unset `ENDORSEMENT_WEBHOOK_URL`) but have not deployed a real Apps Script
and confirmed a live submission lands a row + email, since that requires
Amber's own Google account. Once the Web App is deployed, submit one real
test entry and confirm both the sheet row and the email arrive.

## Action counter

`/api/counter` is a simple GET (read count) / POST (increment) endpoint.
It shows only real numbers — no randomization, no fake seeding.

**Ships with a local JSON-file store** (`lib/counter.ts` →
`data/action-count.json`), which is enough for local development but **will
not persist reliably on Vercel or other serverless hosts** (the filesystem
there is ephemeral). Before launch, swap the two functions in
`lib/counter.ts` to use **Vercel KV** or **Upstash Redis**
(`kv.incr("action_count")` / `kv.get("action_count")` — a few lines). Both
have free tiers large enough for this campaign. This is the only file that
needs to change.

---

## Analytics / funnel tracking

`lib/analytics.ts` exports a single `track(step, props)` function called at
each funnel step: `landing → take_action_click → find_reps_submit →
find_reps_success/error → personalize_edit / prompt_chip_used → send_click
→ message_copied → contact_form_opened → share_text / share_facebook /
share_copy_link`.

By default every event logs to the console (visible in your host's
function logs). If `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is set, events are also
sent to [Plausible](https://plausible.io) — chosen as the suggested default
because it's cookie-free (no cookie-consent banner needed on a page whose
whole job is fast conversion) and has a simple, cheap plan. Swap in GA4 or
another provider by editing that one file if preferred.

---

## SEO / sharing

- `app/layout.tsx` sets title, meta description, and Open Graph / Twitter
  card tags, all pulled from `content/site-content.json` so they stay in
  sync with the visible copy.
- `public/og-image.svg` is a **placeholder** share-preview image (plain
  text on the palette below) — replace with a real designed 1200×630 image
  before launch for the best share-card appearance on Facebook/iMessage/etc.
- `/take-action` is a shareable, memorable route that redirects straight to
  the action flow on the homepage, per the requested URL structure.

---

## Visual design — palette & type

**Resolved and confirmed final.** You pulled these directly from
KarlyRain.com's live DOM via computed styles (not a screenshot guess) and
confirmed them as final — no more re-checking needed on these values:

| Token | Value | Source |
|---|---|---|
| `rain[500]` / primary CTA-accent | `#ab0e7b` | Dominant brand color (main section backgrounds, buttons on the real site) — replaces the earlier `#e6007e` guess |
| `pink-light` (= `rain[200]`) | `#f7a1da` | Lighter secondary accent (top banner) |
| `ink[900]` / "black" | `#000000` | Nav/text — true black, replacing the earlier `#0d0d0d` approximation |
| `cream` (body background; legacy token name, kept to avoid touching every component) | `#ffffff` | Body white |
| `gold` (secondary accent, used on 2 card borders) | `#e8b34c` unchanged | Still unverified — no secondary accent beyond `pink-light` was confirmed; drop or replace if it clashes |

The rest of the `rain` ramp (50-900) is generated tints/shades of
`#ab0e7b`, so `rain[200]` lands almost exactly on `#f7a1da` on its own —
both values are the same hue at different lightness, which is a good
consistency signal that this is one coherent brand color, not two.

There's no top nav bar in this single-page design, so "black nav" was
applied to its closest equivalents: the mobile sticky action bar and the
footer are `ink-900` (true black) with white text, rather than literally
adding a nav element that doesn't otherwise fit the layout.

Typography is unchanged — `Fraunces` (display/serif) + `Inter` (body),
both Google Fonts — since no font names have been given; swap the imports
in `app/layout.tsx` if KarlyRain.com uses something specific.

Verified by screenshot (local build; see chat for before/after images):
CTA button renders `rgb(171, 14, 123)` = `#ab0e7b`, body background
`rgb(255, 255, 255)` = white, H1 text `rgb(0, 0, 0)` = `#000000`, footer
background `rgb(0, 0, 0)`.

---

## Accessibility

- Semantic headings, labeled form inputs (`<label htmlFor>` on every
  field), `role="alert"` on the lookup error state.
- Visible focus rings (`focus-ring` utility) on every interactive element,
  not just default browser outlines that some resets remove.
- Color choices in `tailwind.config.ts` were picked for readable contrast
  on both the cream background and the rain-red buttons — verify with a
  contrast checker once real KarlyRain.com hex values are dropped in.
- Respects `prefers-reduced-motion`.
- Alt text: add real `alt` attributes once real endorsement/press logos
  and photos are added (they're empty placeholders for now).

---

## What's placeholder / still needs Amber

Karly's story, the bill summary, bill status, sponsors, donate links, press,
and social links were updated from real source content pulled from
KarlyRain.com / KarlyRainMatters.com. Search `content/site-content.json`
for `[Amber:` to find what's still an explicit placeholder — currently just:

- **Endorsements** (`endorsements.items`) — one placeholder entry ships so
  Amber has a template to fill in. Real endorser quotes/logos still needed;
  sponsors Ricketts and Fischer are already listed correctly in
  `billStatus` and in the endorsements section intro as "sponsored by," not
  as fabricated endorsement quotes.
- **2 FAQ answers** (`faq.items`) — "What is the Karly Rain Wood Act?" and
  "Is my information stored or sold?" — left untouched per your instruction
  since there's no source material for those yet.

  **Note on both of these:** `components/Endorsements.tsx` and
  `components/Faq.tsx` now use a shared `isPlaceholder()` check
  (`lib/placeholder.ts`) to skip rendering any item whose text still
  contains `[Amber:` — so visitors never see a bracketed editorial note as
  if it were real copy (confirmed by reading the rendered page's actual
  text content, not just the JSON). The JSON placeholder stays in place so
  Amber still sees exactly what to fill in; if only placeholder items exist
  in a section (as is currently true for endorsements), that section quietly
  shows nothing instead of an empty-looking placeholder card. Once real
  content replaces `[Amber: ...]` in the JSON, it'll start rendering
  automatically — no code change needed.
- `public/og-image.svg` — placeholder share image, needs a real design.
- `tailwind.config.ts` — palette updated to pink/black/white this round;
  see "Visual design" above for exact values and what's still unverified.
- `GEOCODIO_API_KEY` — required for the lookup to function; see "Diagnosing
  a find-lawmakers failure" below.
- `ENDORSEMENT_WEBHOOK_URL` / `ENDORSEMENT_WEBHOOK_SECRET` — required for
  the self-endorsement form to submit; see "How the self-endorsement flow
  works" above.
- Counter store — swap to Vercel KV/Upstash before launch (see above).

**Flagged for your confirmation (pulled from an external site, not from you
or Amber directly, so unverified):**
- `donate.donateUrl` (GoFundMe) and `donate.venmoHandle` (`@karlyrain`) —
  confirm both are still active/monitored before launch.
- The 5 social links in `footer.socialLinks` were *constructed* from the
  handles you gave (e.g. `@StandUpForKarlyRain` → `facebook.com/StandUpForKarlyRain`)
  using each platform's standard URL pattern — they were not copied from a
  working link I visited. Click through all 5 before launch, especially the
  Facebook group: Facebook groups often use a numeric ID rather than a
  vanity slug, so `facebook.com/groups/RememberKarlyRain` may 404 even
  though the handle itself is right.
- ~~**Sponsor titles**~~ — **resolved.** You confirmed Deb Fischer is a
  sitting U.S. Senator (NE), not a Representative; `billStatus.statusNote`
  and `endorsements.intro` now both read "Senator Deb Fischer" as a Senate
  co-sponsor alongside Senator Pete Ricketts.

Nothing about Karly, the bill's text, or endorsers has been invented —
everything above is either sourced from what you provided, or an explicit
placeholder/flag rather than a guess.

---

## Mobile flow testing (flagged — emulated, not a physical device)

This build environment has no physical phone attached and no camera/screen
to hand a real device to, so "on an actual phone" was tested as closely as
this environment allows: a headless Chromium instance with Playwright's
**iPhone 13 device emulation** (390×664 viewport, mobile user agent, touch
input) driving the deployed build through the real DOM/JS — not a
simulated click via test IDs.

Confirmed working, end to end, with 0 JavaScript console errors:
- ZIP submission → lawmaker cards render with checkmarks → auto-advance to
  the personalize/send step.
- Tapping a prompt chip ("I'm a parent") correctly inserts its starter
  sentence into the personalization box.
- **COPY MESSAGE**: one tap, no text selection — verified by reading the
  OS clipboard afterward and confirming it contains the subject line, the
  letter body, *and* the personalization text, concatenated correctly.
- **SEND TO MY LAWMAKERS**: one tap copies the message to clipboard *and*
  calls `window.open()` on the first office's contact-form URL — confirmed
  by intercepting `window.open()` calls in-page (needed because this
  sandbox's network policy blocks outbound requests to arbitrary test
  domains, which would otherwise make a real navigation attempt look like
  a failure that isn't actually one).
- The two remaining "Open contact form: <name>" buttons each opened their
  own office's distinct contact-form URL — all **3 offices covered**, no
  duplicates missed, the already-opened one still marked with a checkmark.
- Confirmation step renders, and the server-side action counter increments
  by exactly 1 per real send (verified 1 → 2 → 3 across test runs — no
  fake/random numbers).

**What this doesn't cover** that only a real phone can: actual mobile
Safari/Chrome popup-blocking behavior (iOS Safari is stricter about
multiple `window.open()` calls from one gesture than desktop Chromium —
this is why the UI opens only the *first* office automatically on SEND and
surfaces the other two as separate, explicit one-tap buttons rather than
trying to open three tabs from a single click), on-device clipboard
permission prompts, and real-world thumb ergonomics/tap-target sizing.
**Recommend one real hands-on pass on an iPhone and an Android phone**
before launch, specifically checking: does iOS Safari block or silently
no-op the SEND button's automatic first-tab-open, and do all tap targets
feel comfortably sized.

---

## Geocodio integration — not yet verified end-to-end (blocked)

I could not complete this. Geocodio requires a registered API key tied to
an account (with billing set up beyond the free trial credits), and I have
neither a `GEOCODIO_API_KEY` nor authorization to create a paid account on
your behalf. `lib/lookup.ts` / `app/api/lookup/route.ts` are written and
already handle the full response shape (2 senators + 1 representative,
each with `contactFormUrl`), and the "not configured" / "no match" /
"provider error" paths are all covered and tested (see build log above:
hitting `/api/lookup` locally with no key correctly returns
`{"error":"Lookup failed.","code":"NOT_CONFIGURED"}` rather than failing
silently) — but I have not made a single real call to Geocodio's API, so I
cannot yet confirm real addresses return correct offices or that the
`contact_form` URLs Geocodio provides are live, correct, and point at the
actual message-submission form rather than a generic "contact" landing
page.

**What I need from you to finish this:**
1. A Geocodio API key (free signup at geocod.io gets trial credits) —
   either send it to me to add as `GEOCODIO_API_KEY` and I'll run the
   verification, or run it yourself: `curl "https://api.geocod.io/v1.7/geocode?q=<ADDRESS>&fields=cd&api_key=<KEY>"`
   and check `results[0].fields.congressional_districts[0].current_legislators`
   for 1 senator×2 + 1 representative, each with a non-empty
   `contact.contact_form` URL.
2. Once I have a key, I'll test 2-3 real addresses spanning different
   states (to catch state-specific formatting issues) and report back
   specifically on: whether all 3 offices resolve, whether every
   `contact_form` URL is present and loads, and whether any of them land
   on a generic office page instead of the actual message form (a known
   risk with some smaller House offices whose sites route "contact" to a
   menu page rather than a direct form).

---

## Deploying a preview

**You've deployed one yourself:** https://karly-rain-wood-act.vercel.app/
— thank you. One caveat: I still can't visit it from this environment
myself to verify it (this session's network policy blocks essentially all
outbound browsing, confirmed against multiple unrelated domains including
this one — not something specific to karlyrain.com). So I can't confirm
the deployed build actually reflects the latest push, or eyeball it the
way I can the local build. If Vercel is set to auto-deploy on push to
`claude/karly-rain-wood-advocacy-xvhykc`, it should already be current;
worth a manual check on your end that it picked up the latest commit,
and letting me know if anything looks different from the local
screenshots in this conversation.

---

## Next.js version

Upgraded to **Next.js 16.3.3** (from 14.2.x) to clear the high-severity
`npm audit` advisories that only had fixes upstream in Next 15/16
(SSRF/cache-poisoning classes) — `npm audit` now reports **0
vulnerabilities**. React/ReactDOM were bumped to 19.2.0 to match (Next 16
requires React 19).

**What broke and was fixed as part of the upgrade:**
- `next lint` was removed in Next 16 — the `lint` script now runs `eslint .`
  directly, and ESLint config moved from the old `.eslintrc.json` to a flat
  `eslint.config.mjs` (ESLint 9 requires flat config; `eslint-config-next`
  16.x ships its ruleset as a ready flat-config array, so
  `eslint.config.mjs` just re-exports it plus an `ignores` block for
  `.next/`).
- `eslint` itself had to move from 8.x to 9.x (peer requirement of
  `eslint-config-next@16`).
- `postcss` was bumped to 8.5.26 (was pinned to a version with its own
  advisories, independent of Next).
- Next 16's build step auto-migrated `tsconfig.json` (added Turbopack's dev
  types path, set `jsx: "react-jsx"`) — left as Next generated it.

**Re-verified after the upgrade:** clean `npm run build`, clean
`npm run lint` (0 errors/warnings), and a full mobile-emulated run of the
find-lawmakers → personalize (incl. prompt chip) → copy-message →
send → open-each-contact-form → confirmation flow with 0 JavaScript
console errors and the clipboard/window.open behavior verified
programmatically (see "Mobile flow testing" below). Nothing else in the
app code needed to change — this project doesn't use any of the App
Router APIs whose behavior changed across 15/16 (no dynamic route params,
no `cookies()`/`headers()`, fetches already opt out of caching with
`cache: "no-store"`).

---

## Layout — two-panel sidebar structure

The page is a two-panel layout, simplified to match a reference screenshot
of ANCOR's own VoterVoice-based advocacy page (bleed photo + "The Ask" +
"The Details," nothing else competing for attention in the sidebar):

- **`<aside>`** (`components/Sidebar.tsx`) — `rain-500` (`#ab0e7b`)
  background, white text, edge-to-edge photo at the top (no border/rounded
  corners, matching the reference). Below that: a small `#Pass5245`
  eyebrow, "The Ask:" (one short paragraph), "The Details:" (1-2 short
  paragraphs on what the bill does), an italic closing call-to-action
  line, a compact "Take action ↓" link, and a small footer line — all
  pulled from the `sidebar` block in `content/site-content.json`. On
  desktop (`lg:` and up) it's a fixed-width (`w-96`), sticky,
  independently scrolling column pinned to the left; below that
  breakpoint it's a normal block stacking above `<main>` — same component,
  no separate mobile layout to maintain.
- **`<main>`** — white background. Starts with `components/MainIntro.tsx`
  (the page headline + the 3 short "why this matters" reasons — moved out
  of the sidebar to keep it as uncluttered as the reference, but kept
  somewhere since the brief explicitly wanted them near the top). Then the
  interactive flow (`ActionFlow`) and every below-the-fold section (Karly's
  story, Community, bill summary/status, endorsements, donate, press, FAQ,
  footer) — none of that was in the ANCOR reference (their widget is
  narrowly single-purpose), but nothing asked for it to be removed, so it
  stays per the original brief.

`app/page.tsx` wraps both in a `flex flex-col lg:flex-row` container, so
the breakpoint is the only thing that changes stacked-vs-side-by-side;
there's no JS/media-query logic duplicating the layout.

## Images

**Resolved — all 4 photos are in place.** After two rounds of chat
attachments not making it to disk (pasted/inline images aren't readable
files in this environment, and one earlier attachment didn't match its
filename — see git history on this file for the full story if useful
context later), the files were pushed directly to the repo via GitHub's
web upload, which sidesteps chat entirely. They landed at the repo root
rather than `public/images/`; moved into place with `git mv`.

**Before wiring anything in, each file was opened and visually confirmed
to actually match its filename** — not taken on faith a second time:

| Photo | Used in | Path | Notes |
|---|---|---|---|
| Karly portrait | Sidebar | `/public/images/karly-portrait.jpg` | Used as-is |
| "Forever in Our Hearts" memorial poster | Karly's story section | `/public/images/karly-memorial-poster.jpg` | Cropped — the original was a phone-gallery screenshot with a status bar and a "Celebration of Life" caption baked in below it; cropped down to just the poster itself. The gallery's semi-transparent prev/next arrow icons are still faintly visible over the image (baked into the screenshot's pixels, not something a rectangular crop can remove) — cosmetically minor, but worth a real re-photograph of just the poster if a cleaner version is wanted later. |
| "We Will Never Forget" yard sign | Community/movement section | `/public/images/never-forget-yard-sign.jpg` | Used as-is, resized/compressed for web |
| First Alert 6 news graphic ("Karly Rain Wood Act Introduced") | Press & media section | `/public/images/press-tv-coverage.jpg` | Used as-is, resized/compressed for web |

All 4 were also resized/recompressed for web (largest is ~400KB, the
yard sign at 1050×1400).

Verified end to end, not just "the file exists": `/_next/image` requests
for all 4 return 200 (were 400 before), all 4 render in their correct
sections at the correct viewports (see screenshots), no `[Amber:]`
placeholder text remains anywhere, the 40/60 desktop split and mobile
stacking are unaffected, and the full find-lawmakers → personalize →
send → confirmation flow still works with 0 JS errors.

## Project structure

```
app/
  layout.tsx          SEO/OG metadata, fonts
  page.tsx             two-panel shell: <Sidebar/> + <main> with everything else
  take-action/          /take-action → redirects to #action
  api/lookup/route.ts    ZIP/address → lawmakers (Geocodio)
  api/counter/route.ts   action counter (GET/POST)
  api/endorse/route.ts   self-endorsement form → Google Sheet + email (Apps Script)
components/            Sidebar (now includes the hero block above Karly's
                        photo), ActionFlow (the 3-step flow), ConfirmationShare,
                        LawmakerCard, PromptChips, StickyCta, Community,
                        EndorseForm, and all other below-the-fold sections
content/site-content.json   ALL editable copy, incl. the `images` block — see
                             "How Amber updates content"
lib/                   content loader, Geocodio provider, counter store,
                        analytics, placeholder-hiding helper, shared types
google-apps-script/    endorsements.gs — paste-and-deploy script for the
                        self-endorsement Google Sheet + email flow
```
