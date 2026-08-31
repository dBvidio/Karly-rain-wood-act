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
          className="focus-ring mt-4 inline-block rounded-full border-2 border-rain-500 px-6 py-3 text-sm font-bold tracking-wide text-rain-600 transition hover:bg-rain-500 hover:text-white active:scale-[0.98]"
        >
          {billSummary.fullTextLabel}
        </a>

        {billSummary.didYouKnow && (
          <div className="mt-6 rounded-xl2 border-2 border-gold bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-ink-900">{billSummary.didYouKnow.stat}</p>
            <p className="mt-3 font-display text-sm font-extrabold uppercase leading-snug tracking-wide text-rain-600">
              {billSummary.didYouKnow.callout}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
