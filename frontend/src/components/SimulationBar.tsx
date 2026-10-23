import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { socket } from '../services/socket';
import { SimulationState } from '../types';
import {
  Play,
  Pause,
  FastForward,
  Clock,
  Zap,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  Columns
} from 'lucide-react';

interface SimulationBarProps {
  onToggleSplitScreen?: () => void;
  lang?: 'en' | 'fr';
}

export const SimulationBar: React.FC<SimulationBarProps> = ({ onToggleSplitScreen, lang = 'en' }) => {
  const [state, setState] = useState<SimulationState>({
    simulatedTime: '2026-10-14T14:00:00Z',
    isPlaying: true,
    speed: 1
  });
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'warn' } | null>(null);

  useEffect(() => {
    // Initial fetch
    api.getSimulationState().then(setState).catch(console.error);

    // Socket subscriptions
    const unsub = socket.subscribe((event) => {
      if (event.type === 'SIMULATION_TICK' || event.type === 'SIMULATION_STATE_CHANGED' || event.type === 'SIMULATION_RESET') {
        setState(event.payload);
      } else if (event.type === 'CAUSE_AND_EFFECT_TRIGGERED') {
        const { eventType, flightNumber, delayMinutes, newGate, screenId } = event.payload;
        let msg = '';
        if (eventType === 'DELAY_INJECTED') {
          msg = `⚡ Live AIDX Event: Flight ${flightNumber} delayed +${delayMinutes}m. Gate 42 screens re-planned in < 2s! Retailer delay trigger fired.`;
        } else if (eventType === 'GATE_CHANGE_INJECTED') {
          msg = `⚡ Live AIDX Gate Change: Flight ${flightNumber} reallocated to Gate ${newGate}. Catchment crowd re-calculated!`;
        } else if (eventType === 'SCREEN_OFFLINE_INJECTED') {
          msg = `⚡ Alert: Screen ${screenId} marked OFFLINE. Incident auto-logged and fallback rerouted.`;
        }
        setNotification({ message: msg, type: 'success' });
        setTimeout(() => setNotification(null), 6000);
      } else if (event.type === 'PROMO_REDEEMED') {
        setNotification({
          message: `🎉 Live Redemption: Promo code ${event.payload.code} redeemed! Retailer revenue & conversion updated live.`,
          type: 'success'
        });
        setTimeout(() => setNotification(null), 5000);
      }
    });

    return unsub;
  }, []);

  const handlePlayPause = async () => {
    try {
      const res = await api.setPlayState(!state.isPlaying);
      setState(res);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSpeed = async (speed: number) => {
    try {
      const res = await api.setSimulationSpeed(speed);
      setState(res);
    } catch (e) {
      console.error(e);
    }
  };

  const handleJumpWorkedExample = async () => {
    try {
      const res = await api.jumpSimulationTime('2026-10-14T14:10:00Z');
      setState(res);
      setNotification({
        message: '🕒 Jumped to 14:10 UTC (Worked Example Gate 42 Rush Hour). Crowd Profile: Holiday 58%, Family 31%, Dwell 52m.',
        type: 'success'
      });
      setTimeout(() => setNotification(null), 5000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleInjectDelay = async () => {
    try {
      await api.injectDelay('XH960', 45);
    } catch (e) {
      console.error(e);
    }
  };

  const handleInjectGateChange = async () => {
    try {
      await api.injectGateChange('SKJ862', '42');
    } catch (e) {
      console.error(e);
    }
  };

  const handleInjectScreenOffline = async () => {
    try {
      await api.injectScreenOffline('SC-T2-042');
    } catch (e) {
      console.error(e);
    }
  };

  const handleReset = async () => {
    try {
      const res = await api.resetSimulation();
      setState(res.state);
      setNotification({ message: 'Simulation reset to 14:00 baseline.', type: 'warn' });
      setTimeout(() => setNotification(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  // Format UTC display
  const formattedTime = new Date(state.simulatedTime).toUTCString().replace('GMT', 'UTC');

  return (
    <div className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-white shadow-xl transition-all">
      {/* Live Cause & Effect Notification Banner */}
      {notification && (
        <div className={`px-4 py-2 text-xs font-semibold flex items-center justify-between transition-all duration-300 ${
          notification.type === 'success'
            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
            : 'bg-gradient-to-r from-amber-600 to-orange-600 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-white/80 hover:text-white text-xs px-2"
          >
            ✕
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Clock & Status */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-slate-800/90 border border-slate-700 px-3 py-1.5 rounded-lg shadow-inner">
            <Clock className="w-4 h-4 text-sky-400 animate-pulse" />
            <span className="font-mono text-xs md:text-sm font-bold tracking-wider text-sky-200">
              {formattedTime}
            </span>
          </div>

          {/* Play/Pause */}
          <button
            onClick={handlePlayPause}
            className={`p-1.5 rounded-lg font-medium text-xs flex items-center space-x-1.5 transition-colors ${
              state.isPlaying
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
            }`}
            title={state.isPlaying ? 'Pause Simulation' : 'Resume Simulation'}
          >
            {state.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span className="hidden sm:inline">{state.isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          {/* Speed Selector */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg p-0.5 text-xs font-semibold">
            {[1, 10, 60].map((s) => (
              <button
                key={s}
                onClick={() => handleSpeed(s)}
                className={`px-2 py-1 rounded transition-colors ${
                  state.speed === s
                    ? 'bg-sky-500 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Center: Jump to Worked Example */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleJumpWorkedExample}
            className="bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-medium text-xs px-3 py-1.5 rounded-lg shadow border border-sky-400/30 flex items-center space-x-1.5 transition-transform active:scale-95"
            title="Jump simulation clock to 14:10 Gate 42 rush hour (specification worked example)"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>Jump to 14:10 (Worked Example)</span>
          </button>
        </div>

        {/* Right: Inject Events & WOW Tools */}
        <div className="flex items-center space-x-2 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider hidden lg:inline">
            Inject Events:
          </span>

          <button
            onClick={handleInjectDelay}
            className="bg-rose-950/60 hover:bg-rose-900 border border-rose-700/60 text-rose-300 font-medium text-xs px-2.5 py-1.5 rounded-lg flex items-center space-x-1 transition-colors"
            title="Inject AIDX Flight Delay (+45m on Flight XH960 to Dubai at Gate 42)"
          >
            <Zap className="w-3.5 h-3.5 text-rose-400" />
            <span>Delay +45m</span>
          </button>

          <button
            onClick={handleInjectGateChange}
            className="bg-amber-950/60 hover:bg-amber-900 border border-amber-700/60 text-amber-300 font-medium text-xs px-2.5 py-1.5 rounded-lg flex items-center space-x-1 transition-colors"
            title="Inject Gate Change (Move Flight SKJ862 to Gate 42)"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Gate Change</span>
          </button>

          <button
            onClick={handleInjectScreenOffline}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 font-medium text-xs px-2.5 py-1.5 rounded-lg flex items-center space-x-1 transition-colors"
            title="Inject Screen Failure (Mark Gate 42 Screen Offline)"
          >
            <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>Screen Fail</span>
          </button>

          <button
            onClick={handleReset}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            title="Reset Simulation Data"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Split Screen Demo Mode Toggle */}
          {onToggleSplitScreen && (
            <button
              onClick={onToggleSplitScreen}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3 py-1.5 rounded-lg shadow flex items-center space-x-1.5 transition-transform active:scale-95 ml-2"
              title="Launch Split-Screen Mode (Passenger View on Left, Dashboard on Right)"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Split-Screen Demo</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
