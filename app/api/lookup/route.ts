import { NextRequest, NextResponse } from "next/server";
import { lookupLawmakers } from "@/lib/lookup";

export async function POST(req: NextRequest) {
  let body: { query?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body.", code: "BAD_INPUT" },
      { status: 400 }
    );
  }

  const query = (body.query || "").trim();
  if (!query || query.length < 3) {
    return NextResponse.json(
      { error: "Enter a ZIP code or address.", code: "BAD_INPUT" },
      { status: 400 }
    );
  }

  const result = await lookupLawmakers(query);

  if (!result.ok) {
    const status =
      result.code === "NO_MATCH" ? 404 : result.code === "NOT_CONFIGURED" ? 501 : 502;
    return NextResponse.json(
      { error: "Lookup failed.", code: result.code },
      { status }
    );
  }

  return NextResponse.json(result.data, { status: 200 });
}
