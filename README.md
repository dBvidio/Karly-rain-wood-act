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

The brief asked the palette and type to match KarlyRain.com. **This build
environment's network access to karlyrain.com was blocked**, so the exact
hex values in `tailwind.config.ts` (under the `rain` / `blush` / `ink` /
`cream` / `gold` keys) are a considered placeholder — warm cream
background, a strong rose-red "rain" accent for the primary action color,
soft blush for secondary surfaces — not colors pulled from the live site.

**Before launch:** open KarlyRain.com, pick out its real hex values (colors
+ exact font names), and update `tailwind.config.ts` — every component
pulls its colors from that one file, so it's a single edit to bring the
whole site in line. Typography is currently `Fraunces` (display/serif,
Google Fonts) + `Inter` (body, Google Fonts) as a warm-but-modern pairing;
swap the font imports in `app/layout.tsx` if KarlyRain.com uses something
specific.

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

Search `content/site-content.json` for `[Amber:` — every one of these is a
spot where real content is required and none has been fabricated:

- Hero: the 3 "why this matters" reasons
- Karly's story (`why.body`) and optional pull-quote
- Plain-language bill summary bullets (`billSummary.points`)
- Bill status (`billStatus.stage`, `.statusNote`, `.lastUpdated`)
- Endorsements — real organizations/quotes only (one placeholder entry
  ships so the layout isn't empty; delete it once real endorsers are added)
- Press mentions
- Donate section link (`donate.donateUrl`) — wire up ActBlue / Donorbox /
  GiveButter once a processor is chosen
- Press/contact/endorsement emails
- Footer social links
- `public/og-image.svg` — replace placeholder share image with a designed one
- `tailwind.config.ts` — swap in real KarlyRain.com colors/fonts (see above)
- `GEOCODIO_API_KEY` — required for the lookup to function at all
- Counter store — swap to Vercel KV/Upstash before launch (see above)

Nothing about Karly, the bill's text, statistics, or endorsers has been
invented — every one of those spots is an explicit placeholder rather than
a guess.

---

## Known issue (flagged for review)

`npm audit` currently reports high-severity advisories against the pinned
Next.js 14.2.x / bundled PostCSS versions (SSRF/cache-poisoning classes,
patched upstream in Next 15/16). Fixing them cleanly means a major-version
upgrade to Next.js, which is a real migration (App Router behavior changes)
rather than a drop-in patch — not something to do silently inside this
build. Recommend scheduling that upgrade as a follow-up task before or
shortly after launch rather than shipping it unverified here.

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
