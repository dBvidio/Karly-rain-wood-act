"use client";

import { useMemo, useState } from "react";
import type { SiteContent } from "@/lib/content";
import type { Lawmaker, LookupResult } from "@/lib/types";
import { track } from "@/lib/analytics";
import LawmakerCard from "./LawmakerCard";
import PromptChips from "./PromptChips";
import ConfirmationShare from "./ConfirmationShare";

type Phase = "lookup" | "message" | "done";

export default function ActionFlow({ content }: { content: SiteContent }) {
  const { lookupStep, messageStep, confirmation } = content;

  const [phase, setPhase] = useState<Phase>("lookup");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [result, setResult] = useState<LookupResult | null>(null);

  const [letterBody, setLetterBody] = useState(messageStep.letterBody);
  const [personalNote, setPersonalNote] = useState("");
  const [copied, setCopied] = useState(false);
  const [openedForms, setOpenedForms] = useState<Set<string>>(new Set());
  const [sent, setSent] = useState(false);

  const lawmakers: Lawmaker[] = useMemo(() => {
    if (!result) return [];
    const list = [...result.senators];
    if (result.representative) list.push(result.representative);
    return list;
  }, [result]);

  const fullMessage = useMemo(() => {
    const parts = [letterBody.trim()];
    if (personalNote.trim()) {
      parts.push("");
      parts.push(personalNote.trim());
    }
    return parts.join("\n");
  }, [letterBody, personalNote]);

  /**
   * Every lawmaker gets an action, never silently dropped just because
   * Geocodio didn't return a contact-form URL for them. Preference order:
   * their actual contact form > their official site > a Congress.gov
   * search as a last resort that always resolves to something real.
   *
   * NOTE (flagged for review): whether each office's contactFormUrl
   * actually IS their contact form (vs. a homepage Geocodio mislabeled)
   * has NOT been independently verified against the live sites -- this
   * build environment has no network access to house.gov/senate.gov to
   * check. Labels below say "contact form" only when Geocodio itself
   * labeled it that way; "official website" when falling back, so the
   * visitor isn't told something is a contact form when it's unverified.
   */
  function bestLink(l: Lawmaker): { url: string; label: string } {
    if (l.contactFormUrl) return { url: l.contactFormUrl, label: "Open contact form" };
    if (l.officialUrl) return { url: l.officialUrl, label: "Open official website" };
    return {
      url: `https://www.congress.gov/search?q=${encodeURIComponent(l.name)}`,
      label: "Look up on Congress.gov",
    };
  }

  function mailtoHref(l: Lawmaker): string | null {
    if (!l.email) return null;
    const subject = encodeURIComponent(messageStep.subjectLine);
    const body = encodeURIComponent(fullMessage);
    return `mailto:${l.email}?subject=${subject}&body=${body}`;
  }

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setLookupError(null);
    track("find_reps_submit");

    try {
      const res = await fetch("/api/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();

      if (!res.ok) {
        track("find_reps_error", { code: data.code || "UNKNOWN" });
        setLookupError(
          data.code === "NO_MATCH"
            ? lookupStep.errorNoMatch
            : data.code === "NOT_CONFIGURED"
              ? lookupStep.errorNotConfigured
              : lookupStep.errorGeneric
        );
        setResult(null);
        return;
      }

      setResult(data);
      track("find_reps_success");
      setTimeout(() => setPhase("message"), 600);
    } catch {
      track("find_reps_error", { code: "NETWORK" });
      setLookupError(lookupStep.errorGeneric);
    } finally {
      setLoading(false);
    }
  }

  function insertChip(starter: string) {
    track("personalize_edit");
    setPersonalNote((prev) => (prev ? prev : starter));
  }

  async function copyMessage(): Promise<boolean> {
    const text = `Subject: ${messageStep.subjectLine}\n\n${fullMessage}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      track("message_copied");
      setTimeout(() => setCopied(false), 2000);
      return true;
    } catch {
      return false;
    }
  }

  async function handleSend() {
    track("send_click");
    await copyMessage();
    setSent(true);
    fetch("/api/counter", { method: "POST" }).catch(() => {});

    // Only ever auto-open ONE tab from this click -- browsers (Safari
    // especially) block multiple simultaneous window.open() calls from a
    // single tap. The rest are individual one-tap buttons below.
    const first = lawmakers[0];
    if (first) {
      const { url } = bestLink(first);
      window.open(url, "_blank", "noopener,noreferrer");
      setOpenedForms((prev) => new Set(prev).add(first.name));
      track("contact_form_opened", { office: first.name });
    }
  }

  function openForm(lawmaker: Lawmaker) {
    const { url } = bestLink(lawmaker);
    window.open(url, "_blank", "noopener,noreferrer");
    setOpenedForms((prev) => new Set(prev).add(lawmaker.name));
    track("contact_form_opened", { office: lawmaker.name });
  }

  return (
    <section id="action" className="scroll-mt-4 px-5 py-10 sm:py-14">
      <div className="mx-auto max-w-xl">
        {phase === "lookup" && (
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-rain-600">
              {lookupStep.eyebrow}
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold text-ink-900 sm:text-3xl">
              {lookupStep.title}
            </h2>
            <p className="mt-2 text-sm text-ink-700">{lookupStep.helpText}</p>

            <form onSubmit={handleLookup} className="mt-5">
              <label htmlFor="address" className="mb-1 block text-sm font-semibold text-ink-900">
                {lookupStep.inputLabel}
              </label>
              <input
                id="address"
                name="address"
                type="text"
                inputMode="text"
                autoComplete="postal-code"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={lookupStep.inputPlaceholder}
                className="focus-ring w-full rounded-xl border border-ink-900/15 bg-white px-4 py-3 text-base text-ink-900 shadow-sm"
              />
              <button
                type="submit"
                disabled={loading}
                className="focus-ring mt-3 w-full rounded-full bg-rain-500 py-3.5 text-base font-bold tracking-wide text-white shadow-soft transition hover:bg-rain-600 active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? "Looking up..." : lookupStep.buttonLabel}
              </button>
            </form>

            {lookupError && (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-rain-300 bg-rain-50 p-4 text-sm text-rain-700"
              >
                <p>{lookupError}</p>
                <a
                  href={lookupStep.manualFallbackUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-ring mt-2 inline-block font-semibold underline"
                >
                  {lookupStep.manualFallbackLabel}
                </a>
              </div>
            )}

            {result && (
              <ul className="mt-6 space-y-2" aria-label="Your lawmakers">
                {lawmakers.map((l) => (
                  <LawmakerCard key={`${l.chamber}-${l.name}`} lawmaker={l} />
                ))}
              </ul>
            )}
          </div>
        )}

        {phase === "message" && result && (
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-rain-600">
              {messageStep.eyebrow}
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold text-ink-900 sm:text-3xl">
              {messageStep.title}
            </h2>

            <ul className="mt-4 space-y-2" aria-label="Sending to">
              {lawmakers.map((l) => (
                <LawmakerCard key={`${l.chamber}-${l.name}`} lawmaker={l} />
              ))}
            </ul>

            <div className="mt-6">
              <label htmlFor="subject" className="mb-1 block text-sm font-semibold text-ink-900">
                Subject
              </label>
              <input
                id="subject"
                readOnly
                value={messageStep.subjectLine}
                className="w-full rounded-xl border border-ink-900/15 bg-ink-900/5 px-4 py-3 text-sm text-ink-700"
              />
            </div>

            <div className="mt-4">
              <label htmlFor="letter" className="mb-1 block text-sm font-semibold text-ink-900">
                Your message
              </label>
              <textarea
                id="letter"
                value={letterBody}
                onChange={(e) => setLetterBody(e.target.value)}
                rows={7}
                className="focus-ring w-full rounded-xl border border-ink-900/15 bg-white px-4 py-3 text-sm text-ink-900 shadow-sm"
              />
            </div>

            <div className="mt-5 rounded-xl2 border-2 border-gold bg-cream p-4">
              <p className="text-sm font-bold uppercase tracking-wide text-ink-900">
                {messageStep.personalizeBoxTitle}
              </p>
              <p className="mt-1 text-xs text-ink-700">{messageStep.personalizeBoxSubtitle}</p>

              <div className="mt-3">
                <PromptChips chips={messageStep.promptChips} onSelect={insertChip} />
              </div>

              <label htmlFor="personal" className="sr-only">
                Your own words
              </label>
              <textarea
                id="personal"
                value={personalNote}
                onChange={(e) => setPersonalNote(e.target.value)}
                rows={3}
                placeholder="Tell them why this matters to you..."
                className="focus-ring mt-3 w-full rounded-xl border border-ink-900/15 bg-white px-4 py-3 text-sm text-ink-900 shadow-sm"
              />
              <p className="mt-2 text-xs italic text-ink-500">{messageStep.personalizeNote}</p>
            </div>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={handleSend}
                className="focus-ring w-full rounded-full bg-rain-500 py-3.5 text-base font-bold tracking-wide text-white shadow-soft transition hover:bg-rain-600 active:scale-[0.98]"
              >
                {messageStep.sendButtonLabel}
              </button>
              <button
                type="button"
                onClick={copyMessage}
                className="focus-ring w-full rounded-full border-2 border-rain-500 py-3 text-base font-bold text-rain-600 transition hover:bg-rain-50 active:scale-[0.98]"
              >
                {copied ? messageStep.copiedLabel : messageStep.copyButtonLabel}
              </button>
              <p className="text-center text-xs text-ink-500">{messageStep.sendHelpText}</p>
            </div>

            {sent && (
              <div className="mt-5 space-y-4">
                <p className="text-xs font-semibold text-rain-600">
                  Message copied to your clipboard &mdash; paste it into each box below.
                </p>

                {lawmakers.map((l) => {
                  const { url, label } = bestLink(l);
                  const mailto = mailtoHref(l);
                  return (
                    <div key={l.name} className="rounded-xl border border-rain-200 bg-white p-3 shadow-sm">
                      <p className="text-sm font-semibold text-ink-900">{l.name}</p>
                      <p className="text-xs text-ink-500">
                        {l.chamber === "senate" ? "U.S. Senator" : "U.S. Representative"}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => openForm(l)}
                          className="focus-ring flex items-center gap-1.5 rounded-full border border-rain-200 bg-blush-50 px-3 py-1.5 text-xs font-semibold text-ink-900 transition hover:bg-blush-100"
                        >
                          {label}
                          {openedForms.has(l.name) && (
                            <span aria-hidden className="text-rain-500">
                              &#10003;
                            </span>
                          )}
                        </button>
                        {mailto && (
                          <a
                            href={mailto}
                            onClick={() => track("mailto_opened", { office: l.name })}
                            className="focus-ring flex items-center gap-1.5 rounded-full border border-rain-200 bg-blush-50 px-3 py-1.5 text-xs font-semibold text-ink-900 transition hover:bg-blush-100"
                          >
                            Email directly
                          </a>
                        )}
                      </div>
                      <p className="mt-1 text-[11px] text-ink-500">
                        {url} &mdash; opens in a new tab, nothing is sent automatically. You&rsquo;ll
                        paste your message and click their site&rsquo;s own send button.
                      </p>
                    </div>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setPhase("done")}
                  className="focus-ring mt-3 w-full rounded-full bg-ink-900 py-3.5 text-base font-bold tracking-wide text-white shadow-soft transition hover:bg-ink-700 active:scale-[0.98]"
                >
                  I&rsquo;m done &mdash; continue
                </button>
              </div>
            )}
          </div>
        )}

        {phase === "done" && <ConfirmationShare content={content} />}
      </div>
    </section>
  );
}
