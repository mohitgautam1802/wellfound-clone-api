/**
 * URL/key-safe slug. Used for skill de-duplication and company/job slugs, so it
 * must be stable: the same input always yields the same slug.
 */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Appends a short suffix to keep generated slugs unique within a table. */
export function uniqueSlug(value: string, discriminator: string): string {
  const base = slugify(value);
  const suffix = slugify(discriminator).slice(0, 6);
  return suffix ? `${base}-${suffix}` : base;
}
