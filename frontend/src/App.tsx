import React, { useState, useEffect } from 'react';
import { Role } from './types';
import { Language } from './i18n/translations';
import { Header } from './components/Header';
import { SimulationBar } from './components/SimulationBar';
import { SplitScreenModal } from './components/SplitScreenModal';
import { AdminDashboard } from './views/AdminDashboard';
import { RetailerDashboard } from './views/RetailerDashboard';
import { MediaManagerDashboard } from './views/MediaManagerDashboard';
import { AirlineDashboard } from './views/AirlineDashboard';
import { PassengerScreen } from './views/PassengerScreen';
import { MobileClaimPage } from './views/MobileClaimPage';

export function App() {
  const [currentRole, setCurrentRole] = useState<Role>('ADMIN');
  const [selectedOutletId, setSelectedOutletId] = useState('OUT-02'); // Gate 42 Duty Free
  const [selectedAirlineIata, setSelectedAirlineIata] = useState('XH'); // Halcyon
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const [darkMode, setDarkMode] = useState(true);
  const [splitScreenOpen, setSplitScreenOpen] = useState(false);

  // Check URL hash for direct QR code mobile redemption route (e.g. #claim/PERFUME15-DXB)
  const [claimCodeFromHash, setClaimCodeFromHash] = useState<string | null>(null);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#claim/')) {
        const code = hash.replace('#claim/', '');
        setClaimCodeFromHash(code);
      } else {
        setClaimCodeFromHash(null);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Sync dark mode class on HTML document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // When switching to Admin, enable dark control room theme automatically
  const handleSelectRole = (role: Role) => {
    setCurrentRole(role);
    if (role === 'ADMIN' || role === 'SCREEN_SIM') {
      setDarkMode(true);
    }
  };

  // If viewing via QR mobile scan
  if (claimCodeFromHash) {
    return <MobileClaimPage promoCode={claimCodeFromHash} />;
  }

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors`}>
      {/* Simulation Control Bar (Always visible across all roles) */}
      <SimulationBar
        onToggleSplitScreen={() => setSplitScreenOpen(true)}
        lang={currentLang}
      />

      {/* Main Navigation & Role Switcher Header */}
      <Header
        currentRole={currentRole}
        onSelectRole={handleSelectRole}
        selectedOutletId={selectedOutletId}
        onSelectOutlet={setSelectedOutletId}
        selectedAirlineIata={selectedAirlineIata}
        onSelectAirline={setSelectedAirlineIata}
        currentLang={currentLang}
        onToggleLang={() => setCurrentLang(prev => (prev === 'en' ? 'fr' : 'en'))}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(prev => !prev)}
      />

      {/* Main Role Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {currentRole === 'ADMIN' && (
          <AdminDashboard lang={currentLang} />
        )}
        {currentRole === 'RETAILER' && (
          <RetailerDashboard
            outletId={selectedOutletId}
            lang={currentLang}
          />
        )}
        {currentRole === 'MEDIA_MANAGER' && (
          <MediaManagerDashboard lang={currentLang} />
        )}
        {currentRole === 'AIRLINE' && (
          <AirlineDashboard
            airlineIata={selectedAirlineIata}
            lang={currentLang}
          />
        )}
        {currentRole === 'SCREEN_SIM' && (
          <PassengerScreen
            lang={currentLang}
            defaultScreenId="SC-T2-042"
          />
        )}
      </main>

      {/* Split-Screen Cause-and-Effect Demonstration Modal */}
      {splitScreenOpen && (
        <SplitScreenModal
          onClose={() => setSplitScreenOpen(false)}
          lang={currentLang}
          selectedOutletId={selectedOutletId}
          selectedAirlineIata={selectedAirlineIata}
        />
      )}
    </div>
  );
}
