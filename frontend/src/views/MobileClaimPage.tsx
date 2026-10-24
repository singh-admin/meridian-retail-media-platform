import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Ticket,
  Clock,
  CheckCircle,
  Share2,
  Store,
  Plane,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface MobileClaimPageProps {
  promoCode: string;
}

export const MobileClaimPage: React.FC<MobileClaimPageProps> = ({ promoCode }) => {
  const [data, setData] = useState<any>(null);
  const [claimed, setClaimed] = useState(false);
  const [voucherCode, setVoucherCode] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [familyCode, setFamilyCode] = useState<string | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState(1720);

  useEffect(() => {
    // Check local storage to remember code on phone without server-side identity tracking
    try {
      const stored = localStorage.getItem(`meridian_claimed_${promoCode}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        setClaimed(true);
        setVoucherCode(parsed.voucherCode);
      }
    } catch {
      // Local storage fallback
    }

    api.getPromoClaimData(promoCode).then(setData).catch(console.error);

    const timer = setInterval(() => {
      setCountdownSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [promoCode]);

  const handleClaim = async () => {
    setClaiming(true);
    try {
      // Issue individual claim code per phone scan
      const uniqueVoucherCode = `${promoCode}-V${Math.floor(1000 + Math.random() * 9000)}`;
      const res = await api.redeemPromo(promoCode, uniqueVoucherCode);
      if (res.success) {
        setClaimed(true);
        const codeToDisplay = res.voucherCode || uniqueVoucherCode;
        setVoucherCode(codeToDisplay);
        try {
          localStorage.setItem(`meridian_claimed_${promoCode}`, JSON.stringify({
            voucherCode: codeToDisplay,
            claimedAt: new Date().toISOString()
          }));
        } catch {
          // Local storage fallback
        }
      } else {
        alert(res.message || 'Redemption failed');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setClaiming(false);
    }
  };

  const handleShareFamily = async () => {
    try {
      const res = await api.sharePromoWithFamily(promoCode);
      if (res.code) {
        setFamilyCode(res.code);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const mins = Math.floor(countdownSeconds / 60);
  const secs = countdownSeconds % 60;
  const timerFormatted = `${mins}:${secs < 10 ? '0' + secs : secs}`;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
      {/* Mobile Card Container */}
      <div className="w-full max-w-sm bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col justify-between">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 to-indigo-700 p-5 text-center relative">
          <div className="inline-block bg-white/20 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider mb-1">
            Meridian International Airside Voucher
          </div>
          <h1 className="text-xl font-black text-white tracking-tight">
            Exclusive Passenger Privilege
          </h1>
          <p className="text-xs text-sky-100 mt-1">
            Valid at Concourse C & Gate 42 Retail Outlets
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Discount Value Badge */}
          <div className="text-center bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-inner">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
              Redemption Value
            </span>
            <div className="text-3xl font-black text-amber-400 mt-1 tracking-tight">
              {data?.promo?.discountValue || '15% OFF'}
            </div>
            <div className="text-xs text-slate-300 font-semibold mt-1">
              {data?.campaignName || 'Delayed Flight Special Privilege'}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-500 flex items-center space-x-1.5">
                <Store className="w-3.5 h-3.5 text-sky-400" />
                <span>Retail Outlet:</span>
              </span>
              <strong className="text-white">{data?.outlet?.name || 'Meridian Duty Free Gate 42'}</strong>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-500 flex items-center space-x-1.5">
                <Plane className="w-3.5 h-3.5 text-sky-400" />
                <span>Linked Flight:</span>
              </span>
              <strong className="text-sky-400 font-mono">Flight XH960 to Dubai</strong>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-slate-500 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-400" />
                <span>Expires At:</span>
              </span>
              <span className="text-rose-400 font-bold font-mono">{timerFormatted} (Boarding Close)</span>
            </div>
          </div>

          {/* Action Area */}
          {claimed ? (
            <div className="bg-emerald-950/60 border border-emerald-500/50 rounded-2xl p-4 text-center space-y-2">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
              <div className="text-sm font-black text-white">VOUCHER CLAIMED SUCCESSFULLY!</div>
              <p className="text-xs text-emerald-200">
                Present barcode or individual voucher code <strong className="font-mono text-white text-sm">{voucherCode || promoCode}</strong> to cashier.
              </p>
              <div className="text-[10px] text-emerald-400/80 pt-1">
                ✓ Recorded in real-time in Retailer Dashboard
              </div>
            </div>
          ) : (
            <button
              onClick={handleClaim}
              disabled={claiming}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm py-3.5 rounded-2xl shadow-xl transition-transform active:scale-95 flex items-center justify-center space-x-2"
            >
              <Ticket className="w-4 h-4" />
              <span>{claiming ? 'Verifying...' : 'Claim Voucher on Phone'}</span>
            </button>
          )}

          {/* Share to Family Button */}
          {!familyCode ? (
            <button
              onClick={handleShareFamily}
              className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-xs py-2 rounded-xl flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Share Secondary Code with Travelling Family</span>
            </button>
          ) : (
            <div className="bg-slate-900 p-2.5 rounded-xl border border-sky-500/30 text-center text-xs">
              <span className="text-sky-300 font-bold">Family Code Created: </span>
              <span className="font-mono font-black text-white">{familyCode}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-900/60 p-3 text-center text-[10px] text-slate-500 border-t border-slate-900">
          Powered by Meridian Retail Media Platform • Fictional Airport Demo
        </div>
      </div>
    </div>
  );
};
