import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { socket } from '../services/socket';
import { Screen, Zone, IncidentAlert } from '../types';
import { TerminalMap } from '../components/Map/TerminalMap';
import { Language, translations } from '../i18n/translations';
import {
  Tv,
  Activity,
  Euro,
  Radio,
  Clock,
  Layers,
  AlertTriangle,
  CheckCircle,
  Settings,
  Download,
  PlusCircle,
  Database,
  Cpu,
  RefreshCw
} from 'lucide-react';

interface AdminDashboardProps {
  lang: Language;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ lang }) => {
  const t = translations[lang];
  const [overview, setOverview] = useState<any>(null);
  const [screens, setScreens] = useState<Screen[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [incidents, setIncidents] = useState<IncidentAlert[]>([]);
  const [feedHealth, setFeedHealth] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'MAP' | 'INCIDENTS' | 'DATA' | 'FEEDS' | 'SETTINGS'>('MAP');

  // New screen form state
  const [newScreenName, setNewScreenName] = useState('');
  const [newScreenTerminal, setNewScreenTerminal] = useState<'T1' | 'T2'>('T2');
  const [newScreenGate, setNewScreenGate] = useState('44');

  const loadData = async () => {
    try {
      const [ov, mapData, incs, feeds, sets] = await Promise.all([
        api.getAdminOverview(),
        api.getTerminalMap(),
        api.getIncidents(),
        api.getFeedHealth(),
        api.getSettings()
      ]);
      setOverview(ov);
      setScreens([...mapData.terminal1.screens, ...mapData.terminal2.screens]);
      setZones([...mapData.terminal1.zones, ...mapData.terminal2.zones]);
      setIncidents(incs);
      setFeedHealth(feeds);
      setSettings(sets);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();

    const unsub = socket.subscribe((event) => {
      if (['SCREEN_UPDATED', 'INCIDENT_RAISED', 'INCIDENT_UPDATED', 'FEED_HEALTH_UPDATED', 'CAUSE_AND_EFFECT_TRIGGERED'].includes(event.type)) {
        loadData();
      }
    });

    return unsub;
  }, []);

  const handleResolveIncident = async (id: string) => {
    try {
      await api.resolveIncident(id);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateScreen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScreenName) return;
    try {
      const screenId = `SC-${newScreenTerminal}-${Math.floor(100 + Math.random() * 899)}`;
      await api.createScreen({
        screenId,
        name: newScreenName,
        terminal: newScreenTerminal,
        nearestGates: [newScreenGate],
        zoneId: newScreenTerminal === 'T2' ? 'ZONE-T2-GATES-40-50' : 'ZONE-T1-CONC-A',
        orientation: '9:16'
      });
      setNewScreenName('');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const kpis = overview?.kpis || {
    screensOnlinePercent: 97,
    onlineScreens: 178,
    totalScreens: 182,
    adPlaysToday: 14280,
    impressionsToday: 182400,
    revenueTodayEur: 184200,
    activeCampaigns: 24,
    averageScreenLatencyMs: 16.4,
    openIncidents: 2
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Screens Online */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>{t.admin.kpiScreensOnline}</span>
            <Tv className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {kpis.screensOnlinePercent}%
          </div>
          <div className="text-[11px] text-emerald-400 font-medium mt-1">
            {kpis.onlineScreens} / {kpis.totalScreens} online
          </div>
        </div>

        {/* Ad Plays Today */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>{t.admin.kpiAdPlays}</span>
            <Activity className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {kpis.adPlaysToday.toLocaleString()}
          </div>
          <div className="text-[11px] text-sky-400 font-medium mt-1">
            +18% vs yesterday
          </div>
        </div>

        {/* Impressions Today */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>{t.admin.kpiImpressions}</span>
            <Radio className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {kpis.impressionsToday.toLocaleString()}
          </div>
          <div className="text-[11px] text-indigo-400 font-medium mt-1">
            Targeting 900+ flights
          </div>
        </div>

        {/* Revenue Today */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>{t.admin.kpiRevenue}</span>
            <Euro className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">
            €{kpis.revenueTodayEur.toLocaleString()}
          </div>
          <div className="text-[11px] text-amber-400 font-medium mt-1">
            Configurable currency (EUR)
          </div>
        </div>

        {/* Active Campaigns */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>{t.admin.kpiActiveCampaigns}</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {kpis.activeCampaigns}
          </div>
          <div className="text-[11px] text-purple-400 font-medium mt-1">
            40 outlets / 10 airlines
          </div>
        </div>

        {/* Telemetry Latency */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>{t.admin.kpiAvgLatency}</span>
            <Clock className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {kpis.averageScreenLatencyMs}ms
          </div>
          <div className="text-[11px] text-teal-400 font-medium mt-1">
            p95 SLA: &lt; 50ms
          </div>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center space-x-2">
          {[
            { id: 'MAP', label: t.admin.networkOverview, icon: Radio },
            { id: 'INCIDENTS', label: `${t.admin.incidents} (${incidents.filter(i => i.status === 'OPEN').length})`, icon: AlertTriangle },
            { id: 'DATA', label: t.admin.masterData, icon: Database },
            { id: 'FEEDS', label: t.admin.feedHealth, icon: Cpu },
            { id: 'SETTINGS', label: t.admin.ruleEngine, icon: Settings }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-sky-600 text-white shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <a
          href={api.getDecisionsExportUrl()}
          download
          className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-sky-400" />
          <span>{t.admin.exportAudit}</span>
        </a>
      </div>

      {/* Tab 1: Terminal Map & Passenger Presence Heatmap */}
      {activeTab === 'MAP' && (
        <div className="space-y-4">
          <TerminalMap screens={screens} zones={zones} />
        </div>
      )}

      {/* Tab 2: Incident & Bug Tracker */}
      {activeTab === 'INCIDENTS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Automated Incident & Fault Detection Stream</span>
            </h3>
            <button onClick={loadData} className="text-xs text-slate-400 hover:text-white flex items-center space-x-1">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          <div className="divide-y divide-slate-800">
            {incidents.map((inc) => (
              <div key={inc.incidentId} className="py-3 flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      inc.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                      inc.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' :
                      inc.severity === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                      'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                    }`}>
                      {inc.severity}
                    </span>
                    <span className="font-semibold text-xs text-white">{inc.title}</span>
                    <span className="text-[11px] text-slate-500">ID: {inc.incidentId}</span>
                  </div>
                  <p className="text-xs text-slate-400">{inc.description}</p>
                  <div className="text-[11px] text-slate-500">
                    Owner: <strong className="text-slate-300">{inc.owner}</strong> • Logged: {new Date(inc.timestamp).toLocaleTimeString()}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    inc.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-400' :
                    inc.status === 'INVESTIGATING' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-rose-500/20 text-rose-400'
                  }`}>
                    {inc.status}
                  </span>
                  {inc.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleResolveIncident(inc.incidentId)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1 rounded-lg transition-colors"
                    >
                      {t.admin.resolve}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Master Data Management (Screens & Inventory CRUD) */}
      {activeTab === 'DATA' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Screen Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <PlusCircle className="w-4 h-4 text-sky-400" />
              <span>Onboard New Physical Display Screen</span>
            </h3>

            <form onSubmit={handleCreateScreen} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Display Screen Name</label>
                <input
                  type="text"
                  value={newScreenName}
                  onChange={(e) => setNewScreenName(e.target.value)}
                  placeholder="e.g., Gate 44 Retail Totem B"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Terminal</label>
                  <select
                    value={newScreenTerminal}
                    onChange={(e) => setNewScreenTerminal(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="T1">Terminal 1 (Domestic)</option>
                    <option value="T2">Terminal 2 (International)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Nearest Gate</label>
                  <input
                    type="text"
                    value={newScreenGate}
                    onChange={(e) => setNewScreenGate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2 rounded-lg transition-colors mt-2"
              >
                Onboard Screen to Media Fleet
              </button>
            </form>
          </div>

          {/* Screens Fleet List */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <h3 className="text-sm font-bold text-white mb-3">
              Screen Network Fleet Inventory ({screens.length} Screens Registered)
            </h3>
            <div className="max-h-96 overflow-y-auto divide-y divide-slate-800 text-xs">
              {screens.slice(0, 25).map(s => (
                <div key={s.screenId} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white">{s.screenId}</span> - {s.name}
                    <div className="text-[11px] text-slate-500">
                      {s.terminal} • {s.concourse} • Gates: {s.nearestGates.join(', ')} • {s.orientation}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] text-slate-400">{s.latencyMs}ms</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      s.status === 'ONLINE' ? 'bg-emerald-500/20 text-emerald-400' :
                      s.status === 'DEGRADED' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-rose-500/20 text-rose-400'
                    }`}>
                      {s.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Data Feed Health & Adapters */}
      {activeTab === 'FEEDS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {feedHealth.map((feed) => (
            <div key={feed.source} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">{feed.source} Ingestion Feed</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {feed.status}
                </span>
              </div>
              <div className="space-y-2 text-xs text-slate-300">
                <div><span className="text-slate-500">Adapter Class:</span> <code className="text-sky-400">{feed.adapterInUse}</code></div>
                <div><span className="text-slate-500">Throughput:</span> {feed.messagesPerMinute} msg/min</div>
                <div><span className="text-slate-500">Total Ingested:</span> {feed.totalMessagesProcessed} entities</div>
                <div><span className="text-slate-500">Last Telemetry:</span> {new Date(feed.lastMessageUtc).toLocaleTimeString()}</div>
              </div>
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500">
                Isolation SLA: 100% decoupling from platform core. Switching via single environment config.
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 5: Rule Engine Settings */}
      {activeTab === 'SETTINGS' && settings && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg max-w-2xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Settings className="w-4 h-4 text-sky-400" />
            <span>Ad Decision Engine & Anti-Hallucination Configuration</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Segment Demographic Match Weight: {settings.globalWeights?.audienceMatch}</label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={settings.globalWeights?.audienceMatch || 0.6}
                onChange={(e) => setSettings({
                  ...settings,
                  globalWeights: { ...settings.globalWeights, audienceMatch: parseFloat(e.target.value) }
                })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Exploration Rate (ε-greedy testing): {settings.explorationRate * 100}%</label>
              <input
                type="range"
                min="0.0"
                max="0.2"
                step="0.01"
                value={settings.explorationRate || 0.05}
                onChange={(e) => setSettings({ ...settings, explorationRate: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1">Competitor Separation (Slots)</label>
                <input
                  type="number"
                  value={settings.competitorSeparationSlots || 3}
                  onChange={(e) => setSettings({ ...settings, competitorSeparationSlots: parseInt(e.target.value, 10) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Segment Model Version</label>
                <input
                  type="text"
                  value={settings.segmentModelVersion || 'v2.4-meridian'}
                  disabled
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-400"
                />
              </div>
            </div>

            <button
              onClick={() => api.updateSettings(settings)}
              className="bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors mt-2"
            >
              Save Rule Engine Configuration
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
