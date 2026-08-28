"use client";

import { track } from "@/lib/analytics";
import type { SiteContent } from "@/lib/content";

export default function Hero({ content }: { content: SiteContent }) {
  const { hero, campaign } = content;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blush-100 via-cream to-cream px-5 pb-12 pt-10 text-center sm:pt-16">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-rain-600">
        {campaign.communityName} &middot; {campaign.hashtag}
      </p>
      <h1 className="mx-auto max-w-3xl font-display text-3xl font-bold leading-tight tracking-tight text-ink-900 sm:text-5xl">
        {hero.headline}
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-lg font-semibold text-rain-600 sm:text-xl">
        {hero.subhead}
      </p>
      <p className="mx-auto mt-3 max-w-xl text-base text-ink-700 sm:text-lg">
        {hero.ask}
      </p>

      <a
        href="#action"
        onClick={() => track("take_action_click", { source: "hero" })}
        className="focus-ring mt-7 inline-block w-full max-w-sm rounded-full bg-rain-500 px-8 py-4 text-lg font-bold tracking-wide text-white shadow-soft transition hover:bg-rain-600 active:scale-[0.98] sm:w-auto"
      >
        {hero.ctaLabel}
      </a>

      <ul className="mx-auto mt-10 grid max-w-3xl gap-4 text-left sm:grid-cols-3">
        {hero.reasons.map((reason, i) => (
          <li
            key={i}
            className="rounded-xl2 border border-rain-100 bg-white/80 p-4 text-sm font-medium text-ink-700 shadow-sm"
          >
            {reason}
          </li>
        ))}
      </ul>
    </section>
  );
}
