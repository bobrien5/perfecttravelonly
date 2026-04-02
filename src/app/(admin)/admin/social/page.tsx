import StatCard from '@/components/admin/StatCard';
import GrowthChart from '@/components/admin/charts/GrowthChart';
import SocialEntryForm from '@/components/admin/SocialEntryForm';

interface SocialStat {
  id: string;
  platform: string;
  date: string;
  followers: number | null;
  impressions: number | null;
  reach: number | null;
  engagement: number | null;
  video_views: number | null;
}

async function getSocialData() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${baseUrl}/api/admin/social?limit=60`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function PlatformSection({
  platform,
  label,
  color,
  stats,
  latest,
}: {
  platform: string;
  label: string;
  color: string;
  stats: SocialStat[];
  latest: SocialStat | null;
}) {
  const platformStats = stats
    .filter((s) => s.platform === platform)
    .sort((a, b) => a.date.localeCompare(b.date));

  const followerData = platformStats
    .filter((s) => s.followers != null)
    .map((s) => ({
      date: s.date,
      value: s.followers!,
      label: new Date(s.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">{label}</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <StatCard
          label="Followers"
          value={latest?.followers?.toLocaleString() || '—'}
        />
        <StatCard
          label="Impressions"
          value={latest?.impressions?.toLocaleString() || '—'}
        />
        <StatCard
          label="Reach"
          value={latest?.reach?.toLocaleString() || '—'}
        />
        <StatCard
          label="Engagement"
          value={latest?.engagement?.toLocaleString() || '—'}
        />
      </div>
      <GrowthChart
        data={followerData}
        color={color}
        valueLabel="Followers"
        height={200}
      />
    </div>
  );
}

export default async function SocialPage() {
  const data = await getSocialData();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Social Media</h1>
        <p className="text-sm text-gray-500 mt-1">
          Facebook & Instagram growth tracking (manual entry)
        </p>
      </div>

      {/* Platform Sections */}
      <PlatformSection
        platform="facebook"
        label="Facebook"
        color="#1877F2"
        stats={data?.stats || []}
        latest={data?.latest?.facebook || null}
      />

      <PlatformSection
        platform="instagram"
        label="Instagram"
        color="#E4405F"
        stats={data?.stats || []}
        latest={data?.latest?.instagram || null}
      />

      {/* Manual Entry Form */}
      <SocialEntryForm />
    </div>
  );
}
