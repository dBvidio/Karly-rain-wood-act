import type { Lawmaker } from "@/lib/types";

export default function LawmakerCard({ lawmaker }: { lawmaker: Lawmaker }) {
  const role =
    lawmaker.chamber === "senate"
      ? "U.S. Senator"
      : `U.S. Representative, District ${lawmaker.district}`;

  return (
    <li className="flex items-center gap-3 rounded-xl2 border border-rain-100 bg-white p-3 shadow-sm">
      <span
        aria-hidden
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rain-500 text-white"
      >
        &#10003;
      </span>
      <div className="min-w-0">
        <p className="truncate font-semibold text-ink-900">{lawmaker.name}</p>
        <p className="text-xs text-ink-500">
          {role} &middot; {lawmaker.party}
        </p>
      </div>
    </li>
  );
}
