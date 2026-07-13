import sgMail from '@sendgrid/mail';

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'hello@vacationpro.co';
const FROM_NAME = process.env.SENDGRID_FROM_NAME || 'VacationPro';
const SITE_URL = 'https://www.vacationpro.co';
const YEAR = new Date().getFullYear();
const LOGO_URL = `${SITE_URL}/logo.svg`;

// Brand colors (from globals.css)
const BRAND = {
  50: '#edfdf4',
  100: '#d1fae2',
  200: '#a6f4c8',
  500: '#4ac850',
  600: '#009b51',
  700: '#007b41',
  800: '#006135',
};

// ─── Shared email wrapper ───────────────────────────────────────
function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,${BRAND[600]} 0%,${BRAND[700]} 100%);padding:24px 32px;text-align:center;">
              <a href="${SITE_URL}" style="text-decoration:none;">
                <img src="${LOGO_URL}" alt="VacationPro" width="44" height="44" style="display:inline-block;vertical-align:middle;margin-right:10px;border-radius:50%;background-color:#ffffff;" />
                <span style="color:#ffffff;font-size:24px;font-weight:700;vertical-align:middle;">Vacation<span style="color:${BRAND[200]};">Pro</span></span>
              </a>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#f9fafb;padding:24px 32px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="color:#9ca3af;font-size:12px;margin:0 0 8px;">
                © ${YEAR} VacationPro · <a href="${SITE_URL}" style="color:${BRAND[600]};text-decoration:none;">vacationpro.co</a>
              </p>
              <p style="color:#9ca3af;font-size:12px;margin:0;">
                <a href="<%asm_group_unsubscribe_raw_url%>" style="color:#9ca3af;text-decoration:underline;">Unsubscribe</a> ·
                <a href="${SITE_URL}/legal/privacy" style="color:#9ca3af;text-decoration:underline;">Privacy Policy</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function ctaButton(text: string, href: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr>
      <td align="center">
        <a href="${href}" style="display:inline-block;background-color:${BRAND[500]};color:#ffffff;font-size:16px;font-weight:600;padding:14px 32px;border-radius:10px;text-decoration:none;">${text}</a>
      </td>
    </tr>
  </table>`;
}

// ─── Email 2: Travel Guides (Day 3) ─────────────────────────────
export function getEmail2Html(firstName?: string): string {
  const greeting = firstName ? `${firstName}, check` : 'Check';

  return emailWrapper(`
    <h2 style="color:#111827;font-size:22px;margin:0 0 8px;font-weight:700;">📖 ${greeting} out our latest travel guides</h2>
    <p style="color:#4b5563;font-size:16px;line-height:1.6;margin:0 0 24px;">
      Every week we publish new destination guides, packing tips, and trip planning advice to help you get more out of your next vacation. Take a look at what is new.
    </p>
    ${ctaButton('Browse Guides', `${SITE_URL}/blog`)}
    <p style="color:#9ca3af;font-size:13px;text-align:center;margin:0;">
      New guides are added every week, so check back often.
    </p>
  `);
}

// ─── Email 3: Top Destinations + Social Proof (Day 7) ──────────
export function getEmail3Html(firstName?: string): string {
  const greeting = firstName ? `${firstName}, where` : 'Where';

  const destinations = [
    { name: 'Cancun', slug: 'cancun', emoji: '🇲🇽', tagline: 'All-inclusive paradise with flights from $799' },
    { name: 'Punta Cana', slug: 'punta-cana', emoji: '🇩🇴', tagline: 'Caribbean luxury from $649/person' },
    { name: 'Jamaica', slug: 'jamaica', emoji: '🇯🇲', tagline: 'Adults-only all-inclusive from $899' },
    { name: 'Cabo San Lucas', slug: 'cabo-san-lucas', emoji: '🌅', tagline: 'Oceanfront luxury from $1,299' },
    { name: 'Maui', slug: 'maui', emoji: '🌺', tagline: 'Flight + hotel bundles from $899' },
    { name: 'Orlando', slug: 'orlando', emoji: '🎢', tagline: 'Family theme park packages from $599' },
  ];

  const destRows = destinations.map(d => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;">
        <a href="${SITE_URL}/destinations/${d.slug}" style="text-decoration:none;">
          <span style="font-size:20px;margin-right:8px;">${d.emoji}</span>
          <strong style="color:#111827;font-size:15px;">${d.name}</strong>
          <p style="color:#6b7280;font-size:13px;margin:4px 0 0 28px;">${d.tagline}</p>
        </a>
      </td>
    </tr>
  `).join('');

  return emailWrapper(`
    <h2 style="color:#111827;font-size:22px;margin:0 0 8px;font-weight:700;">${greeting} are you dreaming of going? ✈️</h2>
    <p style="color:#4b5563;font-size:16px;line-height:1.6;margin:0 0 8px;">
      Over 5,000 travelers get our deal alerts every week. Here are the destinations they're booking most:
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
      ${destRows}
    </table>

    <div style="background-color:${BRAND[50]};border-radius:12px;padding:20px;margin:24px 0;text-align:center;">
      <p style="color:${BRAND[700]};font-size:14px;font-weight:600;margin:0 0 4px;">💬 What travelers are saying</p>
      <p style="color:#374151;font-size:15px;font-style:italic;margin:0 0 8px;">
        "I saved over $800 on our Cancun trip just by waiting for a VacationPro deal alert. Literally the easiest way to find vacation packages."
      </p>
      <p style="color:#9ca3af;font-size:13px;margin:0;">— Sarah M., VacationPro subscriber</p>
    </div>

    ${ctaButton('Explore Destinations', `${SITE_URL}/blog`)}
  `);
}

// ─── Email 4: Final CTA + Timeshare Intro (Day 14) ─────────────
export function getEmail4Html(firstName?: string): string {
  const greeting = firstName ? `${firstName}, one` : 'One';

  return emailWrapper(`
    <h2 style="color:#111827;font-size:22px;margin:0 0 8px;font-weight:700;">${greeting} more thing before we settle in 👋</h2>
    <p style="color:#4b5563;font-size:16px;line-height:1.6;margin:0 0 16px;">
      You've been a subscriber for two weeks now — thanks for sticking with us! We wanted to share a few things to make sure you're getting the most out of VacationPro.
    </p>

    <h3 style="color:#111827;font-size:18px;margin:24px 0 12px;font-weight:700;">🧭 Let's plan your next trip together</h3>
    <p style="color:#4b5563;font-size:15px;line-height:1.6;margin:0 0 16px;">
      Tell us where you want to go and what matters most to you, and we'll put together a personalized vacation plan built around your budget and travel style. No pressure, just a plan.
    </p>

    <h3 style="color:#111827;font-size:18px;margin:24px 0 12px;font-weight:700;">💡 Did you know?</h3>
    <p style="color:#4b5563;font-size:15px;line-height:1.6;margin:0 0 16px;">
      We also feature <strong>timeshare preview packages</strong> — resort stays starting from $199/person where you attend a short presentation and enjoy the resort at a massive discount. No obligation to buy, ever.
    </p>
    <p style="color:#4b5563;font-size:15px;line-height:1.6;margin:0 0 16px;">
      Thousands of savvy travelers use these packages every year to vacation for a fraction of the normal price. We always disclose terms upfront so you know exactly what to expect.
    </p>

    ${ctaButton('Plan With Me', `${SITE_URL}/concierge-planning`)}

    <div style="background-color:#f9fafb;border-radius:12px;padding:20px;margin:24px 0;">
      <h4 style="color:#111827;font-size:15px;margin:0 0 8px;font-weight:700;">Quick links:</h4>
      <p style="margin:4px 0;font-size:14px;">🌴 <a href="${SITE_URL}/blog" style="color:${BRAND[600]};text-decoration:none;">All-Inclusive Guides</a></p>
      <p style="margin:4px 0;font-size:14px;">✈️ <a href="${SITE_URL}/blog" style="color:${BRAND[600]};text-decoration:none;">Flight + Hotel Bundles</a></p>
      <p style="margin:4px 0;font-size:14px;">🚢 <a href="${SITE_URL}/blog" style="color:${BRAND[600]};text-decoration:none;">Cruise Guides</a></p>
      <p style="margin:4px 0;font-size:14px;">📖 <a href="${SITE_URL}/blog" style="color:${BRAND[600]};text-decoration:none;">Travel Guides & Tips</a></p>
    </div>

    <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:16px 0 0;text-align:center;">
      From here on out, you'll get our regular deal alerts — 1 to 2 emails per week with the best vacation packages we find. Happy travels! 🌊
    </p>
  `);
}

// ─── Send a specific sequence email ─────────────────────────────
export async function sendSequenceEmail(
  emailNumber: 2 | 3 | 4,
  to: string,
  firstName: string | undefined
) {
  const subjects: Record<number, string> = {
    2: '📖 New travel guides you will want to read',
    3: '✈️ Where should your next vacation be?',
    4: '👋 A quick note + let\'s plan your trip',
  };

  const htmlGenerators: Record<number, () => string> = {
    2: () => getEmail2Html(firstName),
    3: () => getEmail3Html(firstName),
    4: () => getEmail4Html(firstName),
  };

  const msg = {
    to,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: subjects[emailNumber],
    html: htmlGenerators[emailNumber](),
  };

  await sgMail.send(msg);
}
