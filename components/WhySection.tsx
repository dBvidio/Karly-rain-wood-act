import type { SiteContent } from "@/lib/content";

export default function WhySection({ content }: { content: SiteContent }) {
  const { why } = content;
  return (
    <section className="bg-white px-5 py-14">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-widest text-rain-600">{why.eyebrow}</p>
        <h2 className="mt-1 font-display text-2xl font-bold text-ink-900 sm:text-3xl">
          {why.title}
        </h2>
        <div className="mt-4 space-y-4 text-base leading-relaxed text-ink-700">
          {why.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        {why.pullQuote && (
          <blockquote className="mt-6 border-l-4 border-rain-400 pl-4 font-display text-lg italic text-ink-900">
            {why.pullQuote}
          </blockquote>
        )}
      </div>
    </section>
  );
}
