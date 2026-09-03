import { NextRequest, NextResponse } from "next/server";

// Forwards a self-endorsement submission to a Google Apps Script Web App
// bound to a Google Sheet (see google-apps-script/endorsements.gs and the
// README section "How the self-endorsement flow works" for the full
// setup). That script appends a row to the sheet and emails
// StandForKarlyRain@gmail.com — this route never touches Google's APIs
// directly, so no Google service-account credentials live in this app.
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const city = String(body.city ?? "").trim();
  const group = String(body.group ?? "").trim();
  const email = String(body.email ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const helpType = String(body.helpType ?? "").trim();

  if (!name || !city || !email || !helpType) {
    return NextResponse.json(
      { error: "Please fill in all required fields." },
      { status: 400 }
    );
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 }
    );
  }

  const webhookUrl = process.env.ENDORSEMENT_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json(
      { error: "Endorsement submissions aren't configured yet." },
      { status: 501 }
    );
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      redirect: "follow",
      body: JSON.stringify({
        secret: process.env.ENDORSEMENT_WEBHOOK_SECRET ?? "",
        name,
        city,
        group,
        email,
        phone,
        helpType,
      }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok || !data || data.ok !== true) {
      return NextResponse.json(
        { error: "Something went wrong submitting that. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong submitting that. Please try again." },
      { status: 502 }
    );
  }
}
