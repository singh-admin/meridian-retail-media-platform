import React, { useState } from 'react';
import { Screen, Zone } from '../../types';
import { Tv, AlertTriangle, CheckCircle, WifiOff } from 'lucide-react';

interface TerminalMapProps {
  screens: Screen[];
  zones: Zone[];
  selectedScreenId?: string;
  onSelectScreen?: (screenId: string) => void;
  showHeatmap?: boolean;
}

export const TerminalMap: React.FC<TerminalMapProps> = ({
  screens,
  zones,
  selectedScreenId,
  onSelectScreen,
  showHeatmap = true
}) => {
  const [hoveredScreen, setHoveredScreen] = useState<Screen | null>(null);

  // Position helper for mock terminal coordinates
  const getScreenCoordinates = (screen: Screen, index: number) => {
    const isT2 = screen.terminal === 'T2';
    const offsetX = isT2 ? 520 : 60;
    const isGate42 = screen.screenId === 'SC-T2-042';
    const isGate43 = screen.screenId === 'SC-T2-043';

    if (isGate42) return { x: 780, y: 190 };
    if (isGate43) return { x: 810, y: 220 };

    // Deterministic distribution across piers
    const row = Math.floor(index / 8);
    const col = index % 8;
    const x = offsetX + col * 46 + (isT2 ? 20 : 15);
    const y = 80 + row * 42;

    return { x: Math.min(x, isT2 ? 940 : 440), y: Math.min(y, 350) };
  };

  return (
    <div className="relative w-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl p-4">
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1.5 text-emerald-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Online</span>
          </span>
          <span className="flex items-center space-x-1.5 text-amber-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Degraded</span>
          </span>
          <span className="flex items-center space-x-1.5 text-rose-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>Offline</span>
          </span>
          <span className="text-slate-400 border-l border-slate-700 pl-4">
            Total Inventory: <strong className="text-white">{screens.length} Screens</strong>
          </span>
        </div>
        <div className="text-slate-400 text-[11px]">
          Click any screen node to view live signage telemetry
        </div>
      </div>

      <div className="relative aspect-[16/7] w-full">
        <svg
          viewBox="0 0 1000 400"
          className="w-full h-full select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Grid background */}
          <defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            </pattern>
            {/* Heatmap Gradients */}
            <radialGradient id="heatT2Gate42" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(239, 68, 68, 0.45)" />
              <stop offset="50%" stopColor="rgba(245, 158, 11, 0.25)" />
              <stop offset="100%" stopColor="rgba(239, 68, 68, 0)" />
            </radialGradient>
            <radialGradient id="heatDutyFree" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(56, 189, 248, 0.35)" />
              <stop offset="60%" stopColor="rgba(56, 189, 248, 0.15)" />
              <stop offset="100%" stopColor="rgba(56, 189, 248, 0)" />
            </radialGradient>
            <radialGradient id="heatT1Central" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(16, 185, 129, 0.3)" />
              <stop offset="70%" stopColor="rgba(16, 185, 129, 0.08)" />
              <stop offset="100%" stopColor="rgba(16, 185, 129, 0)" />
            </radialGradient>
          </defs>

          <rect width="1000" height="400" fill="url(#grid)" />

          {/* Heatmap Presence Overlays */}
          {showHeatmap && (
            <g className="transition-opacity duration-700">
              {/* Gate 42 Pier Surge Halo (Delay crowd dwell surge) */}
              <circle cx="790" cy="200" r="110" fill="url(#heatT2Gate42)" className="animate-pulse" />
              {/* Duty Free Walkway Presence */}
              <circle cx="630" cy="180" r="95" fill="url(#heatDutyFree)" />
              {/* T1 Domestic Central Promenade */}
              <circle cx="250" cy="180" r="100" fill="url(#heatT1Central)" />
            </g>
          )}

          {/* Terminal 1 (Domestic) Architectural Outline */}
          <g className="cursor-default">
            <rect x="50" y="40" width="410" height="320" rx="16" fill="rgba(30, 41, 59, 0.4)" stroke="#334155" strokeWidth="2" />
            <path d="M 50 160 L 460 160" stroke="#1e293b" strokeWidth="2" strokeDasharray="4 4" />
            <text x="70" y="70" fill="#94a3b8" fontSize="13" fontWeight="bold" letterSpacing="1">TERMINAL 1 (DOMESTIC)</text>
            <text x="70" y="90" fill="#64748b" fontSize="10">Concourse A & B (Gates A1-A10, B1-B10)</text>

            {/* T1 Zones text */}
            <rect x="70" y="270" width="160" height="65" rx="8" fill="rgba(15, 23, 42, 0.6)" stroke="#334155" strokeWidth="1" />
            <text x="80" y="295" fill="#38bdf8" fontSize="11" fontWeight="600">Central Retail & Dining</text>
            <text x="80" y="315" fill="#94a3b8" fontSize="9">Zone: ZONE-T1-RETAIL</text>
          </g>

          {/* Terminal 2 (International) Architectural Outline */}
          <g className="cursor-default">
            <rect x="500" y="40" width="460" height="320" rx="16" fill="rgba(30, 41, 59, 0.4)" stroke="#334155" strokeWidth="2" />
            <path d="M 500 160 L 960 160" stroke="#1e293b" strokeWidth="2" strokeDasharray="4 4" />
            <text x="520" y="70" fill="#38bdf8" fontSize="13" fontWeight="bold" letterSpacing="1">TERMINAL 2 (INTERNATIONAL)</text>
            <text x="520" y="90" fill="#64748b" fontSize="10">Grand Duty-Free Piazza & Concourse C Pier 4</text>

            {/* Pier 4 (Gates 40-50) Highlight Box */}
            <rect x="730" y="110" width="210" height="180" rx="12" fill="rgba(239, 68, 68, 0.08)" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="5 3" />
            <text x="745" y="135" fill="#f43f5e" fontSize="11" fontWeight="bold">PIER 4 (GATES 40-50)</text>
            <text x="745" y="152" fill="#fda4af" fontSize="9">Delayed Flight XH960 Catchment</text>

            {/* Duty Free Piazza Box */}
            <rect x="520" y="230" width="180" height="100" rx="10" fill="rgba(14, 165, 233, 0.06)" stroke="#0ea5e9" strokeWidth="1" />
            <text x="535" y="255" fill="#38bdf8" fontSize="11" fontWeight="600">Grand Duty Free Piazza</text>
            <text x="535" y="272" fill="#94a3b8" fontSize="9">Luxury Perfumery & Electronics</text>
          </g>

          {/* Render Screens Dots */}
          {screens.map((screen, idx) => {
            const coords = getScreenCoordinates(screen, idx);
            const isSelected = screen.screenId === selectedScreenId;
            const isGate42 = screen.screenId === 'SC-T2-042';

            const fillColor =
              screen.status === 'ONLINE'
                ? '#10b981'
                : screen.status === 'DEGRADED'
                ? '#f59e0b'
                : '#f43f5e';

            return (
              <g
                key={screen.screenId}
                className="cursor-pointer transition-transform duration-200 hover:scale-125"
                onClick={() => onSelectScreen && onSelectScreen(screen.screenId)}
                onMouseEnter={() => setHoveredScreen(screen)}
                onMouseLeave={() => setHoveredScreen(null)}
              >
                {/* Gate 42 Pulsing Target Marker */}
                {isGate42 && (
                  <circle
                    cx={coords.x}
                    cy={coords.y}
                    r="18"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    className="animate-ping"
                  />
                )}

                {/* Selection ring */}
                {isSelected && (
                  <circle
                    cx={coords.x}
                    cy={coords.y}
                    r="14"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    strokeDasharray="3 3"
                  />
                )}

                {/* Base dot */}
                <circle
                  cx={coords.x}
                  cy={coords.y}
                  r={isGate42 ? "8" : "5"}
                  fill={fillColor}
                  stroke="#0f172a"
                  strokeWidth="1.5"
                  className={screen.status === 'ONLINE' ? 'drop-shadow-[0_0_8px_rgba(16,185,129,0.7)]' : ''}
                />

                {/* Gate 42 Label */}
                {isGate42 && (
                  <g>
                    <rect x={coords.x - 38} y={coords.y - 28} width="76" height="18" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
                    <text x={coords.x} y={coords.y - 15} textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">
                      GATE 42
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredScreen && (
          <div className="absolute top-4 right-4 bg-slate-900/95 border border-slate-700 backdrop-blur-md rounded-lg shadow-xl p-3 text-xs w-64 pointer-events-none z-20">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
              <span className="font-bold text-white flex items-center space-x-1.5">
                <Tv className="w-3.5 h-3.5 text-sky-400" />
                <span>{hoveredScreen.screenId}</span>
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                hoveredScreen.status === 'ONLINE' ? 'bg-emerald-500/20 text-emerald-400' :
                hoveredScreen.status === 'DEGRADED' ? 'bg-amber-500/20 text-amber-400' :
                'bg-rose-500/20 text-rose-400'
              }`}>
                {hoveredScreen.status}
              </span>
            </div>
            <div className="space-y-1 text-slate-300 text-[11px]">
              <div><span className="text-slate-500">Name:</span> {hoveredScreen.name}</div>
              <div><span className="text-slate-500">Terminal:</span> {hoveredScreen.terminal} • {hoveredScreen.concourse}</div>
              <div><span className="text-slate-500">Orientation:</span> {hoveredScreen.orientation} ({hoveredScreen.resolution})</div>
              <div><span className="text-slate-500">Nearest Gates:</span> {hoveredScreen.nearestGates.join(', ')}</div>
              <div><span className="text-slate-500">Telemetry:</span> {hoveredScreen.latencyMs}ms latency</div>
              {hoveredScreen.currentCampaignId && (
                <div className="pt-1 text-sky-400 font-semibold truncate">
                  Playing: {hoveredScreen.currentCampaignId}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
