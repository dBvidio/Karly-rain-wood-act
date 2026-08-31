"use client";

import Image from "next/image";
import { track } from "@/lib/analytics";
import type { SiteContent } from "@/lib/content";

export default function Sidebar({ content }: { content: SiteContent }) {
  const { hero, campaign, billStatus, images } = content;

  return (
    <aside className="bg-rain-500 px-6 py-10 text-white lg:sticky lg:top-0 lg:h-screen lg:w-96 lg:shrink-0 lg:overflow-y-auto lg:px-8 lg:py-12">
      <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/80">
        {campaign.hashtag}
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold leading-tight sm:text-4xl">
        {hero.headline}
      </h1>

      <div className="relative mt-6 aspect-square overflow-hidden rounded-xl2 border-4 border-white/25 bg-white/10 shadow-soft">
        <Image
          src={images.karlyPortrait.src}
          alt={images.karlyPortrait.alt}
          fill
          sizes="(min-width: 1024px) 320px, 100vw"
          className="object-cover"
        />
      </div>

      <div className="mt-7">
        <p className="text-xs font-bold uppercase tracking-widest text-white/70">The Ask</p>
        <p className="mt-1 text-base leading-snug">{hero.ask}</p>
        <a
          href="#action"
          onClick={() => track("take_action_click", { source: "sidebar" })}
          className="focus-ring mt-4 block rounded-full bg-white px-6 py-3 text-center text-base font-bold tracking-wide text-rain-600 shadow-soft transition hover:bg-blush-50 active:scale-[0.98]"
        >
          {hero.ctaLabel}
        </a>
      </div>

      <div className="mt-8">
        <p className="text-xs font-bold uppercase tracking-widest text-white/70">The Details</p>
        <ul className="mt-2 space-y-1.5 text-sm text-white/90">
          <li>
            <span className="font-semibold text-white">Bill:</span> {campaign.billNumber}
          </li>
          <li>
            <span className="font-semibold text-white">Status:</span> {billStatus.stage}
          </li>
          <li>
            <span className="font-semibold text-white">Sponsors:</span> {billStatus.sponsorsShort}
          </li>
        </ul>
      </div>

      <ul className="mt-8 space-y-3 text-left">
        {hero.reasons.map((reason, i) => (
          <li key={i} className="rounded-xl border border-white/25 bg-white/10 p-3 text-sm">
            {reason}
          </li>
        ))}
      </ul>
    </aside>
  );
}
