import type { SiteContent } from "@/lib/content";

export default function Press({ content }: { content: SiteContent }) {
  const { press } = content;
  return (
    <section className="bg-blush-50 px-5 py-14">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-widest text-rain-600">
          {press.eyebrow}
        </p>
        <h2 className="mt-1 font-display text-2xl font-bold text-ink-900 sm:text-3xl">
          {press.title}
        </h2>
        <ul className="mt-4 space-y-3">
          {press.items.map((item, i) => (
            <li key={i} className="rounded-xl bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-rain-600">
                {item.outlet}
              </p>
              {item.url ? (
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="focus-ring font-semibold text-ink-900 underline">
                  {item.headline}
                </a>
              ) : (
                <p className="font-semibold text-ink-900">{item.headline}</p>
              )}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-ink-700">
          {press.mediaContactLabel}:{" "}
          <a href={`mailto:${press.mediaContactEmail}`} className="focus-ring font-semibold text-rain-600 underline">
            {press.mediaContactEmail}
          </a>
        </p>
      </div>
    </section>
  );
}
