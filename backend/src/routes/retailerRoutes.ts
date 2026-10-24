import { Router, Request, Response } from 'express';
import { DataStore } from '../db/store.js';
import { CrowdProfileEngine } from '../engine/crowdProfile.js';
import { SimulationEngine } from '../engine/simulationEngine.js';
import { Campaign, PromoCode } from '../models/types.js';

export const retailerRouter = Router();
const store = DataStore.getInstance();
const sim = SimulationEngine.getInstance();

// 1. Live Outlet Dashboard Metrics
retailerRouter.get('/:outletId/dashboard', (req: Request, res: Response) => {
  const outletId = String(req.params.outletId);
  const outlet = store.getOutletById(outletId) || store.getOutlets()[0];
  const simState = sim.getState();

  const conversionRate = outlet.todayImpressions > 0
    ? Number(((outlet.todayRedemptions / outlet.todayImpressions) * 100).toFixed(2))
    : 3.4;

  res.json({
    outlet,
    metrics: {
      impressions: outlet.todayImpressions,
      scans: outlet.todayScans,
      redemptions: outlet.todayRedemptions,
      conversionRate,
      revenueAttributedEur: outlet.currentRevenue,
      stockAvailable: outlet.stockAvailable
    },
    simulatedTime: simState.simulatedTime
  });
});

// 2. Passenger Flow Near My Store (2-hour forecast)
retailerRouter.get('/:outletId/passenger-flow', (req: Request, res: Response) => {
  const outletId = String(req.params.outletId);
  const outlet = store.getOutletById(outletId) || store.getOutlets()[0];
  const simState = sim.getState();
  const crowd = CrowdProfileEngine.computeZonePresence(outlet.zoneId, simState.simulatedTime, store);

  res.json({
    zoneId: outlet.zoneId,
    forecastNext60Min: {
      paxCount: Math.round(crowd.paxCount * 1.3),
      internationalShare: crowd.internationalShare,
      domesticShare: crowd.domesticShare,
      dwellMinutes: crowd.dwellMinutes,
      topDestinations: crowd.topDestinations,
      topNationalities: crowd.topNationalities
    },
    forecastNext120Min: {
      paxCount: Math.round(crowd.paxCount * 2.4),
      peakWindow: '14:30 - 15:30 UTC'
    },
    crowd
  });
});

// 3. Campaigns List for this Outlet
retailerRouter.get('/:outletId/campaigns', (req: Request, res: Response) => {
  const outletId = String(req.params.outletId);
  const campaigns = store.getCampaigns().filter(c => c.outletId === outletId);
  res.json(campaigns.length > 0 ? campaigns : store.getCampaigns().slice(0, 3));
});

// 4. Live Audience-Match Preview
retailerRouter.post('/campaigns/preview', (req: Request, res: Response) => {
  const { targetZones, segmentWeights, hardFilters } = req.body;
  const simState = sim.getState();
  const zoneId = (targetZones && targetZones[0]) || 'ZONE-T2-GATES-40-50';
  const crowd = CrowdProfileEngine.computeZonePresence(zoneId, simState.simulatedTime, store);

  const matchPercent = Math.min(94, Math.max(35, Math.round(
    ((segmentWeights?.holiday || 0.5) * crowd.tripPurposes.holiday +
     (segmentWeights?.family || 0.5) * crowd.tripPurposes.family +
     (segmentWeights?.business || 0.5) * crowd.tripPurposes.business +
     (segmentWeights?.international || 0.5) * crowd.internationalShare) * 120
  )));

  const expectedImpressions = Math.round(crowd.paxCount * 5.2);
  const expectedRedemptions = Math.round(expectedImpressions * 0.038);

  res.json({
    matchPercent,
    expectedImpressions,
    expectedRedemptions,
    summaryMessage: `Matches ${matchPercent}% of crowd at target gates from 14:00 to 16:00. Expected ${expectedImpressions.toLocaleString()} impressions and ${expectedRedemptions} redemptions.`,
    crowdProfile: crowd
  });
});

// 5. Create New Campaign
retailerRouter.post('/campaigns', (req: Request, res: Response) => {
  const body = req.body;
  const newCampaign: Campaign = {
    campaignId: `CAMP-${Date.now()}`,
    advertiserId: body.advertiserId || 'ADV-DUTYFREE',
    outletId: body.outletId || 'OUT-01',
    name: body.name || 'Untitled Retail Campaign',
    targetZones: body.targetZones || ['ZONE-T2-DUTYFREE'],
    targetScreens: body.targetScreens || [],
    segmentWeights: body.segmentWeights || { family: 0.5, holiday: 0.5, business: 0.5, international: 0.5, domestic: 0.5, luxury: 0.5 },
    hardFilters: body.hardFilters || {},
    schedule: body.schedule || { startDate: '2026-10-14', endDate: '2026-10-31', dailyStartTime: '06:00', dailyEndTime: '23:00' },
    budget: body.budget || { totalBudget: 5000, spentBudget: 0, dailyCap: 300, costPerPlay: 0.35 },
    frequencyCapPerScreen: body.frequencyCapPerScreen || 8,
    triggers: body.triggers || {},
    status: 'ACTIVE',
    creatives: body.creatives || [
      {
        creativeId: `CR-${Date.now()}`,
        campaignId: `CAMP-${Date.now()}`,
        advertiserId: body.advertiserId || 'ADV-DUTYFREE',
        title: body.title || 'Exclusive Airport Offer',
        subtitle: body.subtitle || 'Special discount for departing passengers',
        bodyText: body.bodyText || 'Show your boarding pass and redeem instant savings.',
        bodyTextFr: 'Présentez votre carte d embarquement pour une remise immédiate.',
        callToAction: 'Scan QR to Redeem',
        discountTag: body.discountTag || '15% OFF',
        imageUrl: body.imageUrl || 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1200&q=80',
        themeColor: '#1e1b4b',
        accentColor: '#fbbf24',
        status: 'APPROVED',
        brandSafetyPassed: true
      }
    ],
    historicalStats: {
      impressions: 0,
      scans: 0,
      redemptions: 0,
      spend: 0,
      roi: 0,
      segmentPerformance: {}
    }
  };

  store.saveCampaign(newCampaign);
  res.status(201).json(newCampaign);
});

// 6. 1-Click Duplicate Campaign
retailerRouter.post('/campaigns/:id/duplicate', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const orig = store.getCampaignById(id);
  if (!orig) {
    return res.status(404).json({ error: 'Campaign not found' });
  }

  const duplicated: Campaign = {
    ...orig,
    campaignId: `CAMP-${Date.now()}`,
    name: `${orig.name} (Copy)`,
    budget: { ...orig.budget, spentBudget: 0 },
    creatives: orig.creatives.map(c => ({ ...c, creativeId: `CR-${Date.now()}-${Math.floor(Math.random() * 100)}` })),
    historicalStats: {
      impressions: 0,
      scans: 0,
      redemptions: 0,
      spend: 0,
      roi: 0,
      segmentPerformance: {}
    }
  };

  store.saveCampaign(duplicated);
  res.status(201).json(duplicated);
});

// 7. Stock-Aware Toggle
retailerRouter.patch('/:outletId/stock', (req: Request, res: Response) => {
  const outletId = String(req.params.outletId);
  const { stockAvailable } = req.body;
  const updated = store.updateOutlet(outletId, { stockAvailable: Boolean(stockAvailable) });
  if (!updated) {
    return res.status(404).json({ error: 'Outlet not found' });
  }
  res.json(updated);
});

// 8. Promo Codes List
retailerRouter.get('/promos', (_req: Request, res: Response) => {
  res.json(store.getPromos());
});

// 9. Share-to-Family Code Generation
retailerRouter.post('/promos/share', (req: Request, res: Response) => {
  const { parentCode } = req.body;
  const parent = store.getPromoByCode(parentCode);
  if (!parent) {
    return res.status(404).json({ error: 'Parent promo code not found' });
  }

  const familyCode: PromoCode = {
    promoId: `PR-FAM-${Date.now()}`,
    code: `${parent.code}-FAM`,
    campaignId: parent.campaignId,
    outletId: parent.outletId,
    advertiserId: parent.advertiserId,
    discountValue: `${parent.discountValue} (Family Share)`,
    expiresAt: parent.expiresAt,
    linkedFlightNumber: parent.linkedFlightNumber,
    isFamilyShare: true,
    parentCodeId: parent.promoId,
    redemptionCount: 0,
    maxRedemptions: 100
  };

  store.savePromo(familyCode);
  res.status(201).json(familyCode);
});

// 10. Redeem Promo Code (Instant synchronization across roles)
retailerRouter.post('/redeem', (req: Request, res: Response) => {
  const { code, voucherCode } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Code is required' });
  }

  const result = store.redeemPromo(String(code).trim(), voucherCode ? String(voucherCode).trim() : undefined);
  if (!result.success) {
    return res.status(400).json(result);
  }

  res.json(result);
});
