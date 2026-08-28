import type { SiteContent } from "@/lib/content";

export default function BillStatus({ content }: { content: SiteContent }) {
  const { billStatus } = content;
  return (
    <section className="bg-white px-5 py-14">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-widest text-rain-600">
          {billStatus.eyebrow}
        </p>
        <h2 className="mt-1 font-display text-2xl font-bold text-ink-900 sm:text-3xl">
          {billStatus.title}
        </h2>
        <div className="mt-4 rounded-xl2 border border-rain-200 bg-cream p-5">
          <p className="inline-block rounded-full bg-rain-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
            {billStatus.stage}
          </p>
          <p className="mt-3 text-sm text-ink-700">{billStatus.statusNote}</p>
          <p className="mt-3 text-xs text-ink-500">Last updated: {billStatus.lastUpdated}</p>
        </div>
      </div>
    </section>
  );
}
