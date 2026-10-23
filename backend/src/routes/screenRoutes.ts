import { Router, Request, Response } from 'express';
import { DataStore } from '../db/store.js';
import { SimulationEngine } from '../engine/simulationEngine.js';
import { DecisionPipeline } from '../engine/decisionPipeline.js';
import { CrowdProfileEngine } from '../engine/crowdProfile.js';

export const screenRouter = Router();
const store = DataStore.getInstance();
const sim = SimulationEngine.getInstance();

// 1. Current Playlist & State for a Screen
screenRouter.get('/:screenId/playlist', (req: Request, res: Response) => {
  const screenId = String(req.params.screenId);
  const screen = store.getScreenById(screenId) || store.getScreens()[0];
  const simState = sim.getState();

  // Evaluate screen against current simulation time
  const { winningCampaign, decision, promoCode } = DecisionPipeline.evaluateScreen(screen.screenId, simState.simulatedTime, store);
  const creative = winningCampaign?.creatives[0] || null;

  // Context strip: Nearby flights (FIDS-style)
  const allFlights = store.getFlights();
  const nearbyGates = screen.nearestGates || ['42'];
  const nearbyFlights = allFlights
    .filter(f => nearbyGates.includes(f.gate) || f.terminal === screen.terminal)
    .slice(0, 4)
    .map(f => ({
      flightNumber: `${f.airline_iata}${f.flight_number}`,
      destination: f.destination,
      gate: f.gate,
      scheduledTime: f.STA_STD.split('T')[1]?.substring(0, 5) || '14:10',
      estimatedTime: f.ETA_ETD.split('T')[1]?.substring(0, 5) || '14:55',
      status: f.status,
      delayMinutes: f.status === 'DEL' ? 45 : 0
    }));

  res.json({
    screen,
    creative,
    campaign: winningCampaign,
    promoCode,
    nearbyFlights,
    simulatedTime: simState.simulatedTime,
    decisionSummary: {
      decisionId: decision.decisionId,
      winningReason: decision.winningReason,
      antiHallucinationVerified: decision.antiHallucinationVerified
    }
  });
});

// 2. "Why this ad?" Overlay Data
screenRouter.get('/:screenId/why-this-ad', (req: Request, res: Response) => {
  const screenId = String(req.params.screenId);
  const decisions = store.getDecisions(10);
  const decision = decisions.find(d => d.screenId === screenId) || decisions[0];

  if (!decision) {
    const simState = sim.getState();
    const evaluated = DecisionPipeline.evaluateScreen(screenId, simState.simulatedTime, store);
    return res.json(evaluated.decision);
  }

  res.json(decision);
});

// 3. Mobile Claim Promo Page Payload (Accessed via QR scan)
screenRouter.get('/claim/:code', (req: Request, res: Response) => {
  const code = String(req.params.code);
  const promo = store.getPromoByCode(code);
  if (!promo) {
    return res.status(404).json({ error: 'Promo code not found or expired' });
  }

  const outlet = store.getOutletById(promo.outletId);
  const campaign = store.getCampaignById(promo.campaignId);

  res.json({
    promo,
    outlet,
    campaignName: campaign?.name || 'Exclusive Airside Offer',
    creative: campaign?.creatives[0] || null,
    expiresAt: promo.expiresAt,
    remainingSeconds: 1800 // Live countdown
  });
});
