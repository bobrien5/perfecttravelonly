import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  getBlogPostBySlug,
  getAllBlogPostParams,
  getRecentBlogPosts,
} from '@/sanity/lib/fetch';
import BlogCard from '@/components/ui/BlogCard';
import NewsletterSignup from '@/components/ui/NewsletterSignup';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Stay22Scripts from '@/components/monetization/Stay22Scripts';
import { PortableText, PortableTextComponents } from '@portabletext/react';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllBlogPostParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return {};
  const rawTitle = post.seoTitle || post.title;
  const rawDesc = post.metaDescription || post.excerpt;
  const cleanTitle = rawTitle.replace(/\s*\|\s*VacationPro\s*$/i, '').replace(/\s*[—–]\s*/g, ', ').replace(/\s+,/g, ',').trim();
  const cleanDesc = rawDesc.replace(/\s*[—–]\s*/g, ', ').replace(/\s+,/g, ',').trim();
  return {
    title: { absolute: cleanTitle },
    description: cleanDesc,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: cleanTitle,
      description: cleanDesc,
      images: post.image ? [{ url: post.image }] : [],
    },
  };
}

const portableTextComponents: PortableTextComponents = {
  types: {
    image: ({ value }) => (
      <figure>
        <img
          src={value.asset?.url || value.url}
          alt={value.alt || ''}
          loading="lazy"
        />
        {value.caption && <figcaption>{value.caption}</figcaption>}
      </figure>
    ),
  },
  marks: {
    link: ({ value, children }) => {
      const href: string = value?.href || '';
      if (!href) return <>{children}</>;
      const external = /^https?:\/\//.test(href);
      const isAffiliate = href.includes('prf.hn') || href.includes('expedia.');
      const rel = isAffiliate
        ? 'sponsored noopener noreferrer'
        : external
          ? 'noopener noreferrer'
          : undefined;
      const target = external ? '_blank' : undefined;
      // Affiliate CTAs render as a prominent brand button; everything else as an inline link.
      if (isAffiliate) {
        return (
          <a
            href={href}
            target={target}
            rel={rel}
            className="not-prose inline-flex items-center gap-2 my-2 px-5 py-2.5 rounded-lg bg-brand-600 text-white font-semibold no-underline hover:bg-brand-700 transition-colors"
          >
            {children}
            <span aria-hidden="true">&rarr;</span>
          </a>
        );
      }
      return (
        <a
          href={href}
          target={target}
          rel={rel}
          className="text-brand-600 underline underline-offset-2 hover:text-brand-700"
        >
          {children}
        </a>
      );
    },
  },
};

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const recentPosts = await getRecentBlogPosts(3);
  const relatedPosts = recentPosts.filter((p) => p.slug !== slug).slice(0, 3);

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : post.date
      ? new Date(post.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : null;

  const categoryName = post.blogCategory?.name || post.category;

  return (
    <div>
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Breadcrumbs
          items={[{ label: 'Blog', href: '/blog' }, { label: post.title }]}
        />
      </div>

      <article>
        {/* Header: single column, aligned to the reading width */}
        <header className="max-w-[45rem] mx-auto px-4 sm:px-6 pt-4 pb-10">
          {categoryName && (
            <p className="text-xs font-semibold text-brand-600 uppercase tracking-[0.2em] mb-4">
              {categoryName}
            </p>
          )}

          <h1 className="text-3xl sm:text-4xl md:text-[2.75rem] lg:text-[3.25rem] font-bold text-gray-900 leading-[1.12] tracking-tight mb-6">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-lg sm:text-xl text-gray-500 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* Byline */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex items-center gap-3 text-sm text-gray-500">
            {post.author && (
              <span className="font-medium text-gray-900">
                By {post.author}
              </span>
            )}
            {post.author && formattedDate && (
              <span className="text-gray-300">|</span>
            )}
            {formattedDate && <span>{formattedDate}</span>}
            {post.readTime && (
              <>
                <span className="text-gray-300">|</span>
                <span>{post.readTime}</span>
              </>
            )}
          </div>
        </header>

        {/* Hero Image: full reading width, gently rounded */}
        {post.image && (
          <div className="w-full max-w-[52rem] mx-auto px-4 sm:px-6 mb-12">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-auto aspect-[16/9] object-cover rounded-xl"
            />
          </div>
        )}

        {/* Tags */}
        {post.blogTags && post.blogTags.length > 0 && (
          <div className="max-w-[45rem] mx-auto px-4 sm:px-6 flex flex-wrap gap-2 mb-10">
            {post.blogTags.map((tag) => (
              <span
                key={tag.slug}
                className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium uppercase tracking-wide"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Body Content */}
        <div className="max-w-[45rem] mx-auto px-4 sm:px-6">
          <div className="blog-article">
            {post.body && Array.isArray(post.body) && post.body.length > 0 ? (
              <PortableText
                value={post.body}
                components={portableTextComponents}
              />
            ) : post.bodyHtml ? (
              <div dangerouslySetInnerHTML={{ __html: post.bodyHtml }} />
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-2xl">
                <p className="text-gray-500 text-lg mb-4">
                  Full article coming soon.
                </p>
                <p className="text-gray-400">
                  In the meantime, check out the planning options below.
                </p>
              </div>
            )}
          </div>

          {/* Share / CTA */}
          <div className="mt-14 pt-8 border-t border-gray-200">
            <div className="bg-brand-50 rounded-2xl p-8 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Planning a trip?
              </h3>
              <p className="text-gray-600 mb-4">
                Tell me where you want to go and I will put together a verified
                itinerary and pricing for you, free of charge.
              </p>
              <Link
                href="/concierge-planning"
                className="inline-block px-6 py-3 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition-colors"
              >
                Plan With Me
              </Link>
            </div>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-8">
            More from the Blog
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {relatedPosts.map((p) => (
              <BlogCard key={p.id} post={p} />
            ))}
          </div>
        </div>
      )}

      {/* Newsletter */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pb-12">
        <NewsletterSignup
          heading="Get travel tips & deals in your inbox"
          subheading="Join 5,000+ travelers who get our best content and deals every week."
          utmCampaign="blog_post"
        />
      </div>
      <Stay22Scripts />
    </div>
  );
}
