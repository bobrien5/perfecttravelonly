'use client';

export default function NewsletterForm() {
  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <div>
        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
          First Name (optional)
        </label>
        <input
          type="text"
          id="firstName"
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          placeholder="Your first name"
        />
      </div>
      <div>
        <label htmlFor="newsletterEmail" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <input
          type="email"
          id="newsletterEmail"
          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          placeholder="you@example.com"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full px-6 py-4 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition-colors text-lg"
      >
        Subscribe — It&apos;s Free
      </button>
      <p className="text-xs text-gray-400 text-center">
        No spam, ever. Unsubscribe anytime. We respect your privacy.
      </p>
    </form>
  );
}
