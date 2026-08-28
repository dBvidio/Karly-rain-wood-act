import { promises as fs } from "fs";
import path from "path";

/**
 * Action counter store.
 *
 * JUDGMENT CALL (flagged for Amber): this ships with a local JSON-file
 * counter, which is fine for local dev but does NOT persist reliably on
 * serverless hosts like Vercel (the filesystem is ephemeral/read-only in
 * production and each region/instance could see a different file). Before
 * launch, swap the two functions below to use Vercel KV or Upstash Redis
 * (a few lines with @vercel/kv — `kv.incr("action_count")` /
 * `kv.get("action_count")`). Both have free tiers large enough for this
 * campaign. This file is the only place that needs to change.
 */

const COUNTER_FILE = path.join(process.cwd(), "data", "action-count.json");

async function readCount(): Promise<number> {
  try {
    const raw = await fs.readFile(COUNTER_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return typeof parsed.count === "number" ? parsed.count : 0;
  } catch {
    return 0;
  }
}

async function writeCount(count: number): Promise<void> {
  await fs.mkdir(path.dirname(COUNTER_FILE), { recursive: true });
  await fs.writeFile(COUNTER_FILE, JSON.stringify({ count }), "utf-8");
}

export async function getActionCount(): Promise<number> {
  return readCount();
}

export async function incrementActionCount(): Promise<number> {
  const current = await readCount();
  const next = current + 1;
  await writeCount(next);
  return next;
}
