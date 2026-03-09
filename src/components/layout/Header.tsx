'use client';

import { useState } from 'react';
import Link from 'next/link';

const navigation = [
  {
    name: 'Deals',
    href: '/deals/all-inclusive',
    children: [
      { name: 'All-Inclusive Deals', href: '/deals/all-inclusive' },
      { name: 'Flight + Hotel Packages', href: '/deals/flight-hotel' },
      { name: 'Cruise Deals', href: '/deals/cruises' },
      { name: 'Timeshare Deals', href: '/deals/timeshare' },
      { name: 'Luxury Deals', href: '/deals/luxury' },
      { name: 'Budget Vacations', href: '/deals/budget' },
      { name: 'Weekend Getaways', href: '/deals/weekend-getaways' },
      { name: 'View All Deals', href: '/deals/all-inclusive' },
    ],
  },
  {
    name: 'Destinations',
    href: '/destinations/cancun',
    children: [
      { name: 'Cancun', href: '/destinations/cancun' },
      { name: 'Punta Cana', href: '/destinations/punta-cana' },
      { name: 'Jamaica', href: '/destinations/jamaica' },
      { name: 'Aruba', href: '/destinations/aruba' },
      { name: 'Cabo San Lucas', href: '/destinations/cabo-san-lucas' },
      { name: 'Orlando', href: '/destinations/orlando' },
      { name: 'Las Vegas', href: '/destinations/las-vegas' },
      { name: 'Maui', href: '/destinations/maui' },
    ],
  },
  {
    name: 'Categories',
    href: '/deals/all-inclusive',
    children: [
      { name: 'All-Inclusive', href: '/deals/all-inclusive' },
      { name: 'Caribbean', href: '/deals/caribbean' },
      { name: 'Mexico', href: '/deals/mexico' },
      { name: 'Beach Vacations', href: '/deals/beach' },
      { name: 'Family Vacations', href: '/deals/family' },
      { name: 'Adults-Only', href: '/deals/adults-only' },
      { name: 'Golf Vacations', href: '/deals/golf' },
      { name: 'Ski Vacations', href: '/deals/ski' },
    ],
  },
  { name: 'Blog', href: '/blog' },
  { name: 'About', href: '/about' },
  { name: 'Partner With Us', href: '/partner' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      {/* Main nav */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img src="/logo.svg" alt="VacationPro" className="w-9 h-9" />
            <span className="text-xl font-bold text-gray-900">
              Vacation<span className="text-brand-600">Pro</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => setActiveDropdown(item.name)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={item.href}
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-brand-600 transition-colors rounded-md hover:bg-gray-50"
                >
                  {item.name}
                  {item.children && (
                    <svg className="inline-block w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </Link>
                {item.children && activeDropdown === item.name && (
                  <div className="absolute top-full left-0 mt-0 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA + Mobile Toggle */}
          <div className="flex items-center gap-3">
            <Link
              href="/newsletter"
              className="hidden sm:inline-flex items-center px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
            >
              Get Deal Alerts
            </Link>
            <button
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-100 py-4 space-y-1">
            {navigation.map((item) => (
              <div key={item.name}>
                <Link
                  href={item.href}
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-brand-600 hover:bg-gray-50 rounded-md"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.name}
                </Link>
                {item.children && (
                  <div className="ml-4 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className="block px-3 py-1.5 text-sm text-gray-500 hover:text-brand-600"
                        onClick={() => setMobileOpen(false)}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-3 px-3">
              <Link
                href="/newsletter"
                className="block w-full text-center px-4 py-2 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Get Deal Alerts
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
