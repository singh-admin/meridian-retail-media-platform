import React, { useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PuzzleHeader } from './components/PuzzleHeader';
import { BlockPalette } from './components/Sidebar/BlockPalette';
import { WorkflowCanvas } from './components/Canvas/WorkflowCanvas';
import { NodeConfigPanel } from './components/Panels/NodeConfigPanel';
import { ExecutionTracePanel } from './components/Panels/ExecutionTracePanel';
import { ReliabilityFeedbackModal } from './components/Panels/ReliabilityFeedbackModal';
import { HumanReviewModal } from './components/Modals/HumanReviewModal';
import { PuzzleSelectorModal } from './components/Modals/PuzzleSelectorModal';
import { HelpGuideModal } from './components/Modals/HelpGuideModal';
import { LiveAPIModal } from './components/Modals/LiveAPIModal';
import { usePuzzleStore } from './stores';

export const App: React.FC = () => {
  const { getCurrentPuzzle, loadInitialWorkflow } = usePuzzleStore();

  useEffect(() => {
    // Initialize first puzzle workflow if canvas is empty
    const currentPuzzle = getCurrentPuzzle();
    if (currentPuzzle?.initialWorkflow) {
      loadInitialWorkflow();
    }
  }, [getCurrentPuzzle, loadInitialWorkflow]);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-100 overflow-hidden font-sans">
      {/* Top Navbar */}
      <Navbar />

      {/* Puzzle Objective & Fault Banner */}
      <PuzzleHeader />

      {/* Main Canvas Workspace */}
      <main className="flex-1 flex relative overflow-hidden">
        {/* Left Block Palette */}
        <BlockPalette />

        {/* Center Interactive Graph Canvas */}
        <WorkflowCanvas />

        {/* Right Configuration Inspector Panel */}
        <NodeConfigPanel />

        {/* Right Live Execution Trace Panel */}
        <ExecutionTracePanel />
      </main>

      {/* Interactive Overlays & Modals */}
      <ReliabilityFeedbackModal />
      <HumanReviewModal />
      <PuzzleSelectorModal />
      <HelpGuideModal />
      <LiveAPIModal />
    </div>
  );
};

export default App;
