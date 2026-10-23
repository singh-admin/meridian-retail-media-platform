import { Router, Request, Response } from 'express';
import { DataStore } from '../db/store.js';
import { PlatformAdapter } from '../adapters/platformAdapter.js';

export const adminRouter = Router();
const store = DataStore.getInstance();

// 1. Operator Overview & KPI Strip
adminRouter.get('/overview', (_req: Request, res: Response) => {
  const screens = store.getScreens();
  const onlineCount = screens.filter(s => s.status === 'ONLINE').length;
  const screensOnlinePercent = Math.round((onlineCount / (screens.length || 1)) * 100);

  const campaigns = store.getCampaigns();
  const activeCampaigns = campaigns.filter(c => c.status === 'ACTIVE').length;

  let totalRevenue = 0;
  let totalImpressions = 0;
  for (const outlet of store.getOutlets()) {
    totalRevenue += outlet.currentRevenue;
    totalImpressions += outlet.todayImpressions;
  }

  const incidents = store.getIncidents();
  const openIncidents = incidents.filter(i => i.status === 'OPEN').length;

  res.json({
    kpis: {
      screensOnlinePercent,
      totalScreens: screens.length,
      onlineScreens: onlineCount,
      adPlaysToday: Math.round(totalImpressions * 0.82),
      impressionsToday: totalImpressions,
      revenueTodayEur: Math.round(totalRevenue),
      activeCampaigns,
      averageScreenLatencyMs: 16.4,
      openIncidents
    },
    systemHealth: 'OPERATIONAL',
    simulatedClock: new Date().toISOString()
  });
});

// 2. Terminal Map Data (Screens + Heat Presence Overlay)
adminRouter.get('/map', (_req: Request, res: Response) => {
  const screens = store.getScreens();
  const zones = store.getZones();

  res.json({
    terminal1: {
      name: 'Terminal 1 (Domestic)',
      zones: zones.filter(z => z.terminal === 'T1'),
      screens: screens.filter(s => s.terminal === 'T1')
    },
    terminal2: {
      name: 'Terminal 2 (International)',
      zones: zones.filter(z => z.terminal === 'T2'),
      screens: screens.filter(s => s.terminal === 'T2')
    }
  });
});

// 3. Incident Tracker
adminRouter.get('/incidents', (_req: Request, res: Response) => {
  res.json(store.getIncidents());
});

adminRouter.patch('/incidents/:id', (req: Request, res: Response) => {
  const { status, owner } = req.body;
  const id = String(req.params.id);
  const updated = store.updateIncident(id, { status, owner });
  if (!updated) {
    return res.status(404).json({ error: 'Incident not found' });
  }
  res.json(updated);
});

// 4. Master Data Management
adminRouter.get('/master-data', (_req: Request, res: Response) => {
  res.json({
    advertisers: store.getAdvertisers(),
    outlets: store.getOutlets(),
    zones: store.getZones(),
    screens: store.getScreens().slice(0, 50),
    totalScreensCount: store.getScreens().length
  });
});

adminRouter.post('/screens', (req: Request, res: Response) => {
  const { screenId, name, terminal, zoneId, orientation, nearestGates } = req.body;
  if (!screenId || !name) {
    return res.status(400).json({ error: 'screenId and name are required' });
  }
  const terminalVal: 'T1' | 'T2' = terminal === 'T2' ? 'T2' : 'T1';
  const newScreen = {
    screenId,
    name,
    terminal: terminalVal,
    zoneId: zoneId || 'ZONE-T1-CONC-A',
    concourse: 'Concourse A',
    nearestGates: nearestGates || ['A1'],
    orientation: (orientation === '16:9' ? '16:9' : '9:16') as '9:16' | '16:9',
    resolution: '2160x3840 (4K)',
    status: 'ONLINE' as const,
    lastHeartbeat: new Date().toISOString(),
    latencyMs: 15,
    currentCreativeId: null,
    currentCampaignId: null,
    currentPromoCode: null
  };
  store.updateScreen(screenId, newScreen);
  res.status(201).json(newScreen);
});

adminRouter.patch('/screens/:id', (req: Request, res: Response) => {
  const id = String(req.params.id);
  const updated = store.updateScreen(id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Screen not found' });
  }
  res.json(updated);
});

// 5. Data Feed Health Status
adminRouter.get('/feed-health', (_req: Request, res: Response) => {
  res.json(store.getFeedHealth());
});

// 6. Rule Engine Settings
adminRouter.get('/settings', (_req: Request, res: Response) => {
  res.json(store.getSettings());
});

adminRouter.put('/settings', (req: Request, res: Response) => {
  const updated = store.updateSettings(req.body);
  res.json(updated);
});

// 7. Decision Audit Log
adminRouter.get('/decisions', (req: Request, res: Response) => {
  const limit = Math.min(200, parseInt(String(req.query.limit || '50'), 10));
  const decisions = store.getDecisions(limit);
  res.json(decisions);
});

adminRouter.get('/decisions/export', (_req: Request, res: Response) => {
  const decisions = store.getDecisions(200);
  const csv = PlatformAdapter.exportDecisionsCsv(decisions);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="meridian_decisions_audit.csv"');
  res.send(csv);
});
