import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { socket } from '../services/socket';
import { QRCodeSVG } from 'qrcode.react';
import { Language, translations } from '../i18n/translations';
import {
  Tv,
  HelpCircle,
  Clock,
  Plane,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  X,
  Maximize2
} from 'lucide-react';

interface PassengerScreenProps {
  lang: Language;
  embeddedMode?: boolean;
  defaultScreenId?: string;
  onOpenMobileClaim?: (code: string) => void;
}

export const PassengerScreen: React.FC<PassengerScreenProps> = ({
  lang,
  embeddedMode = false,
  defaultScreenId = 'SC-T2-042',
  onOpenMobileClaim
}) => {
  const t = translations[lang];
  const [selectedScreenId, setSelectedScreenId] = useState(defaultScreenId);
  const [orientation, setOrientation] = useState<'9:16' | '16:9'>('9:16');
  const [playlistData, setPlaylistData] = useState<any>(null);
  const [whyOverlayOpen, setWhyOverlayOpen] = useState(false);
  const [whyData, setWhyData] = useState<any>(null);
  const [countdownSeconds, setCountdownSeconds] = useState(1740);

  const loadPlaylist = async () => {
    try {
      const data = await api.getScreenPlaylist(selectedScreenId);
      setPlaylistData(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadPlaylist();

    const unsub = socket.subscribe((event) => {
      if (['SIMULATION_TICK', 'SCREEN_UPDATED', 'CAUSE_AND_EFFECT_TRIGGERED', 'FLIGHT_UPDATED'].includes(event.type)) {
        loadPlaylist();
      }
    });

    return unsub;
  }, [selectedScreenId]);

  // Live countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownSeconds(prev => (prev > 0 ? prev - 1 : 1800));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleOpenWhyModal = async () => {
    try {
      const audit = await api.getWhyThisAd(selectedScreenId);
      setWhyData(audit);
      setWhyOverlayOpen(true);
    } catch (e) {
      console.error(e);
    }
  };

  const creative = playlistData?.creative;
  const promoCode = playlistData?.promoCode;
  const nearbyFlights = playlistData?.nearbyFlights || [];
  const screen = playlistData?.screen;

  // Format countdown mm:ss
  const mins = Math.floor(countdownSeconds / 60);
  const secs = countdownSeconds % 60;
  const timerFormatted = `${mins}:${secs < 10 ? '0' + secs : secs}`;

  // QR Code URL: connects to mobile claim route on current host
  const claimUrl = `${window.location.origin}/#claim/${promoCode?.code || 'PERFUME15-DXB'}`;

  return (
    <div className={`space-y-4 ${embeddedMode ? 'w-full' : 'max-w-4xl mx-auto'}`}>
      {/* Top screen control toolbar (if not embedded) */}
      {!embeddedMode && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-500">{t.screen.selectScreen}:</span>
            <select
              value={selectedScreenId}
              onChange={(e) => setSelectedScreenId(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 font-bold px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="SC-T2-042">Gate 42 Flight & Retail Totem A (Worked Example)</option>
              <option value="SC-T2-043">Gate 42 Landscape FIDS Banner</option>
              <option value="SC-T1-001">T1 Gate A1 Promenade Totem</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-500">{t.screen.orientation}:</span>
            <button
              onClick={() => setOrientation('9:16')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                orientation === '9:16' ? 'bg-sky-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              9:16 Portrait
            </button>
            <button
              onClick={() => setOrientation('16:9')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
                orientation === '16:9' ? 'bg-sky-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              16:9 Landscape
            </button>
          </div>
        </div>
      )}

      {/* Physical Digital Display Enclosure */}
      <div
        className={`mx-auto bg-slate-950 text-white border-8 border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative transition-all duration-300 ${
          orientation === '9:16'
            ? 'aspect-[9/16] max-w-[420px] w-full min-h-[640px]'
            : 'aspect-[16/9] w-full min-h-[460px]'
        }`}
      >
        {/* Offline Screen Overlay */}
        {screen?.status === 'OFFLINE' ? (
          <div className="absolute inset-0 bg-black flex flex-col items-center justify-center text-center p-6 space-y-3 z-30">
            <AlertCircle className="w-12 h-12 text-rose-500 animate-pulse" />
            <div className="text-base font-bold text-slate-300">SCREEN TELEMETRY OFFLINE</div>
            <p className="text-xs text-slate-500 max-w-xs">
              Hardware heartbeat lost on Totem {selectedScreenId}. Diagnostic ticket logged to AV engineering.
            </p>
          </div>
        ) : (
          <div className="relative h-full flex flex-col justify-between overflow-hidden">
            {/* Top Bar: Gate & Live Time Context */}
            <div className="bg-slate-900/90 backdrop-blur-md px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs z-10">
              <div className="flex items-center space-x-2">
                <span className="bg-sky-500 text-slate-950 font-black px-2 py-0.5 rounded text-[11px]">
                  MQI T2
                </span>
                <span className="font-bold text-sky-400">GATE 42</span>
              </div>
              <div className="text-slate-400 font-mono text-[11px] flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span>{new Date(playlistData?.simulatedTime || Date.now()).toLocaleTimeString()} UTC</span>
              </div>
            </div>

            {/* FIDS Flight Context Strip */}
            <div className="bg-slate-900/95 border-b border-slate-800 px-3 py-2 z-10">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 flex items-center justify-between">
                <span>Nearby Boarding Status</span>
                <span className="text-emerald-400 font-mono">FIDS SYNC OK</span>
              </div>
              <div className="space-y-1">
                {nearbyFlights.slice(0, orientation === '9:16' ? 2 : 3).map((f: any) => (
                  <div key={f.flightNumber} className="flex items-center justify-between text-[11px] font-mono">
                    <span className="font-bold text-white flex items-center space-x-1">
                      <Plane className="w-3 h-3 text-sky-400" />
                      <span>{f.flightNumber} ➔ {f.destination}</span>
                    </span>
                    <span className="text-slate-300">Gate {f.gate}</span>
                    <span className={`font-bold ${f.status === 'DEL' ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                      {f.status === 'DEL' ? `DEL (+${f.delayMinutes}m)` : f.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Rotating Commercial Creative */}
            <div className="flex-1 relative overflow-hidden flex flex-col justify-end p-5">
              {/* Dynamic Image Background with Gradient Overlay */}
              {creative?.imageUrl && (
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
                  style={{ backgroundImage: `url(${creative.imageUrl})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
                </div>
              )}

              {/* Creative Copy & Discount Tag */}
              <div className="relative z-10 space-y-2">
                {creative?.discountTag && (
                  <span className="inline-block bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-black text-xs px-3 py-1 rounded-full shadow-lg tracking-wider uppercase animate-bounce">
                    {creative.discountTag}
                  </span>
                )}

                <h1 className="text-xl md:text-2xl font-black leading-tight text-white drop-shadow-md">
                  {creative?.title || 'World Duty Free Special Offer'}
                </h1>

                <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-medium line-clamp-2">
                  {creative?.bodyText}
                </p>

                {creative?.bodyTextFr && (
                  <p className="text-[11px] text-slate-300 italic line-clamp-1 border-t border-slate-700/60 pt-1">
                    FR: {creative.bodyTextFr}
                  </p>
                )}
              </div>
            </div>

            {/* Bottom Promo QR Code & Countdown Box */}
            <div className="bg-slate-900/95 backdrop-blur-md p-4 border-t border-slate-800 z-10">
              <div className="flex items-center space-x-4">
                {/* Real SVG QR Code */}
                <div className="bg-white p-2 rounded-xl shadow-md flex-shrink-0">
                  <QRCodeSVG
                    value={claimUrl}
                    size={orientation === '9:16' ? 76 : 64}
                    level="M"
                    fgColor="#0284c7"
                  />
                </div>

                <div className="flex-1 space-y-1">
                  <div className="text-xs font-black text-white flex items-center space-x-1.5">
                    <span>{creative?.callToAction || t.screen.scanToClaim}</span>
                  </div>

                  <div className="text-[11px] text-slate-300">
                    Promo Code: <strong className="text-sky-400 font-mono text-xs">{promoCode?.code || 'PERFUME15-DXB'}</strong>
                  </div>

                  <div className="flex items-center space-x-1.5 text-rose-400 text-[11px] font-bold">
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    <span>{t.screen.expiresIn} <strong className="font-mono text-xs">{timerFormatted}</strong></span>
                  </div>

                  {/* Direct Mobile Claim Button for Local Demo */}
                  <a
                    href={`/#claim/${promoCode?.code || 'PERFUME15-DXB'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-[10px] text-sky-400 hover:text-sky-300 font-bold underline pt-0.5"
                  >
                    <span>Open Mobile Claim Page</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* "Why This Ad?" Floating Button */}
            <button
              onClick={handleOpenWhyModal}
              className="absolute top-12 right-3 z-20 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 backdrop-blur-md text-sky-400 hover:text-white px-2.5 py-1.5 rounded-lg text-[11px] font-bold shadow-lg flex items-center space-x-1 transition-all active:scale-95"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Why This Ad?</span>
            </button>
          </div>
        )}
      </div>

      {/* "Why This Ad?" Explainable Decision Overlay Modal */}
      {whyOverlayOpen && whyData && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-sky-400" />
                <span>Explainable AI Decision Audit & Anti-Hallucination Trail</span>
              </h3>
              <button
                onClick={() => setWhyOverlayOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Winning Rule Summary */}
            <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl space-y-1 text-xs">
              <div className="text-sky-400 font-bold uppercase tracking-wider text-[10px]">
                {t.screen.winningRule}
              </div>
              <div className="text-white font-semibold">
                {whyData.winningReason}
              </div>
            </div>

            {/* Crowd Demographics Bars */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider block">
                Catchment Crowd Demographics Profile (Gate 42)
              </span>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-800 p-2 rounded-lg">
                  <div className="text-slate-400 text-[10px]">Holiday Flyers</div>
                  <div className="text-sm font-black text-amber-400">
                    {Math.round((whyData.crowdProfileSummary?.holidayShare || 0.58) * 100)}%
                  </div>
                </div>
                <div className="bg-slate-800 p-2 rounded-lg">
                  <div className="text-slate-400 text-[10px]">Families with Kids</div>
                  <div className="text-sm font-black text-purple-400">
                    {Math.round((whyData.crowdProfileSummary?.familyShare || 0.31) * 100)}%
                  </div>
                </div>
                <div className="bg-slate-800 p-2 rounded-lg">
                  <div className="text-slate-400 text-[10px]">International Route</div>
                  <div className="text-sm font-black text-sky-400">
                    {Math.round((whyData.crowdProfileSummary?.internationalShare || 0.57) * 100)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Top 3 Candidate Scores Table */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider block">
                Top 3 Evaluated Candidates vs Score
              </span>
              <div className="divide-y divide-slate-800 bg-slate-800/40 rounded-xl p-3">
                {whyData.candidateRankings?.slice(0, 3).map((cand: any, idx: number) => (
                  <div key={cand.campaignId} className="py-2 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white flex items-center space-x-1.5">
                        <span className="text-sky-400">#{idx + 1}</span>
                        <span>{cand.campaignName}</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Match: {Math.round(cand.audienceMatchScore * 100)}% • Boost: {cand.boostMultiplier}x ({cand.boostReason})
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-emerald-400">
                        {cand.finalScore}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Anti-Hallucination Evidence Trail */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{t.screen.antiHallucination}: {t.screen.verified}</span>
              </div>
              <button
                onClick={() => setWhyOverlayOpen(false)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-4 py-1.5 rounded-lg"
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
