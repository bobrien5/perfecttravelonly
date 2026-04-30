import { NextResponse } from 'next/server';
import ghl from '@/lib/ghl/client';
import { supabase } from '@/lib/supabase/client';

export const revalidate = 300; // 5-minute cache

export async function GET() {
  try {
    // Get all pipelines with stages
    const { pipelines } = await ghl.pipelines.getAll();

    // Build pipeline data with opportunity counts per stage
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

        const totalLeads = stageData.reduce((sum, s) => sum + s.count, 0);

        return {
          id: pipeline.id,
          name: pipeline.name,
          stages: stageData,
          totalLeads,
        };
      })
    );

    // Get recent opportunities across all pipelines
    const { opportunities: recentOpps } = await ghl.opportunities.search({
      limit: 20,
    });

    // Get webinar attendance from Supabase
    const { count: webinarCount } = await supabase
      .from('webinar_attendance')
      .select('*', { count: 'exact' })
      .eq('billable', true);

    return NextResponse.json({
      pipelines: pipelineData,
      recentOpportunities: recentOpps,
      webinarAttendance: webinarCount || 0,
      tristarRevenue: (webinarCount || 0) * 250,
    });
  } catch (error) {
    console.error('Leads API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}
