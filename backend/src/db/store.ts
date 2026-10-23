import {
  Flight,
  Screen,
  Outlet,
  Advertiser,
  Campaign,
  Zone,
  PromoCode,
  IncidentAlert,
  DecisionAudit,
  RuleEngineSettings,
  FeedHealthStatus
} from '../models/types.js';
import { generateSeedData } from './seedData.js';

export class DataStore {
  private static instance: DataStore;

  private flights: Map<string, Flight> = new Map();
  private zones: Map<string, Zone> = new Map();
  private screens: Map<string, Screen> = new Map();
  private advertisers: Map<string, Advertiser> = new Map();
  private outlets: Map<string, Outlet> = new Map();
  private campaigns: Map<string, Campaign> = new Map();
  private promos: Map<string, PromoCode> = new Map();
  private incidents: IncidentAlert[] = [];
  private decisions: DecisionAudit[] = [];

  private ruleEngineSettings: RuleEngineSettings = {
    globalWeights: {
      audienceMatch: 0.6,
      bidPrice: 0.25,
      recencyBoost: 0.15
    },
    explorationRate: 0.05,
    frequencyCapMinutes: 10,
    competitorSeparationSlots: 3,
    segmentModelVersion: 'v2.4-meridian-acdmd',
    auditLoggingEnabled: true
  };

  private feedHealth: Map<string, FeedHealthStatus> = new Map([
    ['AODB', { source: 'AODB', status: 'HEALTHY', messagesPerMinute: 42, lastMessageUtc: new Date().toISOString(), adapterInUse: 'AodbCsvAdapter', totalMessagesProcessed: 320 }],
    ['AIDX', { source: 'AIDX', status: 'HEALTHY', messagesPerMinute: 18, lastMessageUtc: new Date().toISOString(), adapterInUse: 'AidxXmlAdapter', totalMessagesProcessed: 184 }],
    ['ACRIS', { source: 'ACRIS', status: 'HEALTHY', messagesPerMinute: 65, lastMessageUtc: new Date().toISOString(), adapterInUse: 'AcrisNgsiLdAdapter', totalMessagesProcessed: 890 }]
  ]);

  private listeners: ((event: { type: string; payload: any }) => void)[] = [];

  private constructor() {
    this.seed();
  }

  public static getInstance(): DataStore {
    if (!DataStore.instance) {
      DataStore.instance = new DataStore();
    }
    return DataStore.instance;
  }

  public seed(): void {
    const data = generateSeedData();
    this.flights.clear();
    for (const f of data.flights) this.flights.set(f.aodb_flight_id, f);

    this.zones.clear();
    for (const z of data.zones) this.zones.set(z.zoneId, z);

    this.screens.clear();
    for (const s of data.screens) this.screens.set(s.screenId, s);

    this.advertisers.clear();
    for (const a of data.advertisers) this.advertisers.set(a.advertiserId, a);

    this.outlets.clear();
    for (const o of data.outlets) this.outlets.set(o.outletId, o);

    this.campaigns.clear();
    for (const c of data.campaigns) this.campaigns.set(c.campaignId, c);

    this.promos.clear();
    for (const p of data.promos) this.promos.set(p.code, p);

    this.incidents = [...data.incidents];
    this.decisions = [];
  }

  public subscribe(callback: (event: { type: string; payload: any }) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const idx = this.listeners.indexOf(callback);
      if (idx >= 0) this.listeners.splice(idx, 1);
    };
  }

  public notify(type: string, payload: any): void {
    for (const listener of this.listeners) {
      try {
        listener({ type, payload });
      } catch (e) {
        console.error('Error delivering datastore notification:', e);
      }
    }
  }

  // --- Flights ---
  public getFlights(): Flight[] {
    return Array.from(this.flights.values());
  }

  public getFlightById(id: string): Flight | undefined {
    return this.flights.get(id);
  }

  public updateFlight(id: string, patch: Partial<Flight>): Flight | undefined {
    const flight = this.flights.get(id);
    if (!flight) return undefined;
    const updated = { ...flight, ...patch, last_update_utc: new Date().toISOString() };
    this.flights.set(id, updated);
    this.notify('FLIGHT_UPDATED', updated);
    return updated;
  }

  // --- Screens ---
  public getScreens(): Screen[] {
    return Array.from(this.screens.values());
  }

  public getScreenById(id: string): Screen | undefined {
    return this.screens.get(id);
  }

  public updateScreen(id: string, patch: Partial<Screen>): Screen | undefined {
    const screen = this.screens.get(id);
    if (!screen) return undefined;
    const updated = { ...screen, ...patch };
    this.screens.set(id, updated);
    this.notify('SCREEN_UPDATED', updated);
    return updated;
  }

  // --- Zones ---
  public getZones(): Zone[] {
    return Array.from(this.zones.values());
  }

  public getZoneById(id: string): Zone | undefined {
    return this.zones.get(id);
  }

  // --- Outlets ---
  public getOutlets(): Outlet[] {
    return Array.from(this.outlets.values());
  }

  public getOutletById(id: string): Outlet | undefined {
    return this.outlets.get(id);
  }

  public updateOutlet(id: string, patch: Partial<Outlet>): Outlet | undefined {
    const outlet = this.outlets.get(id);
    if (!outlet) return undefined;
    const updated = { ...outlet, ...patch };
    this.outlets.set(id, updated);
    this.notify('OUTLET_UPDATED', updated);
    return updated;
  }

  // --- Advertisers ---
  public getAdvertisers(): Advertiser[] {
    return Array.from(this.advertisers.values());
  }

  // --- Campaigns ---
  public getCampaigns(): Campaign[] {
    return Array.from(this.campaigns.values());
  }

  public getCampaignById(id: string): Campaign | undefined {
    return this.campaigns.get(id);
  }

  public saveCampaign(campaign: Campaign): Campaign {
    this.campaigns.set(campaign.campaignId, campaign);
    this.notify('CAMPAIGN_UPDATED', campaign);
    return campaign;
  }

  public deleteCampaign(id: string): boolean {
    const deleted = this.campaigns.delete(id);
    if (deleted) this.notify('CAMPAIGN_DELETED', { campaignId: id });
    return deleted;
  }

  // --- Promo Codes ---
  public getPromos(): PromoCode[] {
    return Array.from(this.promos.values());
  }

  public getPromoByCode(code: string): PromoCode | undefined {
    return this.promos.get(code);
  }

  public savePromo(promo: PromoCode): PromoCode {
    this.promos.set(promo.code, promo);
    this.notify('PROMO_SAVED', promo);
    return promo;
  }

  public redeemPromo(code: string): { success: boolean; promo?: PromoCode; message: string; outlet?: Outlet } {
    const promo = this.promos.get(code);
    if (!promo) {
      return { success: false, message: 'Promo code not found or invalid' };
    }
    if (promo.redemptionCount >= promo.maxRedemptions) {
      return { success: false, message: 'Promo code redemption quota exceeded' };
    }

    promo.redemptionCount += 1;
    this.promos.set(code, promo);

    // Update Outlet metrics
    let outlet = this.outlets.get(promo.outletId);
    if (outlet) {
      outlet = {
        ...outlet,
        todayRedemptions: outlet.todayRedemptions + 1,
        currentRevenue: outlet.currentRevenue + 45.0 // Average attributed basket spend
      };
      this.outlets.set(outlet.outletId, outlet);
      this.notify('OUTLET_UPDATED', outlet);
    }

    // Update Campaign metrics
    const campaign = this.campaigns.get(promo.campaignId);
    if (campaign && campaign.historicalStats) {
      campaign.historicalStats.redemptions += 1;
      this.campaigns.set(campaign.campaignId, campaign);
      this.notify('CAMPAIGN_UPDATED', campaign);
    }

    this.notify('PROMO_REDEEMED', { code, promo, outlet });
    return { success: true, promo, message: 'Promo code successfully redeemed!', outlet };
  }

  // --- Decisions Audit Trail ---
  public recordDecision(decision: DecisionAudit): void {
    this.decisions.unshift(decision);
    if (this.decisions.length > 500) {
      this.decisions.pop();
    }
    this.notify('DECISION_RECORDED', decision);
  }

  public getDecisions(limit = 100): DecisionAudit[] {
    return this.decisions.slice(0, limit);
  }

  // --- Incidents ---
  public getIncidents(): IncidentAlert[] {
    return [...this.incidents];
  }

  public addIncident(incident: IncidentAlert): IncidentAlert {
    this.incidents.unshift(incident);
    this.notify('INCIDENT_RAISED', incident);
    return incident;
  }

  public updateIncident(id: string, patch: Partial<IncidentAlert>): IncidentAlert | undefined {
    const idx = this.incidents.findIndex(i => i.incidentId === id);
    if (idx < 0) return undefined;
    this.incidents[idx] = { ...this.incidents[idx], ...patch };
    this.notify('INCIDENT_UPDATED', this.incidents[idx]);
    return this.incidents[idx];
  }

  // --- Rule Engine Settings ---
  public getSettings(): RuleEngineSettings {
    return { ...this.ruleEngineSettings };
  }

  public updateSettings(patch: Partial<RuleEngineSettings>): RuleEngineSettings {
    this.ruleEngineSettings = { ...this.ruleEngineSettings, ...patch };
    this.notify('SETTINGS_UPDATED', this.ruleEngineSettings);
    return this.ruleEngineSettings;
  }

  // --- Feed Health ---
  public getFeedHealth(): FeedHealthStatus[] {
    return Array.from(this.feedHealth.values());
  }

  public recordFeedHeartbeat(source: 'AODB' | 'AIDX' | 'ACRIS', status: 'HEALTHY' | 'DEGRADED' = 'HEALTHY'): void {
    const current = this.feedHealth.get(source);
    if (current) {
      current.status = status;
      current.lastMessageUtc = new Date().toISOString();
      current.totalMessagesProcessed += 1;
      this.feedHealth.set(source, current);
      this.notify('FEED_HEALTH_UPDATED', current);
    }
  }
}
