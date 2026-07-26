/**
 * JSON-LD structured data.
 *
 * AI answer engines (ChatGPT, Perplexity, Google AI Overviews) lean on standard
 * schema.org structured data to work out what a page is and who published it.
 * There is no special "AI" schema. Google has said so explicitly. This is just the
 * ordinary Organization + Article markup, done properly.
 *
 * Rule: the schema must describe what is actually visible on the page. Marking up
 * content that is not there is spam and it backfires.
 */

const SITE_URL = 'https://www.vacationpro.co';
const ORG_ID = `${SITE_URL}/#organization`;

function JsonLdScript({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Schema is built from our own Sanity data, not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * Organization schema. Establishes VacationPro as an entity in the knowledge graphs
 * that AI models sample. Render once, in the root layout.
 */
export function OrganizationJsonLd() {
  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': ORG_ID,
        name: 'VacationPro',
        url: SITE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/marketing/email/vp-logo.png`,
        },
        image: `${SITE_URL}/og-default.png`,
        description:
          'Expert guides to the best tropical and all-inclusive trips, plus concierge booking to plan and book your vacation with a real travel advisor.',
        sameAs: [
          'https://www.facebook.com/vacationpro',
          'https://www.instagram.com/vacationpro.co',
          'https://www.tiktok.com/@vacationpro.co',
        ],
      }}
    />
  );
}

/**
 * WebSite schema, so the site itself is a recognized entity.
 */
export function WebSiteJsonLd() {
  return (
    <JsonLdScript
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: 'VacationPro',
        publisher: { '@id': ORG_ID },
      }}
    />
  );
}

export interface ArticleJsonLdProps {
  slug: string;
  headline: string;
  description?: string;
  image?: string;
  author?: string;
  datePublished?: string;
}

/**
 * BlogPosting schema for a single article. Signals headline, author, and publish date,
 * which is what an AI uses to judge relevance and recency before quoting a page.
 */
export function ArticleJsonLd({
  slug,
  headline,
  description,
  image,
  author,
  datePublished,
}: ArticleJsonLdProps) {
  const url = `${SITE_URL}/blog/${slug}`;

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
    headline,
    author: {
      '@type': author && author !== 'VacationPro Editorial' ? 'Person' : 'Organization',
      name: author || 'VacationPro Editorial',
      ...(author && author !== 'VacationPro Editorial' ? {} : { '@id': ORG_ID }),
    },
    publisher: { '@id': ORG_ID },
  };

  if (description) data.description = description;
  if (image) data.image = image;
  if (datePublished) {
    data.datePublished = datePublished;
    data.dateModified = datePublished;
  }

  return <JsonLdScript data={data} />;
}
