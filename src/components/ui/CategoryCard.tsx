import Link from 'next/link';
import { Category } from '@/types';

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/deals/${category.slug}`}
      className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-brand-200 hover:shadow-md transition-all duration-300"
    >
      <div className="text-3xl shrink-0 w-12 h-12 flex items-center justify-center bg-brand-50 rounded-lg group-hover:bg-brand-100 transition-colors">
        {category.icon}
      </div>
      <div className="min-w-0">
        <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
          {category.name}
        </h3>
        <p className="text-sm text-gray-500 truncate">{category.shortDescription}</p>
      </div>
      <svg className="w-5 h-5 text-gray-300 group-hover:text-brand-500 shrink-0 ml-auto transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}
