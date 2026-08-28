import type { SiteContent } from "@/lib/content";

export default function Donate({ content }: { content: SiteContent }) {
  const { donate } = content;
  return (
    <section className="bg-white px-5 py-14">
      <div className="mx-auto max-w-2xl rounded-xl2 border-2 border-gold bg-cream p-6 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-rain-600">
          {donate.eyebrow}
        </p>
        <h2 className="mt-1 font-display text-2xl font-bold text-ink-900">{donate.title}</h2>
        <p className="mt-3 text-sm text-ink-700">{donate.body}</p>
        {donate.donateUrl ? (
          <a
            href={donate.donateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="focus-ring mt-5 inline-block rounded-full border-2 border-rain-500 px-8 py-3 font-bold text-rain-600 transition hover:bg-rain-50"
          >
            {donate.buttonLabel}
          </a>
        ) : (
          <p className="mt-5 text-xs text-ink-500">[Amber: add a donation link to enable this button]</p>
        )}
      </div>
    </section>
  );
}
