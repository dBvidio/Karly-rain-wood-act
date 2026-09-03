import type { Lawmaker, LookupResult } from "./types";

/**
 * Rep-lookup provider: Geocodio (https://www.geocod.io).
 *
 * JUDGMENT CALL (flagged for Amber): three real options were weighed —
 *  1. A paid advocacy platform (Action Network / VoterVoice) — fastest to a
 *     fully "one-tap" send since they run the whole flow, but recurring
 *     platform fees and less control over this custom, emotional design.
 *  2. Cicero (cicerodata.com) — accurate, but priced per-lookup (roughly
 *     3-4 cents/address at low volume) with no meaningful free tier.
 *  3. Geocodio (geocod.io) — chosen here. Free account, generous
 *     pay-as-you-go pricing, and critically: its congressional-district
 *     append returns each current legislator's official contact-form URL
 *     directly, which is exactly what the "open their contact form"
 *     fallback below needs. No recurring subscription is required at this
 *     traffic scale.
 * Google's Civic Information "representatives" endpoint — the option many
 * older tutorials use — was permanently retired by Google in April 2025
 * and is not usable at all.
 *
 * This function is intentionally the *only* place that talks to the
 * provider, so swapping providers later means editing this file only.
 */

const GEOCODIO_ENDPOINT = "https://api.geocod.io/v1.7/geocode";

type GeocodioLegislator = {
  type: "representative" | "senator";
  bio: {
    first_name: string;
    last_name: string;
    party: string;
  };
  contact: {
    url?: string;
    contact_form?: string;
    phone?: string;
    email?: string;
  };
};

type GeocodioResponse = {
  results?: Array<{
    address_components?: { state?: string };
    fields?: {
      congressional_districts?: Array<{
        district_number: number;
        current_legislators?: GeocodioLegislator[];
      }>;
    };
  }>;
};

function toLawmaker(
  l: GeocodioLegislator,
  state: string,
  district: string
): Lawmaker {
  return {
    chamber: l.type === "senator" ? "senate" : "house",
    name: `${l.bio.first_name} ${l.bio.last_name}`.trim(),
    party: l.bio.party || "Unknown",
    state,
    district: l.type === "representative" ? district : undefined,
    phone: l.contact?.phone,
    email: l.contact?.email,
    contactFormUrl: l.contact?.contact_form,
    officialUrl: l.contact?.url,
  };
}

export async function lookupLawmakers(
  query: string
): Promise<
  | { ok: true; data: LookupResult }
  | { ok: false; code: "NO_MATCH" | "NOT_CONFIGURED" | "PROVIDER_ERROR" }
> {
  const apiKey = process.env.GEOCODIO_API_KEY;
  if (!apiKey) {
    return { ok: false, code: "NOT_CONFIGURED" };
  }

  const url = new URL(GEOCODIO_ENDPOINT);
  url.searchParams.set("q", query);
  url.searchParams.set("fields", "cd");
  url.searchParams.set("api_key", apiKey);

  let res: Response;
  try {
    res = await fetch(url.toString(), { cache: "no-store" });
  } catch {
    return { ok: false, code: "PROVIDER_ERROR" };
  }

  if (!res.ok) {
    return { ok: false, code: res.status === 422 ? "NO_MATCH" : "PROVIDER_ERROR" };
  }

  let json: GeocodioResponse;
  try {
    json = await res.json();
  } catch {
    return { ok: false, code: "PROVIDER_ERROR" };
  }

  const result = json.results?.[0];
  const cd = result?.fields?.congressional_districts?.[0];
  const legislators = cd?.current_legislators;
  const state = result?.address_components?.state;

  if (!result || !cd || !legislators || !state) {
    return { ok: false, code: "NO_MATCH" };
  }

  const district = String(cd.district_number ?? "");
  const senators = legislators
    .filter((l) => l.type === "senator")
    .map((l) => toLawmaker(l, state, district));
  const rep = legislators.find((l) => l.type === "representative");

  if (senators.length === 0 && !rep) {
    return { ok: false, code: "NO_MATCH" };
  }

  // Diagnostic only (visible in server/Vercel function logs) -- helps
  // confirm whether an incomplete result (e.g. only 1 of 3 officials) is
  // Geocodio returning partial data for this address, vs. a bug in this
  // file or the UI. Never shown to the visitor.
  if (senators.length < 2 || !rep) {
    console.warn(
      `[lookup] Incomplete legislator data for "${query}": ${senators.length} senator(s), representative ${
        rep ? "found" : "MISSING"
      }. Raw legislator types returned: ${legislators.map((l) => l.type).join(", ") || "(none)"}`
    );
  }

  return {
    ok: true,
    data: {
      senators,
      representative: rep ? toLawmaker(rep, state, district) : null,
    },
  };
}
