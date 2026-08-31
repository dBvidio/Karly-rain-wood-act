"use client";

import Image from "next/image";
import { track } from "@/lib/analytics";
import type { SiteContent } from "@/lib/content";

export default function Sidebar({ content }: { content: SiteContent }) {
  const { sidebar, images } = content;

  return (
    <aside className="flex flex-col bg-rain-500 text-white lg:sticky lg:top-0 lg:h-screen lg:w-96 lg:shrink-0 lg:overflow-y-auto">
      <div className="relative aspect-[4/3] w-full shrink-0 bg-rain-600 lg:aspect-square">
        <Image
          src={images.karlyPortrait.src}
          alt={images.karlyPortrait.alt}
          fill
          sizes="(min-width: 1024px) 384px, 100vw"
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
