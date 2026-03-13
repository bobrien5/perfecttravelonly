import { Metadata } from 'next';
import BlogCard from '@/components/ui/BlogCard';
import NewsletterSignup from '@/components/ui/NewsletterSignup';
import { getAllBlogPosts } from '@/sanity/lib/fetch';

export const metadata: Metadata = {
  title: 'Travel Blog — Guides, Tips & Deal Alerts',
  description:
    'Expert travel guides, destination tips, deal breakdowns, and insider advice to help you plan the perfect vacation for less.',
};

export default async function BlogPage() {
  const posts = await getAllBlogPosts();

  // Group posts by category
  const categories = Array.from(new Set(posts.map((p) => p.category)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          The VacationPro Blog
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Expert travel guides, destination tips, and deal breakdowns to help
          you plan the perfect vacation for less.
        </p>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-10 justify-center">
        {categories.map((cat) => (
          <span
            key={cat}
            className="px-4 py-2 bg-brand-50 text-brand-700 font-medium rounded-full text-sm"
          >
            {cat}
          </span>
        ))}
      </div>

      {/* All Posts */}
      {posts.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 mb-16">
          <p className="text-gray-500 text-lg">
            Blog posts are coming soon. Stay tuned!
          </p>
        </div>
      )}

      {/* Newsletter */}
      <NewsletterSignup
        heading="Get travel tips & deals in your inbox"
        subheading="Join 5,000+ travelers who get our best content and deals every week."
        utmCampaign="blog_page"
      />
    </div>
  );
}
