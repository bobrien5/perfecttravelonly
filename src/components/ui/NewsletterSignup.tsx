'use client';

interface NewsletterSignupProps {
  variant?: 'default' | 'hero' | 'inline';
  heading?: string;
  subheading?: string;
}

export default function NewsletterSignup({
  variant = 'default',
  heading = 'Get the best vacation deals delivered to your inbox',
  subheading = 'Join 25,000+ travelers who never miss a deal. Free, no spam, unsubscribe anytime.',
}: NewsletterSignupProps) {
  if (variant === 'inline') {
    return (
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          placeholder="Enter your email"
          className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
        <button
          type="button"
          className="px-6 py-3 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition-colors whitespace-nowrap"
        >
          Get Deal Alerts
        </button>
      </div>
    );
  }

  if (variant === 'hero') {
    return (
      <section className="bg-brand-600 rounded-2xl p-8 md:p-12 text-center text-white">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">{heading}</h2>
        <p className="text-brand-100 mb-6 max-w-lg mx-auto">{subheading}</p>
        <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-white text-brand-700 font-semibold rounded-lg hover:bg-brand-50 transition-colors whitespace-nowrap"
          >
            Subscribe Free
          </button>
        </form>
        <p className="text-xs text-brand-200 mt-3">No spam, ever. Unsubscribe anytime.</p>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-r from-brand-50 to-green-50 rounded-2xl p-8 md:p-12 text-center">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{heading}</h2>
      <p className="text-gray-600 mb-6 max-w-lg mx-auto">{subheading}</p>
      <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
        <input
          type="email"
          placeholder="Enter your email"
          className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition-colors whitespace-nowrap"
        >
          Get Deal Alerts
        </button>
      </form>
      <p className="text-xs text-gray-500 mt-3">No spam, ever. Unsubscribe anytime.</p>
    </section>
  );
}
