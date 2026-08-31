"use client";

import Image from "next/image";
import { track } from "@/lib/analytics";
import type { SiteContent } from "@/lib/content";

export default function Sidebar({ content }: { content: SiteContent }) {
  const { sidebar, images, hero, campaign } = content;

  return (
    <aside className="flex flex-col bg-rain-500 text-white lg:sticky lg:top-0 lg:h-screen lg:w-2/5 lg:shrink-0 lg:overflow-y-auto">
      {/* Hero block — mirrors the campaign's original hero design (headline,
          subhead, ask, TAKE ACTION button, 3 reason cards), moved here from
          the top of <main> so it's the first thing every visitor sees,
          desktop or mobile, right above Karly's photo. Kept as a light,
          self-contained card so its black/purple text stays readable
          against the sidebar's solid rain-500 background. */}
      <div className="bg-gradient-to-b from-blush-100 to-white px-6 py-8 text-center lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-rain-600">
          {campaign.communityName} &middot; {campaign.hashtag} &middot; {campaign.hashtag2}
        </p>
        <h1 className="mt-3 font-display text-2xl font-bold leading-tight text-ink-900 sm:text-3xl">
          {hero.headline}
        </h1>
        <p className="mt-4 font-display text-lg font-bold text-rain-600">{hero.subhead}</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-700">{hero.ask}</p>

        <a
          href="#action"
          onClick={() => track("take_action_click", { source: "sidebar_hero" })}
          className="focus-ring mt-5 inline-block rounded-full bg-rain-500 px-8 py-3 text-sm font-bold tracking-wide text-white shadow-soft transition hover:bg-rain-600 active:scale-[0.98]"
        >
          {hero.ctaLabel}
        </a>

        <ul className="mt-6 space-y-3 text-left">
          {hero.reasons.map((reason, i) => (
            <li
              key={i}
              className="rounded-xl2 border border-rain-200 bg-white p-3.5 text-sm leading-relaxed text-ink-700 shadow-sm"
            >
              {reason}
            </li>
          ))}
        </ul>
      </div>

      <a
        href="#action"
        onClick={() => track("take_action_click", { source: "sidebar_challenge_bubble" })}
        className="focus-ring block bg-rain-600 px-6 py-4 text-center text-sm font-extrabold uppercase leading-snug tracking-wide text-white transition hover:bg-rain-700 active:scale-[0.98] lg:px-8"
      >
        {sidebar.challengeCta}
      </a>

      <div className="relative aspect-[4/3] w-full shrink-0 bg-rain-600 lg:aspect-square">
        <Image
          src={images.karlyPortrait.src}
          alt={images.karlyPortrait.alt}
          fill
          sizes="(min-width: 1024px) 40vw, 100vw"
          className="object-cover"
          priority
        />
      </div>

      <div className="flex flex-1 flex-col px-6 py-8 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/70">
          {sidebar.eyebrow}
        </p>

        <h2 className="mt-5 font-display text-xl font-bold">{sidebar.askHeading}</h2>
        <p className="mt-2 text-base leading-relaxed">{sidebar.askBody}</p>

        <h2 className="mt-6 font-display text-xl font-bold">{sidebar.detailsHeading}</h2>
        <div className="mt-2 space-y-3 text-base leading-relaxed text-white/95">
          {sidebar.detailsBody.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <p className="mt-6 font-display text-base italic leading-relaxed">{sidebar.ctaLine}</p>

        <a
          href="#action"
          onClick={() => track("take_action_click", { source: "sidebar" })}
          className="focus-ring mt-6 inline-block self-start rounded-full bg-white px-6 py-2.5 text-sm font-bold tracking-wide text-rain-600 shadow-soft transition hover:bg-blush-50 active:scale-[0.98]"
        >
          {sidebar.takeActionLabel} &darr;
        </a>

        <p className="mt-auto pt-8 text-xs text-white/60">{sidebar.footerLine}</p>
      </div>
    </aside>
  );
}
