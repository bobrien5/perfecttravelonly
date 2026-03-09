import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'VacationPro terms of use. Review the terms and conditions for using our website.',
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Use</h1>
      <p className="text-sm text-gray-500 mb-10">Last updated: March 2026</p>

      <div className="prose prose-gray max-w-none space-y-6">
        <p className="text-gray-600">
          By accessing and using VacationPro.co (the &ldquo;Site&rdquo;), you agree to be bound by these Terms
          of Use. If you do not agree with any part of these terms, please do not use the Site.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8">Use of the Site</h2>
        <p className="text-gray-600">
          VacationPro provides a platform for discovering and comparing vacation deals from
          third-party travel providers. We do not directly sell, book, or fulfill any travel
          products or services. When you click through to a partner site and make a booking, your
          transaction is with that third-party provider, not with VacationPro.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8">Deal Information & Pricing</h2>
        <p className="text-gray-600">
          We strive to display accurate pricing and deal details. However, prices and availability
          are subject to change by our partners at any time. We do not guarantee that any deal will
          be available at the price shown when you click through to the booking site.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8">Affiliate Relationships</h2>
        <p className="text-gray-600">
          VacationPro participates in affiliate programs and earns commissions on qualifying
          purchases made through our links. This does not affect the price you pay for any product
          or service.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8">Timeshare & Promotional Offers</h2>
        <p className="text-gray-600">
          Some deals featured on VacationPro are promotional packages that may require attendance at
          a timeshare or resort presentation. These offers are clearly labeled on the Site.
          VacationPro does not make any representations about the timeshare products being offered
          and encourages users to carefully review all terms and conditions before accepting any
          promotional offer.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8">Intellectual Property</h2>
        <p className="text-gray-600">
          All content on the Site, including text, graphics, logos, and design elements, is the
          property of VacationPro or its content suppliers and is protected by copyright law.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8">Limitation of Liability</h2>
        <p className="text-gray-600">
          VacationPro is not liable for any damages arising from your use of the Site, reliance on
          deal information, or transactions with third-party providers. The Site is provided &ldquo;as
          is&rdquo; without warranties of any kind.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8">Contact</h2>
        <p className="text-gray-600">
          For questions about these Terms of Use, contact us at legal@vacationpro.co.
        </p>
      </div>
    </div>
  );
}
