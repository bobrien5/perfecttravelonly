import { Metadata } from 'next';
import NewsletterForm from '@/components/ui/NewsletterForm';

export const metadata: Metadata = {
  title: 'Get Vacation Deal Alerts — Subscribe to VacationPro',
  description: 'Get the best vacation deals delivered to your inbox. All-inclusive packages, flight deals, cruise offers, and limited-time travel promotions.',
};

export default function NewsletterPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Never Miss a Great Vacation Deal
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Join 25,000+ savvy travelers who get the best vacation deals delivered straight to their inbox.
          Free, no spam, unsubscribe anytime.
        </p>
      </div>

      {/* Signup Form */}
      <div className="max-w-md mx-auto mb-16">
        <NewsletterForm />
      </div>

      {/* What You'll Get */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">What You&apos;ll Get</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: 'Weekly Deal Roundups',
              desc: 'A curated selection of the best vacation deals each week — all-inclusive, cruises, flight bundles, and more.',
            },
            {
              title: 'Flash Sale Alerts',
              desc: 'Be the first to know about limited-time deals and flash sales that sell out fast.',
            },
            {
              title: 'Destination Guides',
              desc: 'Travel tips, insider guides, and destination insights to help you plan the perfect trip.',
            },
          ].map((item) => (
            <div key={item.title} className="bg-gray-50 rounded-xl p-6 text-center">
              <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Social Proof */}
      <div className="text-center bg-brand-50 rounded-2xl p-8">
        <p className="text-lg text-gray-700 italic mb-4">
          &ldquo;VacationPro&apos;s newsletter helped me find a Cancun all-inclusive deal for $799 that normally
          costs $1,500. Best vacation I&apos;ve ever booked.&rdquo;
        </p>
        <p className="text-sm text-gray-500">— Sarah M., Newsletter Subscriber</p>
      </div>
    </div>
  );
}
