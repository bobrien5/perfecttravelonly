'use client';

import { useEffect, useRef } from 'react';

interface GHLFormProps {
  formId: string;
  className?: string;
  height?: number;
}

/**
 * Embeds a GoHighLevel hosted form via their standard embed snippet.
 *
 * Uses the custom domain go.vacationpro.co for the embed.
 *
 * Usage:
 *   <GHLForm formId="UZXf7idNHC3qSQSS5YEF" />
 */
export default function GHLForm({ formId, className = '', height = 609 }: GHLFormProps) {
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (!formId || scriptLoaded.current) return;

    // Load the GHL form embed script once
    const existingScript = document.querySelector(
      'script[src="https://go.vacationpro.co/js/form_embed.js"]'
    );

    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://go.vacationpro.co/js/form_embed.js';
      script.async = true;
      document.body.appendChild(script);
    }

    scriptLoaded.current = true;
  }, [formId]);

  if (!formId) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
        <p className="text-amber-800 text-sm font-medium">
          GHL Form ID not configured. Update the <code>formId</code> prop with your GoHighLevel form ID.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <iframe
        src={`https://go.vacationpro.co/widget/form/${formId}`}
        style={{
          width: '100%',
          height: `${height}px`,
          border: 'none',
          borderRadius: '4px',
        }}
        id={`inline-${formId}`}
        data-layout="{'id':'INLINE'}"
        data-trigger-type="alwaysShow"
        data-trigger-value=""
        data-activation-type="alwaysActivated"
        data-activation-value=""
        data-deactivation-type="neverDeactivate"
        data-deactivation-value=""
        data-form-name="Marketing Form - Claim Offer"
        data-height={String(height)}
        data-layout-iframe-id={`inline-${formId}`}
        data-form-id={formId}
        title="Marketing Form - Claim Offer"
      />
    </div>
  );
}
