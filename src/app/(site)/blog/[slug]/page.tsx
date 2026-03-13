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
import { PortableText } from '@portabletext/react';

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumbs
        items={[{ label: 'Blog', href: '/blog' }, { label: post.title }]}
      />

      <article className="max-w-3xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            {post.blogCategory ? (
              <span className="text-sm font-medium text-brand-600 uppercase tracking-wide">
                {post.blogCategory.name}
              </span>
            ) : post.category ? (
              <span className="text-sm font-medium text-brand-600 uppercase tracking-wide">
                {post.category}
              </span>
            ) : null}
            {post.readTime && (
              <>
                <span className="text-gray-300">·</span>
                <span className="text-sm text-gray-500">{post.readTime}</span>
              </>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-xl text-gray-600 leading-relaxed">
              {post.excerpt}
            </p>
          )}

          <div className="flex items-center gap-4 mt-6 pt-6 border-t border-gray-100">
            <div>
              {post.author && (
                <p className="font-medium text-gray-900">{post.author}</p>
              )}
              {formattedDate && (
                <p className="text-sm text-gray-500">{formattedDate}</p>
              )}
            </div>
          </div>
        </header>

        {/* Hero Image */}
        {post.image && (
          <div className="rounded-2xl overflow-hidden mb-10">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-auto aspect-[16/9] object-cover"
            />
          </div>
        )}

        {/* Tags */}
        {post.blogTags && post.blogTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {post.blogTags.map((tag) => (
              <span
                key={tag.slug}
                className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Body Content */}
        <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-brand-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl">
          {post.body && Array.isArray(post.body) && post.body.length > 0 ? (
            <PortableText value={post.body} />
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
        <div className="mt-12 pt-8 border-t border-gray-200">
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
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="mt-16 max-w-7xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
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
      <div className="mt-16">
        <NewsletterSignup
          heading="Get travel tips & deals in your inbox"
          subheading="Join 25,000+ travelers who get our best content and deals every week."
          utmCampaign="blog_post"
        />
      </div>
    </div>
  );
}
