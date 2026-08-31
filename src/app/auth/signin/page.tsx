import { Suspense } from 'react';

import { SignInForm } from './SignInForm';

export const metadata = {
  title: 'Sign in | VacationPro Trip Hub',
};

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center text-white font-bold">
              VP
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">VacationPro</h1>
              <p className="text-xs text-gray-500">Trip Hub</p>
            </div>
          </div>

          <Suspense fallback={null}>
            <SignInForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
