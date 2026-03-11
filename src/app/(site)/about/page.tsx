import { Metadata } from 'next';
import Link from 'next/link';
import NewsletterSignup from '@/components/ui/NewsletterSignup';

export const metadata: Metadata = {
  title: 'About VacationPro',
  description: 'VacationPro helps travelers discover the best vacation package deals in one place. Learn about our mission, editorial standards, and team.',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">About VacationPro</h1>

      <div className="prose prose-lg max-w-none">
        <p className="text-xl text-gray-600 mb-8">
          VacationPro is your trusted destination for finding the best vacation package deals on the
          internet — all in one place.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Our Mission</h2>
        <p className="text-gray-600 leading-relaxed">
          We believe everyone deserves an incredible vacation, and finding the right deal shouldn&apos;t
          require hours of searching across dozens of websites. VacationPro curates the best vacation
          packages from trusted travel partners and presents them in a clear, transparent way — so you
          can compare deals, understand what&apos;s included, and book with confidence.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">What We Do</h2>
        <p className="text-gray-600 leading-relaxed">
          We aggregate and showcase vacation deals from leading travel brands, OTAs, resort companies,
          and affiliate partners. Our coverage includes:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-600 mt-4">
          <li>All-inclusive resort packages</li>
          <li>Flight + hotel bundles</li>
          <li>Cruise deals</li>
          <li>Luxury vacation packages</li>
          <li>Timeshare preview offers (clearly disclosed)</li>
          <li>Budget-friendly getaways</li>
          <li>Weekend escapes and last-minute deals</li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Our Editorial Standards</h2>
        <p className="text-gray-600 leading-relaxed">
          Every deal on VacationPro is reviewed before it&apos;s published. We verify pricing, check what&apos;s
          included, and provide our honest editorial assessment. When a deal is an affiliate link, we
          say so. When a deal requires a timeshare presentation, we disclose it clearly. Transparency
          isn&apos;t optional — it&apos;s foundational to how we operate.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">How We Make Money</h2>
        <p className="text-gray-600 leading-relaxed">
          VacationPro earns revenue through affiliate commissions, sponsored placements, and lead
          generation partnerships. When you click on a deal and make a purchase through one of our
          partner links, we may earn a commission at no additional cost to you. This allows us to
          keep the site free and continue curating the best deals for our readers.
        </p>
        <p className="text-gray-600 leading-relaxed mt-4">
          For full details, please read our{' '}
          <Link href="/legal/affiliate-disclosure" className="text-brand-600 hover:underline">
            Affiliate Disclosure
          </Link>.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Work With Us</h2>
        <p className="text-gray-600 leading-relaxed">
          Are you a travel brand, resort company, or affiliate network interested in featuring your
          deals on VacationPro? We&apos;d love to hear from you.
        </p>
        <div className="mt-4">
          <Link
            href="/partner"
            className="inline-flex items-center px-6 py-3 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition-colors"
          >
            Partner With Us
          </Link>
        </div>
      </div>

      <div className="mt-16">
        <NewsletterSignup />
      </div>
    </div>
  );
}
