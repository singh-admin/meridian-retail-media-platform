import { Router, Request, Response } from 'express';
import { DataStore } from '../db/store.js';
import { SimulationEngine } from '../engine/simulationEngine.js';
import { CrowdProfileEngine } from '../engine/crowdProfile.js';

export const airlineRouter = Router();
const store = DataStore.getInstance();
const sim = SimulationEngine.getInstance();

// 1. My Flights Today (List & Timeline with status, delay, load factor)
airlineRouter.get('/:airlineIata/flights', (req: Request, res: Response) => {
  const iata = String(req.params.airlineIata).toUpperCase();
  const allFlights = store.getFlights();
  const airlineFlights = allFlights.filter(f => f.airline_iata === iata || f.codeshares.includes(iata));

  const items = (airlineFlights.length > 0 ? airlineFlights : allFlights.slice(0, 15)).map(f => {
    const loadFactorPercent = f.seats > 0 ? Math.round((f.pax_total / f.seats) * 100) : 85;
    return {
      flightId: f.aodb_flight_id,
      flightNumber: `${f.airline_iata}${f.flight_number}`,
      callsign: f.callsign,
      origin: f.origin,
      destination: f.destination,
      gate: f.gate,
      stand: f.stand,
      terminal: f.terminal,
      scheduledTime: f.STA_STD,
      estimatedTime: f.ETA_ETD,
      status: f.status,
      delayMinutes: f.status === 'DEL' ? 45 : 0,
      seats: f.seats,
      paxTotal: f.pax_total,
      loadFactorPercent,
      aircraftType: f.aircraft_type_icao
    };
  });

  res.json({
    airlineIata: iata,
    totalFlightsToday: items.length,
    flights: items
  });
});

// 2. Gate-Area Messaging (Schedule sponsored content for boarding window)
airlineRouter.post('/gate-messaging', (req: Request, res: Response) => {
  const { flightNumber, messageType, title, bodyText, discountTag, targetGate } = req.body;

  const newCampaign = {
    campaignId: `CAMP-AIRLINE-GATE-${Date.now()}`,
    advertiserId: 'ADV-AIR-HCZ',
    outletId: 'OUT-06',
    name: `Airline Gate Message: ${flightNumber} - ${title || 'Priority Notice'}`,
    targetZones: ['ZONE-T2-GATES-40-50'],
    targetScreens: ['SC-T2-042', 'SC-T2-043'],
    segmentWeights: { family: 0.5, holiday: 0.5, business: 0.9, international: 0.8, domestic: 0.2, luxury: 0.8 },
    hardFilters: { targetGates: [targetGate || '42'] },
    schedule: { startDate: '2026-10-14', endDate: '2026-10-14', dailyStartTime: '00:00', dailyEndTime: '23:59' },
    budget: { totalBudget: 5000, spentBudget: 0, dailyCap: 500, costPerPlay: 0.20 },
    frequencyCapPerScreen: 10,
    triggers: { boardingWindowOnly: true },
    status: 'ACTIVE' as const,
    creatives: [
      {
        creativeId: `CR-AIRLINE-${Date.now()}`,
        campaignId: `CAMP-AIRLINE-GATE-${Date.now()}`,
        advertiserId: 'ADV-AIR-HCZ',
        title: title || `Boarding Soon: Flight ${flightNumber}`,
        subtitle: `Special passenger benefit for ${flightNumber}`,
        bodyText: bodyText || 'Priority upgrade and partner lounge access available right now at Gate desk.',
        bodyTextFr: 'Surclassement prioritaire et accès lounge disponibles en porte.',
        callToAction: 'Inquire at Gate Desk',
        discountTag: discountTag || 'BOARDING BENEFIT',
        imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
        themeColor: '#0f172a',
        accentColor: '#38bdf8',
        status: 'APPROVED' as const,
        brandSafetyPassed: true
      }
    ]
  };

  store.saveCampaign(newCampaign);
  res.status(201).json(newCampaign);
});

// 3. Delay Goodwill Automation (auto-push vouchers when flight delayed past threshold)
airlineRouter.post('/goodwill-automation', (req: Request, res: Response) => {
  const { flightNumber, delayThresholdMinutes = 30, voucherValueEur = 15, partnerRetailer = 'Cloud Nine Bakery' } = req.body;

  const goodwillCampaign = {
    campaignId: `CAMP-GOODWILL-${Date.now()}`,
    advertiserId: 'ADV-AIR-HCZ',
    outletId: 'OUT-04',
    name: `Automated Goodwill Hospitality (${flightNumber} +${delayThresholdMinutes}m)`,
    targetZones: ['ZONE-T2-GATES-40-50'],
    targetScreens: ['SC-T2-042', 'SC-T2-043'],
    segmentWeights: { family: 0.9, holiday: 0.9, business: 0.8, international: 1.0, domestic: 0.1, luxury: 0.5 },
    hardFilters: {},
    schedule: { startDate: '2026-10-14', endDate: '2026-10-31', dailyStartTime: '00:00', dailyEndTime: '23:59' },
    budget: { totalBudget: 10000, spentBudget: 0, dailyCap: 1500, costPerPlay: 0.40 },
    frequencyCapPerScreen: 10,
    triggers: { delayThresholdMinutes },
    status: 'ACTIVE' as const,
    creatives: [
      {
        creativeId: `CR-GOODWILL-${Date.now()}`,
        campaignId: `CAMP-GOODWILL-${Date.now()}`,
        advertiserId: 'ADV-AIR-HCZ',
        title: `Complimentary €${voucherValueEur} Refreshment Voucher`,
        subtitle: `Our sincere apologies for the delay on Flight ${flightNumber}`,
        bodyText: `Scan to redeem your complimentary refreshment voucher at ${partnerRetailer} or any participating concourse cafe.`,
        bodyTextFr: `Bon de rafraîchissement de ${voucherValueEur}€ offert par votre compagnie aérienne.`,
        callToAction: 'Scan to Claim Food Voucher',
        discountTag: `FREE €${voucherValueEur} VOUCHER`,
        imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
        themeColor: '#064e3b',
        accentColor: '#34d399',
        status: 'APPROVED' as const,
        brandSafetyPassed: true
      }
    ]
  };

  store.saveCampaign(goodwillCampaign);
  res.status(201).json({ success: true, automationActivated: true, campaign: goodwillCampaign });
});

// 4. Aggregated Crowd Profile for Airline's Flights
airlineRouter.get('/:airlineIata/crowd-profile', (req: Request, res: Response) => {
  const iata = String(req.params.airlineIata).toUpperCase();
  const simState = sim.getState();
  const crowd = CrowdProfileEngine.computeZonePresence('ZONE-T2-GATES-40-50', simState.simulatedTime, store);

  res.json({
    airlineIata: iata,
    activeCatchmentGates: ['42', '41', '43'],
    crowdProfile: {
      holidayShare: crowd.tripPurposes.holiday,
      familyShare: crowd.tripPurposes.family,
      businessShare: crowd.tripPurposes.business,
      internationalShare: crowd.internationalShare,
      medianDwellMinutes: crowd.dwellMinutes,
      paxCount: crowd.paxCount
    },
    topPartnerOffers: [
      { partner: 'Meridian World Duty Free', offer: '15% Off Delayed Flight Special', matchScore: '86%', status: 'PLAYING NOW' },
      { partner: 'Cloud Nine Bakery', offer: 'Complimentary €15 Goodwill Voucher', matchScore: '94%', status: 'ACTIVE' },
      { partner: 'Halcyon Club Lounge', offer: '20% Off Walk-in Day Pass', matchScore: '21%', status: 'FILTERED' }
    ]
  });
});

// 5. Co-marketing Marketplace
airlineRouter.get('/:airlineIata/marketplace', (_req: Request, res: Response) => {
  res.json([
    {
      proposalId: 'PROP-01',
      retailerName: 'Cloud Nine Artisan Coffee',
      dealSummary: 'Halcyon Airways passengers receive 10% off all artisan brews upon presenting mobile boarding pass.',
      coFundingSplit: '50% Airline / 50% Retailer',
      estimatedReachPax: 1200,
      status: 'PENDING_AIRLINE_ACCEPT'
    },
    {
      proposalId: 'PROP-02',
      retailerName: 'Meridian Duty-Free',
      dealSummary: 'Exclusive 20% discount on luxury gift sets for premium cabin travelers.',
      coFundingSplit: '100% Retailer funded',
      estimatedReachPax: 450,
      status: 'ACCEPTED'
    }
  ]);
});

airlineRouter.post('/marketplace/accept', (req: Request, res: Response) => {
  const { proposalId } = req.body;
  res.json({ success: true, proposalId, message: 'Co-marketing agreement accepted and activated on gate screens!' });
});

// 6. Airline Passenger Performance
airlineRouter.get('/:airlineIata/performance', (req: Request, res: Response) => {
  const iata = String(req.params.airlineIata).toUpperCase();
  res.json({
    airlineIata: iata,
    passengerImpressionsToday: 14200,
    goodwillVouchersClaimed: 245,
    loungeUpsellConversions: 42,
    passengerSatisfactionScore: 4.8
  });
});
