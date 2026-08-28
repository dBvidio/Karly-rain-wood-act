"use client";

import { track } from "@/lib/analytics";
import type { SiteContent } from "@/lib/content";

type Chip = SiteContent["messageStep"]["promptChips"][number];

export default function PromptChips({
  chips,
  onSelect,
}: {
  chips: Chip[];
  onSelect: (starter: string, label: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <button
          key={chip.label}
          type="button"
          onClick={() => {
            track("prompt_chip_used", { chip: chip.label });
            onSelect(chip.starter, chip.label);
          }}
          className="focus-ring rounded-full border border-rain-300 bg-blush-50 px-3 py-1.5 text-xs font-semibold text-rain-700 transition hover:bg-blush-100 active:scale-95"
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}
