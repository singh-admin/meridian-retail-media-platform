import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  WorkflowNode,
  WorkflowEdge,
  WorkflowDefinition,
  Puzzle,
  BlockType,
  StepExecution,
  ExecutionTrace,
  BlockConfig,
  HumanDecision
} from '../types';
import { BLOCK_DEFINITIONS } from '../types/blocks';
import { ALL_PUZZLES } from '../puzzles';
import { EvaluationResult } from '../engine/reliabilityEvaluator';

// ================= WORKFLOW STORE =================
interface WorkflowState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNodeId: string | null;
  setNodes: (nodes: WorkflowNode[]) => void;
  setEdges: (edges: WorkflowEdge[]) => void;
  addNode: (node: WorkflowNode) => void;
  updateNode: (id: string, data: Partial<WorkflowNode>) => void;
  updateNodeConfig: (id: string, configUpdates: Record<string, any>) => void;
  deleteNode: (id: string) => void;
  setSelectedNode: (id: string | null) => void;
  resetWorkflow: () => void;
  loadWorkflow: (workflow: WorkflowDefinition) => void;
  getWorkflowDefinition: () => WorkflowDefinition;
}

export const useWorkflowStore = create<WorkflowState>()(
  persist(
    (set, get) => ({
      nodes: ALL_PUZZLES[0]?.initialWorkflow?.nodes || [],
      edges: ALL_PUZZLES[0]?.initialWorkflow?.edges || [],
      selectedNodeId: null,
      setNodes: (nodes) => set({ nodes }),
      setEdges: (edges) => set({ edges }),
      addNode: (node) => set((state) => ({ nodes: [...state.nodes, node] })),
      updateNode: (id, data) =>
        set((state) => ({
          nodes: state.nodes.map((n) => (n.id === id ? { ...n, ...data } : n))
        })),
      updateNodeConfig: (id, configUpdates) =>
        set((state) => ({
          nodes: state.nodes.map((n) =>
            n.id === id
              ? {
                  ...n,
                  data: {
                    ...n.data,
                    config: { ...n.data.config, ...configUpdates }
                  }
                }
              : n
          )
        })),
      deleteNode: (id) =>
        set((state) => ({
          nodes: state.nodes.filter((n) => n.id !== id),
          edges: state.edges.filter((e) => e.source !== id && e.target !== id),
          selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId
        })),
      setSelectedNode: (id) => set({ selectedNodeId: id }),
      resetWorkflow: () => set({ nodes: [], edges: [], selectedNodeId: null }),
      loadWorkflow: (workflow) =>
        set({
          nodes: workflow.nodes,
          edges: workflow.edges,
          selectedNodeId: null
        }),
      getWorkflowDefinition: () => {
        const { nodes, edges } = get();
        return {
          id: 'current-workflow',
          name: 'Current Workflow',
          description: '',
          nodes,
          edges,
          sampleInput: {},
          expectedOutput: {}
        };
      }
    }),
    { name: 'workflow-store', partialize: (state) => ({ nodes: state.nodes, edges: state.edges }) }
  )
);

// ================= PUZZLE STORE =================
interface PuzzleState {
  puzzles: Puzzle[];
  currentPuzzleId: string;
  completedPuzzleIds: string[];
  blockDefinitions: Record<BlockType, BlockConfig>;
  setPuzzles: (puzzles: Puzzle[]) => void;
  setCurrentPuzzle: (id: string) => void;
  getCurrentPuzzle: () => Puzzle;
  getAvailableBlocks: () => BlockConfig[];
  markPuzzleSolved: (id: string) => void;
  loadInitialWorkflow: () => void;
  loadSolutionWorkflow: () => void;
}

export const usePuzzleStore = create<PuzzleState>()(
  persist(
    (set, get) => ({
      puzzles: ALL_PUZZLES,
      currentPuzzleId: ALL_PUZZLES[0].id,
      completedPuzzleIds: [],
      blockDefinitions: BLOCK_DEFINITIONS,
      setPuzzles: (puzzles) => set({ puzzles }),
      setCurrentPuzzle: (id) => {
        set({ currentPuzzleId: id });
        const puzzle = get().puzzles.find((p) => p.id === id);
        if (puzzle?.initialWorkflow) {
          useWorkflowStore.getState().loadWorkflow(puzzle.initialWorkflow);
        }
        useExecutionStore.getState().resetExecution();
      },
      getCurrentPuzzle: () => {
        const { puzzles, currentPuzzleId } = get();
        return puzzles.find((p) => p.id === currentPuzzleId) || puzzles[0];
      },
      getAvailableBlocks: () => {
        const { currentPuzzleId, puzzles, blockDefinitions } = get();
        const puzzle = puzzles.find((p) => p.id === currentPuzzleId) || puzzles[0];
        if (!puzzle.availableBlocks || puzzle.availableBlocks.length === 0) {
          return Object.values(blockDefinitions);
        }
        return puzzle.availableBlocks.map((type) => blockDefinitions[type]).filter(Boolean);
      },
      markPuzzleSolved: (id) =>
        set((state) => ({
          completedPuzzleIds: Array.from(new Set([...state.completedPuzzleIds, id]))
        })),
      loadInitialWorkflow: () => {
        const puzzle = get().getCurrentPuzzle();
        if (puzzle?.initialWorkflow) {
          useWorkflowStore.getState().loadWorkflow(puzzle.initialWorkflow);
          useExecutionStore.getState().resetExecution();
        }
      },
      loadSolutionWorkflow: () => {
        const puzzle = get().getCurrentPuzzle();
        if (puzzle?.solutionWorkflow) {
          useWorkflowStore.getState().loadWorkflow(puzzle.solutionWorkflow);
          useExecutionStore.getState().resetExecution();
        }
      }
    }),
    {
      name: 'puzzle-store',
      partialize: (state) => ({
        currentPuzzleId: state.currentPuzzleId,
        completedPuzzleIds: state.completedPuzzleIds
      })
    }
  )
);

// ================= EXECUTION STORE =================
export interface HumanReviewRequestContext {
  stepId: string;
  node: WorkflowNode;
  input: any;
  prompt: string;
  reviewType: string;
  resolve: (decision: HumanDecision) => void;
}

interface ExecutionState {
  isRunning: boolean;
  isPaused: boolean;
  activeStepId: string | null;
  stepExecutions: StepExecution[];
  executionTrace: ExecutionTrace | null;
  failureScenarioEnabled: boolean;
  mockMode: boolean;
  humanReviewRequest: HumanReviewRequestContext | null;
  evaluationResult: EvaluationResult | null;
  showReliabilityModal: boolean;
  setRunning: (running: boolean) => void;
  setPaused: (paused: boolean) => void;
  setActiveStepId: (stepId: string | null) => void;
  addStepExecution: (execution: StepExecution) => void;
  updateStepExecution: (stepId: string, updates: Partial<StepExecution>) => void;
  setExecutionTrace: (trace: ExecutionTrace | null) => void;
  setFailureScenarioEnabled: (enabled: boolean) => void;
  setMockMode: (enabled: boolean) => void;
  setHumanReviewRequest: (req: HumanReviewRequestContext | null) => void;
  setEvaluationResult: (res: EvaluationResult | null) => void;
  setShowReliabilityModal: (show: boolean) => void;
  resetExecution: () => void;
}

export const useExecutionStore = create<ExecutionState>()((set) => ({
  isRunning: false,
  isPaused: false,
  activeStepId: null,
  stepExecutions: [],
  executionTrace: null,
  failureScenarioEnabled: true,
  mockMode: true,
  humanReviewRequest: null,
  evaluationResult: null,
  showReliabilityModal: false,
  setRunning: (running) => set({ isRunning: running }),
  setPaused: (paused) => set({ isPaused: paused }),
  setActiveStepId: (stepId) => set({ activeStepId: stepId }),
  addStepExecution: (execution) =>
    set((state) => ({ stepExecutions: [...state.stepExecutions, execution] })),
  updateStepExecution: (stepId, updates) =>
    set((state) => ({
      stepExecutions: state.stepExecutions.map((s) =>
        s.stepId === stepId ? { ...s, ...updates } : s
      )
    })),
  setExecutionTrace: (trace) => set({ executionTrace: trace }),
  setFailureScenarioEnabled: (enabled) => set({ failureScenarioEnabled: enabled }),
  setMockMode: (enabled) => set({ mockMode: enabled }),
  setHumanReviewRequest: (req) => set({ humanReviewRequest: req }),
  setEvaluationResult: (res) => set({ evaluationResult: res }),
  setShowReliabilityModal: (show) => set({ showReliabilityModal: show }),
  resetExecution: () =>
    set({
      isRunning: false,
      isPaused: false,
      activeStepId: null,
      stepExecutions: [],
      executionTrace: null,
      humanReviewRequest: null,
      evaluationResult: null,
      showReliabilityModal: false
    })
}));

// ================= UI STORE =================
interface UIState {
  sidebarOpen: boolean;
  rightPanelOpen: boolean;
  activeRightPanel: 'config' | 'trace' | null;
  activeModal: 'puzzle-select' | 'help-guide' | 'live-api' | null;
  setSidebarOpen: (open: boolean) => void;
  setRightPanelOpen: (open: boolean) => void;
  setActiveRightPanel: (panel: 'config' | 'trace' | null) => void;
  setActiveModal: (modal: 'puzzle-select' | 'help-guide' | 'live-api' | null) => void;
  toggleRightPanel: (panel: 'config' | 'trace') => void;
}

export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: true,
  rightPanelOpen: false,
  activeRightPanel: null,
  activeModal: null,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setRightPanelOpen: (open) => set({ rightPanelOpen: open }),
  setActiveRightPanel: (panel) =>
    set({ activeRightPanel: panel, rightPanelOpen: panel !== null }),
  setActiveModal: (modal) => set({ activeModal: modal }),
  toggleRightPanel: (panel) =>
    set((state) => ({
      activeRightPanel: state.activeRightPanel === panel ? null : panel,
      rightPanelOpen: state.activeRightPanel !== panel
    }))
}));