import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Affiliate Disclosure',
  description: 'VacationPro affiliate disclosure. Learn how we earn revenue and how it affects the deals we feature.',
};

export default function AffiliateDisclosurePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Affiliate Disclosure</h1>
      <p className="text-sm text-gray-500 mb-10">Last updated: March 2026</p>

      <div className="prose prose-gray max-w-none space-y-6">
        <p className="text-gray-600 text-lg">
          Transparency matters to us. Here&apos;s how VacationPro earns revenue and what that means for you.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8">How We Earn Revenue</h2>
        <p className="text-gray-600">
          VacationPro is a free website. We earn revenue in the following ways:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-600">
          <li>
            <strong>Affiliate Commissions:</strong> When you click on a deal link and make a purchase
            or booking through one of our partner sites, we may earn a commission at no additional
            cost to you.
          </li>
          <li>
            <strong>Lead Generation:</strong> Some deals, particularly timeshare preview offers,
            generate revenue when qualified users sign up for a vacation package. These offers are
            always clearly labeled.
          </li>
          <li>
            <strong>Sponsored Placements:</strong> Some deals may be featured or promoted by our
            advertising partners. Sponsored deals are always identified.
          </li>
          <li>
            <strong>Display Advertising:</strong> We may display advertisements on the Site from
            third-party ad networks.
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-gray-900 mt-8">Does This Affect Our Editorial Content?</h2>
        <p className="text-gray-600">
          No. Our editorial team independently selects and reviews the deals featured on VacationPro.
          While we earn commissions from some links, this does not influence which deals we recommend
          or how we rank them. We prioritize genuine value for our readers above all else.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8">Our Promise to You</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-600">
          <li>We will always clearly disclose when a link is an affiliate link</li>
          <li>We will never recommend a deal solely because it pays a higher commission</li>
          <li>We will always disclose when a deal is a timeshare preview or promotional offer</li>
          <li>We will always show you the real price and what&apos;s included</li>
          <li>Our editorial integrity is not for sale</li>
        </ul>

        <h2 className="text-xl font-semibold text-gray-900 mt-8">Affiliate Partners</h2>
        <p className="text-gray-600">
          We work with a range of travel affiliate partners and networks, including (but not limited to):
          Travelzoo, Expedia, Booking.com, JetBlue Vacations, Priceline, and various resort and
          timeshare companies. We only partner with companies we believe offer genuine value to travelers.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8">Questions?</h2>
        <p className="text-gray-600">
          If you have any questions about our affiliate relationships, please contact us at
          disclosure@vacationpro.co.
        </p>
      </div>
    </div>
  );
}
