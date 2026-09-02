import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  RotateCw,
  ShieldCheck,
  PauseCircle,
  UserCheck,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  Check
} from 'lucide-react';
import { useExecutionStore, useUIStore } from '../../stores';
import { StepExecution } from '../../types';

export const ExecutionTracePanel: React.FC = () => {
  const { stepExecutions, executionTrace, isRunning, activeStepId } = useExecutionStore();
  const { activeRightPanel, setActiveRightPanel } = useUIStore();

  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (activeRightPanel !== 'trace') {
    return null;
  }

  const toggleExpand = (stepId: string) => {
    setExpandedSteps((prev) => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const getStatusIcon = (status: string, isCurrent: boolean) => {
    if (isCurrent || status === 'running') {
      return <RotateCw className="w-4 h-4 text-blue-500 animate-spin flex-shrink-0" />;
    }
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />;
      case 'retrying':
        return <RotateCw className="w-4 h-4 text-orange-500 animate-spin flex-shrink-0" />;
      case 'recovered':
        return <ShieldCheck className="w-4 h-4 text-purple-500 flex-shrink-0" />;
      case 'safely-stopped':
        return <PauseCircle className="w-4 h-4 text-slate-500 flex-shrink-0" />;
      case 'waiting-human':
        return <UserCheck className="w-4 h-4 text-amber-500 flex-shrink-0" />;
      default:
        return <div className="w-2.5 h-2.5 rounded-full bg-gray-300 flex-shrink-0 m-0.5" />;
    }
  };

  return (
    <aside className="w-96 bg-white border-l border-gray-200 flex flex-col h-[calc(100vh-4rem)] z-20 shadow-xl select-none">
      {/* Trace Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-slate-900 text-white">
        <div>
          <h2 className="font-bold text-sm flex items-center space-x-2">
            <span>Execution Trace</span>
            {isRunning && (
              <span className="bg-blue-600 text-white text-[10px] px-2 py-0.2 rounded-full font-mono animate-pulse">
                LIVE
              </span>
            )}
          </h2>
          <p className="text-[11px] text-slate-400">
            {stepExecutions.length} steps executed • {executionTrace ? `${executionTrace.totalDuration}ms` : 'In progress'}
          </p>
        </div>
        <button
          onClick={() => setActiveRightPanel(null)}
          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
          title="Close Trace"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Trace Stream List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 scrollbar-thin bg-slate-50">
        {stepExecutions.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-xs">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p>No steps executed yet.</p>
            <p className="text-[11px] text-gray-400 mt-1">Click "Run Workflow" to observe execution trace.</p>
          </div>
        )}

        {stepExecutions.map((step: StepExecution, idx: number) => {
          const isCurrent = activeStepId === step.stepId;
          const isExpanded = expandedSteps[step.stepId] ?? (idx === stepExecutions.length - 1);

          return (
            <div
              key={`${step.stepId}-${idx}`}
              className={`bg-white rounded-xl border transition-all overflow-hidden ${
                isCurrent
                  ? 'border-blue-400 ring-2 ring-blue-100 shadow-md'
                  : step.status === 'failed'
                  ? 'border-red-300'
                  : 'border-gray-200 shadow-xs'
              }`}
            >
              {/* Step Card Header */}
              <div
                onClick={() => toggleExpand(step.stepId)}
                className="p-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-2 min-w-0">
                  {getStatusIcon(step.status, isCurrent)}
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-gray-900 truncate">
                      {step.stepId}
                    </h4>
                    <span className="text-[10px] text-gray-500 font-mono uppercase">
                      {step.stepType}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {step.duration !== undefined && (
                    <span className="text-[10px] text-gray-400 font-mono">
                      {step.duration}ms
                    </span>
                  )}
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Step Expanded Details */}
              {isExpanded && (
                <div className="p-3 border-t border-gray-100 bg-gray-50/70 space-y-2 text-xs">
                  {/* Status Banner */}
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-500 font-medium">Status:</span>
                    <span className={`font-semibold capitalize ${
                      step.status === 'completed'
                        ? 'text-emerald-700'
                        : step.status === 'failed'
                        ? 'text-red-700'
                        : step.status === 'recovered'
                        ? 'text-purple-700'
                        : 'text-gray-700'
                    }`}>
                      {step.status}
                    </span>
                  </div>

                  {/* Recovery Action Info */}
                  {step.recoveryAction && (
                    <div className="p-2 bg-purple-50 border border-purple-200 rounded-lg text-purple-900 text-[11px]">
                      <div className="font-bold flex items-center space-x-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                        <span>Recovery Strategy: {step.recoveryAction.strategy}</span>
                      </div>
                      <p className="mt-0.5 text-[10px] text-purple-800">{step.recoveryAction.description}</p>
                    </div>
                  )}

                  {/* Validation Result */}
                  {step.validationResult && (
                    <div className={`p-2 rounded-lg text-[11px] border ${
                      step.validationResult.valid
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}>
                      <div className="font-bold">
                        Validation: {step.validationResult.valid ? 'PASSED' : 'FAILED'}
                      </div>
                      {step.validationResult.errors.length > 0 && (
                        <ul className="list-disc list-inside mt-1 text-[10px] text-amber-800 space-y-0.5">
                          {step.validationResult.errors.map((err, i) => (
                            <li key={i}>{err}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {/* Human Decision */}
                  {step.humanDecision && (
                    <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px]">
                      <div className="font-bold">Human Decision: {step.humanDecision.action.toUpperCase()}</div>
                      {step.humanDecision.reason && (
                        <p className="text-[10px] text-amber-800 mt-0.5">Note: {step.humanDecision.reason}</p>
                      )}
                    </div>
                  )}

                  {/* Error Message */}
                  {step.error && (
                    <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-[11px] font-mono">
                      <strong>Error:</strong> {step.error}
                    </div>
                  )}

                  {/* Step Output JSON Viewer */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-semibold text-gray-700">Step Output:</span>
                      <button
                        onClick={() =>
                          copyToClipboard(JSON.stringify(step.output, null, 2), `out-${step.stepId}`)
                        }
                        className="text-[10px] text-gray-500 hover:text-indigo-600 flex items-center space-x-1"
                      >
                        {copiedKey === `out-${step.stepId}` ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedKey === `out-${step.stepId}` ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <pre className="p-2 bg-slate-900 text-emerald-300 rounded-lg font-mono text-[10px] overflow-x-auto max-h-36 scrollbar-thin">
                      {step.output !== undefined
                        ? JSON.stringify(step.output, null, 2)
                        : 'null'}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};
