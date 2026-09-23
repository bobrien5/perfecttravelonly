import imageUrlBuilder from '@sanity/image-url';
// v2 exports its types from the package root. The nested
// '@sanity/image-url/lib/types/types' path was a v1 arrangement and no longer
// resolves.
import type { SanityImageSource } from '@sanity/image-url';
import { client } from './client';

const builder = imageUrlBuilder(client);

/**
 * Builds a Sanity CDN URL for an uploaded image asset.
 *
 * Only for `type: 'image'` fields (heroImageAsset). Plain URL fields
 * (heroImage, heroImageUrl) are already absolute URLs and must not be passed
 * through here.
 */
export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

/**
 * Shape shared by every document that can carry a hero image, whichever way
 * it was supplied.
 */
export interface HeroImageFields {
  /** Uploaded through the Studio. Preferred when present. */
  heroImageAsset?: SanityImageSource | null;
  /** Legacy: a pasted absolute URL. Kept so existing content keeps working. */
  heroImage?: string | null;
  /** Legacy, resort documents use this name instead of heroImage. */
  heroImageUrl?: string | null;
}

/**
 * Resolves a document's hero image to a usable src, preferring an uploaded
 * asset over a pasted URL.
 *
 * Both field styles exist because every image field on destination, resort and
 * deal started life as `type: 'url'`, which renders as a text box in the Studio
 * with no way to upload. Rather than migrate the existing values and risk
 * breaking live pages, the image fields were added alongside them: new content
 * is uploaded, old content keeps its URL, and this function hides the
 * difference from callers.
 *
 * @param width  requested width in pixels; ignored for legacy URLs, which
 *               cannot be resized
 * @returns an image src, or null when the document has neither
 */
export function heroImageSrc(doc: HeroImageFields, width = 1200): string | null {
  if (doc.heroImageAsset) {
    return urlFor(doc.heroImageAsset).width(width).auto('format').fit('max').url();
  }
  return doc.heroImage || doc.heroImageUrl || null;
}
