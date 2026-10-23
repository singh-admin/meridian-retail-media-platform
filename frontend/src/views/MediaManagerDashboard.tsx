import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { socket } from '../services/socket';
import { Language, translations } from '../i18n/translations';
import {
  Calendar,
  DollarSign,
  CheckCircle2,
  XCircle,
  Building2,
  TrendingUp,
  FileText,
  AlertCircle,
  Package,
  Layers,
  Sparkles,
  ShieldCheck,
  Pin
} from 'lucide-react';

interface MediaManagerDashboardProps {
  lang: Language;
}

export const MediaManagerDashboard: React.FC<MediaManagerDashboardProps> = ({ lang }) => {
  const t = translations[lang];
  const [calendar, setCalendar] = useState<any>(null);
  const [yieldData, setYieldData] = useState<any>(null);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [advertisers, setAdvertisers] = useState<any[]>([]);
  const [heatmap, setHeatmap] = useState<any>(null);
  const [conflictView, setConflictView] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'CALENDAR' | 'YIELD' | 'APPROVALS' | 'ADVERTISERS' | 'HEATMAP' | 'CONFLICT'>('CALENDAR');

  // Report Modal
  const [selectedReport, setSelectedReport] = useState<any>(null);

  // Manual Pin State
  const [overrideScreenId, setOverrideScreenId] = useState('SC-T2-042');
  const [overrideCampaignId, setOverrideCampaignId] = useState('CAMP-DUTYFREE-PERFUME');
  const [overrideReason, setOverrideReason] = useState('VIP Contract Agreement');

  const loadData = async () => {
    try {
      const [cal, yld, apprs, advs, hmp, cnf] = await Promise.all([
        api.getInventoryCalendar(),
        api.getYieldPricing(),
        api.getApprovals(),
        api.getAdvertisers(),
        api.getHeatmap(),
        api.getConflictView('SC-T2-042')
      ]);
      setCalendar(cal);
      setYieldData(yld);
      setApprovals(apprs);
      setAdvertisers(advs);
      setHeatmap(hmp);
      setConflictView(cnf);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();

    const unsub = socket.subscribe((event) => {
      if (['CAMPAIGN_UPDATED', 'DECISION_RECORDED', 'CAUSE_AND_EFFECT_TRIGGERED'].includes(event.type)) {
        loadData();
      }
    });

    return unsub;
  }, []);

  const handleReview = async (id: string, action: 'APPROVE' | 'REJECT') => {
    try {
      await api.reviewApproval(id, action);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleApplyOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.overrideScreen(overrideScreenId, overrideCampaignId, overrideReason);
      loadData();
      alert(`Manual override successfully applied to Screen ${overrideScreenId}.`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenReport = async (campaignId: string) => {
    try {
      const report = await api.getAdvertiserReport(campaignId);
      setSelectedReport(report);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Media Sales Summary Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-indigo-500" />
            <span>Airport Ad Sales & Screen Inventory Operations</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Yield optimization, dynamic pricing, creative approvals and conflict diagnostics
          </p>
        </div>

        {yieldData && (
          <div className="flex items-center space-x-4 text-xs font-semibold">
            <div className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800">
              Occupancy: <strong>{yieldData.occupancyPercent}%</strong>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
              7-Day Forecast: <strong>€{yieldData.revenueForecast7DaysEur?.toLocaleString()}</strong>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'CALENDAR', label: t.mediaManager.inventoryCalendar, icon: Calendar },
          { id: 'YIELD', label: t.mediaManager.yieldPricing, icon: TrendingUp },
          { id: 'APPROVALS', label: `${t.mediaManager.approvalQueue} (${approvals.length})`, icon: ShieldCheck },
          { id: 'HEATMAP', label: t.mediaManager.segmentHeatmap, icon: Layers },
          { id: 'CONFLICT', label: t.mediaManager.conflictView, icon: AlertCircle },
          { id: 'ADVERTISERS', label: t.mediaManager.advertiserOverview, icon: Building2 }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Inventory Calendar (Screen x Hour Grid) */}
      {activeTab === 'CALENDAR' && calendar && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Screen × Hourly Schedule Slot Availability
            </h3>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded bg-amber-500"></span>
                <span>Premium Slot (€120+)</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded bg-sky-500"></span>
                <span>Booked (€75)</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
                <span>Available (€45)</span>
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                  <th className="py-2 px-3 font-semibold w-48">Screen Totem</th>
                  {calendar.hours.map((h: string) => (
                    <th key={h} className="py-2 px-2 text-center font-mono font-bold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {calendar.grid.slice(0, 10).map((row: any) => (
                  <tr key={row.screenId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2 px-3">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{row.screenId}</div>
                      <div className="text-[10px] text-slate-400 truncate">{row.screenName}</div>
                    </td>
                    {row.slots.map((slot: any) => (
                      <td key={slot.hour} className="p-1 text-center">
                        <span className={`inline-block w-full py-1 rounded text-[10px] font-bold ${
                          slot.status === 'PREMIUM' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/40' :
                          slot.status === 'BOOKED' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40' :
                          'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        }`}>
                          €{slot.priceEur}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Yield Management & Pricing */}
      {activeTab === 'YIELD' && yieldData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Dynamic Yield & Footfall-Driven Pricing Tiers
            </h3>
            <div className="space-y-3">
              {yieldData.suggestedPricing?.map((tier: any) => (
                <div key={tier.tier} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">{tier.tier}</div>
                    <div className="text-slate-500">Baseline: €{tier.baseline} • Demand Multiplier: {tier.demandIndex}x</div>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-black text-indigo-600 dark:text-indigo-400">€{tier.suggestedPriceEur}</div>
                    <div className="text-[10px] text-emerald-600 font-bold">Suggested Slot Rate</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              7-Day Occupancy & Revenue Projection
            </h3>
            <div className="space-y-2">
              {yieldData.next7DaysForecast?.map((day: any) => (
                <div key={day.day} className="flex items-center space-x-3 text-xs">
                  <span className="w-10 font-bold text-slate-700 dark:text-slate-300">{day.day}</span>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${day.occupancy}%` }}></div>
                  </div>
                  <span className="w-12 text-right font-semibold text-slate-600 dark:text-slate-400">{day.occupancy}%</span>
                  <span className="w-20 text-right font-black text-emerald-600 dark:text-emerald-400">€{day.revenueEur.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Approval Queue & Brand Safety */}
      {activeTab === 'APPROVALS' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Campaign Creatives Awaiting Review ({approvals.length} In Review)
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {approvals.map((appr) => (
              <div key={appr.campaignId} className="py-4 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1 max-w-lg">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{appr.name}</span>
                  <p className="text-xs text-slate-500">{appr.creative?.bodyText}</p>
                  <div className="flex items-center space-x-2 text-[11px] text-slate-400 pt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Brand Safety Checked: Verified contrast, content integrity & disclaimers</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleReview(appr.campaignId, 'APPROVE')}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center space-x-1.5 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t.mediaManager.approve}</span>
                  </button>
                  <button
                    onClick={() => handleReview(appr.campaignId, 'REJECT')}
                    className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center space-x-1.5 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>{t.mediaManager.reject}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Heatmap (Segment x Hour x Zone) */}
      {activeTab === 'HEATMAP' && heatmap && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Segment Demographics Presence Heatmap (Segment × Hour × Concourse Zone)
          </h3>

          <div className="space-y-6">
            {heatmap.heatmapData?.map((zoneData: any) => (
              <div key={zoneData.zone} className="space-y-2">
                <h4 className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                  Zone: {zoneData.zone}
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                        <th className="py-1 px-3 w-36">Segment</th>
                        {heatmap.hours.map((h: string) => (
                          <th key={h} className="py-1 px-2 text-center font-mono">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {zoneData.rows.map((row: any) => (
                        <tr key={row.segment}>
                          <td className="py-1.5 px-3 font-semibold text-slate-700 dark:text-slate-300">{row.segment}</td>
                          {row.values.map((v: any) => (
                            <td key={v.hour} className="p-1 text-center">
                              <span
                                className="inline-block w-full py-1 rounded font-bold text-[10px] text-white"
                                style={{
                                  backgroundColor: `rgba(14, 165, 233, ${Math.max(0.2, v.intensity / 100)})`
                                }}
                              >
                                {v.intensity}%
                              </span>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Conflict View (Why Campaign A beat Campaign B) & Manual Pin */}
      {activeTab === 'CONFLICT' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Conflict Diagnostic */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span>Decision Conflict Diagnostics (Screen SC-T2-042 at Gate 42)</span>
            </h3>

            {conflictView && (
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">Winner: {conflictView.winner?.campaignName || conflictView.winner?.name}</span>
                    <span className="font-black text-sm text-emerald-600">Score: {conflictView.winner?.finalScore || conflictView.winner?.score}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Runner-up: {conflictView.runnerUp?.campaignName || conflictView.runnerUp?.name}</span>
                    <span className="font-semibold text-slate-400">Score: {conflictView.runnerUp?.finalScore || conflictView.runnerUp?.score}</span>
                  </div>
                </div>

                <div className="p-3 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-lg text-slate-700 dark:text-slate-300">
                  <strong className="text-sky-700 dark:text-sky-300 block mb-1">Algorithmic Explanation:</strong>
                  {conflictView.explanation}
                </div>
              </div>
            )}
          </div>

          {/* Manual Pin / Override Slot */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Pin className="w-4 h-4 text-indigo-500" />
              <span>Manual Screen Slot Override</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Operator prerogative: force pin a campaign to a screen, bypassing algorithmic rotation with mandatory audit reason.
            </p>

            <form onSubmit={handleApplyOverride} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Screen ID</label>
                <input
                  type="text"
                  value={overrideScreenId}
                  onChange={(e) => setOverrideScreenId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Campaign to Pin</label>
                <input
                  type="text"
                  value={overrideCampaignId}
                  onChange={(e) => setOverrideCampaignId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Reason for Override (Audit trail)</label>
                <input
                  type="text"
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-lg transition-colors mt-2"
              >
                Apply Manual Screen Pin
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 6: Advertisers Overview */}
      {activeTab === 'ADVERTISERS' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Advertiser Portfolio & Performance Reports
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {advertisers.map(adv => (
              <div key={adv.advertiserId} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-white truncate">{adv.name}</span>
                  <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded font-semibold text-slate-700 dark:text-slate-300">
                    {adv.category}
                  </span>
                </div>

                <div className="text-xs text-slate-500 space-y-1">
                  <div>Total Spend: <strong className="text-slate-900 dark:text-white">€{adv.totalSpend?.toLocaleString()}</strong></div>
                  <div>Active Campaigns: {adv.campaignsRunning}</div>
                  {adv.underDeliveringFlag && (
                    <div className="text-rose-500 font-semibold text-[11px] flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>Under-delivering impression flag</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleOpenReport('CAMP-DUTYFREE-PERFUME')}
                  className="w-full text-xs font-semibold py-1.5 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600 flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-sky-500" />
                  <span>{t.mediaManager.advertiserReport}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 1-Click Advertiser Report Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center space-x-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                <span>Advertiser Performance Audit Report</span>
              </h3>
              <button onClick={() => setSelectedReport(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <div><span className="text-slate-500">Campaign:</span> <strong>{selectedReport.campaignName}</strong></div>
              <div><span className="text-slate-500">Outlet:</span> {selectedReport.outletName}</div>
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div>Impressions: <strong className="text-slate-900 dark:text-white">{selectedReport.metrics?.impressions?.toLocaleString()}</strong></div>
                <div>Redemptions: <strong className="text-emerald-500">{selectedReport.metrics?.redemptions}</strong></div>
                <div>Conversion Rate: <strong>{selectedReport.metrics?.conversionRate}</strong></div>
                <div>ROI: <strong className="text-indigo-500">{selectedReport.metrics?.roi}x</strong></div>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Sample Logged Decisions:</span>
                <div className="max-h-28 overflow-y-auto space-y-1">
                  {selectedReport.decisionsSample?.map((d: any, i: number) => (
                    <div key={i} className="text-[11px] text-slate-400">
                      • {d.screenId}: {d.winningReason}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => window.print()}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-lg"
              >
                Print / Save PDF
              </button>
              <button
                onClick={() => setSelectedReport(null)}
                className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs px-4 py-2 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
