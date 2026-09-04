import { Transform } from 'class-transformer';

/**
 * Query strings carry arrays inconsistently: `?x=a&x=b` arrives as an array,
 * `?x=a,b` as one comma-joined string, `?x=a` as a bare string. This normalises
 * all three into `string[]` so filter DTOs can just declare `@IsArray()`.
 */
export function TransformToArray(): PropertyDecorator {
  return Transform(({ value }): string[] | undefined => {
    if (value === undefined || value === null || value === '') return undefined;

    const raw = Array.isArray(value) ? value : [value];

    return raw
      .flatMap((item) => String(item).split(','))
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  });
}

/** Query params are strings; coerce the usual truthy spellings to a boolean. */
export function TransformToBoolean(): PropertyDecorator {
  return Transform(({ value }): boolean | undefined => {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value === 'boolean') return value;
    return ['true', '1', 'yes', 'on'].includes(String(value).toLowerCase());
  });
}

/**
 * Splits a search box into terms, honouring double-quoted phrases the way
 * Wellfound's saved searches do:
 *   `"associate product manager" remote` -> ['associate product manager', 'remote']
 */
export function tokenizeSearchQuery(query: string): string[] {
  const tokens: string[] = [];
  const pattern = /"([^"]+)"|(\S+)/g;

  let match: RegExpExecArray | null;
  while ((match = pattern.exec(query)) !== null) {
    const token = (match[1] ?? match[2] ?? '').trim();
    if (token) tokens.push(token);
  }

  return tokens;
}
