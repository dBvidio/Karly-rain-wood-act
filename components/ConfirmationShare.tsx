"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import type { SiteContent } from "@/lib/content";

export default function ConfirmationShare({ content }: { content: SiteContent }) {
  const { confirmation, campaign } = content;
  const [count, setCount] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const shareUrl = `https://${campaign.domain}/take-action`;

  useEffect(() => {
    fetch("/api/counter")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && typeof data.count === "number") setCount(data.count);
      })
      .catch(() => {});
  }, []);

  const smsHref = `sms:?body=${encodeURIComponent(`${confirmation.shareText} ${shareUrl}`)}`;
  const fbHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(confirmation.shareText)}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      track("share_copy_link");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // no-op: clipboard can fail without permissions; button label stays as-is
    }
  }

  return (
    <div className="rounded-xl2 border-2 border-rain-200 bg-blush-50 p-6 text-center shadow-soft">
      <p className="text-sm font-bold uppercase tracking-wide text-rain-600">
        {confirmation.subhead}
      </p>
      <h3 className="mt-2 font-display text-2xl font-bold text-ink-900 sm:text-3xl">
        {confirmation.headline}
      </h3>

      <div className="mt-6 flex flex-col gap-3">
        <a
          href={smsHref}
          onClick={() => track("share_text")}
          className="focus-ring rounded-full bg-rain-500 py-3 text-center font-bold text-white shadow-soft transition hover:bg-rain-600 active:scale-[0.98]"
        >
          {confirmation.textShareLabel}
        </a>
        <a
          href={fbHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("share_facebook")}
          className="focus-ring rounded-full border-2 border-rain-500 py-3 text-center font-bold text-rain-600 transition hover:bg-rain-50 active:scale-[0.98]"
        >
          {confirmation.facebookShareLabel}
        </a>
        <button
          type="button"
          onClick={copyLink}
          className="focus-ring rounded-full border-2 border-ink-900/20 py-3 text-center font-bold text-ink-900 transition hover:bg-white active:scale-[0.98]"
        >
          {copied ? "Copied!" : confirmation.copyLinkLabel}
        </button>
      </div>

      <p className="mt-6 text-lg font-bold text-rain-600">
        {campaign.hashtag} {campaign.hashtag2}
      </p>

      <p className="mt-2 text-sm text-ink-500">
        {count !== null
          ? `${count.toLocaleString()} ${confirmation.counterSuffix}`
          : confirmation.counterFallback}
      </p>
    </div>
  );
}
