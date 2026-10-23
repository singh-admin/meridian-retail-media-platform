import React, { useState } from 'react';
import { Role } from '../types';
import { PassengerScreen } from '../views/PassengerScreen';
import { AdminDashboard } from '../views/AdminDashboard';
import { RetailerDashboard } from '../views/RetailerDashboard';
import { MediaManagerDashboard } from '../views/MediaManagerDashboard';
import { AirlineDashboard } from '../views/AirlineDashboard';
import { Language } from '../i18n/translations';
import { X, Columns, Tv, Store, ShieldAlert, BarChart3, Plane } from 'lucide-react';

interface SplitScreenModalProps {
  onClose: () => void;
  lang: Language;
  selectedOutletId: string;
  selectedAirlineIata: string;
}

export const SplitScreenModal: React.FC<SplitScreenModalProps> = ({
  onClose,
  lang,
  selectedOutletId,
  selectedAirlineIata
}) => {
  const [rightRole, setRightRole] = useState<Role>('RETAILER');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 flex flex-col backdrop-blur-md overflow-hidden">
      {/* Top Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between text-white">
        <div className="flex items-center space-x-3">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Columns className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold flex items-center space-x-2">
              <span>Split-Screen Live Cause-and-Effect Demonstration</span>
              <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40">
                ACTIVE
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Left: Gate 42 Digital Screen • Right: Interactive Business Dashboard (Simulate delay to view dynamic ad re-targeting)
            </p>
          </div>
        </div>

        {/* Right Pane Persona Switcher & Close */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
            <span className="text-slate-400 text-[11px] px-2 font-medium">Right View:</span>
            <button
              onClick={() => setRightRole('RETAILER')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-semibold ${
                rightRole === 'RETAILER' ? 'bg-sky-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>Retailer</span>
            </button>
            <button
              onClick={() => setRightRole('AIRLINE')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-semibold ${
                rightRole === 'AIRLINE' ? 'bg-sky-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Plane className="w-3.5 h-3.5" />
              <span>Airline</span>
            </button>
            <button
              onClick={() => setRightRole('MEDIA_MANAGER')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-semibold ${
                rightRole === 'MEDIA_MANAGER' ? 'bg-sky-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Media</span>
            </button>
            <button
              onClick={() => setRightRole('ADMIN')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-semibold ${
                rightRole === 'ADMIN' ? 'bg-sky-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Exit Split-Screen Mode"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Side-by-side Dual Panels */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left: Passenger Screen Simulator (5 Cols) */}
        <div className="lg:col-span-5 border-r border-slate-800 bg-black overflow-y-auto p-4 flex flex-col justify-center">
          <div className="mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center space-x-1 text-sky-400">
              <Tv className="w-3.5 h-3.5" />
              <span>Passenger Signage: Totem SC-T2-042 (Gate 42)</span>
            </span>
            <span className="text-emerald-400 text-[10px] bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              LIVE BROADCAST
            </span>
          </div>
          <PassengerScreen lang={lang} embeddedMode={true} defaultScreenId="SC-T2-042" />
        </div>

        {/* Right: Dashboard View (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900 overflow-y-auto p-4">
          {rightRole === 'RETAILER' && (
            <RetailerDashboard outletId={selectedOutletId} lang={lang} />
          )}
          {rightRole === 'AIRLINE' && (
            <AirlineDashboard airlineIata={selectedAirlineIata} lang={lang} />
          )}
          {rightRole === 'MEDIA_MANAGER' && (
            <MediaManagerDashboard lang={lang} />
          )}
          {rightRole === 'ADMIN' && (
            <AdminDashboard lang={lang} />
          )}
        </div>
      </div>
    </div>
  );
};
