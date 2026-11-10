import { describe, it, expect, vi } from 'vitest';
import { ACTIVE_RESORTS, ageLabel, destinationName } from '@/lib/resorts/catalog';
import { clampText, DESCRIPTION_MAX, resortDescription, resortTitle, TITLE_MAX } from '@/lib/seo/meta';
import nextConfig, { DEAD_BLOG_SLUG_REDIRECTS } from '../../next.config';

vi.mock('@/sanity/lib/fetch', () => ({
  getAllBlogPosts: async () => [],
  getAllDestinations: async () => [],
}));

const DASHES = /[–—]/;

describe('clampText', () => {
  it('leaves short text alone and cuts long text on a word boundary', () => {
    expect(clampText('Short text.', 20)).toBe('Short text.');
    const out = clampText('one two three four five six', 14);
    expect(out).toBe('one two three');
    expect(out.length).toBeLessThanOrEqual(14);
  });

  it('drops trailing punctuation left by the cut', () => {
    expect(clampText('alpha beta, gamma delta', 12)).toBe('alpha beta');
  });
});

describe('resort metadata', () => {
  it('fits every active resort title and description into search limits', () => {
    for (const r of ACTIVE_RESORTS) {
      const title = resortTitle(r.name);
      const desc = resortDescription(r.name, destinationName(r.destination), ageLabel(r).toLowerCase());
      expect(title.length, title).toBeLessThanOrEqual(TITLE_MAX);
      expect(title.endsWith(' | VacationPro')).toBe(true);
      expect(desc.length, desc).toBeLessThanOrEqual(DESCRIPTION_MAX);
      expect(DASHES.test(title) || DASHES.test(desc)).toBe(false);
    }
  });

  it('keeps the descriptive suffix when the name allows it', () => {
    expect(resortTitle('Riu Republica')).toBe('Riu Republica: Who It Suits | VacationPro');
  });

  it('degrades gracefully for very long names', () => {
    const t = resortTitle('A Very Long Resort Name That Keeps Going and Going Past Any Reasonable Limit');
    expect(t.length).toBeLessThanOrEqual(TITLE_MAX);
    expect(t.endsWith(' | VacationPro')).toBe(true);
  });
});

describe('page metadata', () => {
  it('gives /quiz its own title and a short description', async () => {
    const { metadata } = await import('@/app/quiz/layout');
    const title = (metadata.title as { absolute: string }).absolute;
    expect(title).not.toBe('Find Your All-Inclusive Resort | VacationPro');
    expect(title.length).toBeLessThanOrEqual(TITLE_MAX);
    expect((metadata.description ?? '').length).toBeLessThan(155);
  });

  it('adds a canonical to /auth/signin', async () => {
    const { metadata } = await import('@/app/auth/signin/page');
    expect(metadata.alternates?.canonical).toBe('/auth/signin');
  });
});

describe('sitemap', () => {
  it('leaves out the noindex quote forms', async () => {
    const { default: sitemap } = await import('@/app/sitemap');
    const urls = (await sitemap()).map((e) => new URL(e.url).pathname);
    expect(urls).toContain('/quiz');
    expect(urls).not.toContain('/quote');
    expect(urls).not.toContain('/concierge-planning');
  });
});

describe('redirects', () => {
  it('sends dead blog and destination links to live pages, permanently', async () => {
    const rules = await nextConfig.redirects!();
    const find = (source: string) => rules.find((r) => r.source === source);
    expect(find('/destinations')).toMatchObject({ destination: '/resorts', permanent: true });
    expect(find('/destinations/riviera-maya')).toMatchObject({ destination: '/destinations/cancun', permanent: true });
    expect(DEAD_BLOG_SLUG_REDIRECTS).toHaveLength(6);
    for (const [from, to] of DEAD_BLOG_SLUG_REDIRECTS) {
      expect(find(`/blog/${from}`)).toMatchObject({ destination: `/blog/${to}`, permanent: true });
    }
    // Only the exact index path: no wildcard rule may swallow /destinations/<slug>.
    expect(rules.some((r) => /^\/destinations\/:/.test(r.source))).toBe(false);
  });
});
