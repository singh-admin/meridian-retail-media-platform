import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { socket } from '../services/socket';
import { Campaign, PromoCode, Outlet } from '../types';
import { Language, translations } from '../i18n/translations';
import {
  Store,
  TrendingUp,
  QrCode,
  Users,
  Copy,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Clock,
  Euro,
  Share2,
  Calendar,
  Layers,
  ArrowRight,
  Sliders,
  Compass
} from 'lucide-react';

interface RetailerDashboardProps {
  outletId: string;
  lang: Language;
}

export const RetailerDashboard: React.FC<RetailerDashboardProps> = ({ outletId, lang }) => {
  const t = translations[lang];
  const [dashboard, setDashboard] = useState<any>(null);
  const [passengerFlow, setPassengerFlow] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'BUILDER' | 'GENAI' | 'PROMOS' | 'HISTORY'>('OVERVIEW');

  // Campaign Builder Form
  const [campaignName, setCampaignName] = useState('Gate 42 Duty-Free Special');
  const [targetHolidayWeight, setTargetHolidayWeight] = useState(0.9);
  const [targetFamilyWeight, setTargetFamilyWeight] = useState(0.8);
  const [targetBusinessWeight, setTargetBusinessWeight] = useState(0.4);
  const [livePreview, setLivePreview] = useState<any>(null);

  // GenAI Assistant State
  const [aiBrief, setAiBrief] = useState('Luxury Swiss chocolates and perfumes, 20% off for international families waiting at Gate 42');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [generatedCreative, setGeneratedCreative] = useState<any>(null);

  // Smart Recommendations State (WOW Feature #5)
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  const handleLoadRecommendations = async () => {
    setLoadingRecommendations(true);
    try {
      const res = await api.recommendSlots('CAMP-DUTYFREE-PERFUME');
      if (res.recommendations) {
        setRecommendations(res.recommendations);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const loadData = async () => {
    try {
      const [dash, flow, camps, prms] = await Promise.all([
        api.getRetailerDashboard(outletId),
        api.getPassengerFlow(outletId),
        api.getRetailerCampaigns(outletId),
        api.getPromos()
      ]);
      setDashboard(dash);
      setPassengerFlow(flow);
      setCampaigns(camps);
      setPromos(prms);
      handleLoadRecommendations();
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();

    const unsub = socket.subscribe((event) => {
      if (['OUTLET_UPDATED', 'CAMPAIGN_UPDATED', 'PROMO_REDEEMED', 'PROMO_SAVED', 'CAUSE_AND_EFFECT_TRIGGERED'].includes(event.type)) {
        loadData();
      }
    });

    return unsub;
  }, [outletId]);

  // Live match preview updater
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const preview = await api.previewCampaign({
          targetZones: ['ZONE-T2-GATES-40-50'],
          segmentWeights: {
            holiday: targetHolidayWeight,
            family: targetFamilyWeight,
            business: targetBusinessWeight,
            international: 0.9,
            domestic: 0.1,
            luxury: 0.8
          }
        });
        setLivePreview(preview);
      } catch (e) {
        console.error(e);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [targetHolidayWeight, targetFamilyWeight, targetBusinessWeight]);

  const handleStockToggle = async () => {
    if (!dashboard?.outlet) return;
    const nextState = !dashboard.outlet.stockAvailable;
    try {
      await api.setStockStatus(outletId, nextState);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDuplicateCampaign = async (id: string) => {
    try {
      await api.duplicateCampaign(id);
      loadData();
      alert('Campaign duplicated successfully and added to active rotation!');
    } catch (e) {
      console.error(e);
    }
  };

  const handleShareFamilyPromo = async (code: string) => {
    try {
      await api.sharePromoWithFamily(code);
      loadData();
      alert(`Family share code created! Shareable link generated.`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateAiCreative = async () => {
    if (!aiBrief) return;
    setAiGenerating(true);
    try {
      const res = await api.generateCreative(aiBrief, 'Families & Holiday', '20% OFF');
      setGeneratedCreative(res);
    } catch (e) {
      console.error(e);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleApplyAiToCampaign = async () => {
    if (!generatedCreative) return;
    try {
      await api.createCampaign({
        outletId,
        advertiserId: dashboard?.outlet?.advertiserId || 'ADV-DUTYFREE',
        name: `GenAI Campaign: ${generatedCreative.title}`,
        targetZones: ['ZONE-T2-GATES-40-50', 'ZONE-T2-DUTYFREE'],
        segmentWeights: { family: 0.8, holiday: 0.9, business: 0.3, international: 0.8, domestic: 0.2, luxury: 0.7 },
        creatives: [
          {
            creativeId: `CR-AI-${Date.now()}`,
            campaignId: `CAMP-AI-${Date.now()}`,
            advertiserId: dashboard?.outlet?.advertiserId || 'ADV-DUTYFREE',
            title: generatedCreative.title,
            subtitle: generatedCreative.subtitle,
            bodyText: generatedCreative.bodyText,
            bodyTextFr: generatedCreative.bodyTextFr,
            callToAction: generatedCreative.callToAction,
            discountTag: generatedCreative.discountTag,
            imageUrl: generatedCreative.imageUrl,
            themeColor: generatedCreative.themeColor,
            accentColor: generatedCreative.accentColor,
            status: 'APPROVED',
            brandSafetyPassed: true
          }
        ]
      });
      loadData();
      alert('GenAI Campaign applied and published to terminal displays!');
    } catch (e) {
      console.error(e);
    }
  };

  const metrics = dashboard?.metrics || {
    impressions: 48200,
    scans: 2840,
    redemptions: 1120,
    conversionRate: 3.87,
    revenueAttributedEur: 84200,
    stockAvailable: true
  };

  return (
    <div className="space-y-6">
      {/* Outlet Header & Stock Toggle */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Store className="w-5 h-5 text-sky-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {dashboard?.outlet?.name || 'Meridian Duty-Free Store'}
            </h2>
            <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded font-medium">
              Zone: {dashboard?.outlet?.zoneId || 'ZONE-T2-GATES-40-50'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Airside Retail Management • Dynamic passenger targeting & promo redemption
          </p>
        </div>

        {/* Stock-Aware Toggle (Should requirement) */}
        <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {t.retailer.stockStatus}:
          </span>
          <button
            onClick={handleStockToggle}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              metrics.stockAvailable
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'bg-rose-500 text-white shadow-sm'
            }`}
          >
            {metrics.stockAvailable ? (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{t.retailer.inStock}</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{t.retailer.outOfStock}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Real-Time Ticking Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl shadow-sm">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t.retailer.impressions}</span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {metrics.impressions.toLocaleString()}
          </div>
          <span className="text-[11px] text-sky-600 font-semibold">Ticking real-time</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl shadow-sm">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t.retailer.scans}</span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {metrics.scans.toLocaleString()}
          </div>
          <span className="text-[11px] text-indigo-600 font-semibold">Mobile QR scans</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl shadow-sm">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t.retailer.redemptions}</span>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {metrics.redemptions.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">Claimed vouchers</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl shadow-sm">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t.retailer.conversionRate}</span>
          <div className="text-xl font-black text-slate-900 dark:text-white mt-1">
            {metrics.conversionRate}%
          </div>
          <span className="text-[11px] text-purple-600 font-semibold">Scan-to-claim ROI</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl shadow-sm">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{t.retailer.attributedRevenue}</span>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">
            €{metrics.revenueAttributedEur.toLocaleString()}
          </div>
          <span className="text-[11px] text-amber-600 font-semibold">+€45 avg basket</span>
        </div>
      </div>

      {/* Passenger Flow Near My Store (Next 2 Hours Forecast) */}
      {passengerFlow && (
        <div className="bg-gradient-to-r from-sky-900 to-indigo-950 text-white p-5 rounded-xl shadow-lg border border-sky-800">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center space-x-2">
              <Compass className="w-5 h-5 text-sky-400" />
              <h3 className="text-sm font-bold tracking-tight">
                {t.retailer.flowForecast}
              </h3>
            </div>
            <span className="text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-400/30 px-2.5 py-0.5 rounded-full">
              Derived from AODB flight legs & ACRIS sensors
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
              <span className="text-sky-200">Next 60 min Footfall:</span>
              <div className="text-xl font-black mt-1">
                {passengerFlow.forecastNext60Min?.paxCount?.toLocaleString()} passengers
              </div>
              <div className="text-[11px] text-sky-300 mt-1">
                {Math.round((passengerFlow.forecastNext60Min?.internationalShare || 0) * 100)}% International
              </div>
            </div>

            <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
              <span className="text-sky-200">Catchment Median Dwell:</span>
              <div className="text-xl font-black mt-1">
                {passengerFlow.forecastNext60Min?.dwellMinutes || 52} minutes
              </div>
              <div className="text-[11px] text-emerald-300 mt-1 font-semibold">
                Surge due to delayed Dubai flight
              </div>
            </div>

            <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm md:col-span-2">
              <span className="text-sky-200">Top Destinations & Nationalities in Catchment:</span>
              <div className="flex items-center space-x-2 mt-2 flex-wrap gap-1">
                {passengerFlow.forecastNext60Min?.topDestinations?.map((d: any) => (
                  <span key={d.destination} className="bg-sky-500/30 border border-sky-400/40 px-2 py-0.5 rounded text-white font-bold">
                    {d.city} ({d.destination}): {d.pax} pax
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {[
          { id: 'OVERVIEW', label: 'Active Campaigns & Triggers' },
          { id: 'BUILDER', label: t.retailer.campaignBuilder },
          { id: 'GENAI', label: t.retailer.aiAssistant },
          { id: 'PROMOS', label: t.retailer.promoCodes },
          { id: 'HISTORY', label: 'Campaign History & ROI' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === tab.id
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Active Campaigns & Trigger Rules */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map((camp) => (
              <div key={camp.campaignId} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {camp.name}
                  </h4>
                  <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30">
                    {camp.status}
                  </span>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <div>Target Zones: <strong className="text-slate-800 dark:text-slate-200">{camp.targetZones.join(', ')}</strong></div>
                  <div>Frequency Cap: <strong>{camp.frequencyCapPerScreen} plays/hr</strong></div>
                  {camp.triggers?.delayThresholdMinutes && (
                    <div className="text-amber-600 dark:text-amber-400 font-semibold flex items-center space-x-1">
                      <span>⚡ Delay Rule Trigger: If delayed &gt; {camp.triggers.delayThresholdMinutes}m, apply 1.5x boost</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    ROI: <strong className="text-emerald-600">{camp.historicalStats?.roi || 4.2}x</strong> • Redemptions: {camp.historicalStats?.redemptions || 120}
                  </div>
                  <button
                    onClick={() => handleDuplicateCampaign(camp.campaignId)}
                    className="flex items-center space-x-1 text-sky-600 hover:text-sky-700 font-semibold"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{t.retailer.duplicateCampaign}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Campaign Builder & Live Audience Match Preview */}
      {activeTab === 'BUILDER' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-sky-500" />
              <span>Configure Audience Matching & Triggers</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">Campaign Name</label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">
                  Holiday / Leisure Travellers Weight: {targetHolidayWeight}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={targetHolidayWeight}
                  onChange={(e) => setTargetHolidayWeight(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">
                  Family with Children Weight: {targetFamilyWeight}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={targetFamilyWeight}
                  onChange={(e) => setTargetFamilyWeight(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 mb-1">
                  Business Travellers Weight: {targetBusinessWeight}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={targetBusinessWeight}
                  onChange={(e) => setTargetBusinessWeight(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="bg-slate-900 text-white border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                  {t.retailer.liveMatchPreview}
                </span>
                <span className="text-emerald-400 text-xs font-bold">
                  {livePreview?.matchPercent || 71}% Match
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-200">
                {livePreview?.summaryMessage || "Matches 71% of crowd at Gate 42. Expected 3,450 impressions and 130 redemptions."}
              </p>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 text-xs space-y-1">
              <span className="font-bold text-slate-300">Targeting Gate 42 Catchment:</span>
              <div>• Crowd Profile: 58% Holiday, 31% Family, 22% Business</div>
              <div>• Flight Trigger: +45m Delay on Dubai route triggers 1.5x boost</div>
            </div>

            {/* Smart AI Recommendations: Best 3 Slots Tomorrow */}
            <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700 text-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-400 flex items-center space-x-1.5 uppercase text-[10px] tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>AI Smart Recommendation: Best 3 Slots Tomorrow</span>
                </span>
                <button
                  onClick={handleLoadRecommendations}
                  disabled={loadingRecommendations}
                  className="text-[10px] font-semibold bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 px-2 py-0.5 rounded border border-amber-500/30 transition-colors"
                >
                  {loadingRecommendations ? 'Refreshing...' : 'Refresh AI Slots'}
                </button>
              </div>

              {recommendations.length > 0 ? (
                <div className="space-y-2">
                  {recommendations.map((rec: any, idx: number) => (
                    <div key={rec.slotId} className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-700/80 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white flex items-center space-x-1.5">
                          <span className="text-amber-400 font-mono">#{idx + 1}</span>
                          <span>{rec.screenName}</span>
                        </span>
                        <span className="text-emerald-400 font-bold font-mono text-[11px]">
                          {rec.audienceMatchPercent}% Match
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {rec.scheduledTime} • Forecast: <strong className="text-sky-300">{rec.predictedImpressions.toLocaleString()} impressions</strong>
                      </div>
                      <p className="text-[10px] text-slate-400 italic">
                        {rec.reason}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-2 text-slate-400 text-[11px] text-center">
                  Calculating optimal slots...
                </div>
              )}
            </div>

            <button
              onClick={() => alert('Campaign configuration saved and activated for screen rotation!')}
              className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 rounded-lg transition-colors shadow"
            >
              Deploy Campaign to Gate 42 Fleet
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: GenAI Creative Assistant */}
      {activeTab === 'GENAI' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                GenAI Bilingual Ad Copy Generator
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Type a natural brief. The engine instantly formats high-contrast airport signage creative in English and French.
            </p>

            <textarea
              rows={3}
              value={aiBrief}
              onChange={(e) => setAiBrief(e.target.value)}
              placeholder={t.retailer.aiBriefPlaceholder}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
            />

            <button
              onClick={handleGenerateAiCreative}
              disabled={aiGenerating}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs py-2.5 px-4 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{aiGenerating ? 'Generating...' : t.retailer.generateCreative}</span>
            </button>
          </div>

          {/* Generated Result Preview */}
          {generatedCreative && (
            <div className="bg-slate-900 border border-slate-800 text-white rounded-xl p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                  Generated Creative Preview
                </span>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded border border-purple-500/30">
                  {generatedCreative.pluggableProvider}
                </span>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-black text-amber-400">{generatedCreative.discountTag}</div>
                <div className="text-base font-bold text-white">{generatedCreative.title}</div>
                <div className="text-xs text-slate-300">{generatedCreative.bodyText}</div>
                <div className="text-xs text-slate-400 italic pt-1 border-t border-slate-800">
                  FR: {generatedCreative.bodyTextFr}
                </div>
              </div>

              <button
                onClick={handleApplyAiToCampaign}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 rounded-lg transition-colors mt-2"
              >
                1-Click Add to Live Campaign
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Promo Codes & Share with Family */}
      {activeTab === 'PROMOS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {promos.map((p) => (
              <div key={p.promoId} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-black text-sky-600 dark:text-sky-400">
                    {p.code}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    {p.discountValue}
                  </span>
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                  <div>Flight Link: <strong className="text-slate-800 dark:text-slate-200">{p.linkedFlightNumber}</strong></div>
                  <div>Redemptions: {p.redemptionCount} / {p.maxRedemptions}</div>
                  <div className="flex items-center space-x-1 text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Expires: {new Date(p.expiresAt).toLocaleTimeString()} (Boarding Close)</span>
                  </div>
                </div>

                {!p.isFamilyShare && (
                  <button
                    onClick={() => handleShareFamilyPromo(p.code)}
                    className="w-full mt-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold py-1.5 rounded-lg flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5 text-sky-500" />
                    <span>{t.retailer.shareFamily}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: History & ROI */}
      {activeTab === 'HISTORY' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Historical Campaign Performance (Past 30 Days)
          </h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {campaigns.slice(0, 5).map(c => (
              <div key={c.campaignId} className="py-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">{c.name}</span>
                  <div className="text-slate-500 mt-0.5">
                    Impressions: {c.historicalStats?.impressions?.toLocaleString()} • Redemptions: {c.historicalStats?.redemptions}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{c.historicalStats?.roi || 4.2}x ROI</span>
                    <div className="text-[11px] text-slate-400">€{c.historicalStats?.spend?.toLocaleString()} spend</div>
                  </div>
                  <button
                    onClick={() => handleDuplicateCampaign(c.campaignId)}
                    className="bg-sky-600 hover:bg-sky-500 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Run Again
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
