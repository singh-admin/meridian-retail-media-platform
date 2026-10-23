import React from 'react';
import { Role } from '../types';
import {
  ShieldAlert,
  Store,
  BarChart3,
  Plane,
  Tv,
  Globe,
  Sun,
  Moon,
  ChevronDown
} from 'lucide-react';
import { Language, translations } from '../i18n/translations';

interface HeaderProps {
  currentRole: Role;
  onSelectRole: (role: Role) => void;
  selectedOutletId: string;
  onSelectOutlet: (outletId: string) => void;
  selectedAirlineIata: string;
  onSelectAirline: (iata: string) => void;
  currentLang: Language;
  onToggleLang: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onSelectRole,
  selectedOutletId,
  onSelectOutlet,
  selectedAirlineIata,
  onSelectAirline,
  currentLang,
  onToggleLang,
  darkMode,
  onToggleDarkMode
}) => {
  const t = translations[currentLang];

  const roles = [
    { id: 'ADMIN' as Role, label: t.roles.ADMIN, icon: ShieldAlert },
    { id: 'RETAILER' as Role, label: t.roles.RETAILER, icon: Store },
    { id: 'MEDIA_MANAGER' as Role, label: t.roles.MEDIA_MANAGER, icon: BarChart3 },
    { id: 'AIRLINE' as Role, label: t.roles.AIRLINE, icon: Plane },
    { id: 'SCREEN_SIM' as Role, label: t.roles.SCREEN_SIM, icon: Tv }
  ];

  const sampleOutlets = [
    { id: 'OUT-02', name: 'Meridian Duty-Free (Gate 42)', category: 'Duty Free' },
    { id: 'OUT-01', name: 'Meridian Duty-Free (T2 Central)', category: 'Duty Free' },
    { id: 'OUT-04', name: 'Cloud Nine Reserve Espresso (Gate 41)', category: 'F&B' },
    { id: 'OUT-03', name: 'Cloud Nine Bakery (T1 Concourse A)', category: 'F&B' },
    { id: 'OUT-05', name: 'Voyager Kids FunStore (T2 Pier 4)', category: 'Toys' },
    { id: 'OUT-06', name: 'Halcyon Palm Lounge (T2 Concourse C)', category: 'Lounge' },
    { id: 'OUT-07', name: 'Aura Luxury Boutique (T2 Duty-Free)', category: 'Luxury' }
  ];

  const sampleAirlines = [
    { iata: 'XH', name: 'Halcyon Airways (XH - International Full-Service)' },
    { iata: 'XD', name: 'Skylark Air (XD - Domestic Low-Cost)' },
    { iata: 'YA', name: 'Aurora National (YA - Domestic Full-Service)' },
    { iata: 'YG', name: 'Alpine Continental (YG - International)' }
  ];

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors sticky top-[48px] z-40">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Logo & Product context */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-700 flex items-center justify-center text-white shadow-md font-black text-lg tracking-tighter">
            MQI
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                {t.platformTitle}
              </span>
              <span className="bg-sky-500/10 dark:bg-sky-400/20 text-sky-600 dark:text-sky-300 font-semibold text-[10px] px-1.5 py-0.5 rounded border border-sky-400/20">
                POC DEMO
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {t.retailMediaOs} • Live Flight-Triggered Signage
            </p>
          </div>
        </div>

        {/* Primary Role Switcher */}
        <nav className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl overflow-x-auto">
          {roles.map((r) => {
            const Icon = r.icon;
            const isActive = currentRole === r.id;
            return (
              <button
                key={r.id}
                onClick={() => onSelectRole(r.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400'}`} />
                <span>{r.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Secondary Sub-Switchers & Utilities */}
        <div className="flex items-center space-x-2">
          {/* Retailer Outlet Sub-Switcher */}
          {currentRole === 'RETAILER' && (
            <div className="relative">
              <select
                value={selectedOutletId}
                onChange={(e) => onSelectOutlet(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium pl-2.5 pr-7 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 shadow-sm appearance-none focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                {sampleOutlets.map(o => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
            </div>
          )}

          {/* Airline Sub-Switcher */}
          {currentRole === 'AIRLINE' && (
            <div className="relative">
              <select
                value={selectedAirlineIata}
                onChange={(e) => onSelectAirline(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium pl-2.5 pr-7 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 shadow-sm appearance-none focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                {sampleAirlines.map(a => (
                  <option key={a.iata} value={a.iata}>
                    {a.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
            </div>
          )}

          {/* Language Toggle */}
          <button
            onClick={onToggleLang}
            className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
            title="Switch Language (English / French)"
          >
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>{currentLang.toUpperCase()}</span>
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
            title="Toggle Dark / Light Theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
