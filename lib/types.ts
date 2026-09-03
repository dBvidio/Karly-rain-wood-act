export type Lawmaker = {
  chamber: "senate" | "house";
  name: string;
  party: string;
  state: string;
  district?: string;
  phone?: string;
  email?: string;
  contactFormUrl?: string;
  officialUrl?: string;
  photoUrl?: string;
};

export type LookupResult = {
  senators: Lawmaker[];
  representative: Lawmaker | null;
};

export type LookupError = {
  error: string;
  code: "NO_MATCH" | "NOT_CONFIGURED" | "PROVIDER_ERROR" | "BAD_INPUT";
};
