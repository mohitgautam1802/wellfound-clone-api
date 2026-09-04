import { tokenizeSearchQuery } from './query-array';

describe('tokenizeSearchQuery', () => {
  it('splits bare words on whitespace', () => {
    expect(tokenizeSearchQuery('product manager remote')).toEqual([
      'product',
      'manager',
      'remote',
    ]);
  });

  it('keeps a double-quoted phrase together', () => {
    expect(tokenizeSearchQuery('"associate product manager"')).toEqual([
      'associate product manager',
    ]);
  });

  it('mixes quoted phrases and bare words, as saved searches do', () => {
    expect(tokenizeSearchQuery('"product manager" bengaluru "series a"')).toEqual([
      'product manager',
      'bengaluru',
      'series a',
    ]);
  });

  it('collapses irregular whitespace', () => {
    expect(tokenizeSearchQuery('  product   manager  ')).toEqual([
      'product',
      'manager',
    ]);
  });

  it('returns nothing for an empty or whitespace-only query', () => {
    expect(tokenizeSearchQuery('')).toEqual([]);
    expect(tokenizeSearchQuery('   ')).toEqual([]);
  });

  it('does not emit an empty token for an unterminated quote', () => {
    // A user mid-typing sends `"product manager` - it must degrade to words
    // rather than producing an empty token that would match every row.
    const tokens = tokenizeSearchQuery('"product manager');

    expect(tokens).not.toContain('');
    expect(tokens.length).toBeGreaterThan(0);
  });
});
