"use client";

import { useState } from "react";
import type { SiteContent } from "@/lib/content";
import { isPlaceholder } from "@/lib/placeholder";
import EndorseForm from "./EndorseForm";

export default function Endorsements({ content }: { content: SiteContent }) {
  const { endorsements } = content;
  const [formOpen, setFormOpen] = useState(false);
  const realItems = endorsements.items.filter(
    (item) => !isPlaceholder(item.name) && !isPlaceholder(item.quote)
  );

  return (
    <section className="bg-blush-50 px-5 py-14">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-widest text-rain-600">
          {endorsements.eyebrow}
        </p>
        <h2 className="mt-1 font-display text-2xl font-bold text-ink-900 sm:text-3xl">
          {endorsements.title}
        </h2>
        <p className="mt-2 text-sm text-ink-700">{endorsements.intro}</p>

        {realItems.length > 0 && (
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {realItems.map((item, i) => (
              <li key={i} className="rounded-xl2 bg-white p-4 shadow-sm">
                <p className="text-sm italic text-ink-700">&ldquo;{item.quote}&rdquo;</p>
                <p className="mt-2 text-sm font-semibold text-ink-900">{item.name}</p>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 rounded-xl border border-dashed border-rain-300 p-4 text-sm text-ink-700">
          <p className="font-semibold text-ink-900">{endorsements.becomeEndorserLabel}</p>
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="focus-ring mt-3 inline-block rounded-full bg-rain-500 px-6 py-2.5 text-sm font-bold tracking-wide text-white shadow-soft transition hover:bg-rain-600 active:scale-[0.98]"
          >
            {endorsements.selfEndorseCtaLabel}
          </button>
          <p className="mt-2 text-xs text-ink-500">
            Or email{" "}
            <a
              href={`mailto:${endorsements.becomeEndorserEmail}`}
              className="focus-ring font-semibold text-rain-600 underline"
            >
              {endorsements.becomeEndorserEmail}
            </a>
          </p>
        </div>
      </div>

      {formOpen && <EndorseForm content={content} onClose={() => setFormOpen(false)} />}
    </section>
  );
}
