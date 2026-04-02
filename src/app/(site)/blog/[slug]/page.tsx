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
  return {
    title: post.seoTitle || post.title,
    description: post.metaDescription || post.excerpt,
    openGraph: {
      title: post.seoTitle || post.title,
      description: post.metaDescription || post.excerpt,
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
        {/* Header — centered, narrow column */}
        <header className="max-w-2xl mx-auto px-4 sm:px-6 text-center pt-4 pb-8">
          {categoryName && (
            <p className="text-xs font-semibold text-brand-600 uppercase tracking-[0.2em] mb-4">
              {categoryName}
            </p>
          )}

          <h1 className="font-[family-name:var(--font-serif)] text-3xl sm:text-4xl md:text-[2.75rem] lg:text-5xl font-bold text-gray-900 leading-[1.15] mb-5">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-lg sm:text-xl text-gray-500 leading-relaxed max-w-xl mx-auto">
              {post.excerpt}
            </p>
          )}

          {/* Byline */}
          <div className="mt-8 pt-5 border-t border-gray-200 flex items-center justify-center gap-3 text-sm text-gray-500">
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

        {/* Hero Image — full width, no rounded corners */}
        {post.image && (
          <div className="w-full max-w-5xl mx-auto mb-10">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-auto aspect-[16/9] object-cover"
            />
          </div>
        )}

        {/* Tags */}
        {post.blogTags && post.blogTags.length > 0 && (
          <div className="max-w-2xl mx-auto px-4 sm:px-6 flex flex-wrap gap-2 mb-8">
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
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="blog-article prose prose-lg max-w-none prose-headings:font-[family-name:var(--font-serif)] prose-headings:text-gray-900 prose-headings:font-bold prose-h2:text-2xl sm:prose-h2:text-3xl prose-h3:text-xl sm:prose-h3:text-2xl prose-p:text-gray-700 prose-p:leading-[1.85] prose-p:text-[1.0625rem] sm:prose-p:text-lg prose-a:text-brand-600 prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-brand-600 prose-blockquote:text-gray-600 prose-blockquote:font-[family-name:var(--font-serif)] prose-blockquote:text-xl prose-blockquote:not-italic prose-img:rounded-none prose-strong:text-gray-900 prose-li:text-gray-700 prose-li:leading-[1.75]">
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
                  In the meantime, check out our latest vacation deals below.
                </p>
              </div>
            )}
          </div>

          {/* Share / CTA */}
          <div className="mt-14 pt-8 border-t border-gray-200">
            <div className="bg-brand-50 rounded-2xl p-8 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Looking for vacation deals?
              </h3>
              <p className="text-gray-600 mb-4">
                Browse our curated collection of the best travel deals available
                right now.
              </p>
              <Link
                href="/deals/all-inclusive"
                className="inline-block px-6 py-3 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition-colors"
              >
                Browse Deals
              </Link>
            </div>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <h2 className="font-[family-name:var(--font-serif)] text-2xl font-bold text-gray-900 mb-8">
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
    </div>
  );
}
