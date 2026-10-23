export type Role = 'ADMIN' | 'RETAILER' | 'MEDIA_MANAGER' | 'AIRLINE' | 'SCREEN_SIM';

export interface Flight {
  aodb_flight_id: string;
  flight_number: string;
  airline_iata: string;
  airline_icao: string;
  origin: string;
  destination: string;
  terminal: 'T1' | 'T2';
  gate: string;
  stand: string;
  STA_STD: string;
  ETA_ETD: string;
  status: string;
  seats: number;
  pax_total: number;
  delay_codes: string;
  codeshares: string;
}

export interface Zone {
  zoneId: string;
  terminal: 'T1' | 'T2';
  concourse: string;
  name: string;
  type: string;
  gatesNearby: string[];
  currentPaxEstimate: number;
  queueWaitMinutes: number;
  queueDensity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface Screen {
  screenId: string;
  name: string;
  terminal: 'T1' | 'T2';
  zoneId: string;
  concourse: string;
  nearestGates: string[];
  orientation: '9:16' | '16:9';
  resolution: string;
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  lastHeartbeat: string;
  latencyMs: number;
  currentCreativeId: string | null;
  currentCampaignId: string | null;
  currentPromoCode: string | null;
}

export interface Outlet {
  outletId: string;
  advertiserId: string;
  name: string;
  terminal: 'T1' | 'T2';
  zoneId: string;
  category: string;
  stockAvailable: boolean;
  currentRevenue: number;
  todayImpressions: number;
  todayScans: number;
  todayRedemptions: number;
}

export interface Creative {
  creativeId: string;
  campaignId: string;
  advertiserId: string;
  title: string;
  subtitle: string;
  bodyText: string;
  bodyTextFr: string;
  callToAction: string;
  discountTag: string;
  imageUrl: string;
  themeColor: string;
  accentColor: string;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  brandSafetyPassed: boolean;
}

export interface Campaign {
  campaignId: string;
  advertiserId: string;
  outletId: string;
  name: string;
  targetZones: string[];
  targetScreens: string[];
  segmentWeights: {
    family: number;
    holiday: number;
    business: number;
    international: number;
    domestic: number;
    luxury: number;
  };
  hardFilters: Record<string, any>;
  schedule: {
    startDate: string;
    endDate: string;
    dailyStartTime: string;
    dailyEndTime: string;
  };
  budget: {
    totalBudget: number;
    spentBudget: number;
    dailyCap: number;
    costPerPlay: number;
  };
  frequencyCapPerScreen: number;
  triggers: Record<string, any>;
  status: 'ACTIVE' | 'PAUSED' | 'PENDING_APPROVAL' | 'ENDED';
  creatives: Creative[];
  historicalStats?: {
    impressions: number;
    scans: number;
    redemptions: number;
    spend: number;
    roi: number;
    segmentPerformance: Record<string, number>;
  };
}

export interface PromoCode {
  promoId: string;
  code: string;
  campaignId: string;
  outletId: string;
  advertiserId: string;
  discountValue: string;
  expiresAt: string;
  linkedFlightNumber: string;
  isFamilyShare: boolean;
  parentCodeId?: string;
  redemptionCount: number;
  maxRedemptions: number;
  shareableCode?: string;
}

export interface DecisionCandidate {
  campaignId: string;
  campaignName: string;
  advertiserName: string;
  creativeId: string;
  audienceMatchScore: number;
  boostMultiplier: number;
  boostReason: string;
  finalScore: number;
  passedHardFilters: boolean;
  filterFailureReason?: string;
  businessRuleStatus: string;
}

export interface DecisionAudit {
  decisionId: string;
  timestamp: string;
  screenId: string;
  zoneId: string;
  simulatedTime: string;
  crowdProfileSummary: {
    paxCount: number;
    medianDwell: number;
    internationalShare: number;
    holidayShare: number;
    familyShare: number;
    businessShare: number;
  };
  candidateRankings: DecisionCandidate[];
  winningCampaignId: string;
  winningCreativeId: string;
  winningReason: string;
  evidenceTrail: {
    source: string;
    timestamp: string;
    freshnessSeconds: number;
    dataPoints: string[];
  }[];
  antiHallucinationVerified: boolean;
  fallbackUsed: boolean;
}

export interface IncidentAlert {
  incidentId: string;
  timestamp: string;
  type: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  targetEntityId: string;
  targetEntityType: string;
  title: string;
  description: string;
  owner: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
}

export interface SimulationState {
  simulatedTime: string;
  isPlaying: boolean;
  speed: number;
}
