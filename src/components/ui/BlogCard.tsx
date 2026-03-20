import Link from 'next/link';
import { BlogPost } from '@/types';

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
      <Link href={`/blog/${post.slug}`}>
        <div className="aspect-[16/10] overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-medium text-brand-600 uppercase tracking-wide">{post.category}</span>
            <span className="text-gray-300">·</span>
            <span className="text-xs text-gray-500">{post.readTime}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-brand-600 transition-colors line-clamp-2 mb-3">
            {post.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">{post.excerpt}</p>
        </div>
      </Link>
    </article>
  );
}
