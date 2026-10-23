import { Flight, Screen, Outlet, Advertiser, Campaign, Creative, Zone, PromoCode, IncidentAlert } from '../models/types.js';

export const AIRLINES = [
  { iata: 'XD', icao: 'SKJ', name: 'Skylark Air', nature: 'D' as const, handler: 'Skylark self-handling' },
  { iata: 'YA', icao: 'AUQ', name: 'Aurora National Airlines', nature: 'D' as const, handler: 'Meridian Ground Services' },
  { iata: 'YN', icao: 'KSQ', name: 'Kestrel Air', nature: 'D' as const, handler: 'Compass Ground Handling' },
  { iata: 'XU', icao: 'CWQ', name: 'Coralwing Express', nature: 'D' as const, handler: 'Meridian Ground Services' },
  { iata: 'YF', icao: 'SVZ', name: 'Sunvale Airlines', nature: 'D' as const, handler: 'Compass Ground Handling' },
  { iata: 'ZO', icao: 'SLQ', name: 'Solano Airways', nature: 'I' as const, handler: 'Harbor Aviation Services' },
  { iata: 'XH', icao: 'HCZ', name: 'Halcyon Airways', nature: 'I' as const, handler: 'Skylark self-handling' },
  { iata: 'YG', icao: 'ACZ', name: 'Alpine Continental Airlines', nature: 'I' as const, handler: 'Compass Ground Handling' },
  { iata: 'XI', icao: 'CRU', name: 'Crescent Airways', nature: 'I' as const, handler: 'Skylark self-handling' },
  { iata: 'YU', icao: 'LPZ', name: 'Lumen Pacific Airlines', nature: 'I' as const, handler: 'Meridian Ground Services' },
  { iata: 'YB', icao: 'NSZ', name: 'Northstar Atlantic', nature: 'I' as const, handler: 'Skylark self-handling' }
];

export const DESTINATIONS = {
  domestic: [
    { code: 'ADN', city: 'Aldmere' },
    { code: 'BWZ', city: 'Brightwater' },
    { code: 'CBP', city: 'Calder Bay' },
    { code: 'CPZ', city: 'Coralport' },
    { code: 'DMQ', city: 'Dunmore' },
    { code: 'EHQ', city: 'Eastholm' },
    { code: 'FHQ', city: 'Fairhaven' },
    { code: 'GRH', city: 'Glenrock' },
    { code: 'GSZ', city: 'Goldsand' },
    { code: 'HCX', city: 'Highcliff' },
    { code: 'IVQ', city: 'Ironvale' },
    { code: 'JFQ', city: 'Juniper Falls' },
    { code: 'LMW', city: 'Lakemont' },
    { code: 'NGV', city: 'Northgate' },
    { code: 'OKZ', city: 'Oakridge' }
  ],
  international: [
    { code: 'BVQ', city: 'Belvista' },
    { code: 'KST', city: 'Kastell' },
    { code: 'NVQ', city: 'Novaterra' },
    { code: 'PVQ', city: 'Port Valen' },
    { code: 'SCJ', city: 'Santa Corvina' },
    { code: 'SMG', city: 'Solmara' },
    { code: 'ZHQ', city: 'Zarhan' },
    { code: 'DXB', city: 'Dubai' }
  ]
};

export const AIRCRAFT_MODELS = [
  { type: 'A20N', seats: 186 },
  { type: 'A21N', seats: 232 },
  { type: 'A359', seats: 283 },
  { type: 'B38M', seats: 189 },
  { type: 'B788', seats: 256 },
  { type: 'B789', seats: 299 },
  { type: 'B77W', seats: 354 },
  { type: 'AT76', seats: 78 }
];

export function generateSeedData(): {
  flights: Flight[];
  zones: Zone[];
  screens: Screen[];
  advertisers: Advertiser[];
  outlets: Outlet[];
  campaigns: Campaign[];
  promos: PromoCode[];
  incidents: IncidentAlert[];
} {
  // 1. Generate Zones
  const zones: Zone[] = [
    // T1 Domestic Zones
    { zoneId: 'ZONE-T1-CHK', terminal: 'T1', concourse: 'Main Hall', name: 'T1 Check-in & Security Concourse', type: 'CHECKIN', gatesNearby: ['A1', 'A2', 'A3', 'A4'], currentPaxEstimate: 210, queueWaitMinutes: 5, queueDensity: 'LOW' },
    { zoneId: 'ZONE-T1-CONC-A', terminal: 'T1', concourse: 'Concourse A', name: 'T1 Concourse A (Gates A1-A10)', type: 'GATE_AREA', gatesNearby: ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10'], currentPaxEstimate: 540, queueWaitMinutes: 4, queueDensity: 'LOW' },
    { zoneId: 'ZONE-T1-CONC-B', terminal: 'T1', concourse: 'Concourse B', name: 'T1 Concourse B (Gates B1-B10)', type: 'GATE_AREA', gatesNearby: ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10'], currentPaxEstimate: 420, queueWaitMinutes: 6, queueDensity: 'LOW' },
    { zoneId: 'ZONE-T1-RETAIL', terminal: 'T1', concourse: 'Airside Central', name: 'T1 Central Domestic Promenade & Dining', type: 'RETAIL_CENTRAL', gatesNearby: ['A1', 'A2', 'B1', 'B2'], currentPaxEstimate: 620, queueWaitMinutes: 3, queueDensity: 'LOW' },
    { zoneId: 'ZONE-T1-BAG', terminal: 'T1', concourse: 'Arrivals Ground', name: 'T1 Baggage Reclaim & Ground Transport', type: 'BAGGAGE_CLAIM', gatesNearby: [], currentPaxEstimate: 310, queueWaitMinutes: 8, queueDensity: 'LOW' },

    // T2 International Zones
    { zoneId: 'ZONE-T2-CHK', terminal: 'T2', concourse: 'International Hall', name: 'T2 International Check-in & FastTrack', type: 'CHECKIN', gatesNearby: ['C1', 'C2'], currentPaxEstimate: 480, queueWaitMinutes: 12, queueDensity: 'MEDIUM' },
    { zoneId: 'ZONE-T2-DUTYFREE', terminal: 'T2', concourse: 'Airside Piazza', name: 'T2 Grand Duty-Free & Luxury Walkway', type: 'DUTY_FREE', gatesNearby: ['C1', 'C2', 'C10', '40', '41', '42'], currentPaxEstimate: 1250, queueWaitMinutes: 2, queueDensity: 'LOW' },
    { zoneId: 'ZONE-T2-CONC-C', terminal: 'T2', concourse: 'Concourse C', name: 'T2 Concourse C (Gates C1-C20)', type: 'GATE_AREA', gatesNearby: ['C1', 'C2', 'C3', 'C4', 'C5', 'C10', 'C12', 'C14', 'C20'], currentPaxEstimate: 780, queueWaitMinutes: 7, queueDensity: 'LOW' },
    { zoneId: 'ZONE-T2-GATES-40-50', terminal: 'T2', concourse: 'Concourse C Pier 4', name: 'T2 International Gates 40-50 Pier', type: 'GATE_AREA', gatesNearby: ['40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50'], currentPaxEstimate: 920, queueWaitMinutes: 8, queueDensity: 'MEDIUM' },
    { zoneId: 'ZONE-T2-FOOD', terminal: 'T2', concourse: 'Mezzanine', name: 'T2 Gourmet Terrace & Coffee Lounges', type: 'FOOD_COURT', gatesNearby: ['C10', '41', '42'], currentPaxEstimate: 430, queueWaitMinutes: 4, queueDensity: 'LOW' },
    { zoneId: 'ZONE-T2-BAG', terminal: 'T2', concourse: 'Arrivals Ground', name: 'T2 International Baggage & Customs', type: 'BAGGAGE_CLAIM', gatesNearby: [], currentPaxEstimate: 510, queueWaitMinutes: 14, queueDensity: 'MEDIUM' }
  ];

  // 2. Generate Advertisers (Brands)
  const advertisers: Advertiser[] = [
    { advertiserId: 'ADV-DUTYFREE', name: 'Meridian World Duty-Free', category: 'DUTY_FREE', logoUrl: '/brands/dutyfree.svg', totalSpend: 145000, activeCampaignsCount: 4 },
    { advertiserId: 'ADV-CAFE', name: 'Cloud Nine Artisan Coffee & Bakery', category: 'FB', logoUrl: '/brands/cafe.svg', totalSpend: 62000, activeCampaignsCount: 3 },
    { advertiserId: 'ADV-ELEC', name: 'Skyline Premium Electronics', category: 'ELECTRONICS', logoUrl: '/brands/elec.svg', totalSpend: 89000, activeCampaignsCount: 2 },
    { advertiserId: 'ADV-LUX', name: 'Aura Haute Parfumerie & Jewels', category: 'LUXURY', logoUrl: '/brands/luxury.svg', totalSpend: 198000, activeCampaignsCount: 3 },
    { advertiserId: 'ADV-TOY', name: 'Voyager Kids & Toy Kingdom', category: 'TOYS', logoUrl: '/brands/toys.svg', totalSpend: 34000, activeCampaignsCount: 2 },
    { advertiserId: 'ADV-AIR-SKJ', name: 'Skylark Air Services', category: 'AIRLINE', logoUrl: '/brands/skylark.svg', totalSpend: 75000, activeCampaignsCount: 2 },
    { advertiserId: 'ADV-AIR-AUQ', name: 'Aurora National Priority Lounge', category: 'LOUNGE', logoUrl: '/brands/aurora.svg', totalSpend: 92000, activeCampaignsCount: 2 },
    { advertiserId: 'ADV-AIR-HCZ', name: 'Halcyon First & Business Club', category: 'LOUNGE', logoUrl: '/brands/halcyon.svg', totalSpend: 110000, activeCampaignsCount: 3 }
  ];

  // 3. Generate 40 Outlets
  const outlets: Outlet[] = [
    { outletId: 'OUT-01', advertiserId: 'ADV-DUTYFREE', name: 'Meridian Duty-Free Flagship (T2 Central)', terminal: 'T2', zoneId: 'ZONE-T2-DUTYFREE', category: 'DUTY_FREE', stockAvailable: true, currentRevenue: 84200, todayImpressions: 48200, todayScans: 2840, todayRedemptions: 1120 },
    { outletId: 'OUT-02', advertiserId: 'ADV-DUTYFREE', name: 'Meridian Duty-Free Express (Gate 42)', terminal: 'T2', zoneId: 'ZONE-T2-GATES-40-50', category: 'DUTY_FREE', stockAvailable: true, currentRevenue: 43100, todayImpressions: 29400, todayScans: 1950, todayRedemptions: 830 },
    { outletId: 'OUT-03', advertiserId: 'ADV-CAFE', name: 'Cloud Nine Bakery (T1 Concourse A)', terminal: 'T1', zoneId: 'ZONE-T1-CONC-A', category: 'FB', stockAvailable: true, currentRevenue: 18400, todayImpressions: 16400, todayScans: 1420, todayRedemptions: 640 },
    { outletId: 'OUT-04', advertiserId: 'ADV-CAFE', name: 'Cloud Nine Reserve Espresso (Gate 41)', terminal: 'T2', zoneId: 'ZONE-T2-GATES-40-50', category: 'FB', stockAvailable: true, currentRevenue: 24900, todayImpressions: 21500, todayScans: 1890, todayRedemptions: 910 },
    { outletId: 'OUT-05', advertiserId: 'ADV-TOY', name: 'Voyager Kids FunStore (T2 Pier 4)', terminal: 'T2', zoneId: 'ZONE-T2-GATES-40-50', category: 'TOYS', stockAvailable: true, currentRevenue: 15300, todayImpressions: 14800, todayScans: 890, todayRedemptions: 340 },
    { outletId: 'OUT-06', advertiserId: 'ADV-AIR-HCZ', name: 'Halcyon Palm Lounge (T2 Concourse C)', terminal: 'T2', zoneId: 'ZONE-T2-GATES-40-50', category: 'LOUNGE', stockAvailable: true, currentRevenue: 38200, todayImpressions: 12400, todayScans: 410, todayRedemptions: 140 },
    { outletId: 'OUT-07', advertiserId: 'ADV-LUX', name: 'Aura Luxury Boutique (T2 Duty-Free)', terminal: 'T2', zoneId: 'ZONE-T2-DUTYFREE', category: 'LUXURY', stockAvailable: true, currentRevenue: 67000, todayImpressions: 32000, todayScans: 1100, todayRedemptions: 290 },
    { outletId: 'OUT-08', advertiserId: 'ADV-ELEC', name: 'Skyline Tech Hub (T2 Concourse C)', terminal: 'T2', zoneId: 'ZONE-T2-CONC-C', category: 'ELECTRONICS', stockAvailable: true, currentRevenue: 52000, todayImpressions: 28000, todayScans: 980, todayRedemptions: 210 }
  ];

  // Fill up to 40 outlets with varied categories
  const categories = ['FB', 'RETAIL', 'DUTY_FREE', 'FASHION', 'PHARMACY', 'BOOKS', 'LOUNGE'];
  for (let i = 9; i <= 40; i++) {
    const isT2 = i % 2 === 0;
    const cat = categories[i % categories.length];
    outlets.push({
      outletId: `OUT-${i < 10 ? '0' + i : i}`,
      advertiserId: advertisers[i % advertisers.length].advertiserId,
      name: `Meridian ${cat} Store ${i} (${isT2 ? 'T2' : 'T1'})`,
      terminal: isT2 ? 'T2' : 'T1',
      zoneId: isT2 ? (i > 25 ? 'ZONE-T2-GATES-40-50' : 'ZONE-T2-DUTYFREE') : 'ZONE-T1-RETAIL',
      category: cat,
      stockAvailable: true,
      currentRevenue: 12000 + (i * 850),
      todayImpressions: 8000 + (i * 450),
      todayScans: 500 + (i * 35),
      todayRedemptions: 180 + (i * 15)
    });
  }

  // 4. Generate ~180 Screens across T1 and T2
  const screens: Screen[] = [];
  // Gate 42 specific screen (Critical for Worked Example)
  screens.push({
    screenId: 'SC-T2-042',
    name: 'Gate 42 Flight & Retail Totem A',
    terminal: 'T2',
    zoneId: 'ZONE-T2-GATES-40-50',
    concourse: 'Concourse C Pier 4',
    nearestGates: ['42', '41', '43'],
    orientation: '9:16',
    resolution: '2160x3840 (4K Portrait)',
    status: 'ONLINE',
    lastHeartbeat: new Date().toISOString(),
    latencyMs: 14,
    currentCreativeId: 'CR-PERFUME-01',
    currentCampaignId: 'CAMP-DUTYFREE-PERFUME',
    currentPromoCode: 'PERFUME15-DXB'
  });
  screens.push({
    screenId: 'SC-T2-043',
    name: 'Gate 42 Landscape FIDS Banner',
    terminal: 'T2',
    zoneId: 'ZONE-T2-GATES-40-50',
    concourse: 'Concourse C Pier 4',
    nearestGates: ['42', '43'],
    orientation: '16:9',
    resolution: '3840x2160 (4K Landscape)',
    status: 'ONLINE',
    lastHeartbeat: new Date().toISOString(),
    latencyMs: 18,
    currentCreativeId: 'CR-PERFUME-01',
    currentCampaignId: 'CAMP-DUTYFREE-PERFUME',
    currentPromoCode: 'PERFUME15-DXB'
  });

  // T1 Screens (approx 70 screens)
  for (let i = 1; i <= 70; i++) {
    const gateNum = `A${(i % 10) + 1}`;
    screens.push({
      screenId: `SC-T1-${i < 10 ? '00' + i : (i < 100 ? '0' + i : i)}`,
      name: `T1 Gate ${gateNum} Display #${i}`,
      terminal: 'T1',
      zoneId: i < 20 ? 'ZONE-T1-CHK' : (i < 45 ? 'ZONE-T1-CONC-A' : 'ZONE-T1-RETAIL'),
      concourse: i < 45 ? 'Concourse A' : 'Central Promenade',
      nearestGates: [gateNum, `A${((i + 1) % 10) + 1}`],
      orientation: i % 3 === 0 ? '16:9' : '9:16',
      resolution: '2160x3840 (4K)',
      status: i === 65 ? 'OFFLINE' : (i === 12 ? 'DEGRADED' : 'ONLINE'),
      lastHeartbeat: new Date().toISOString(),
      latencyMs: 12 + (i % 8),
      currentCreativeId: null,
      currentCampaignId: null,
      currentPromoCode: null
    });
  }

  // T2 Screens (approx 110 screens, totaling 182 screens)
  for (let i = 1; i <= 110; i++) {
    const gateNum = `${40 + (i % 11)}`;
    screens.push({
      screenId: `SC-T2-${i < 10 ? '00' + i : (i < 100 ? '0' + i : i)}`,
      name: `T2 Concourse Screen #${i} (Gate ${gateNum})`,
      terminal: 'T2',
      zoneId: i < 30 ? 'ZONE-T2-DUTYFREE' : (i < 80 ? 'ZONE-T2-GATES-40-50' : 'ZONE-T2-CONC-C'),
      concourse: i < 30 ? 'Piazza Duty-Free' : 'Concourse C',
      nearestGates: [gateNum, `${40 + ((i + 1) % 11)}`],
      orientation: i % 2 === 0 ? '9:16' : '16:9',
      resolution: '3840x2160',
      status: i === 99 ? 'OFFLINE' : 'ONLINE',
      lastHeartbeat: new Date().toISOString(),
      latencyMs: 15 + (i % 6),
      currentCreativeId: null,
      currentCampaignId: null,
      currentPromoCode: null
    });
  }

  // 5. Generate Campaigns (Including Worked Example Campaigns)
  const campaigns: Campaign[] = [
    // 1. Worked Example Winner: Duty-free perfume, 15% off
    {
      campaignId: 'CAMP-DUTYFREE-PERFUME',
      advertiserId: 'ADV-DUTYFREE',
      outletId: 'OUT-02',
      name: 'Duty-Free Premium Perfume & Fragrances - 15% Off Delayed Flight Special',
      targetZones: ['ZONE-T2-DUTYFREE', 'ZONE-T2-GATES-40-50'],
      targetScreens: ['SC-T2-042', 'SC-T2-043'],
      segmentWeights: {
        family: 0.3,
        holiday: 0.9,
        business: 0.4,
        international: 1.0,
        domestic: 0.1,
        luxury: 0.8
      },
      hardFilters: {
        flightNature: 'I',
        minDwellMinutes: 15,
        minZonePax: 100,
        targetGates: ['40', '41', '42', '43', '44', '45']
      },
      schedule: {
        startDate: '2026-10-01',
        endDate: '2026-10-31',
        dailyStartTime: '06:00',
        dailyEndTime: '23:59'
      },
      budget: {
        totalBudget: 25000,
        spentBudget: 8420,
        dailyCap: 1200,
        costPerPlay: 0.45
      },
      frequencyCapPerScreen: 8,
      triggers: {
        delayThresholdMinutes: 30, // Delay rule boost 1.5x!
        targetGates: ['42', '41', '43']
      },
      status: 'ACTIVE',
      creatives: [
        {
          creativeId: 'CR-PERFUME-01',
          campaignId: 'CAMP-DUTYFREE-PERFUME',
          advertiserId: 'ADV-DUTYFREE',
          title: 'Exquisite Luxury Fragrances - 15% OFF',
          subtitle: 'Exclusive Airside Gate 42 Flash Promo for DXB Passengers',
          bodyText: 'Turn your flight delay into a sensory indulgence. Enjoy 15% off Dior, Chanel, Tom Ford & niche fragrances at World Duty Free.',
          bodyTextFr: 'Profitez de votre attente pour une pause parfumée. 15% de remise sur Dior, Chanel et Tom Ford au Duty Free.',
          callToAction: 'Scan QR to Redeem at Gate 42 Counter',
          discountTag: '15% OFF DELAY VOUCHER',
          imageUrl: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1200&q=80',
          themeColor: '#1e1b4b',
          accentColor: '#fbbf24',
          status: 'APPROVED',
          brandSafetyPassed: true
        }
      ],
      historicalStats: {
        impressions: 48900,
        scans: 3820,
        redemptions: 1450,
        spend: 6400,
        roi: 4.8,
        segmentPerformance: {
          'Holiday Travellers': 62,
          'International DXB': 28,
          'Business Couples': 10
        }
      }
    },

    // 2. Worked Example Runner-up: Toy store, buy 2 get 1
    {
      campaignId: 'CAMP-TOYSTORE-B2G1',
      advertiserId: 'ADV-TOY',
      outletId: 'OUT-05',
      name: 'Voyager Kids Toy Palace - Buy 2 Get 1 Free Family Pack',
      targetZones: ['ZONE-T2-GATES-40-50', 'ZONE-T1-CONC-A'],
      targetScreens: ['SC-T2-042', 'SC-T2-043'],
      segmentWeights: {
        family: 1.0,
        holiday: 0.7,
        business: 0.1,
        international: 0.5,
        domestic: 0.5,
        luxury: 0.2
      },
      hardFilters: {
        minZonePax: 80,
        targetGates: ['42', '41']
      },
      schedule: {
        startDate: '2026-10-01',
        endDate: '2026-10-31',
        dailyStartTime: '08:00',
        dailyEndTime: '21:00'
      },
      budget: {
        totalBudget: 15000,
        spentBudget: 4200,
        dailyCap: 600,
        costPerPlay: 0.35
      },
      frequencyCapPerScreen: 6,
      triggers: {},
      status: 'ACTIVE',
      creatives: [
        {
          creativeId: 'CR-TOY-01',
          campaignId: 'CAMP-TOYSTORE-B2G1',
          advertiserId: 'ADV-TOY',
          title: 'Happy Flights: Buy 2 Get 1 Free Toys & Games!',
          subtitle: 'Keep the little explorers entertained on board',
          bodyText: 'Lego, plushies, travel puzzles and audiobooks. Instant boarding comfort for family journeys.',
          bodyTextFr: 'Jouets et jeux pour enfants: Achetez-en 2, le 3ème offert avant votre embarquement.',
          callToAction: 'Claim Voucher & Visit Pier 4 Shop',
          discountTag: 'BUY 2 GET 1 FREE',
          imageUrl: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=1200&q=80',
          themeColor: '#701a75',
          accentColor: '#f43f5e',
          status: 'APPROVED',
          brandSafetyPassed: true
        }
      ],
      historicalStats: {
        impressions: 22400,
        scans: 1940,
        redemptions: 920,
        spend: 2800,
        roi: 3.9,
        segmentPerformance: {
          'Families with Kids': 78,
          'Holiday Couples': 22
        }
      }
    },

    // 3. Worked Example Low Match: Business lounge day pass
    {
      campaignId: 'CAMP-LOUNGE-DAYPASS',
      advertiserId: 'ADV-AIR-HCZ',
      outletId: 'OUT-06',
      name: 'Halcyon Palm Executive Lounge - Walk-in Day Pass',
      targetZones: ['ZONE-T2-CONC-C', 'ZONE-T2-GATES-40-50'],
      targetScreens: ['SC-T2-042'],
      segmentWeights: {
        family: 0.1,
        holiday: 0.2,
        business: 1.0,
        international: 0.8,
        domestic: 0.2,
        luxury: 0.9
      },
      hardFilters: {
        minDwellMinutes: 45
      },
      schedule: {
        startDate: '2026-10-01',
        endDate: '2026-10-31',
        dailyStartTime: '05:00',
        dailyEndTime: '23:00'
      },
      budget: {
        totalBudget: 35000,
        spentBudget: 11200,
        dailyCap: 1500,
        costPerPlay: 0.65
      },
      frequencyCapPerScreen: 5,
      triggers: {},
      status: 'ACTIVE',
      creatives: [
        {
          creativeId: 'CR-LOUNGE-01',
          campaignId: 'CAMP-LOUNGE-DAYPASS',
          advertiserId: 'ADV-AIR-HCZ',
          title: 'Relax in Luxury: Halcyon Club Lounge Access',
          subtitle: 'Champagne bar, shower suites & high-speed quiet pods',
          bodyText: 'Upgrade your airport wait. Day pass available for all international passengers departing Concourse C.',
          bodyTextFr: 'Accès lounge exclusif: bar à champagne, douches et espaces de travail paisibles.',
          callToAction: 'Book Day Pass with 20% Off',
          discountTag: '20% OFF DAY PASS',
          imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
          themeColor: '#0f172a',
          accentColor: '#38bdf8',
          status: 'APPROVED',
          brandSafetyPassed: true
        }
      ],
      historicalStats: {
        impressions: 18200,
        scans: 680,
        redemptions: 210,
        spend: 4200,
        roi: 3.1,
        segmentPerformance: {
          'Business Class': 72,
          'Frequent Flyers': 28
        }
      }
    },

    // 4. Delay Goodwill Automation Campaign (Airline co-marketing)
    {
      campaignId: 'CAMP-AIRLINE-GOODWILL-XH',
      advertiserId: 'ADV-AIR-HCZ',
      outletId: 'OUT-04',
      name: 'Halcyon Airways Delay Hospitality Voucher',
      targetZones: ['ZONE-T2-GATES-40-50'],
      targetScreens: ['SC-T2-042', 'SC-T2-043'],
      segmentWeights: {
        family: 0.8,
        holiday: 0.9,
        business: 0.8,
        international: 1.0,
        domestic: 0.1,
        luxury: 0.5
      },
      hardFilters: {
        flightNature: 'I',
        targetGates: ['42', '41', '43']
      },
      schedule: {
        startDate: '2026-10-01',
        endDate: '2026-10-31',
        dailyStartTime: '00:00',
        dailyEndTime: '23:59'
      },
      budget: {
        totalBudget: 40000,
        spentBudget: 6200,
        dailyCap: 2000,
        costPerPlay: 0.50
      },
      frequencyCapPerScreen: 10,
      triggers: {
        delayThresholdMinutes: 30,
        boardingWindowOnly: false
      },
      status: 'ACTIVE',
      creatives: [
        {
          creativeId: 'CR-GOODWILL-01',
          campaignId: 'CAMP-AIRLINE-GOODWILL-XH',
          advertiserId: 'ADV-AIR-HCZ',
          title: 'Complimentary Refreshments from Halcyon Airways',
          subtitle: 'Apologies for your delay on Flight XH960 to Dubai',
          bodyText: 'Scan below to receive a complimentary €15 meal and drink voucher at Cloud Nine Bakery or participating dining outlets.',
          bodyTextFr: 'Bons de rafraîchissement offerts par Halcyon Airways suite au retard de votre vol.',
          callToAction: 'Scan to Claim €15 Refreshment Code',
          discountTag: 'FREE €15 REFRESHMENT',
          imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
          themeColor: '#064e3b',
          accentColor: '#34d399',
          status: 'APPROVED',
          brandSafetyPassed: true
        }
      ],
      historicalStats: {
        impressions: 12500,
        scans: 2800,
        redemptions: 2450,
        spend: 3800,
        roi: 6.2,
        segmentPerformance: {
          'Delayed International Pax': 100
        }
      }
    },

    // 5. Cloud Nine Morning Coffee & Pastry
    {
      campaignId: 'CAMP-CAFE-MORNING',
      advertiserId: 'ADV-CAFE',
      outletId: 'OUT-03',
      name: 'Cloud Nine Artisan Coffee - Grab & Go Flight Booster',
      targetZones: ['ZONE-T1-CONC-A', 'ZONE-T1-RETAIL'],
      targetScreens: ['SC-T1-001', 'SC-T1-002', 'SC-T1-003'],
      segmentWeights: {
        family: 0.4,
        holiday: 0.5,
        business: 0.9,
        international: 0.3,
        domestic: 0.9,
        luxury: 0.3
      },
      hardFilters: {
        flightNature: 'D'
      },
      schedule: {
        startDate: '2026-10-01',
        endDate: '2026-10-31',
        dailyStartTime: '05:00',
        dailyEndTime: '11:30'
      },
      budget: {
        totalBudget: 12000,
        spentBudget: 5100,
        dailyCap: 450,
        costPerPlay: 0.25
      },
      frequencyCapPerScreen: 10,
      triggers: {},
      status: 'ACTIVE',
      creatives: [
        {
          creativeId: 'CR-CAFE-01',
          campaignId: 'CAMP-CAFE-MORNING',
          advertiserId: 'ADV-CAFE',
          title: 'Artisan Roast & Fresh Croissant: €5 Morning Combo',
          subtitle: 'Freshly baked every 20 minutes right before your gate',
          bodyText: 'Single origin espresso, matcha lattes, and golden French viennoiserie. Fast lane pickup for departing travelers.',
          bodyTextFr: 'Café artisanal et viennoiserie chaude: Formule matin à 5€ à emporter en porte.',
          callToAction: 'Claim Mobile Order & Skip the Queue',
          discountTag: 'MORNING COMBO €5',
          imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
          themeColor: '#78350f',
          accentColor: '#f59e0b',
          status: 'APPROVED',
          brandSafetyPassed: true
        }
      ]
    }
  ];

  // Fill up to 25 total campaigns with 30-day historical records
  for (let i = 6; i <= 25; i++) {
    const adv = advertisers[i % advertisers.length];
    const isIntl = i % 2 === 0;
    campaigns.push({
      campaignId: `CAMP-AUTO-${i < 10 ? '0' + i : i}`,
      advertiserId: adv.advertiserId,
      outletId: outlets[i % outlets.length].outletId,
      name: `${adv.name} Promotional Rotation #${i}`,
      targetZones: isIntl ? ['ZONE-T2-DUTYFREE', 'ZONE-T2-CONC-C'] : ['ZONE-T1-RETAIL', 'ZONE-T1-CONC-A'],
      targetScreens: [],
      segmentWeights: {
        family: (i * 7 % 10) / 10,
        holiday: (i * 5 % 10) / 10,
        business: (i * 9 % 10) / 10,
        international: isIntl ? 0.9 : 0.2,
        domestic: isIntl ? 0.2 : 0.9,
        luxury: (i * 3 % 10) / 10
      },
      hardFilters: {},
      schedule: {
        startDate: '2026-10-01',
        endDate: '2026-10-31',
        dailyStartTime: '06:00',
        dailyEndTime: '22:00'
      },
      budget: {
        totalBudget: 10000 + i * 1500,
        spentBudget: 3000 + i * 400,
        dailyCap: 500 + i * 30,
        costPerPlay: 0.30 + (i % 5) * 0.05
      },
      frequencyCapPerScreen: 8,
      triggers: {},
      status: i === 24 ? 'PENDING_APPROVAL' : 'ACTIVE',
      creatives: [
        {
          creativeId: `CR-AUTO-${i}`,
          campaignId: `CAMP-AUTO-${i < 10 ? '0' + i : i}`,
          advertiserId: adv.advertiserId,
          title: `Special Departure Offer: ${adv.name}`,
          subtitle: 'Exclusive in-terminal voucher for verified passengers',
          bodyText: 'Discover travel exclusives and limited-run selections before boarding your flight.',
          bodyTextFr: 'Offre exclusive en zone sous douane avant votre vol.',
          callToAction: 'Scan to Claim Your Travel Discount',
          discountTag: `${10 + (i % 4) * 5}% OFF`,
          imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
          themeColor: '#1e293b',
          accentColor: '#38bdf8',
          status: 'APPROVED',
          brandSafetyPassed: true
        }
      ],
      historicalStats: {
        impressions: 15000 + i * 1200,
        scans: 1200 + i * 90,
        redemptions: 450 + i * 40,
        spend: 2500 + i * 200,
        roi: 3.2 + (i % 3) * 0.4,
        segmentPerformance: {
          'General Travelers': 55,
          'High Dwell Passengers': 45
        }
      }
    });
  }

  // 6. Generate Initial Promo Codes
  const promos: PromoCode[] = [
    {
      promoId: 'PR-PERFUME-15',
      code: 'PERFUME15-DXB',
      campaignId: 'CAMP-DUTYFREE-PERFUME',
      outletId: 'OUT-02',
      advertiserId: 'ADV-DUTYFREE',
      discountValue: '15% OFF',
      expiresAt: '2026-10-14T15:45:00Z',
      linkedFlightNumber: 'XH960',
      isFamilyShare: false,
      redemptionCount: 84,
      maxRedemptions: 500,
      shareableCode: 'PERFUME15-FAM'
    },
    {
      promoId: 'PR-PERFUME-15-FAM',
      code: 'PERFUME15-FAM',
      campaignId: 'CAMP-DUTYFREE-PERFUME',
      outletId: 'OUT-02',
      advertiserId: 'ADV-DUTYFREE',
      discountValue: '15% OFF (Family Pack)',
      expiresAt: '2026-10-14T15:45:00Z',
      linkedFlightNumber: 'XH960',
      isFamilyShare: true,
      parentCodeId: 'PR-PERFUME-15',
      redemptionCount: 22,
      maxRedemptions: 200
    },
    {
      promoId: 'PR-TOY-B2G1',
      code: 'TOY-B2G1-GATE42',
      campaignId: 'CAMP-TOYSTORE-B2G1',
      outletId: 'OUT-05',
      advertiserId: 'ADV-TOY',
      discountValue: 'BUY 2 GET 1 FREE',
      expiresAt: '2026-10-14T15:30:00Z',
      linkedFlightNumber: 'SKJ862',
      isFamilyShare: false,
      redemptionCount: 41,
      maxRedemptions: 300,
      shareableCode: 'TOY-B2G1-FAM'
    },
    {
      promoId: 'PR-GOODWILL-15',
      code: 'GOODWILL-XH960',
      campaignId: 'CAMP-AIRLINE-GOODWILL-XH',
      outletId: 'OUT-04',
      advertiserId: 'ADV-AIR-HCZ',
      discountValue: '€15 REFRESHMENT VOUCHER',
      expiresAt: '2026-10-14T16:00:00Z',
      linkedFlightNumber: 'XH960',
      isFamilyShare: false,
      redemptionCount: 112,
      maxRedemptions: 280
    }
  ];

  // 7. Generate Initial Incidents
  const incidents: IncidentAlert[] = [
    {
      incidentId: 'INC-2026-1042',
      timestamp: '2026-10-14T13:55:00Z',
      type: 'DELAY_SURGE',
      severity: 'HIGH',
      targetEntityId: 'XH960',
      targetEntityType: 'GATE',
      title: 'AIDX Weather Delay Notice (+45m) at Gate 42',
      description: 'Flight XH960 to DXB delayed by 45 minutes. Catchment crowd dwell increased to 52 mins. Dynamic delay boost triggered.',
      owner: 'Operations Dispatch',
      status: 'OPEN'
    },
    {
      incidentId: 'INC-2026-1043',
      timestamp: '2026-10-14T13:42:00Z',
      type: 'SCREEN_OFFLINE',
      severity: 'MEDIUM',
      targetEntityId: 'SC-T1-065',
      targetEntityType: 'SCREEN',
      title: 'Screen SC-T1-065 Offline > 5 min',
      description: 'Display telemetry heartbeat lost on T1 Promenade Totem 65. Auto-ticket raised to Hardware Maintenance.',
      owner: 'AV Engineering',
      status: 'INVESTIGATING'
    },
    {
      incidentId: 'INC-2026-1044',
      timestamp: '2026-10-14T12:10:00Z',
      type: 'FEED_LAG',
      severity: 'LOW',
      targetEntityId: 'ACRIS-STREAM',
      targetEntityType: 'FEED',
      title: 'ACRIS Passenger Queue Ingestion Latency (+1.2s)',
      description: 'Queue measurement buffer normalized. SLA within acceptable bounds (<2.0s).',
      owner: 'Data Platform Team',
      status: 'RESOLVED'
    }
  ];

  // 8. Generate ~900 Flights (Full 24-Hour Schedule at MQI)
  const flights: Flight[] = [];
  
  // Seed the worked example flights first:
  // Flight XY501 / XH960 to DXB at Gate 42 at 14:10
  flights.push({
    aodb_flight_id: '100180',
    linked_flight_id: '100181',
    direction: 'D',
    airline_iata: 'XH',
    airline_icao: 'HCZ',
    flight_number: '960',
    callsign: 'HCZ960',
    service_type: 'J',
    flight_nature: 'I',
    origin: 'MQI',
    destination: 'DXB',
    via: '',
    terminal: 'T2',
    STA_STD: '2026-10-14T14:10:00Z',
    ETA_ETD: '2026-10-14T14:55:00Z', // Delayed by 45 min
    ELDT_ETOT: '2026-10-14T15:05:00Z',
    ALDT_ATOT: '',
    AIBT_AOBT: '',
    TOBT: '2026-10-14T14:50:00Z',
    TSAT: '2026-10-14T14:55:00Z',
    stand: 'C38',
    gate: '42',
    checkin_counters: 'T2-B11-36',
    baggage_belt: '3',
    aircraft_reg: 'QH-BC',
    aircraft_type_icao: 'A359',
    seats: 283,
    pax_total: 240, // 240 pax
    status: 'DEL',
    delay_codes: '89',
    codeshares: 'XD|XH',
    handler: 'Skylark self-handling',
    last_update_utc: '2026-10-14T14:02:00Z'
  });

  // Flight ZQ88 / SKJ862 to beach destination (SCJ / Belvista) at Gate 42 catchment (180 pax)
  flights.push({
    aodb_flight_id: '100299',
    linked_flight_id: '100298',
    direction: 'D',
    airline_iata: 'XD',
    airline_icao: 'SKJ',
    flight_number: '862',
    callsign: 'SKJ862',
    service_type: 'J',
    flight_nature: 'I',
    origin: 'MQI',
    destination: 'SCJ',
    via: '',
    terminal: 'T2',
    STA_STD: '2026-10-14T14:40:00Z',
    ETA_ETD: '2026-10-14T14:40:00Z',
    ELDT_ETOT: '2026-10-14T14:50:00Z',
    ALDT_ATOT: '',
    AIBT_AOBT: '',
    TOBT: '2026-10-14T14:35:00Z',
    TSAT: '2026-10-14T14:40:00Z',
    stand: 'C39',
    gate: '41', // adjacent gate at Pier 4
    checkin_counters: 'T2-D14-53',
    baggage_belt: '5',
    aircraft_reg: 'QM-TOX',
    aircraft_type_icao: 'A20N',
    seats: 186,
    pax_total: 180, // 180 pax beach / holiday crowd
    status: 'SCH',
    delay_codes: '',
    codeshares: 'XD|XH',
    handler: 'Meridian Ground Services',
    last_update_utc: '2026-10-14T14:00:00Z'
  });

  // Generate remaining ~900 flights across the 24-hour timeline
  const baseDate = '2026-10-14';
  let flightSeq = 100300;

  for (let minute = 0; minute < 1440; minute += 3) {
    flightSeq++;
    const isArrival = flightSeq % 2 === 0;
    const airline = AIRLINES[flightSeq % AIRLINES.length];
    const isIntl = airline.nature === 'I' || flightSeq % 3 === 0;
    const destList = isIntl ? DESTINATIONS.international : DESTINATIONS.domestic;
    const destObj = destList[flightSeq % destList.length];
    const aircraft = AIRCRAFT_MODELS[flightSeq % AIRCRAFT_MODELS.length];
    const terminal = isIntl ? 'T2' : 'T1';

    const hour = Math.floor(minute / 60);
    const min = minute % 60;
    const hh = hour < 10 ? '0' + hour : String(hour);
    const mm = min < 10 ? '0' + min : String(min);
    const timeIso = `${baseDate}T${hh}:${mm}:00Z`;

    const gate = terminal === 'T2'
      ? `${40 + (flightSeq % 11)}`
      : `A${(flightSeq % 10) + 1}`;

    const isDelayed = flightSeq % 14 === 0;
    const delayMins = isDelayed ? 20 + (flightSeq % 4) * 15 : 0;
    const status = isDelayed ? 'DEL' : (minute < 840 ? (isArrival ? 'ARR' : 'DEP') : 'SCH');

    flights.push({
      aodb_flight_id: String(flightSeq),
      linked_flight_id: String(flightSeq + 1),
      direction: isArrival ? 'A' : 'D',
      airline_iata: airline.iata,
      airline_icao: airline.icao,
      flight_number: String(100 + (flightSeq % 899)),
      callsign: `${airline.icao}${100 + (flightSeq % 899)}`,
      service_type: 'J',
      flight_nature: isIntl ? 'I' : 'D',
      origin: isArrival ? destObj.code : 'MQI',
      destination: isArrival ? 'MQI' : destObj.code,
      via: '',
      terminal,
      STA_STD: timeIso,
      ETA_ETD: delayMins > 0 ? `${baseDate}T${hh}:${String((min + delayMins) % 60).padStart(2, '0')}:00Z` : timeIso,
      ELDT_ETOT: timeIso,
      ALDT_ATOT: isArrival && minute < 840 ? timeIso : '',
      AIBT_AOBT: isArrival && minute < 840 ? timeIso : '',
      TOBT: timeIso,
      TSAT: timeIso,
      stand: `C${(flightSeq % 35) + 1}`,
      gate,
      checkin_counters: `${terminal}-Z${(flightSeq % 20) + 1}`,
      baggage_belt: String((flightSeq % 14) + 1),
      aircraft_reg: `QM-${String.fromCharCode(65 + (flightSeq % 26))}${String.fromCharCode(65 + ((flightSeq * 3) % 26))}`,
      aircraft_type_icao: aircraft.type,
      seats: aircraft.seats,
      pax_total: Math.floor(aircraft.seats * (0.75 + (flightSeq % 20) * 0.01)),
      status,
      delay_codes: isDelayed ? '89' : '',
      codeshares: '',
      handler: airline.handler,
      last_update_utc: timeIso
    });
  }

  return {
    flights,
    zones,
    screens,
    advertisers,
    outlets,
    campaigns,
    promos,
    incidents
  };
}
