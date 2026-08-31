import type { SiteContent } from "@/lib/content";

export default function MainIntro({ content }: { content: SiteContent }) {
  const { hero } = content;
  return (
    <div className="border-b border-rain-100 px-5 pb-6 pt-8 sm:px-8">
      <h1 className="font-display text-2xl font-bold leading-tight text-ink-900 sm:text-3xl">
        {hero.headline}
      </h1>
      <ul className="mt-4 space-y-1.5 text-sm text-ink-700">
        {hero.reasons.map((reason, i) => (
          <li key={i} className="flex gap-2">
            <span aria-hidden className="text-rain-500">
              &bull;
            </span>
            <span>{reason}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
