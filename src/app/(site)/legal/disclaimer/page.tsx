import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Disclaimer',
  description: 'VacationPro disclaimer. Important information about deal accuracy, timeshare offers, and third-party bookings.',
};

export default function DisclaimerPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Disclaimer</h1>
      <p className="text-sm text-gray-500 mb-10">Last updated: March 2026</p>

      <div className="prose prose-gray max-w-none space-y-6">
        <h2 className="text-xl font-semibold text-gray-900 mt-8">General Disclaimer</h2>
        <p className="text-gray-600">
          VacationPro is a deal discovery platform. We do not directly sell, book, or fulfill any
          travel products or services. All deals are provided by third-party travel partners, and
          your booking is directly with those providers. We make every effort to display accurate
          information, but prices, availability, and deal terms may change at any time without notice.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8">Pricing & Availability</h2>
        <p className="text-gray-600">
          The prices shown on VacationPro are estimates based on information from our partners at the
          time of publication. Actual prices may vary based on travel dates, occupancy, departure city,
          and other factors. Taxes, fees, and resort charges may not be included in displayed prices
          unless explicitly stated.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8">Timeshare & Promotional Offers</h2>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 my-4">
          <p className="text-amber-800 text-sm leading-relaxed">
            <strong>Important:</strong> Some vacation packages featured on VacationPro are timeshare
            preview or promotional offers. These deals may require the following:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-amber-800 text-sm mt-3">
            <li>Attendance at a timeshare or resort ownership presentation (typically 60–120 minutes)</li>
            <li>Meeting specific eligibility requirements (age, income, marital status)</li>
            <li>Presenting a valid ID and major credit card</li>
            <li>Married or cohabitating couples may be required to attend together</li>
          </ul>
          <p className="text-amber-800 text-sm mt-3">
            <strong>There is no obligation to purchase a timeshare or vacation ownership product.</strong>{' '}
            These offers are promotional in nature. VacationPro clearly labels all timeshare preview
            deals and encourages users to review all terms and conditions before booking.
          </p>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mt-8">Affiliate & Advertising Relationships</h2>
        <p className="text-gray-600">
          VacationPro earns revenue through affiliate commissions, lead generation, and sponsored
          placements. This means we may be compensated when you click on a link and/or complete a
          booking. Our editorial content is independent of our advertising relationships.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8">Not Professional Advice</h2>
        <p className="text-gray-600">
          Content on VacationPro is for informational purposes only and does not constitute
          professional travel, legal, or financial advice. Always do your own research and
          consult appropriate professionals before making travel decisions.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8">Contact</h2>
        <p className="text-gray-600">
          For questions about this disclaimer, contact us at Admin@vacationpro.co.
        </p>
      </div>
    </div>
  );
}
