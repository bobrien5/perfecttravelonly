import { Metadata } from 'next';
import GHLForm from '@/components/ui/GHLForm';

const GHL_FORM_ID = 'UZXf7idNHC3qSQSS5YEF';

export const metadata: Metadata = {
  title: 'Free Webinar: Stop Overpaying for Vacations — VacationPro',
  description:
    'Discover how smart travelers are booking luxury all-inclusive resorts for a fraction of the public price. Free 60-minute webinar with live Q&A.',
  openGraph: {
    title: 'Free Webinar: Stop Overpaying for Vacations',
    description:
      'Discover how smart travelers are booking luxury all-inclusive resorts for a fraction of the public price.',
  },
};

export default function WebinarPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-brand-900 via-brand-800 to-brand-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1920&h=800&fit=crop')] bg-cover bg-center" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <p className="text-brand-300 text-sm font-semibold uppercase tracking-widest mb-4">
            Free Webinar — Limited Spots
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Stop Overpaying
            <br />
            <span className="text-brand-300">for Vacations.</span>
          </h1>
          <p className="text-lg text-brand-100 max-w-2xl mx-auto mb-8">
            Discover how smart travelers are booking luxury all-inclusive resorts for
            a fraction of the public price — and how you can do the same.
          </p>
          <div className="flex justify-center gap-6 text-sm text-brand-200">
            <span>60 Minutes</span>
            <span>·</span>
            <span>Live Q&A</span>
            <span>·</span>
            <span>100% Free</span>
          </div>
        </div>
      </section>

      {/* What You'll Learn */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">
            What You&apos;ll Walk Away With
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                num: '01',
                title: 'How Vacation Club Pricing Works',
                desc: 'Why members access rates that are simply unavailable to the public.',
              },
              {
                num: '02',
                title: 'Best Value Destinations in 2026',
                desc: 'Which resorts and regions deliver the most value right now.',
              },
              {
                num: '03',
                title: 'Retail vs. Member Pricing',
                desc: 'Side-by-side comparisons showing what members actually pay.',
              },
              {
                num: '04',
                title: 'How to Evaluate Any Membership',
                desc: 'The honest questions to ask before joining anything.',
              },
              {
                num: '05',
                title: 'Is It Right for You?',
                desc: 'A straightforward framework for deciding if it fits your travel habits.',
              },
              {
                num: '06',
                title: 'Live Q&A',
                desc: 'Ask anything — get real, unscripted answers from our team.',
              },
            ].map((item) => (
              <div
                key={item.num}
                className="bg-white rounded-xl border border-gray-200 p-6"
              >
                <span className="text-3xl font-bold text-gray-200">{item.num}</span>
                <h3 className="text-lg font-semibold text-gray-900 mt-3 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section className="py-12 sm:py-16" id="register">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Reserve Your Free Spot
            </h2>
            <p className="text-gray-600">
              Enter your details below and we&apos;ll send you everything you need —
              webinar time, link, and a reminder.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
            <GHLForm formId={GHL_FORM_ID} height={609} />
          </div>

          <p className="text-xs text-gray-400 text-center mt-4">
            Spots are limited · Free to attend · No obligations
          </p>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-12 sm:py-16 bg-brand-900 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-yellow-400 text-lg mb-6">★★★★★</p>
          <blockquote className="text-xl sm:text-2xl font-light italic text-brand-100 mb-6">
            &ldquo;We&apos;ve been taking all-inclusive vacations for 15 years. I had
            no idea a pricing tier like this existed. We booked our first trip
            through the membership and paid less than half of what we&apos;d been
            spending.&rdquo;
          </blockquote>
          <p className="text-sm text-brand-300">
            <strong className="text-white">Sarah M.</strong> · VacationPro Community
            Member · Cancún, Mexico
          </p>
        </div>
      </section>

      {/* About / Trust */}
      <section className="py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Why Listen to Us
          </h2>
          <p className="text-gray-600 mb-4">
            VacationPro grew out of All-Inclusive HQ — one of the web&apos;s most
            trusted resources for all-inclusive travel. We&apos;re a media and education
            brand. Our job is to cut through the noise and share what genuinely works.
          </p>
          <p className="text-gray-600 mb-8">
            We partner with travel companies only when we believe in what they&apos;re
            offering. You&apos;ll make your own decision after the webinar.
          </p>
          <a
            href="#register"
            className="inline-flex items-center justify-center px-8 py-4 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors"
          >
            Reserve My Free Spot
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Common Questions
          </h2>
          <div className="space-y-0 divide-y divide-gray-200">
            {[
              {
                q: 'Is this a timeshare pitch?',
                a: "No. This is an educational webinar about vacation club memberships — a different model than traditional timeshares. We'll explain exactly how it works. You won't be pressured into anything.",
              },
              {
                q: 'Is there a cost to attend?',
                a: 'The webinar is completely free. No credit card, no catch.',
              },
              {
                q: 'How long is it?',
                a: 'About 60 minutes, including a live Q&A at the end.',
              },
              {
                q: 'Will I be pressured to buy something?',
                a: "You'll hear about the membership option — that's part of what we cover honestly. But there's no hard sell.",
              },
              {
                q: "What if I can't make the live time?",
                a: "Register anyway and we'll send you a replay link.",
              },
            ].map((item) => (
              <details key={item.q} className="group">
                <summary className="flex justify-between items-center py-5 cursor-pointer text-gray-900 font-medium">
                  {item.q}
                  <span className="text-brand-600 text-xl group-open:hidden">+</span>
                  <span className="text-brand-600 text-xl hidden group-open:inline">−</span>
                </summary>
                <p className="pb-5 text-sm text-gray-600 leading-relaxed">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
