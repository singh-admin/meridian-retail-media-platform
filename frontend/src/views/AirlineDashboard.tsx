import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { socket } from '../services/socket';
import { Language, translations } from '../i18n/translations';
import {
  Plane,
  Clock,
  Send,
  Gift,
  Users,
  ShoppingBag,
  CheckCircle,
  AlertTriangle,
  Award,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

interface AirlineDashboardProps {
  airlineIata: string;
  lang: Language;
}

export const AirlineDashboard: React.FC<AirlineDashboardProps> = ({ airlineIata, lang }) => {
  const t = translations[lang];
  const [flightsData, setFlightsData] = useState<any>(null);
  const [crowdProfile, setCrowdProfile] = useState<any>(null);
  const [marketplaceDeals, setMarketplaceDeals] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'FLIGHTS' | 'MESSAGING' | 'GOODWILL' | 'MARKETPLACE'>('FLIGHTS');

  // Gate Messaging Form State
  const [targetGate, setTargetGate] = useState('42');
  const [msgTitle, setMsgTitle] = useState('Halcyon Priority Boarding & Lounge Privilege');
  const [msgBody, setMsgBody] = useState('Complimentary lounge pass and priority upgrades available right now for Flight XH960 passengers.');

  // Goodwill Automation Form State
  const [delayThreshold, setDelayThreshold] = useState(30);
  const [voucherValue, setVoucherValue] = useState(15);
  const [partnerRetailer, setPartnerRetailer] = useState('Cloud Nine Bakery');

  const loadData = async () => {
    try {
      const [flts, crwd, deals, perf] = await Promise.all([
        api.getAirlineFlights(airlineIata),
        api.getAirlineCrowdProfile(airlineIata),
        api.getMarketplaceDeals(airlineIata),
        api.getAirlinePerformance(airlineIata)
      ]);
      setFlightsData(flts);
      setCrowdProfile(crwd);
      setMarketplaceDeals(deals);
      setPerformance(perf);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();

    const unsub = socket.subscribe((event) => {
      if (['FLIGHT_UPDATED', 'CAUSE_AND_EFFECT_TRIGGERED', 'PROMO_REDEEMED'].includes(event.type)) {
        loadData();
      }
    });

    return unsub;
  }, [airlineIata]);

  const handleSendGateMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.scheduleGateMessage({
        flightNumber: `${airlineIata}960`,
        targetGate,
        title: msgTitle,
        bodyText: msgBody,
        discountTag: 'BOARDING PRIVILEGE'
      });
      loadData();
      alert(`Gate messaging scheduled for boarding window at Gate ${targetGate}!`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleActivateGoodwill = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.triggerGoodwillAutomation({
        flightNumber: `${airlineIata}960`,
        delayThresholdMinutes: delayThreshold,
        voucherValueEur: voucherValue,
        partnerRetailer
      });
      loadData();
      alert(`Automated delay goodwill rule armed for ${airlineIata}960! If delayed > ${delayThreshold}m, €${voucherValue} voucher automatically pushes to gate screens.`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAcceptDeal = async (proposalId: string) => {
    try {
      await api.acceptMarketplaceDeal(proposalId);
      loadData();
      alert('1-Click Co-Marketing Agreement accepted! Ad pushed to departing passenger gate displays.');
    } catch (e) {
      console.error(e);
    }
  };

  const flights = flightsData?.flights || [];

  return (
    <div className="space-y-6">
      {/* Airline Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Plane className="w-5 h-5 text-sky-500" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Carrier Operations Console: {airlineIata}
            </h2>
            <span className="text-xs bg-sky-500/10 text-sky-600 dark:text-sky-400 px-2 py-0.5 rounded font-bold">
              {flights.length} Departures Scheduled
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Gate-area digital messaging, delay hospitality automation & co-marketing partnerships
          </p>
        </div>

        {performance && (
          <div className="flex items-center space-x-3 text-xs font-semibold">
            <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
              Passenger Impressions: <strong className="text-sky-600 dark:text-sky-400">{performance.passengerImpressionsToday.toLocaleString()}</strong>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
              Vouchers Claimed: <strong className="text-emerald-600 dark:text-emerald-400">{performance.goodwillVouchersClaimed}</strong>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        {[
          { id: 'FLIGHTS', label: t.airline.myFlights, icon: Plane },
          { id: 'MESSAGING', label: t.airline.gateMessaging, icon: Send },
          { id: 'GOODWILL', label: t.airline.delayGoodwill, icon: Gift },
          { id: 'MARKETPLACE', label: t.airline.marketplace, icon: ShoppingBag }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                isActive
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: My Flights Today (List & Timeline) */}
      {activeTab === 'FLIGHTS' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Daily Flight Movement & Gate Allocation Timeline
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                  <th className="py-2 px-3 font-semibold">{t.airline.flightNumber}</th>
                  <th className="py-2 px-3 font-semibold">{t.airline.destination}</th>
                  <th className="py-2 px-3 font-semibold">{t.airline.gate}</th>
                  <th className="py-2 px-3 font-semibold">Scheduled / Estimated</th>
                  <th className="py-2 px-3 font-semibold">{t.airline.status}</th>
                  <th className="py-2 px-3 font-semibold">{t.airline.loadFactor}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {flights.map((f: any) => {
                  const isDelayed = f.status === 'DEL';
                  return (
                    <tr key={f.flightId} className={isDelayed ? 'bg-rose-50/50 dark:bg-rose-950/20' : ''}>
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                        <Plane className={`w-3.5 h-3.5 ${isDelayed ? 'text-rose-500' : 'text-sky-500'}`} />
                        <span>{f.flightNumber}</span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                        {f.destination}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-sky-600 dark:text-sky-400">
                        Gate {f.gate}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 font-mono">
                        {f.scheduledTime?.split('T')[1]?.substring(0, 5)}
                        {isDelayed && (
                          <span className="text-rose-600 font-bold ml-1.5">
                            ➔ {f.estimatedTime?.split('T')[1]?.substring(0, 5)} (+{f.delayMinutes}m)
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          isDelayed ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30' :
                          'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
                        }`}>
                          {f.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                        {f.loadFactorPercent}% ({f.paxTotal} / {f.seats} seats)
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Gate-Area Messaging */}
      {activeTab === 'MESSAGING' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm max-w-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Send className="w-4 h-4 text-sky-500" />
            <span>Schedule Boarding Window Content</span>
          </h3>

          <form onSubmit={handleSendGateMessage} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">Target Gate</label>
              <input
                type="text"
                value={targetGate}
                onChange={(e) => setTargetGate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">Headline</label>
              <input
                type="text"
                value={msgTitle}
                onChange={(e) => setMsgTitle(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">Message Content</label>
              <textarea
                rows={3}
                value={msgBody}
                onChange={(e) => setMsgBody(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 rounded-lg transition-colors mt-2"
            >
              Push Message to Gate Screens During Boarding
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Delay Goodwill Hospitality Automation */}
      {activeTab === 'GOODWILL' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm max-w-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Gift className="w-4 h-4 text-emerald-500" />
            <span>Automated Delay Hospitality Rule</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Automatically issues digital meal and coffee vouchers to passengers on screens when an AODB/AIDX delay event exceeds threshold.
          </p>

          <form onSubmit={handleActivateGoodwill} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">
                Delay Threshold (Minutes): {delayThreshold} min
              </label>
              <input
                type="range"
                min="15"
                max="90"
                step="5"
                value={delayThreshold}
                onChange={(e) => setDelayThreshold(parseInt(e.target.value, 10))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">
                Complimentary Voucher Value: €{voucherValue}
              </label>
              <input
                type="number"
                value={voucherValue}
                onChange={(e) => setVoucherValue(parseInt(e.target.value, 10))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">Partner Dining Retailer</label>
              <input
                type="text"
                value={partnerRetailer}
                onChange={(e) => setPartnerRetailer(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg transition-colors mt-2"
            >
              Arm Goodwill Automation Trigger
            </button>
          </form>
        </div>
      )}

      {/* Tab 4: Co-Marketing Marketplace */}
      {activeTab === 'MARKETPLACE' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <ShoppingBag className="w-4 h-4 text-purple-500" />
            <span>Retailer Co-Marketing Marketplace</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {marketplaceDeals.map((deal) => (
              <div key={deal.proposalId} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">{deal.retailerName}</span>
                  <span className="text-[10px] bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold px-2 py-0.5 rounded">
                    {deal.coFundingSplit}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300">{deal.dealSummary}</p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500">Reach: {deal.estimatedReachPax} pax</span>
                  {deal.status === 'ACCEPTED' ? (
                    <span className="text-emerald-600 font-bold flex items-center space-x-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Active on Screens</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAcceptDeal(deal.proposalId)}
                      className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {t.airline.acceptDeal}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
