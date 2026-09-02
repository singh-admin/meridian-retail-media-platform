import React from 'react';
import {
  Play,
  RotateCcw,
  Sparkles,
  Lightbulb,
  FileText,
  BarChart2,
  HelpCircle,
  Key,
  Grid,
  AlertTriangle,
  Cpu
} from 'lucide-react';
import {
  usePuzzleStore,
  useWorkflowStore,
  useExecutionStore,
  useUIStore
} from '../stores';
import { WorkflowEngine } from '../engine/workflowEngine';
import confetti from 'canvas-confetti';

export const Navbar: React.FC = () => {
  const { getCurrentPuzzle, loadInitialWorkflow, loadSolutionWorkflow, markPuzzleSolved } = usePuzzleStore();
  const { nodes, edges } = useWorkflowStore();
  const {
    isRunning,
    failureScenarioEnabled,
    mockMode,
    evaluationResult,
    setRunning,
    setFailureScenarioEnabled,
    setActiveStepId,
    addStepExecution,
    updateStepExecution,
    setExecutionTrace,
    setHumanReviewRequest,
    setEvaluationResult,
    setShowReliabilityModal,
    resetExecution
  } = useExecutionStore();
  const { setActiveModal, toggleRightPanel, setActiveRightPanel } = useUIStore();

  const currentPuzzle = getCurrentPuzzle();
  const [engineInstance, setEngineInstance] = React.useState<WorkflowEngine | null>(null);

  const handleRunWorkflow = async () => {
    resetExecution();
    setRunning(true);
    setActiveRightPanel('trace');

    const engine = new WorkflowEngine();
    setEngineInstance(engine);

    try {
      const { trace, evalResult } = await engine.runWorkflow(
        nodes,
        edges,
        currentPuzzle.sampleInput || {},
        currentPuzzle,
        failureScenarioEnabled,
        {
          onStepStart: (stepId) => {
            setActiveStepId(stepId);
          },
          onStepUpdate: (step) => {
            updateStepExecution(step.stepId, step);
          },
          onStepFinish: (step) => {
            addStepExecution(step);
          },
          onHumanReviewRequired: (context) => {
            setHumanReviewRequest(context);
          }
        }
      );

      setExecutionTrace(trace);
      setEvaluationResult(evalResult);
      setActiveStepId(null);
      setRunning(false);
      setShowReliabilityModal(true);

      if (evalResult.isPuzzleSolved) {
        markPuzzleSolved(currentPuzzle.id);
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error('Workflow execution failed:', err);
      setRunning(false);
      setActiveStepId(null);
    }
  };

  const handleReset = () => {
    if (engineInstance) {
      engineInstance.cancel();
    }
    loadInitialWorkflow();
    resetExecution();
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return <span className="difficulty-badge difficulty-beginner">Beginner</span>;
      case 'intermediate':
        return <span className="difficulty-badge difficulty-intermediate">Intermediate</span>;
      case 'advanced':
        return <span className="difficulty-badge difficulty-advanced">Advanced</span>;
      default:
        return null;
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-4 flex items-center justify-between z-30 sticky top-0 shadow-sm">
      {/* Left section: App Title & Puzzle Switcher */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
          <span className="text-2xl">🧩</span>
          <div>
            <h1 className="text-sm font-bold text-indigo-900 leading-tight">AI Workflow Puzzle</h1>
            <p className="text-[10px] text-indigo-600 font-medium">Reliability & Resilience Lab</p>
          </div>
        </div>

        <button
          onClick={() => setActiveModal('puzzle-select')}
          className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-medium transition-colors border border-gray-300"
          title="Switch Puzzle"
        >
          <Grid className="w-4 h-4 text-gray-600" />
          <span className="font-semibold">{currentPuzzle.title}</span>
          {getDifficultyBadge(currentPuzzle.difficulty)}
        </button>
      </div>

      {/* Middle section: Failure Simulation Toggle & Controls */}
      <div className="flex items-center space-x-3">
        {/* Failure Scenario Toggle Button */}
        <button
          onClick={() => setFailureScenarioEnabled(!failureScenarioEnabled)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            failureScenarioEnabled
              ? 'bg-red-50 text-red-700 border-red-300 ring-2 ring-red-200 shadow-sm'
              : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
          }`}
          title="Toggle controlled failure scenario for this puzzle"
        >
          <AlertTriangle className={`w-3.5 h-3.5 ${failureScenarioEnabled ? 'text-red-600 animate-pulse' : 'text-gray-400'}`} />
          <span>Failure Simulation:</span>
          <span className={`uppercase font-bold ${failureScenarioEnabled ? 'text-red-700' : 'text-gray-600'}`}>
            {failureScenarioEnabled ? 'ON' : 'OFF'}
          </span>
        </button>

        {/* Mock Mode / AI Provider Badge */}
        <button
          onClick={() => setActiveModal('live-api')}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-medium border border-emerald-200 hover:bg-emerald-100"
          title="Configure AI Providers or View Mock Mode"
        >
          <Cpu className="w-3.5 h-3.5 text-emerald-600" />
          <span>{mockMode ? 'Mock AI (Free)' : 'Live AI Provider'}</span>
          <Key className="w-3 h-3 text-emerald-600 opacity-70" />
        </button>

        {/* Run Button */}
        <button
          onClick={handleRunWorkflow}
          disabled={isRunning}
          className={`btn flex items-center space-x-2 px-5 py-2 font-bold rounded-lg shadow-md transition-all ${
            isRunning
              ? 'bg-indigo-400 text-white cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white ring-2 ring-indigo-500 ring-offset-1'
          }`}
        >
          <Play className={`w-4 h-4 ${isRunning ? 'animate-spin' : 'fill-current'}`} />
          <span>{isRunning ? 'Running...' : 'Run Workflow'}</span>
        </button>

        {/* Reset Button */}
        <button
          onClick={handleReset}
          className="btn btn-secondary px-3 py-2 text-xs flex items-center space-x-1.5 text-gray-700"
          title="Reset workflow to starting state"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Right section: Solution, Hint, Trace, Scorecard, Help */}
      <div className="flex items-center space-x-2">
        <button
          onClick={loadSolutionWorkflow}
          className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-300 rounded-lg transition-colors"
          title="Load reference resilient solution"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Solution</span>
        </button>

        {currentPuzzle.hint && (
          <button
            onClick={() => alert(`💡 Puzzle Hint:\n\n${currentPuzzle.hint}`)}
            className="p-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-transparent hover:border-amber-200"
            title="View Hint"
          >
            <Lightbulb className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={() => toggleRightPanel('trace')}
          className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors"
          title="Toggle Execution Trace"
        >
          <FileText className="w-3.5 h-3.5 text-gray-600" />
          <span>Trace</span>
        </button>

        {evaluationResult && (
          <button
            onClick={() => setShowReliabilityModal(true)}
            className="flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
            title="View Reliability Scorecard"
          >
            <BarChart2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Score: {evaluationResult.score}%</span>
          </button>
        )}

        <button
          onClick={() => setActiveModal('help-guide')}
          className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-200"
          title="Resilience Guide & Rules"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
