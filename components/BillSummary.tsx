import type { SiteContent } from "@/lib/content";

export default function BillSummary({ content }: { content: SiteContent }) {
  const { billSummary } = content;
  return (
    <section className="bg-blush-50 px-5 py-14">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-widest text-rain-600">
          {billSummary.eyebrow}
        </p>
        <h2 className="mt-1 font-display text-2xl font-bold text-ink-900 sm:text-3xl">
          {billSummary.title}
        </h2>
        <ul className="mt-4 space-y-3">
          {billSummary.points.map((point, i) => (
            <li key={i} className="flex gap-3 rounded-xl bg-white p-4 text-sm text-ink-700 shadow-sm">
              <span aria-hidden className="font-bold text-rain-500">
                {i + 1}
              </span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
        <a
          href={billSummary.fullTextUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring mt-4 inline-block text-sm font-semibold text-rain-600 underline"
        >
          {billSummary.fullTextLabel}
        </a>
      </div>
    </section>
  );
}
