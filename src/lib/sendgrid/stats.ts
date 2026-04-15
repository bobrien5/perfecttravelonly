import sgClient from '@sendgrid/client';

sgClient.setApiKey(process.env.SENDGRID_API_KEY || '');

export interface EmailStats {
  date: string;
  requests: number;
  delivered: number;
  opens: number;
  uniqueOpens: number;
  clicks: number;
  uniqueClicks: number;
  bounces: number;
  unsubscribes: number;
  spamReports: number;
}

export interface ContactCount {
  contactCount: number;
  billableCount: number;
}

export async function getGlobalStats(
  startDate: string,
  endDate: string
): Promise<EmailStats[]> {
  const [, body] = await sgClient.request({
    url: '/v3/stats',
    method: 'GET',
    qs: {
      start_date: startDate,
      end_date: endDate,
      aggregated_by: 'day',
    },
  });

  const data = body as Array<{
    date: string;
    stats: Array<{
      metrics: Record<string, number>;
    }>;
  }>;

  return data.map((day) => {
    const m = day.stats[0]?.metrics || {};
    return {
      date: day.date,
      requests: m.requests || 0,
      delivered: m.delivered || 0,
      opens: m.opens || 0,
      uniqueOpens: m.unique_opens || 0,
      clicks: m.clicks || 0,
      uniqueClicks: m.unique_clicks || 0,
      bounces: m.bounces || 0,
      unsubscribes: m.unsubscribes || 0,
      spamReports: m.spam_reports || 0,
    };
  });
}

export async function getContactCount(): Promise<ContactCount> {
  const [, contactBody] = await sgClient.request({
    url: '/v3/marketing/contacts/count',
    method: 'GET',
  });

  const body = contactBody as { contact_count: number; billable_count: number };
  return {
    contactCount: body.contact_count,
    billableCount: body.billable_count,
  };
}
