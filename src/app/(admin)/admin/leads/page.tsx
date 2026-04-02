import StatCard from '@/components/admin/StatCard';
import FunnelChart from '@/components/admin/charts/FunnelChart';
import RefreshButton from '@/components/admin/RefreshButton';
import { getBaseUrl } from '@/lib/utils';

interface StageData {
  id: string;
  name: string;
  position: number;
  count: number;
}

interface PipelineData {
  id: string;
  name: string;
  stages: StageData[];
  totalLeads: number;
}

interface Opportunity {
  id: string;
  name: string;
  status: string;
  source?: string;
  dateAdded?: string;
  pipelineStageId: string;
}

async function getLeadsData() {
  const baseUrl = getBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/admin/leads`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function LeadsPage() {
  const data = await getLeadsData();

  if (!data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Lead Tracking</h1>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">Unable to load lead data. Check your GoHighLevel connection.</p>
        </div>
      </div>
    );
  }

  const totalLeads = data.pipelines?.reduce(
    (s: number, p: PipelineData) => s + p.totalLeads,
    0
  ) || 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lead Tracking</h1>
          <p className="text-sm text-gray-500 mt-1">GoHighLevel pipeline overview</p>
        </div>
        <RefreshButton />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Leads" value={totalLeads} />
        <StatCard
          label="Webinars Attended"
          value={data.webinarAttendance}
        />
        <StatCard
          label="WOW Revenue"
          value={`$${(data.wowRevenue || 0).toLocaleString()}`}
          subtitle={`${data.webinarAttendance} @ $250`}
        />
        <StatCard
          label="Pipelines"
          value={data.pipelines?.length || 0}
        />
      </div>

      {/* Pipeline Funnels */}
      {data.pipelines?.map((pipeline: PipelineData) => (
        <div key={pipeline.id} className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">{pipeline.name}</h3>
            <span className="text-xs text-gray-500">{pipeline.totalLeads} total leads</span>
          </div>
          <FunnelChart stages={pipeline.stages} />

          {/* Conversion Rates */}
          {pipeline.stages.length > 1 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {pipeline.stages.slice(0, -1).map((stage, i) => {
                const next = pipeline.stages[i + 1];
                const rate =
                  stage.count > 0
                    ? ((next.count / stage.count) * 100).toFixed(1)
                    : '0';
                return (
                  <span
                    key={stage.id}
                    className="text-xs bg-gray-50 px-2.5 py-1 rounded-full text-gray-600"
                  >
                    {stage.name} → {next.name}: <strong>{rate}%</strong>
                  </span>
                );
              })}
            </div>
          )}
        </div>
      ))}

      {/* Recent Leads Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">Recent Opportunities</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-5 py-3 font-medium text-gray-500">Name</th>
                <th className="px-5 py-3 font-medium text-gray-500">Status</th>
                <th className="px-5 py-3 font-medium text-gray-500">Source</th>
                <th className="px-5 py-3 font-medium text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.recentOpportunities?.map((opp: Opportunity) => (
                <tr key={opp.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900">{opp.name}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        opp.status === 'won'
                          ? 'bg-green-50 text-green-700'
                          : opp.status === 'lost'
                          ? 'bg-red-50 text-red-700'
                          : opp.status === 'abandoned'
                          ? 'bg-gray-100 text-gray-600'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {opp.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{opp.source || '—'}</td>
                  <td className="px-5 py-3 text-gray-500">
                    {opp.dateAdded
                      ? new Date(opp.dateAdded).toLocaleDateString()
                      : '—'}
                  </td>
                </tr>
              ))}
              {(!data.recentOpportunities || data.recentOpportunities.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-gray-400">
                    No opportunities found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
