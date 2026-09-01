import { describe, it, expect } from 'vitest';

import { stay22Url, STAY22_AID } from '@/lib/monetization/stay22';

describe('stay22Url', () => {
  it('wraps a target url in the allez format and encodes it', () => {
    const url = stay22Url('https://www.expedia.com/resort?id=123&ref=vp', 'triphub-resort');

    expect(url).toBe(
      `https://www.stay22.com/allez/roam?aid=${STAY22_AID}&campaign=triphub-resort&link=${encodeURIComponent(
        'https://www.expedia.com/resort?id=123&ref=vp'
      )}`
    );
  });

  it('preserves the same aid used by Stay22Scripts', () => {
    const url = stay22Url('https://example.com/book', 'triphub-resort');
    expect(url).toContain(`aid=${STAY22_AID}`);
  });

  it('encodes the campaign parameter too', () => {
    const url = stay22Url('https://example.com/book', 'trip hub');
    expect(url).toContain(`campaign=${encodeURIComponent('trip hub')}`);
  });

  it('rejects an empty target url', () => {
    expect(() => stay22Url('', 'triphub-resort')).toThrow(Error);
  });
});
