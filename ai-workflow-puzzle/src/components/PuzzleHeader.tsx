import React from 'react';
import {
  AlertTriangle,
  CheckCircle,
  Sparkles,
  RotateCcw,
  Target
} from 'lucide-react';
import { usePuzzleStore, useExecutionStore } from '../stores';

export const PuzzleHeader: React.FC = () => {
  const { getCurrentPuzzle, completedPuzzleIds, loadInitialWorkflow, loadSolutionWorkflow } = usePuzzleStore();
  const { failureScenarioEnabled } = useExecutionStore();

  const currentPuzzle = getCurrentPuzzle();
  const isSolved = completedPuzzleIds.includes(currentPuzzle.id);

  return (
    <div className="bg-slate-900 text-white border-b border-slate-800 px-6 py-3 shadow-inner">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Left side: Objective & Story */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/60">
              {currentPuzzle.category || 'Reliability Challenge'}
            </span>
            {isSolved ? (
              <span className="flex items-center space-x-1 text-xs font-semibold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>SOLVED</span>
              </span>
            ) : (
              <span className="text-xs font-semibold text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                IN PROGRESS
              </span>
            )}
          </div>

          <div className="flex items-baseline space-x-2">
            <Target className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-slate-200 line-clamp-1">
              <span className="text-white font-bold">Goal: </span>
              {currentPuzzle.objective}
            </p>
          </div>

          {currentPuzzle.story && (
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 italic">
              "{currentPuzzle.story}"
            </p>
          )}
        </div>

        {/* Right side: Active Failure Scenario Banner */}
        <div className="flex items-center space-x-3">
          {failureScenarioEnabled && currentPuzzle.failureScenario && (
            <div className="bg-red-950/60 border border-red-800/80 rounded-lg px-3 py-1.5 flex items-center space-x-2 max-w-md">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 animate-pulse" />
              <div className="text-xs">
                <div className="font-semibold text-red-300 flex items-center space-x-1">
                  <span>Fault Injected:</span>
                  <span className="bg-red-900/80 text-red-200 px-1.5 py-0.2 rounded text-[10px] uppercase font-mono">
                    {currentPuzzle.failureScenario.failureType}
                  </span>
                </div>
                <p className="text-red-400 text-[11px] truncate" title={currentPuzzle.failureScenario.description}>
                  {currentPuzzle.failureScenario.description}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-1">
            <button
              onClick={loadInitialWorkflow}
              className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 flex items-center space-x-1 transition-colors"
              title="Reset to broken starting workflow"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Broken State</span>
            </button>
            <button
              onClick={loadSolutionWorkflow}
              className="text-xs px-2.5 py-1 bg-indigo-900/60 hover:bg-indigo-800/80 text-indigo-200 rounded border border-indigo-700 flex items-center space-x-1 transition-colors"
              title="Load full resilient solution"
            >
              <Sparkles className="w-3 h-3 text-indigo-300" />
              <span>Solution</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
