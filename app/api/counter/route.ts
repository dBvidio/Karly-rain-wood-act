import { NextResponse } from "next/server";
import { getActionCount, incrementActionCount } from "@/lib/counter";

export async function GET() {
  const count = await getActionCount();
  return NextResponse.json({ count });
}

export async function POST() {
  const count = await incrementActionCount();
  return NextResponse.json({ count });
}
