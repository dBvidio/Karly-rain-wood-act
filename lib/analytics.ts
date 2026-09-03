/**
 * Minimal funnel analytics.
 *
 * Ships provider-agnostic: every call logs to the console (visible in your
 * hosting provider's function/edge logs) and, if
 * NEXT_PUBLIC_PLAUSIBLE_DOMAIN is set, also fires a Plausible custom event
 * (Plausible is cookie-free, so it needs no cookie-consent banner — a good
 * fit for a page whose whole job is converting visitors fast). Swap in
 * GA4 / another provider here if Amber prefers one; this is the only file
 * that needs to change.
 *
 * Funnel steps tracked: landing -> find_reps -> personalize -> send -> share
 */

export type FunnelStep =
  | "landing"
  | "take_action_click"
  | "find_reps_submit"
  | "find_reps_success"
  | "find_reps_error"
  | "personalize_edit"
  | "prompt_chip_used"
  | "send_click"
  | "message_copied"
  | "contact_form_opened"
  | "mailto_opened"
  | "share_text"
  | "share_facebook"
  | "share_copy_link";

declare global {
  interface Window {
    plausible?: (event: string, opts?: { props?: Record<string, string> }) => void;
  }
}

export function track(step: FunnelStep, props?: Record<string, string>) {
  if (typeof window === "undefined") return;

  console.info("[funnel]", step, props || {});

  if (window.plausible) {
    window.plausible(step, props ? { props } : undefined);
  }
}
