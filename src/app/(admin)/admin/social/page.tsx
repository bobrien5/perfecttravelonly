'use client';

import { useEffect, useState } from 'react';
import StatCard from '@/components/admin/StatCard';
import GrowthChart from '@/components/admin/charts/GrowthChart';

interface PlatformData {
  platform: string;
  name: string;
  followers: number;
  reach: number;
  engagement: number;
  videoViews: number;
  engagementRate: number;
  reachRate: number;
  linkClicks: number;
  clickThroughRate: number;
  postsThisMonth: number;
  postsScheduled: number;
  statsSource: 'api' | 'media-kit';
  dailyFollowers: Record<string, number>;
  dailyReach: Record<string, number>;
  dailyEngagement: Record<string, number>;
  recentPosts: Array<{ text: string; link: string | null; date: string; type: string }>;
  upcomingPosts: Array<{ text: string; date: string; type: string }>;
}

interface SocialData {
  platforms: PlatformData[];
  totals: {
    followers: number;
    reach: number;
    engagement: number;
    videoViews: number;
    linkClicks: number;
    postsThisMonth: number;
    postsScheduled: number;
  };
}

const PLATFORM_COLORS: Record<string, string> = {
  facebook: '#1877F2',
  instagram: '#E4405F',
  tiktok: '#000000',
};

const PLATFORM_LABELS: Record<string, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
};

function toChartData(daily: Record<string, number>) {
  return Object.entries(daily)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({
      date,
      value: Number(value) || 0,
      label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }));
}

function formatPct(n: number) {
  if (!n) return '—';
  return `${n.toFixed(1)}%`;
}

function PlatformSection({ data }: { data: PlatformData }) {
  const hasAnalytics = data.followers > 0 || data.reach > 0 || data.engagement > 0;
  const color = PLATFORM_COLORS[data.platform] || '#6b7280';
  const label = PLATFORM_LABELS[data.platform] || data.platform;
  const showClicks = data.platform !== 'tiktok';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900">{label}</h3>
          {data.statsSource === 'media-kit' && (
            <span className="text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded" title="Stats from media kit (Q2 2026). Publer API doesn't expose analytics values.">
              Q2 2026 baseline
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {data.postsThisMonth} posted
          </span>
          {data.postsScheduled > 0 && (
            <span className="text-xs font-medium text-brand-700 bg-brand-50 px-2 py-1 rounded">
              {data.postsScheduled} scheduled
            </span>
          )}
        </div>
      </div>

      {/* Primary metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
        <StatCard
          label="Followers"
          value={data.followers > 0 ? data.followers.toLocaleString() : '—'}
        />
        <StatCard
          label="Reach"
          value={data.reach > 0 ? data.reach.toLocaleString() : '—'}
        />
        <StatCard
          label="Engagements"
          value={data.engagement > 0 ? data.engagement.toLocaleString() : '—'}
        />
        <StatCard
          label="Video Views"
          value={data.videoViews > 0 ? data.videoViews.toLocaleString() : '—'}
        />
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatCard
          label="Engagement Rate"
          value={formatPct(data.engagementRate)}
        />
        <StatCard
          label="Reach Rate"
          value={formatPct(data.reachRate)}
        />
        {showClicks ? (
          <>
            <StatCard
              label="Link Clicks"
              value={data.linkClicks > 0 ? data.linkClicks.toLocaleString() : '—'}
            />
            <StatCard
              label="CTR"
              value={formatPct(data.clickThroughRate)}
            />
          </>
        ) : (
          <>
            <StatCard label="Link Clicks" value="N/A" />
            <StatCard label="CTR" value="N/A" />
          </>
        )}
      </div>

      {hasAnalytics ? (
        <GrowthChart
          data={toChartData(data.dailyFollowers)}
          color={color}
          valueLabel="Followers"
          height={200}
        />
      ) : (
        <div className="h-[200px] flex items-center justify-center bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-400">Analytics data collecting — check back in 24-48 hours</p>
        </div>
      )}

      {/* Posts: recent + upcoming side by side */}
      <div className="mt-4 pt-4 border-t border-gray-100 grid md:grid-cols-2 gap-6">
        {data.recentPosts.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Recent Posts</h4>
            <div className="space-y-2">
              {data.recentPosts.map((post, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <span className="text-gray-400 text-xs whitespace-nowrap mt-0.5">
                    {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-gray-700 flex-1 line-clamp-1">{post.text}</span>
                  {post.link && (
                    <a href={post.link} target="_blank" rel="noopener noreferrer" className="text-brand-600 text-xs whitespace-nowrap hover:underline">
                      View
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {data.upcomingPosts.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Upcoming Posts</h4>
            <div className="space-y-2">
              {data.upcomingPosts.map((post, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <span className="text-gray-400 text-xs whitespace-nowrap mt-0.5">
                    {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </span>
                  <span className="text-gray-700 flex-1 line-clamp-1">{post.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SocialPage() {
  const [data, setData] = useState<SocialData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/admin/social?period=last_30_days');
        const d = res.ok ? await res.json() : null;
        if (!cancelled) {
          setData(d);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setData(null);
          setLoading(false);
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Social Media</h1>
        <p className="text-sm text-gray-500 mt-1">VacationPro social performance via Publer (last 30 days)</p>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="h-3 bg-gray-200 rounded w-20 mb-3" />
              <div className="h-8 bg-gray-200 rounded w-16" />
            </div>
          ))
        ) : (
          <>
            <StatCard label="Total Followers" value={data?.totals?.followers ? data.totals.followers.toLocaleString() : '—'} />
            <StatCard label="Total Reach" value={data?.totals?.reach ? data.totals.reach.toLocaleString() : '—'} />
            <StatCard label="Engagements" value={data?.totals?.engagement ? data.totals.engagement.toLocaleString() : '—'} />
            <StatCard label="Video Views" value={data?.totals?.videoViews ? data.totals.videoViews.toLocaleString() : '—'} />
            <StatCard label="Link Clicks" value={data?.totals?.linkClicks ? data.totals.linkClicks.toLocaleString() : '—'} />
            <StatCard label="Posted / Scheduled" value={`${data?.totals?.postsThisMonth || 0} / ${data?.totals?.postsScheduled || 0}`} />
          </>
        )}
      </div>

      {/* Platform Sections */}
      {loading ? (
        <div className="animate-pulse space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 h-80" />
          ))}
        </div>
      ) : (
        data?.platforms?.map((p) => (
          <PlatformSection key={p.platform} data={p} />
        ))
      )}
    </div>
  );
}
