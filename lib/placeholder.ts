/**
 * Content in content/site-content.json is sometimes intentionally left as a
 * `[Amber: ...]` placeholder — real content isn't available yet. Rather
 * than showing that bracketed editorial note to real site visitors,
 * sections built from these helpers just omit the incomplete item until
 * Amber replaces it. The placeholder text itself stays in the JSON so she
 * still sees exactly what needs filling in when she opens the file.
 */
export function isPlaceholder(value: string | undefined | null): boolean {
  return !value || value.includes("[Amber:");
}
