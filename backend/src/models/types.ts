export type FlightDirection = 'A' | 'D';
export type FlightNature = 'D' | 'I';
export type FlightStatus = 'SCH' | 'ARR' | 'DEP' | 'CNL' | 'DEL' | 'BRD' | 'GATE' | 'AIR';

export interface Airline {
  iata: string;
  icao: string;
  name: string;
  nature: FlightNature;
  handler: string;
}

export interface Flight {
  aodb_flight_id: string;
  linked_flight_id: string;
  direction: FlightDirection;
  airline_iata: string;
  airline_icao: string;
  flight_number: string;
  callsign: string;
  service_type: string;
  flight_nature: FlightNature;
  origin: string;
  destination: string;
  via: string;
  terminal: 'T1' | 'T2';
  STA_STD: string;
  ETA_ETD: string;
  ELDT_ETOT: string;
  ALDT_ATOT: string;
  AIBT_AOBT: string;
  TOBT: string;
  TSAT: string;
  stand: string;
  gate: string;
  checkin_counters: string;
  baggage_belt: string;
  aircraft_reg: string;
  aircraft_type_icao: string;
  seats: number;
  pax_total: number;
  status: FlightStatus;
  delay_codes: string;
  codeshares: string;
  handler: string;
  last_update_utc: string;
}

export interface FlightEvent {
  eventId: string;
  source: 'AODB' | 'AIDX' | 'ACRIS' | 'MANUAL_INJECT';
  timestamp: string;
  flightId: string;
  flightNumber: string;
  airlineIata: string;
  eventType: 'DELAY' | 'GATE_CHANGE' | 'STATUS_CHANGE' | 'BOARDING' | 'CANCEL';
  oldValue: string;
  newValue: string;
  delayMinutes: number;
  reason: string;
}

export interface Zone {
  zoneId: string;
  terminal: 'T1' | 'T2';
  concourse: string;
  name: string;
  type: 'GATE_AREA' | 'CHECKIN' | 'SECURITY' | 'DUTY_FREE' | 'RETAIL_CENTRAL' | 'FOOD_COURT' | 'BAGGAGE_CLAIM' | 'LOUNGE_AREA';
  gatesNearby: string[];
  currentPaxEstimate: number;
  queueWaitMinutes: number;
  queueDensity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface ZonePresence {
  zoneId: string;
  windowStart: string;
  windowEnd: string;
  paxCount: number;
  dwellMinutes: number;
  domesticShare: number;
  internationalShare: number;
  topDestinations: { destination: string; city: string; share: number; pax: number }[];
  topNationalities: { nationality: string; language: string; share: number }[];
  tripPurposes: {
    business: number;
    holiday: number;
    family: number;
    visiting_family: number;
    student: number;
    religious: number;
  };
  partyTypes: {
    solo: number;
    couple: number;
    family: number;
    group: number;
  };
  ageBands: {
    under12: number;
    age12_17: number;
    age18_24: number;
    age25_34: number;
    age35_44: number;
    age45_54: number;
    age55_plus: number;
  };
  genderSplit: {
    female: number;
    male: number;
  };
  cabinMix: {
    economy: number;
    premium_economy: number;
    business: number;
    frequent_flyer_share: number;
  };
  nearbyFlights: {
    flightNumber: string;
    airlineIata: string;
    destination: string;
    gate: string;
    departureTime: string;
    status: FlightStatus;
    delayMinutes: number;
    pax: number;
  }[];
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

export interface Advertiser {
  advertiserId: string;
  name: string;
  category: 'DUTY_FREE' | 'FB' | 'AIRLINE' | 'LUXURY' | 'ELECTRONICS' | 'TRAVEL_SERVICES' | 'TOYS' | 'LOUNGE';
  logoUrl: string;
  totalSpend: number;
  activeCampaignsCount: number;
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
  hardFilters: {
    flightNature?: 'D' | 'I' | 'ANY';
    destinationRegion?: string[];
    minDwellMinutes?: number;
    minZonePax?: number;
    targetGates?: string[];
    targetFlightNumbers?: string[];
  };
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
  triggers: {
    delayThresholdMinutes?: number;
    targetGates?: string[];
    boardingWindowOnly?: boolean;
    holidayOnly?: boolean;
  };
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
  businessRuleStatus: 'PASSED' | 'COMPETITOR_SEPARATION' | 'FREQUENCY_CAPPED' | 'BUDGET_EXHAUSTED' | 'OUT_OF_STOCK';
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
  type: 'SCREEN_OFFLINE' | 'FEED_LAG' | 'FAILED_CREATIVE' | 'DELAY_SURGE' | 'SAFETY_FLAG';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  targetEntityId: string;
  targetEntityType: 'SCREEN' | 'FEED' | 'CAMPAIGN' | 'GATE';
  title: string;
  description: string;
  owner: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
}

export interface RuleEngineSettings {
  globalWeights: {
    audienceMatch: number;
    bidPrice: number;
    recencyBoost: number;
  };
  explorationRate: number; // e.g. 0.05
  frequencyCapMinutes: number;
  competitorSeparationSlots: number;
  segmentModelVersion: string;
  auditLoggingEnabled: boolean;
}

export interface FeedHealthStatus {
  source: 'AODB' | 'AIDX' | 'ACRIS';
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  messagesPerMinute: number;
  lastMessageUtc: string;
  adapterInUse: string;
  totalMessagesProcessed: number;
}
