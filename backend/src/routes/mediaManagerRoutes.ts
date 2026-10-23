import { Router, Request, Response } from 'express';
import { DataStore } from '../db/store.js';
import { PlatformAdapter } from '../adapters/platformAdapter.js';

export const mediaManagerRouter = Router();
const store = DataStore.getInstance();

// 1. Inventory Calendar (screen x hour slots)
mediaManagerRouter.get('/calendar', (_req: Request, res: Response) => {
  const screens = store.getScreens().slice(0, 15);
  const hours = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
  ];

  const grid = screens.map(screen => {
    const isPremiumZone = screen.zoneId.includes('DUTYFREE') || screen.nearestGates.includes('42');
    return {
      screenId: screen.screenId,
      screenName: screen.name,
      terminal: screen.terminal,
      zoneId: screen.zoneId,
      slots: hours.map(hour => {
        const hourNum = parseInt(hour.split(':')[0], 10);
        const isPeak = hourNum >= 13 && hourNum <= 16;
        const status = isPeak
          ? (isPremiumZone ? 'PREMIUM' : 'BOOKED')
          : (hourNum % 2 === 0 ? 'BOOKED' : 'AVAILABLE');
        const priceEur = status === 'PREMIUM' ? 120 : (status === 'BOOKED' ? 75 : 45);
        return {
          hour,
          status,
          priceEur,
          currentCampaign: status !== 'AVAILABLE' ? 'CAMP-DUTYFREE-PERFUME' : null
        };
      })
    };
  });

  res.json({ hours, grid });
});

// 2. Yield & Dynamic Pricing Forecast
mediaManagerRouter.get('/yield', (_req: Request, res: Response) => {
  const screens = store.getScreens();
  const totalScreens = screens.length;

  res.json({
    occupancyPercent: 78.4,
    revenueForecast7DaysEur: 184500,
    averageYieldPerSlotEur: 68.50,
    suggestedPricing: [
      { tier: 'T2 International Concourse C / Gate 42 Pier', suggestedPriceEur: 135, baseline: 80, demandIndex: 1.68 },
      { tier: 'T2 Grand Duty-Free Central Walkway', suggestedPriceEur: 150, baseline: 90, demandIndex: 1.66 },
      { tier: 'T1 Domestic Central Promenade', suggestedPriceEur: 65, baseline: 50, demandIndex: 1.30 },
      { tier: 'Baggage Claim Digital Totems', suggestedPriceEur: 40, baseline: 35, demandIndex: 1.14 }
    ],
    next7DaysForecast: [
      { day: 'Mon', occupancy: 72, revenueEur: 23400 },
      { day: 'Tue', occupancy: 75, revenueEur: 24800 },
      { day: 'Wed', occupancy: 76, revenueEur: 25100 },
      { day: 'Thu', occupancy: 82, revenueEur: 28900 },
      { day: 'Fri', occupancy: 89, revenueEur: 32400 },
      { day: 'Sat', occupancy: 84, revenueEur: 27900 },
      { day: 'Sun', occupancy: 86, revenueEur: 29500 }
    ]
  });
});

// 3. Approval Queue with Brand Safety Checklist
mediaManagerRouter.get('/approvals', (_req: Request, res: Response) => {
  const campaigns = store.getCampaigns();
  const pending = campaigns.filter(c => c.status === 'PENDING_APPROVAL' || c.creatives.some(cr => cr.status === 'PENDING_REVIEW'));

  const items = (pending.length > 0 ? pending : campaigns.slice(0, 3)).map(c => ({
    campaignId: c.campaignId,
    name: c.name,
    advertiserId: c.advertiserId,
    creative: c.creatives[0],
    brandSafetyChecklist: {
      appropriateContent: true,
      textContrastCompliant: true,
      noCompetitorInfringement: true,
      disclaimerPresent: true
    },
    status: c.status
  }));

  res.json(items);
});

mediaManagerRouter.post('/approvals/:id', (req: Request, res: Response) => {
  const { action } = req.body; // 'APPROVE' | 'REJECT'
  const id = String(req.params.id);
  const campaign = store.getCampaignById(id);
  if (!campaign) {
    return res.status(404).json({ error: 'Campaign not found' });
  }

  campaign.status = action === 'APPROVE' ? 'ACTIVE' : 'PAUSED';
  if (campaign.creatives[0]) {
    campaign.creatives[0].status = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
  }
  store.saveCampaign(campaign);

  res.json({ success: true, campaign });
});

// 4. Advertisers Overview
mediaManagerRouter.get('/advertisers', (_req: Request, res: Response) => {
  const advertisers = store.getAdvertisers();
  const campaigns = store.getCampaigns();

  const overview = advertisers.map(adv => {
    const advCampaigns = campaigns.filter(c => c.advertiserId === adv.advertiserId);
    const underDelivering = advCampaigns.some(c => (c.historicalStats?.impressions || 0) < 5000 && c.status === 'ACTIVE');
    return {
      ...adv,
      campaignsRunning: advCampaigns.filter(c => c.status === 'ACTIVE').length,
      underDeliveringFlag: underDelivering
    };
  });

  res.json(overview);
});

// 5. Segment Heatmap (segment x hour x zone)
mediaManagerRouter.get('/heatmap', (_req: Request, res: Response) => {
  const segments = ['Holiday', 'Family', 'Business', 'Luxury', 'Domestic', 'International'];
  const hours = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
  const zones = ['T2 Gate 42 Pier', 'T2 Duty-Free', 'T1 Concourse A', 'T1 Retail Promenade'];

  const heatmapData = zones.map(zone => ({
    zone,
    rows: segments.map(segment => ({
      segment,
      values: hours.map(hour => {
        const isPeak = hour === '14:00' || hour === '16:00';
        let val = Math.floor(Math.random() * 40) + 30;
        if (segment === 'Holiday' && zone.includes('Gate 42') && isPeak) val = 88;
        if (segment === 'Family' && isPeak) val = 68;
        if (segment === 'Business' && hour === '08:00') val = 85;
        return { hour, intensity: val };
      })
    }))
  }));

  res.json({ hours, segments, zones, heatmapData });
});

// 6. Conflict View: Explains why Campaign A beat Campaign B
mediaManagerRouter.get('/conflict', (req: Request, res: Response) => {
  const screenId = String(req.query.screenId || 'SC-T2-042');
  const decisions = store.getDecisions(10);
  const decision = decisions.find(d => d.screenId === screenId) || decisions[0];

  if (!decision || decision.candidateRankings.length < 2) {
    return res.json({
      screenId,
      winner: { name: 'Duty-free perfume, 15% off', score: 0.86, reason: 'High holiday match + delay trigger' },
      runnerUp: { name: 'Toy store, buy 2 get 1', score: 0.52, reason: 'Lower match to adult-heavy crowd' },
      explanation: 'Campaign A scored 0.86 vs Campaign B 0.52 due to higher audience match (71% vs 49%) and a 1.5x delay trigger boost active on the international flight.'
    });
  }

  const winner = decision.candidateRankings[0];
  const runnerUp = decision.candidateRankings[1];

  res.json({
    screenId,
    decisionId: decision.decisionId,
    timestamp: decision.timestamp,
    winner,
    runnerUp,
    differenceScore: Number((winner.finalScore - runnerUp.finalScore).toFixed(2)),
    explanation: `Campaign "${winner.campaignName}" beat "${runnerUp.campaignName}" by ${(winner.finalScore - runnerUp.finalScore).toFixed(2)} pts. Factors: Audience Match (${Math.round(winner.audienceMatchScore * 100)}% vs ${Math.round(runnerUp.audienceMatchScore * 100)}%), Boost Multiplier (${winner.boostMultiplier}x vs ${runnerUp.boostMultiplier}x).`
  });
});

// 7. Manual Pin or Override Slot
mediaManagerRouter.post('/override', (req: Request, res: Response) => {
  const { screenId, campaignId, reason } = req.body;
  if (!screenId || !campaignId) {
    return res.status(400).json({ error: 'screenId and campaignId required' });
  }

  const campaign = store.getCampaignById(campaignId);
  const creative = campaign?.creatives[0];

  store.updateScreen(screenId, {
    currentCampaignId: campaignId,
    currentCreativeId: creative?.creativeId || null
  });

  store.addIncident({
    incidentId: `INC-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'SAFETY_FLAG',
    severity: 'LOW',
    targetEntityId: screenId,
    targetEntityType: 'SCREEN',
    title: `Manual Screen Override Applied on ${screenId}`,
    description: `Media Manager manually pinned campaign "${campaign?.name}". Reason: ${reason || 'VIP Commercial Agreement'}`,
    owner: 'Ad Sales Ops',
    status: 'RESOLVED'
  });

  res.json({ success: true, message: `Screen ${screenId} overridden successfully.` });
});

// 8. Package Builder
mediaManagerRouter.post('/packages', (req: Request, res: Response) => {
  const { packageName, targetScreens, bundlePriceEur, discountPercent } = req.body;
  res.status(201).json({
    packageId: `PKG-${Date.now()}`,
    packageName: packageName || 'International Departures Premium Pack',
    targetScreens: targetScreens || ['SC-T2-042', 'SC-T2-043', 'SC-T2-010'],
    bundlePriceEur: bundlePriceEur || 2500,
    discountPercent: discountPercent || 15,
    status: 'ACTIVE'
  });
});

// 9. One-Click Advertiser Report
mediaManagerRouter.get('/report/:campaignId', (req: Request, res: Response) => {
  const campaignId = String(req.params.campaignId);
  const campaign = store.getCampaignById(campaignId) || store.getCampaigns()[0];
  const outlet = store.getOutletById(campaign.outletId);
  const decisions = store.getDecisions(100);

  const report = PlatformAdapter.exportAdvertiserReportJson(campaign, outlet, decisions);
  res.json(report);
});
