const API_BASE = 'https://api.beehiiv.com/v2';

function getConfig() {
  const apiKey = process.env.BEEHIIV_API_KEY;
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID;
  if (!apiKey || !publicationId) {
    throw new Error('Missing BEEHIIV_API_KEY or BEEHIIV_PUBLICATION_ID');
  }
  return { apiKey, publicationId };
}

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

interface BeehiivPost {
  id: string;
  status: string;
  publish_date: number | null;
  stats?: {
    email?: {
      recipients?: number;
      delivered?: number;
      opens?: number;
      unique_opens?: number;
      clicks?: number;
      unique_clicks?: number;
      unsubscribes?: number;
      spam_reports?: number;
    };
  };
}

interface SubscriptionsPage {
  data: Array<{ status: string }>;
  total_results: number;
}

async function fetchPosts(start: string, end: string): Promise<BeehiivPost[]> {
  const { apiKey, publicationId } = getConfig();
  const startTs = Math.floor(new Date(start).getTime() / 1000);
  const endTs = Math.floor(new Date(end + 'T23:59:59Z').getTime() / 1000);

  const posts: BeehiivPost[] = [];
  let page = 1;
  const limit = 50;

  while (true) {
    const url = new URL(`${API_BASE}/publications/${publicationId}/posts`);
    url.searchParams.set('expand[]', 'stats');
    url.searchParams.set('status', 'confirmed');
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('page', String(page));

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) {
      throw new Error(`Beehiiv posts fetch failed (${res.status})`);
    }
    const json = (await res.json()) as { data: BeehiivPost[]; total_results: number };
    posts.push(...json.data);
    if (json.data.length < limit) break;
    page += 1;
  }

  return posts.filter(
    (p) =>
      p.publish_date !== null &&
      p.publish_date >= startTs &&
      p.publish_date <= endTs
  );
}

export async function getGlobalStats(
  startDate: string,
  endDate: string
): Promise<EmailStats[]> {
  const posts = await fetchPosts(startDate, endDate);

  const byDate = new Map<string, EmailStats>();
  for (const p of posts) {
    if (!p.publish_date) continue;
    const day = new Date(p.publish_date * 1000).toISOString().split('T')[0];
    const s = p.stats?.email ?? {};
    const existing = byDate.get(day) ?? {
      date: day,
      requests: 0,
      delivered: 0,
      opens: 0,
      uniqueOpens: 0,
      clicks: 0,
      uniqueClicks: 0,
      bounces: 0,
      unsubscribes: 0,
      spamReports: 0,
    };
    existing.requests += s.recipients ?? 0;
    existing.delivered += s.delivered ?? 0;
    existing.opens += s.opens ?? 0;
    existing.uniqueOpens += s.unique_opens ?? 0;
    existing.clicks += s.clicks ?? 0;
    existing.uniqueClicks += s.unique_clicks ?? 0;
    existing.unsubscribes += s.unsubscribes ?? 0;
    existing.spamReports += s.spam_reports ?? 0;
    byDate.set(day, existing);
  }

  return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export async function getContactCount(): Promise<ContactCount> {
  const { apiKey, publicationId } = getConfig();
  const url = new URL(`${API_BASE}/publications/${publicationId}/subscriptions`);
  url.searchParams.set('limit', '1');
  url.searchParams.set('status', 'active');

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) {
    throw new Error(`Beehiiv subscriptions count failed (${res.status})`);
  }
  const json = (await res.json()) as SubscriptionsPage;
  const count = json.total_results ?? 0;
  return { contactCount: count, billableCount: count };
}
