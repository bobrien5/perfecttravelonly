import { NextRequest, NextResponse } from 'next/server';

const PUBLER_API_KEY = process.env.PUBLER_API_KEY || '83e6aabe43980542da0b4e6a674864a84251afff2e5c819e';
const PUBLER_WORKSPACE_ID = process.env.PUBLER_WORKSPACE_ID || '69d514eb73f1e0c9d3f0bc3f';
const PUBLER_BASE = 'https://app.publer.com/api/v1';

// Manual stats from media kit (Q2 2026). Publer API doesn't expose these values.
// Update these numbers periodically from platform dashboards.
const MEDIA_KIT_STATS: Record<string, {
  followers: number;
  reach90d: number;
  engagement90d: number;
  videoViews90d: number;
  engagementRate: number;
  reachRate: number;
}> = {
  facebook: {
    followers: 29560,
    reach90d: 5800000,
    engagement90d: 233200,
    videoViews90d: 20400000,
    engagementRate: 4.0,
    reachRate: 196.2,
  },
  instagram: {
    followers: 38537,
    reach90d: 4800000,
    engagement90d: 760500,
    videoViews90d: 12200000,
    engagementRate: 15.8,
    reachRate: 124.6,
  },
  tiktok: {
    followers: 289114,
    reach90d: 364000,
    engagement90d: 4623,
    videoViews90d: 364000,
    engagementRate: 1.27,
    reachRate: 0.13,
  },
};

const ACCOUNTS = [
  { id: '69d515055b79afafe075ad33', platform: 'facebook', name: 'VacationPro' },
  { id: '69d5152727413b865c1c7f28', platform: 'instagram', name: 'VacationPro' },
  { id: '69d51540efe8d34c58a7f3c1', platform: 'tiktok', name: 'VacationPro' },
];

function publerHeaders() {
  return {
    'Authorization': `Bearer-API ${PUBLER_API_KEY}`,
    'Publer-Workspace-Id': PUBLER_WORKSPACE_ID,
    'Content-Type': 'application/json',
  };
}

async function publerFetch(path: string) {
  const res = await fetch(`${PUBLER_BASE}${path}`, {
    headers: publerHeaders(),
    cache: 'no-store',
  });
  if (!res.ok) return null;
  return res.json();
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const period = searchParams.get('period') || 'last_30_days';

  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const today = now.toISOString().split('T')[0];
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    const results = await Promise.all(
      ACCOUNTS.map(async (account) => {
        const [
          followers,
          reach,
          engagement,
          videoViews,
          engagementRate,
          reachRate,
          linkClicks,
          clickThroughRate,
          posts,
          scheduled,
        ] = await Promise.all([
          publerFetch(`/analytics/chart_data?account_id=${account.id}&period=${period}&id=followers`),
          publerFetch(`/analytics/chart_data?account_id=${account.id}&period=${period}&id=post_reach`),
          publerFetch(`/analytics/chart_data?account_id=${account.id}&period=${period}&id=post_engagement`),
          publerFetch(`/analytics/chart_data?account_id=${account.id}&period=${period}&id=video_views`),
          publerFetch(`/analytics/chart_data?account_id=${account.id}&period=${period}&id=engagement_rate`),
          publerFetch(`/analytics/chart_data?account_id=${account.id}&period=${period}&id=reach_rate`),
          publerFetch(`/analytics/chart_data?account_id=${account.id}&period=${period}&id=link_clicks`),
          publerFetch(`/analytics/chart_data?account_id=${account.id}&period=${period}&id=click_through_rate`),
          publerFetch(`/posts?account_id=${account.id}&state=published&from=${monthStart}&to=${today}`),
          publerFetch(`/posts?account_id=${account.id}&state=scheduled&from=${today}&to=${nextMonth}`),
        ]);

        const sumValues = (data: Record<string, number> | null) => {
          if (!data || typeof data !== 'object') return 0;
          return Object.values(data).reduce((sum, v) => sum + (Number(v) || 0), 0);
        };

        const avgValues = (data: Record<string, number> | null) => {
          if (!data || typeof data !== 'object') return 0;
          const values = Object.values(data).map((v) => Number(v) || 0).filter((v) => v > 0);
          if (values.length === 0) return 0;
          return values.reduce((sum, v) => sum + v, 0) / values.length;
        };

        const lastValue = (data: Record<string, number> | null) => {
          if (!data || typeof data !== 'object') return 0;
          const entries = Object.entries(data).sort(([a], [b]) => a.localeCompare(b));
          return entries.length > 0 ? Number(entries[entries.length - 1][1]) || 0 : 0;
        };

        const postList = Array.isArray(posts) ? posts : posts?.posts || [];
        const scheduledList = Array.isArray(scheduled) ? scheduled : scheduled?.posts || [];

        // Publer API returns empty for analytics values, so fall back to media kit stats
        const kit = MEDIA_KIT_STATS[account.platform] || {
          followers: 0, reach90d: 0, engagement90d: 0, videoViews90d: 0,
          engagementRate: 0, reachRate: 0,
        };
        const apiFollowers = lastValue(followers?.current);
        const apiReach = sumValues(reach?.current);
        const apiEngagement = sumValues(engagement?.current);
        const apiVideoViews = sumValues(videoViews?.current);

        return {
          platform: account.platform,
          name: account.name,
          followers: apiFollowers || kit.followers,
          reach: apiReach || kit.reach90d,
          engagement: apiEngagement || kit.engagement90d,
          videoViews: apiVideoViews || kit.videoViews90d,
          engagementRate: avgValues(engagementRate?.current) || kit.engagementRate,
          reachRate: avgValues(reachRate?.current) || kit.reachRate,
          linkClicks: sumValues(linkClicks?.current),
          clickThroughRate: avgValues(clickThroughRate?.current),
          postsThisMonth: postList.length,
          postsScheduled: scheduledList.length,
          dailyFollowers: followers?.current || {},
          dailyReach: reach?.current || {},
          dailyEngagement: engagement?.current || {},
          statsSource: apiFollowers ? 'api' : 'media-kit',
          recentPosts: postList.slice(0, 5).map((p: { text?: string; post_link?: string; scheduled_at?: string; type?: string }) => ({
            text: (p.text || '').slice(0, 100),
            link: p.post_link,
            date: p.scheduled_at,
            type: p.type,
          })),
          upcomingPosts: scheduledList.slice(0, 5).map((p: { text?: string; scheduled_at?: string; type?: string }) => ({
            text: (p.text || '').slice(0, 100),
            date: p.scheduled_at,
            type: p.type,
          })),
        };
      })
    );

    const totals = {
      followers: results.reduce((s, r) => s + r.followers, 0),
      reach: results.reduce((s, r) => s + r.reach, 0),
      engagement: results.reduce((s, r) => s + r.engagement, 0),
      videoViews: results.reduce((s, r) => s + r.videoViews, 0),
      linkClicks: results.reduce((s, r) => s + r.linkClicks, 0),
      postsThisMonth: results.reduce((s, r) => s + r.postsThisMonth, 0),
      postsScheduled: results.reduce((s, r) => s + r.postsScheduled, 0),
    };

    return NextResponse.json({
      platforms: results,
      totals,
      period,
    });
  } catch (err) {
    console.error('Social API error:', err);
    return NextResponse.json({
      platforms: [],
      totals: { followers: 0, reach: 0, engagement: 0, videoViews: 0, linkClicks: 0, postsThisMonth: 0, postsScheduled: 0 },
      period,
    });
  }
}
