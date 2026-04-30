import { supabase } from '@/lib/supabase/client';
import ghl from '@/lib/ghl/client';
import { getGlobalStats, getContactCount } from '@/lib/sendgrid/stats';

export async function getRevenueData(start: string, end: string) {
  try {
    let query = supabase
      .from('revenue_entries')
      .select('*')
      .order('date', { ascending: false });

    if (start) query = query.gte('date', start);
    if (end) query = query.lte('date', end);

    const { data, error } = await query;
    if (error) return null;

    const bySource: Record<string, number> = {};
    for (const entry of data || []) {
      bySource[entry.source] = (bySource[entry.source] || 0) + Number(entry.amount);
    }

    let attendanceQuery = supabase
      .from('webinar_attendance')
      .select('*', { count: 'exact' })
      .eq('billable', true);

    if (start) attendanceQuery = attendanceQuery.gte('attended_at', start);
    if (end) attendanceQuery = attendanceQuery.lte('attended_at', end);

    const { count: webinarCount } = await attendanceQuery;
    const tristarRevenue = (webinarCount || 0) * 250;
    const total = Object.values(bySource).reduce((s, v) => s + v, 0) + tristarRevenue;

    return { entries: data || [], bySource, tristarRevenue, webinarCount: webinarCount || 0, total };
  } catch {
    return null;
  }
}

export async function getLeadsSummary() {
  try {
    const { pipelines } = await ghl.pipelines.getAll();

    const pipelineData = await Promise.all(
      pipelines.map(async (pipeline) => {
        const stageData = await Promise.all(
          pipeline.stages
            .sort((a, b) => a.position - b.position)
            .map(async (stage) => {
              const result = await ghl.opportunities.search({
                pipelineId: pipeline.id,
                pipelineStageId: stage.id,
                limit: 1,
              });
              return {
                id: stage.id,
                name: stage.name,
                position: stage.position,
                count: result.meta.total,
              };
            })
        );

        return {
          id: pipeline.id,
          name: pipeline.name,
          stages: stageData,
          totalLeads: stageData.reduce((sum, s) => sum + s.count, 0),
        };
      })
    );

    const { opportunities: recentOpps } = await ghl.opportunities.search({ limit: 20 });

    const { count: webinarCount } = await supabase
      .from('webinar_attendance')
      .select('*', { count: 'exact' })
      .eq('billable', true);

    return {
      pipelines: pipelineData,
      recentOpportunities: recentOpps,
      webinarAttendance: webinarCount || 0,
      tristarRevenue: (webinarCount || 0) * 250,
    };
  } catch {
    return null;
  }
}

export async function getEmailSummary(start?: string, end?: string) {
  try {
    const s = start || (() => { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString().split('T')[0]; })();
    const e = end || new Date().toISOString().split('T')[0];

    const [stats, contactInfo] = await Promise.all([
      getGlobalStats(s, e),
      getContactCount(),
    ]);

    const totals = stats.reduce(
      (acc, day) => ({
        delivered: acc.delivered + day.delivered,
        opens: acc.opens + day.opens,
        uniqueOpens: acc.uniqueOpens + day.uniqueOpens,
        clicks: acc.clicks + day.clicks,
        uniqueClicks: acc.uniqueClicks + day.uniqueClicks,
        bounces: acc.bounces + day.bounces,
        unsubscribes: acc.unsubscribes + day.unsubscribes,
        spamReports: acc.spamReports + day.spamReports,
      }),
      { delivered: 0, opens: 0, uniqueOpens: 0, clicks: 0, uniqueClicks: 0, bounces: 0, unsubscribes: 0, spamReports: 0 }
    );

    const openRate = totals.delivered > 0 ? ((totals.uniqueOpens / totals.delivered) * 100).toFixed(1) : '0';
    const clickRate = totals.delivered > 0 ? ((totals.uniqueClicks / totals.delivered) * 100).toFixed(1) : '0';
    const bounceRate = totals.delivered > 0 ? ((totals.bounces / (totals.delivered + totals.bounces)) * 100).toFixed(1) : '0';

    return {
      subscribers: contactInfo.contactCount,
      billableContacts: contactInfo.billableCount,
      stats,
      totals,
      rates: { openRate: Number(openRate), clickRate: Number(clickRate), bounceRate: Number(bounceRate) },
    };
  } catch {
    return null;
  }
}
