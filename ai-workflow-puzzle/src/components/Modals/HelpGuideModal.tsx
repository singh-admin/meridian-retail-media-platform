import React from 'react';
import {
  X,
  BookOpen,
  Shield,
  Layers,
  Lightbulb
} from 'lucide-react';
import { useUIStore } from '../../stores';

export const HelpGuideModal: React.FC = () => {
  const { activeModal, setActiveModal } = useUIStore();

  if (activeModal !== 'help-guide') {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-indigo-700 to-purple-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">AI Workflow Puzzle Builder Guide</h2>
              <p className="text-xs text-white/80">
                Mastering Resilient Multi-Step AI Application Design
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 hover:bg-white/10 rounded-full text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin text-xs text-gray-700">
          {/* Section 1: Core User Journey */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
              <Lightbulb className="w-4 h-4 text-indigo-600" />
              <span>How the Puzzle Game Works</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3">
                <span className="font-bold text-indigo-900 block mb-1">1. Pick a Puzzle</span>
                <p className="text-[11px] text-indigo-800">
                  Read the objective and inspect the initial broken workflow.
                </p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <span className="font-bold text-red-900 block mb-1">2. Trigger Fault</span>
                <p className="text-[11px] text-red-800">
                  Enable Failure Simulation and click Run to observe where it fails.
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <span className="font-bold text-amber-900 block mb-1">3. Repair & Shield</span>
                <p className="text-[11px] text-amber-800">
                  Add Validators, Retries, Fallbacks, or Human Review blocks.
                </p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                <span className="font-bold text-emerald-900 block mb-1">4. Win & Validate</span>
                <p className="text-[11px] text-emerald-800">
                  Re-run workflow to earn 100% Reliability Scorecard and celebrate!
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Block Types */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Workflow Block Categories</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 space-y-1">
                <h4 className="font-bold text-blue-900 text-xs">Core Execution Blocks</h4>
                <ul className="text-[11px] text-blue-800 space-y-1">
                  <li>• <strong>Input:</strong> Initial prompt or data payload</li>
                  <li>• <strong>AI Model:</strong> LLM prompt execution</li>
                  <li>• <strong>Tool:</strong> APIs, calculators, searches, emails</li>
                  <li>• <strong>Retrieval:</strong> RAG knowledge base search</li>
                  <li>• <strong>Condition:</strong> Dynamic branching logic</li>
                  <li>• <strong>Transform:</strong> JavaScript data formatting</li>
                  <li>• <strong>Output:</strong> Final structured delivery</li>
                </ul>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 space-y-1">
                <h4 className="font-bold text-orange-900 text-xs">Reliability & Recovery</h4>
                <ul className="text-[11px] text-orange-800 space-y-1">
                  <li>• <strong>Validator:</strong> Enforce JSON schema & rules</li>
                  <li>• <strong>Retry:</strong> Exponential backoff retry loop</li>
                  <li>• <strong>Fallback:</strong> Alternative model / safe default</li>
                  <li>• <strong>Timeout:</strong> Limit step run time</li>
                  <li>• <strong>Error Handler:</strong> Catch exceptions</li>
                  <li>• <strong>Safe Stop:</strong> Graceful controlled shutdown</li>
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-1">
                <h4 className="font-bold text-amber-900 text-xs">Human Governance</h4>
                <ul className="text-[11px] text-amber-800 space-y-1">
                  <li>• <strong>Human Review:</strong> Pause for manual inspection</li>
                  <li>• <strong>Approval Gate:</strong> Sign-off on high-risk actions</li>
                  <li>• <strong>Confidence Check:</strong> Route low-score outputs</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 3: AI Resilience Best Practices */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
              <Shield className="w-4 h-4 text-indigo-600" />
              <span>Resilient AI Design Principles</span>
            </h3>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-[11px] text-slate-700">
              <p>
                <strong>1. Never trust raw LLM output blindly:</strong> Always validate JSON structure, required keys, and types with a Validator block.
              </p>
              <p>
                <strong>2. Cascade Failovers:</strong> If your primary AI model provider experiences rate limits or server outages, cascade automatically to an alternative secondary model or cached fallback.
              </p>
              <p>
                <strong>3. Human-in-the-loop for irreversible actions:</strong> Sending emails, issuing financial refunds, or writing database records should be gated with an Approval Gate.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end">
          <button
            onClick={() => setActiveModal(null)}
            className="btn btn-primary text-xs px-5 py-2 font-bold"
          >
            Got It, Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
};
