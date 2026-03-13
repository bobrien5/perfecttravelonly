import { Metadata } from 'next';
import ContactForm from '@/components/ui/ContactForm';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the VacationPro team. Questions about deals, partnerships, or advertising? We\'d love to hear from you.',
};

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
      <p className="text-lg text-gray-600 mb-10">
        Have a question about a deal, interested in partnering with us, or just want to say hello?
        We&apos;d love to hear from you.
      </p>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Send Us a Message</h2>
          <ContactForm />
        </div>

        {/* Contact Info */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Other Ways to Reach Us</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-1">Email</h3>
              <p className="text-gray-600">Admin@vacationpro.co</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">Partnerships</h3>
              <p className="text-gray-600">Admin@vacationpro.co</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">Press & Media</h3>
              <p className="text-gray-600">Admin@vacationpro.co</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 mt-8">
              <h3 className="font-medium text-gray-900 mb-2">Response Time</h3>
              <p className="text-sm text-gray-600">
                We typically respond within 1–2 business days. For urgent partnership inquiries,
                please include &ldquo;URGENT&rdquo; in your subject line.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
