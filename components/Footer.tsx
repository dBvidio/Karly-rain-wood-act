import type { SiteContent } from "@/lib/content";

export default function Footer({ content }: { content: SiteContent }) {
  const { footer, campaign } = content;
  return (
    <footer className="bg-ink-900 px-5 py-10 text-cream">
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-display text-xl font-bold">{campaign.hashtag}</p>
        <p className="mt-2 text-sm text-cream/70">{footer.tagline}</p>

        <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm">
          <a href={campaign.sisterSites.karlyRain} target="_blank" rel="noopener noreferrer" className="focus-ring underline">
            KarlyRain.com — Karly&rsquo;s Angels
          </a>
          <a href={campaign.sisterSites.karlyRainMatters} target="_blank" rel="noopener noreferrer" className="focus-ring underline">
            KarlyRainMatters.com — the podcast
          </a>
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm text-cream/70">
          {footer.socialLinks.map((link) => (
            <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="focus-ring underline">
              {link.label}
            </a>
          ))}
        </div>

        <p className="mt-4 text-xs text-cream/50">
          Contact: <a href={`mailto:${footer.contactEmail}`} className="focus-ring underline">{footer.contactEmail}</a>
        </p>
      </div>
    </footer>
  );
}
