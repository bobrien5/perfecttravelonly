'use client';

import Link from 'next/link';

const footerLinks = {
  deals: [
    { name: 'All-Inclusive Deals', href: '/deals/all-inclusive' },
    { name: 'Cruise Deals', href: '/deals/cruises' },
    { name: 'Flight + Hotel', href: '/deals/flight-hotel' },
    { name: 'Timeshare Deals', href: '/deals/timeshare' },
    { name: 'Luxury Deals', href: '/deals/luxury' },
    { name: 'Budget Vacations', href: '/deals/budget' },
    { name: 'Weekend Getaways', href: '/deals/weekend-getaways' },
  ],
  destinations: [
    { name: 'Cancun', href: '/destinations/cancun' },
    { name: 'Punta Cana', href: '/destinations/punta-cana' },
    { name: 'Jamaica', href: '/destinations/jamaica' },
    { name: 'Aruba', href: '/destinations/aruba' },
    { name: 'Cabo San Lucas', href: '/destinations/cabo-san-lucas' },
    { name: 'Orlando', href: '/destinations/orlando' },
    { name: 'Las Vegas', href: '/destinations/las-vegas' },
    { name: 'Maui', href: '/destinations/maui' },
  ],
  company: [
    { name: 'About VacationPro', href: '/about' },
    { name: 'Partner With Us', href: '/partner' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
    { name: 'Newsletter', href: '/newsletter' },
  ],
  legal: [
    { name: 'Privacy Policy', href: '/legal/privacy' },
    { name: 'Terms of Use', href: '/legal/terms' },
    { name: 'Affiliate Disclosure', href: '/legal/affiliate-disclosure' },
    { name: 'Disclaimer', href: '/legal/disclaimer' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Newsletter CTA */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-white mb-2">
              Get the best vacation deals in your inbox
            </h3>
            <p className="text-gray-400 mb-6">
              Join thousands of savvy travelers who never miss a deal.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition-colors whitespace-nowrap"
              >
                Subscribe Free
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-3">No spam, ever. Unsubscribe anytime.</p>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Deals</h4>
            <ul className="space-y-2">
              {footerLinks.deals.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Destinations</h4>
            <ul className="space-y-2">
              {footerLinks.destinations.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <img src="/logo-white.svg" alt="VacationPro" className="w-8 h-8" />
              <span className="text-lg font-bold text-white">
                Vacation<span className="text-brand-400">Pro</span>
              </span>
            </div>
            <p className="text-sm text-gray-500 text-center">
              &copy; {new Date().getFullYear()} VacationPro. All rights reserved.
              Some links on this site are affiliate links. See our{' '}
              <Link href="/legal/affiliate-disclosure" className="text-gray-400 hover:text-white underline">
                affiliate disclosure
              </Link>.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
