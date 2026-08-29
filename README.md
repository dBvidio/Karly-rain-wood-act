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
email — they require their own secure webform (often with CAPTCHA and
required fields like topic/category), specifically to block mass /
automated submissions. That means a single "true one-tap send to all three
offices" isn't something any provider — Geocodio, Cicero, or even a paid
platform like Action Network — can fully deliver; even paid platforms
solve this by owning long-term relationships with individual congressional
IT offices, not through fully automation.

So the site implements the graceful fallback the brief explicitly allows:

1. Visitor writes/personalizes their letter.
2. Tapping **SEND TO MY LAWMAKERS** does two things in one tap:
   - Copies the finished message to the clipboard automatically (no manual
     text selection).
   - Opens the first office's official contact-form page in a new tab.
3. Two more one-tap buttons appear for the other two offices — the message
   is already on the clipboard, so it's copy-once, paste-three-times.
4. A standalone **COPY MESSAGE** button is always available too.

This is "as close to one tap as possible" within what congressional offices
actually allow, without pretending to a "fully automated" send that would
either be dishonest about what happened or would get flagged as spam by
congressional office software.

---

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

## Visual design — palette & type (flagged for review)

Updated from the placeholder rose/cream guess to a hot-pink / black / white
palette, per your direct description of KarlyRain.com (this environment
still cannot reach karlyrain.com, sites.google.com, or
karlyrainwoodact.com — confirmed via curl, WebFetch, and the network
proxy's own status log all agreeing it's an organization policy block, not
a transient failure — so nothing here was independently pixel-verified by
me):

| Token | Value | Source |
|---|---|---|
| `rain[500]` (primary CTA/accent) | `#e6007e` | First value in the `#E6007E`-`#EC1E79` range you gave — **please pixel-sample the real header banner yourself and correct this if it's off**; the rest of the `rain` ramp (50-900) is generated tints/shades of this one value |
| `ink[900]` (headline text, footer/sticky-bar background) | `#0d0d0d` | Near-black, per "headline text black" / "nav bar black" |
| `cream` (body background; legacy token name, kept to avoid touching every component) | `#ffffff` | Per "body white" |
| `gold` (secondary accent, used on 2 card borders) | `#e8b34c` unchanged | No secondary accent color was given — flagged as still unverified; drop or replace once you confirm whether the real site has one |

There's no top nav bar in this single-page design, so "black nav" was
applied to its closest equivalents: the mobile sticky action bar and the
footer are now `ink-900` (near-black) with white text, rather than
literally adding a nav element that doesn't otherwise fit the layout.

Typography is unchanged — `Fraunces` (display/serif) + `Inter` (body),
both Google Fonts — since no font names were given this round; swap the
imports in `app/layout.tsx` if KarlyRain.com uses something specific.

Verified by screenshot (local build; see chat for before/after images):
CTA button renders `rgb(230, 0, 126)` = `#e6007e`, body background
`rgb(255, 255, 255)` = white, H1 text `rgb(13, 13, 13)` = `#0d0d0d`, footer
background `rgb(13, 13, 13)`.

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
- **Sponsor titles** (`billStatus.statusNote`): you specified Senator Pete
  Ricketts (NE) as primary sponsor and *Representative* Deb Fischer (NE) as
  co-sponsor. I used that verbatim since it's what you sourced — but
  flagging it because Deb Fischer is publicly known as a sitting U.S.
  *Senator* from Nebraska, not a Representative. Worth double-checking
  against the bill's actual cosponsor listing on Congress.gov before this
  goes live, since a wrong chamber/title on a specific, checkable fact is
  the kind of error that undermines credibility fast.

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

I don't currently have Vercel or Netlify account access from this
environment, so I haven't deployed a live preview URL yet. To get you one
fastest:

- **Fastest path:** if you connect this GitHub repo to a Vercel or Netlify
  account (either invite me as a collaborator with deploy access, or share
  a deploy token / project you've already created), I can push the preview
  directly and hand you the URL.
- **Or, in the meantime, the fastest way for you to see it yourself:**
  import `dBvidio/Karly-rain-wood-act` at vercel.com/new (or
  app.netlify.com), point it at branch `claude/karly-rain-wood-advocacy-xvhykc`,
  and add the `GEOCODIO_API_KEY` environment variable — it'll deploy in
  under a minute and every future push to this branch will auto-update the
  preview URL.

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

## Project structure

```
app/
  layout.tsx          SEO/OG metadata, fonts
  page.tsx             composes all sections
  take-action/          /take-action → redirects to #action
  api/lookup/route.ts    ZIP/address → lawmakers (Geocodio)
  api/counter/route.ts   action counter (GET/POST)
components/            Hero, ActionFlow (the 3-step flow), ConfirmationShare,
                        LawmakerCard, PromptChips, StickyCta, and all
                        below-the-fold sections
content/site-content.json   ALL editable copy — see "How Amber updates content"
lib/                   content loader, Geocodio provider, counter store,
                        analytics, shared types
```
