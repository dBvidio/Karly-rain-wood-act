"use client";

import { useState } from "react";
import type { SiteContent } from "@/lib/content";
import { track } from "@/lib/analytics";

type Status = "idle" | "submitting" | "done" | "error";

export default function EndorseForm({
  content,
  onClose,
}: {
  content: SiteContent;
  onClose: () => void;
}) {
  const { endorseForm } = content;
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    city: "",
    group: "",
    email: "",
    phone: "",
    helpType: endorseForm.helpTypeOptions[0],
  });

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.city.trim() || !form.email.trim() || !form.helpType) {
      setErrorMessage(endorseForm.errorRequired);
      setStatus("error");
      return;
    }
    setStatus("submitting");
    setErrorMessage(null);
    track("send_click", { form: "endorse" });

    try {
      const res = await fetch("/api/endorse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || endorseForm.errorGeneric);
        setStatus("error");
        return;
      }
      setStatus("done");
    } catch {
      setErrorMessage(endorseForm.errorGeneric);
      setStatus("error");
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="endorse-form-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/60 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl2 bg-white p-6 shadow-soft"
        onClick={(e) => e.stopPropagation()}
      >
        {status === "done" ? (
          <div className="text-center">
            <h3 className="font-display text-xl font-bold text-ink-900">
              {endorseForm.successHeadline}
            </h3>
            <p className="mt-2 text-sm text-ink-700">{endorseForm.successBody}</p>
            <button
              type="button"
              onClick={onClose}
              className="focus-ring mt-6 w-full rounded-full bg-rain-500 py-3 text-sm font-bold tracking-wide text-white shadow-soft transition hover:bg-rain-600 active:scale-[0.98]"
            >
              {endorseForm.closeLabel}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="flex items-start justify-between gap-3">
              <h3 id="endorse-form-title" className="font-display text-xl font-bold text-ink-900">
                {endorseForm.title}
              </h3>
              <button
                type="button"
                onClick={onClose}
                aria-label={endorseForm.closeLabel}
                className="focus-ring rounded-full p-1 text-ink-500 hover:text-ink-900"
              >
                &times;
              </button>
            </div>
            <p className="mt-1 text-sm text-ink-700">{endorseForm.intro}</p>

            <div className="mt-5 space-y-4">
              <Field label={endorseForm.nameLabel} htmlFor="endorse-name" required>
                <input
                  id="endorse-name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  className="focus-ring w-full rounded-xl border border-ink-900/15 bg-white px-3.5 py-2.5 text-sm text-ink-900"
                />
              </Field>

              <Field label={endorseForm.cityLabel} htmlFor="endorse-city" required>
                <input
                  id="endorse-city"
                  type="text"
                  required
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  className="focus-ring w-full rounded-xl border border-ink-900/15 bg-white px-3.5 py-2.5 text-sm text-ink-900"
                />
              </Field>

              <Field label={endorseForm.groupLabel} htmlFor="endorse-group">
                <input
                  id="endorse-group"
                  type="text"
                  value={form.group}
                  onChange={(e) => set("group", e.target.value)}
                  className="focus-ring w-full rounded-xl border border-ink-900/15 bg-white px-3.5 py-2.5 text-sm text-ink-900"
                />
              </Field>

              <Field label={endorseForm.emailLabel} htmlFor="endorse-email" required>
                <input
                  id="endorse-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  className="focus-ring w-full rounded-xl border border-ink-900/15 bg-white px-3.5 py-2.5 text-sm text-ink-900"
                />
              </Field>

              <Field label={endorseForm.phoneLabel} htmlFor="endorse-phone">
                <input
                  id="endorse-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  className="focus-ring w-full rounded-xl border border-ink-900/15 bg-white px-3.5 py-2.5 text-sm text-ink-900"
                />
              </Field>

              <fieldset>
                <legend className="mb-1.5 block text-sm font-semibold text-ink-900">
                  {endorseForm.helpTypeLabel}
                </legend>
                <div className="flex flex-wrap gap-4">
                  {endorseForm.helpTypeOptions.map((opt) => (
                    <label key={opt} className="flex cursor-pointer items-center gap-1.5 text-sm text-ink-700">
                      <input
                        type="radio"
                        name="helpType"
                        checked={form.helpType === opt}
                        onChange={() => set("helpType", opt)}
                        className="focus-ring"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            {status === "error" && errorMessage && (
              <p role="alert" className="mt-4 text-sm text-rain-700">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "submitting"}
              className="focus-ring mt-6 w-full rounded-full bg-rain-500 py-3 text-sm font-bold tracking-wide text-white shadow-soft transition hover:bg-rain-600 active:scale-[0.98] disabled:opacity-60"
            >
              {status === "submitting" ? endorseForm.submittingLabel : endorseForm.submitLabel}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink-900">
        {label}
        {required && <span aria-hidden> *</span>}
      </span>
      {children}
    </label>
  );
}
