"use client";

import { track } from "@/lib/analytics";

export default function StickyCta({ label }: { label: string }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-ink-900/95 p-3 backdrop-blur sm:hidden">
      <a
        href="#action"
        onClick={() => track("take_action_click", { source: "sticky_bar" })}
        className="focus-ring block w-full rounded-full bg-rain-500 py-3 text-center text-base font-bold tracking-wide text-white shadow-soft transition hover:bg-rain-600 active:scale-[0.98]"
      >
        {label}
      </a>
    </div>
  );
}
