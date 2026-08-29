import type { SiteContent } from "@/lib/content";
import { isPlaceholder } from "@/lib/placeholder";

export default function Faq({ content }: { content: SiteContent }) {
  const { faq } = content;
  const answeredItems = faq.items.filter((item) => !isPlaceholder(item.answer));

  if (answeredItems.length === 0) return null;

  return (
    <section className="bg-white px-5 py-14">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-widest text-rain-600">{faq.eyebrow}</p>
        <h2 className="mt-1 font-display text-2xl font-bold text-ink-900 sm:text-3xl">
          {faq.title}
        </h2>
        <dl className="mt-4 divide-y divide-ink-900/10">
          {answeredItems.map((item, i) => (
            <div key={i} className="py-4">
              <dt className="font-semibold text-ink-900">{item.question}</dt>
              <dd className="mt-1 text-sm text-ink-700">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
