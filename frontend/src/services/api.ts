const BASE_URL = '/api';

export const api = {
  // --- Admin ---
  async getAdminOverview() {
    const res = await fetch(`${BASE_URL}/admin/overview`);
    return res.json();
  },
  async getTerminalMap() {
    const res = await fetch(`${BASE_URL}/admin/map`);
    return res.json();
  },
  async getIncidents() {
    const res = await fetch(`${BASE_URL}/admin/incidents`);
    return res.json();
  },
  async resolveIncident(id: string) {
    const res = await fetch(`${BASE_URL}/admin/incidents/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'RESOLVED' })
    });
    return res.json();
  },
  async getMasterData() {
    const res = await fetch(`${BASE_URL}/admin/master-data`);
    return res.json();
  },
  async createScreen(screenData: any) {
    const res = await fetch(`${BASE_URL}/admin/screens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(screenData)
    });
    return res.json();
  },
  async getFeedHealth() {
    const res = await fetch(`${BASE_URL}/admin/feed-health`);
    return res.json();
  },
  async getSettings() {
    const res = await fetch(`${BASE_URL}/admin/settings`);
    return res.json();
  },
  async updateSettings(settings: any) {
    const res = await fetch(`${BASE_URL}/admin/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    return res.json();
  },
  async getDecisions(limit = 50) {
    const res = await fetch(`${BASE_URL}/admin/decisions?limit=${limit}`);
    return res.json();
  },
  getDecisionsExportUrl() {
    return `${BASE_URL}/admin/decisions/export`;
  },

  // --- Retailer ---
  async getRetailerDashboard(outletId: string) {
    const res = await fetch(`${BASE_URL}/retailer/${outletId}/dashboard`);
    return res.json();
  },
  async getPassengerFlow(outletId: string) {
    const res = await fetch(`${BASE_URL}/retailer/${outletId}/passenger-flow`);
    return res.json();
  },
  async getRetailerCampaigns(outletId: string) {
    const res = await fetch(`${BASE_URL}/retailer/${outletId}/campaigns`);
    return res.json();
  },
  async previewCampaign(previewData: any) {
    const res = await fetch(`${BASE_URL}/retailer/campaigns/preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(previewData)
    });
    return res.json();
  },
  async createCampaign(campaignData: any) {
    const res = await fetch(`${BASE_URL}/retailer/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(campaignData)
    });
    return res.json();
  },
  async duplicateCampaign(id: string) {
    const res = await fetch(`${BASE_URL}/retailer/campaigns/${id}/duplicate`, {
      method: 'POST'
    });
    return res.json();
  },
  async setStockStatus(outletId: string, stockAvailable: boolean) {
    const res = await fetch(`${BASE_URL}/retailer/${outletId}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stockAvailable })
    });
    return res.json();
  },
  async getPromos() {
    const res = await fetch(`${BASE_URL}/retailer/promos`);
    return res.json();
  },
  async sharePromoWithFamily(parentCode: string) {
    const res = await fetch(`${BASE_URL}/retailer/promos/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parentCode })
    });
    return res.json();
  },
  async redeemPromo(code: string) {
    const res = await fetch(`${BASE_URL}/retailer/redeem`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    return res.json();
  },

  // --- Media Manager ---
  async getInventoryCalendar() {
    const res = await fetch(`${BASE_URL}/media-manager/calendar`);
    return res.json();
  },
  async getYieldPricing() {
    const res = await fetch(`${BASE_URL}/media-manager/yield`);
    return res.json();
  },
  async getApprovals() {
    const res = await fetch(`${BASE_URL}/media-manager/approvals`);
    return res.json();
  },
  async reviewApproval(id: string, action: 'APPROVE' | 'REJECT') {
    const res = await fetch(`${BASE_URL}/media-manager/approvals/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });
    return res.json();
  },
  async getAdvertisers() {
    const res = await fetch(`${BASE_URL}/media-manager/advertisers`);
    return res.json();
  },
  async getHeatmap() {
    const res = await fetch(`${BASE_URL}/media-manager/heatmap`);
    return res.json();
  },
  async getConflictView(screenId: string) {
    const res = await fetch(`${BASE_URL}/media-manager/conflict?screenId=${screenId}`);
    return res.json();
  },
  async overrideScreen(screenId: string, campaignId: string, reason: string) {
    const res = await fetch(`${BASE_URL}/media-manager/override`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ screenId, campaignId, reason })
    });
    return res.json();
  },
  async createPackage(packageData: any) {
    const res = await fetch(`${BASE_URL}/media-manager/packages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(packageData)
    });
    return res.json();
  },
  async getAdvertiserReport(campaignId: string) {
    const res = await fetch(`${BASE_URL}/media-manager/report/${campaignId}`);
    return res.json();
  },

  // --- Airline ---
  async getAirlineFlights(iata: string) {
    const res = await fetch(`${BASE_URL}/airline/${iata}/flights`);
    return res.json();
  },
  async scheduleGateMessage(data: any) {
    const res = await fetch(`${BASE_URL}/airline/gate-messaging`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async triggerGoodwillAutomation(data: any) {
    const res = await fetch(`${BASE_URL}/airline/goodwill-automation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  async getAirlineCrowdProfile(iata: string) {
    const res = await fetch(`${BASE_URL}/airline/${iata}/crowd-profile`);
    return res.json();
  },
  async getMarketplaceDeals(iata: string) {
    const res = await fetch(`${BASE_URL}/airline/${iata}/marketplace`);
    return res.json();
  },
  async acceptMarketplaceDeal(proposalId: string) {
    const res = await fetch(`${BASE_URL}/airline/marketplace/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proposalId })
    });
    return res.json();
  },
  async getAirlinePerformance(iata: string) {
    const res = await fetch(`${BASE_URL}/airline/${iata}/performance`);
    return res.json();
  },

  // --- Screen Simulator & Claim ---
  async getScreenPlaylist(screenId: string) {
    const res = await fetch(`${BASE_URL}/screen/${screenId}/playlist`);
    return res.json();
  },
  async getWhyThisAd(screenId: string) {
    const res = await fetch(`${BASE_URL}/screen/${screenId}/why-this-ad`);
    return res.json();
  },
  async getPromoClaimData(code: string) {
    const res = await fetch(`${BASE_URL}/screen/claim/${code}`);
    return res.json();
  },

  // --- Simulation Control ---
  async getSimulationState() {
    const res = await fetch(`${BASE_URL}/simulation/state`);
    return res.json();
  },
  async setPlayState(playing: boolean) {
    const res = await fetch(`${BASE_URL}/simulation/play`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playing })
    });
    return res.json();
  },
  async setSimulationSpeed(speed: number) {
    const res = await fetch(`${BASE_URL}/simulation/speed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ speed })
    });
    return res.json();
  },
  async jumpSimulationTime(timeIso: string) {
    const res = await fetch(`${BASE_URL}/simulation/jump`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timeIso })
    });
    return res.json();
  },
  async injectDelay(flightNumber = 'XH960', delayMinutes = 45) {
    const res = await fetch(`${BASE_URL}/simulation/inject/delay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flightNumber, delayMinutes })
    });
    return res.json();
  },
  async injectGateChange(flightNumber = 'SKJ862', newGate = '42') {
    const res = await fetch(`${BASE_URL}/simulation/inject/gate-change`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flightNumber, newGate })
    });
    return res.json();
  },
  async injectScreenOffline(screenId = 'SC-T2-042') {
    const res = await fetch(`${BASE_URL}/simulation/inject/screen-offline`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ screenId })
    });
    return res.json();
  },
  async resetSimulation() {
    const res = await fetch(`${BASE_URL}/simulation/reset`, { method: 'POST' });
    return res.json();
  },

  // --- GenAI ---
  async generateCreative(brief: string, audience?: string, discount?: string) {
    const res = await fetch(`${BASE_URL}/ai/generate-creative`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ brief, audience, discount })
    });
    return res.json();
  },
  async recommendSlots(campaignId: string) {
    const res = await fetch(`${BASE_URL}/ai/recommend-slots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignId })
    });
    return res.json();
  }
};
