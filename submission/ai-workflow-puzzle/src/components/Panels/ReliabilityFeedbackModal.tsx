import React from 'react';
import {
  X,
  Trophy,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight
} from 'lucide-react';
import { useExecutionStore, usePuzzleStore, useUIStore } from '../../stores';

export const ReliabilityFeedbackModal: React.FC = () => {
  const {
    showReliabilityModal,
    setShowReliabilityModal,
    evaluationResult,
    executionTrace
  } = useExecutionStore();
  const { getCurrentPuzzle, puzzles, setCurrentPuzzle } = usePuzzleStore();
  const { setActiveModal } = useUIStore();

  if (!showReliabilityModal || !evaluationResult) {
    return null;
  }

  const currentPuzzle = getCurrentPuzzle();
  const { feedback, score, isPuzzleSolved, verdictMessage } = evaluationResult;

  const currentIdx = puzzles.findIndex((p) => p.id === currentPuzzle.id);
  const nextPuzzle = puzzles[currentIdx + 1];

  const handleNextPuzzle = () => {
    if (nextPuzzle) {
      setCurrentPuzzle(nextPuzzle.id);
      setShowReliabilityModal(false);
    }
  };

  const scoreColor =
    score >= 80 ? 'text-emerald-500' : score >= 50 ? 'text-amber-500' : 'text-rose-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className={`p-6 text-white flex items-center justify-between ${
          isPuzzleSolved
            ? 'bg-gradient-to-r from-emerald-600 to-teal-700'
            : 'bg-gradient-to-r from-slate-800 to-indigo-900'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md">
              {isPuzzleSolved ? (
                <Trophy className="w-8 h-8 text-yellow-300 animate-bounce" />
              ) : (
                <AlertTriangle className="w-8 h-8 text-amber-300" />
              )}
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold opacity-80">
                Reliability Assessment Report
              </span>
              <h2 className="text-xl font-bold">{currentPuzzle.title}</h2>
              <p className="text-xs text-white/90 mt-0.5">{verdictMessage}</p>
            </div>
          </div>

          <button
            onClick={() => setShowReliabilityModal(false)}
            className="p-1.5 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          {/* Score & Metrics Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Score Metric Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <span className="text-xs text-slate-500 font-medium">Reliability Score</span>
              <div className={`text-4xl font-extrabold my-1 ${scoreColor}`}>
                {score}%
              </div>
              <span className="text-[11px] text-slate-400">
                Target: {currentPuzzle.completionCriteria.minReliabilityScore || 80}%
              </span>
            </div>

            {/* Checklist Card */}
            <div className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
              <span className="text-xs font-bold text-slate-700 block mb-1">
                Completion Checklist
              </span>
              <div className="flex items-center space-x-2">
                {feedback.completedSuccessfully ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                )}
                <span className="text-slate-700 font-medium">Workflow Completed Execution</span>
              </div>

              <div className="flex items-center space-x-2">
                {feedback.outputValid ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                )}
                <span className="text-slate-700 font-medium">Output Validated Against Schema</span>
              </div>

              <div className="flex items-center space-x-2">
                {feedback.failureHandled ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                )}
                <span className="text-slate-700 font-medium">Injected Failure Scenario Mitigated</span>
              </div>
            </div>
          </div>

          {/* Strengths / Wins */}
          {feedback.strengths.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Resilience Wins & Strengths</span>
              </h3>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 space-y-1.5">
                {feedback.strengths.map((str, i) => (
                  <div key={i} className="flex items-start space-x-2 text-xs text-emerald-900">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{str}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weaknesses / Suggestions */}
          {feedback.weaknesses.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Vulnerabilities & Suggested Repairs</span>
              </h3>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-1.5">
                {feedback.weaknesses.map((weak, i) => (
                  <div key={i} className="flex items-start space-x-2 text-xs text-amber-900">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{weak}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Final Output Viewer */}
          <div>
            <span className="text-xs font-bold text-gray-700 block mb-1">
              Final Workflow Output
            </span>
            <pre className="p-3 bg-slate-900 text-emerald-300 rounded-xl font-mono text-[11px] overflow-x-auto max-h-40 scrollbar-thin">
              {executionTrace?.finalOutput !== undefined
                ? JSON.stringify(executionTrace.finalOutput, null, 2)
                : 'null'}
            </pre>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <button
            onClick={() => setShowReliabilityModal(false)}
            className="btn btn-secondary text-xs px-4 py-2"
          >
            Review Workflow
          </button>

          <div className="flex items-center space-x-2">
            {nextPuzzle && isPuzzleSolved && (
              <button
                onClick={handleNextPuzzle}
                className="btn btn-primary text-xs px-4 py-2 flex items-center space-x-1.5 shadow-md"
              >
                <span>Next Puzzle: {nextPuzzle.title}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => {
                setShowReliabilityModal(false);
                setActiveModal('puzzle-select');
              }}
              className="btn bg-slate-800 hover:bg-slate-900 text-white text-xs px-4 py-2"
            >
              All Puzzles
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
