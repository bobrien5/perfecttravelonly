import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'VacationPro privacy policy. Learn how we collect, use, and protect your personal information.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-10">Last updated: March 2026</p>

      <div className="prose prose-gray max-w-none space-y-6">
        <p className="text-gray-600">
          VacationPro (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is committed to protecting your privacy. This Privacy
          Policy explains how we collect, use, disclose, and safeguard your information when you
          visit our website vacationpro.co (the &ldquo;Site&rdquo;).
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8">Information We Collect</h2>
        <p className="text-gray-600">
          We may collect personal information that you voluntarily provide to us, including:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-gray-600">
          <li>Name and email address when you subscribe to our newsletter</li>
          <li>Contact information when you fill out our contact form</li>
          <li>Usage data and analytics information collected via cookies and similar technologies</li>
        </ul>

        <h2 className="text-xl font-semibold text-gray-900 mt-8">How We Use Your Information</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-600">
          <li>To send you our newsletter and deal alerts (with your consent)</li>
          <li>To respond to your inquiries</li>
          <li>To improve our website and user experience</li>
          <li>To analyze website traffic and usage patterns</li>
          <li>To comply with legal obligations</li>
        </ul>

        <h2 className="text-xl font-semibold text-gray-900 mt-8">Third-Party Links</h2>
        <p className="text-gray-600">
          Our Site contains links to third-party websites, including travel partners and affiliate
          networks. We are not responsible for the privacy practices of these external sites. We
          encourage you to read the privacy policies of every website you visit.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8">Cookies & Tracking</h2>
        <p className="text-gray-600">
          We use cookies and similar tracking technologies to analyze website traffic, personalize
          content, and track affiliate conversions. You can control cookies through your browser
          settings.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8">Your Rights</h2>
        <p className="text-gray-600">
          You have the right to access, correct, or delete your personal data. You may unsubscribe
          from our newsletter at any time by clicking the unsubscribe link in any email. For data
          requests, contact us at Admin@vacationpro.co.
        </p>

        <h2 className="text-xl font-semibold text-gray-900 mt-8">Contact Us</h2>
        <p className="text-gray-600">
          If you have questions about this Privacy Policy, please contact us at Admin@vacationpro.co.
        </p>
      </div>
    </div>
  );
}
