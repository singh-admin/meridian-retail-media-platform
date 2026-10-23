import { Campaign, Creative, Screen, Outlet, DecisionAudit } from '../models/types.js';

export class PlatformAdapter {
  static exportDecisionsCsv(decisions: DecisionAudit[]): string {
    const headers = [
      'decision_id',
      'timestamp',
      'screen_id',
      'zone_id',
      'winning_campaign',
      'winning_reason',
      'crowd_pax',
      'crowd_dwell_min',
      'international_share',
      'holiday_share',
      'family_share',
      'business_share',
      'anti_hallucination_verified'
    ];

    const rows = decisions.map(d => [
      d.decisionId,
      d.timestamp,
      d.screenId,
      d.zoneId,
      `"${d.winningCampaignId.replace(/"/g, '""')}"`,
      `"${d.winningReason.replace(/"/g, '""')}"`,
      d.crowdProfileSummary.paxCount,
      d.crowdProfileSummary.medianDwell,
      (d.crowdProfileSummary.internationalShare * 100).toFixed(1) + '%',
      (d.crowdProfileSummary.holidayShare * 100).toFixed(1) + '%',
      (d.crowdProfileSummary.familyShare * 100).toFixed(1) + '%',
      (d.crowdProfileSummary.businessShare * 100).toFixed(1) + '%',
      d.antiHallucinationVerified
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  static exportAdvertiserReportJson(campaign: Campaign, outlet?: Outlet, decisions: DecisionAudit[] = []): Record<string, any> {
    const relevantDecisions = decisions.filter(d => d.winningCampaignId === campaign.campaignId);
    return {
      campaignId: campaign.campaignId,
      campaignName: campaign.name,
      outletName: outlet?.name || 'Retail Outlet',
      status: campaign.status,
      metrics: {
        budgetTotal: campaign.budget.totalBudget,
        budgetSpent: campaign.budget.spentBudget,
        impressions: campaign.historicalStats?.impressions || 0,
        scans: campaign.historicalStats?.scans || 0,
        redemptions: campaign.historicalStats?.redemptions || 0,
        conversionRate: campaign.historicalStats?.impressions
          ? (((campaign.historicalStats?.redemptions || 0) / campaign.historicalStats.impressions) * 100).toFixed(2) + '%'
          : '0%',
        roi: campaign.historicalStats?.roi || 0
      },
      segmentPerformance: campaign.historicalStats?.segmentPerformance || {},
      decisionsSample: relevantDecisions.slice(0, 10).map(d => ({
        screenId: d.screenId,
        timestamp: d.timestamp,
        winningReason: d.winningReason
      })),
      generatedAt: new Date().toISOString()
    };
  }
}
