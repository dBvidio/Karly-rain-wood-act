import type { SiteContent } from "@/lib/content";
import { isPlaceholder } from "@/lib/placeholder";

export default function Endorsements({ content }: { content: SiteContent }) {
  const { endorsements } = content;
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
          <a
            href={`mailto:${endorsements.becomeEndorserEmail}`}
            className="focus-ring mt-1 inline-block font-semibold text-rain-600 underline"
          >
            {endorsements.becomeEndorserEmail}
          </a>
        </div>
      </div>
    </section>
  );
}
