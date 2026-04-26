import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Partner With Us: Advertise on VacationPro',
  description: 'Reach engaged vacation shoppers. Feature your deals, resorts, and travel products on VacationPro.',
  alternates: { canonical: '/partner' },
};

export default function PartnerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Partner With VacationPro</h1>
      <p className="text-xl text-gray-600 mb-12">
        Reach thousands of engaged travelers actively searching for their next vacation.
        Feature your deals, resorts, and travel products on VacationPro.
      </p>

      {/* Partnership Options */}
      <div className="grid md:grid-cols-2 gap-6 mb-16">
        {[
          {
            title: 'Featured Deal Placements',
            desc: 'Get your vacation packages featured prominently on our homepage, category pages, and destination pages. Premium placement ensures maximum visibility.',
          },
          {
            title: 'Affiliate Partnerships',
            desc: 'Join our affiliate program and have your deals listed on VacationPro. We drive qualified traffic to your booking page. You only pay for results.',
          },
          {
            title: 'Sponsored Content',
            desc: 'Collaborate with our editorial team to create branded travel guides, destination features, and deal spotlights that align with your brand.',
          },
          {
            title: 'Newsletter Sponsorships',
            desc: 'Reach our growing email subscriber base with sponsored placements in our deals newsletter. High open rates, engaged travel audience.',
          },
          {
            title: 'Lead Generation',
            desc: 'Generate qualified leads for your resort, timeshare, or vacation ownership program. We handle the traffic. You handle the conversions.',
          },
          {
            title: 'Custom Landing Pages',
            desc: 'Get a dedicated landing page on VacationPro showcasing your brand, deals, and offerings to our audience.',
          },
        ].map((option) => (
          <div key={option.title} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{option.title}</h3>
            <p className="text-sm text-gray-600">{option.desc}</p>
          </div>
        ))}
      </div>

      {/* Audience Stats */}
      <div className="bg-brand-50 rounded-2xl p-8 md:p-12 mb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Our Audience</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { stat: '50K+', label: 'Monthly Visitors' },
            { stat: '5K+', label: 'Email Subscribers' },
            { stat: '85%', label: 'U.S. Based' },
            { stat: '3.5min', label: 'Avg. Time on Site' },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-3xl font-bold text-brand-700">{item.stat}</p>
              <p className="text-sm text-gray-600 mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
        <p className="text-gray-600 mb-6 max-w-lg mx-auto">
          Reach out to our partnerships team and we&apos;ll put together a custom plan that works for your brand and budget.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-8 py-4 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors"
          >
            Contact Our Team
          </Link>
          <a
            href="mailto:Admin@vacationpro.co"
            className="inline-flex items-center justify-center px-8 py-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
          >
            Admin@vacationpro.co
          </a>
        </div>
      </div>
    </div>
  );
}
