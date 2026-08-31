import { FormEvent, useState } from 'react';

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

interface SaveGateProps {
  onClose: () => void;
  onSubmit: (email: string) => void;
}

export default function SaveGate({ onClose, onSubmit }: SaveGateProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();

    if (!EMAIL_RE.test(trimmed)) {
      setError('Please enter a valid email address.');
      return;
    }

    setError(null);
    onSubmit(trimmed);
    setSaved(true);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-sm relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold leading-none"
        >
          &times;
        </button>

        {saved ? (
          <div className="text-center py-6">
            <p className="text-lg font-extrabold text-gray-900 mb-2">Saved. We&apos;ll email you a link to your matches.</p>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-extrabold text-gray-900 mb-2">Save your matches</h2>
            <p className="text-gray-600 mb-5">
              Create a free VacationPro account to save your trip and build your personalized itinerary.
            </p>

            <form onSubmit={handleSubmit}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 mb-2 text-gray-900 focus:border-brand-500 focus:outline-none"
              />
              {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
              <button
                type="submit"
                className="bg-brand-500 hover:bg-brand-600 text-white rounded-xl py-3.5 font-bold w-full mb-3"
              >
                Save my matches
              </button>
            </form>

            <p className="text-xs text-gray-400 text-center">Google and Apple sign-in coming soon.</p>
          </>
        )}
      </div>
    </div>
  );
}
