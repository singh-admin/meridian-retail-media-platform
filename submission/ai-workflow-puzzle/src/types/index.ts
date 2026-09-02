export type BlockType = 
  | 'input'
  | 'ai-model'
  | 'tool'
  | 'retrieval'
  | 'condition'
  | 'transform'
  | 'output'
  | 'validator'
  | 'retry'
  | 'fallback'
  | 'human-review'
  | 'approval-gate'
  | 'confidence-check'
  | 'timeout'
  | 'error-handler'
  | 'safe-stop';

export type StepStatus = 
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'paused'
  | 'retrying'
  | 'recovered'
  | 'safely-stopped'
  | 'waiting-human';

export type FailureType = 
  | 'timeout'
  | 'invalid-json'
  | 'missing-field'
  | 'schema-validation'
  | 'empty-retrieval'
  | 'low-confidence'
  | 'tool-failure'
  | 'human-rejection'
  | 'network-error';

export type RecoveryStrategy = 
  | 'retry'
  | 'fallback'
  | 'repair'
  | 'safe-default'
  | 'human-review'
  | 'safe-stop'
  | 'resume-from-last';

export interface BlockConfig {
  id: string;
  type: BlockType;
  label: string;
  description: string;
  icon: string;
  color: string;
  category: 'core' | 'reliability' | 'human-control';
  configSchema: ConfigField[];
  defaultConfig: Record<string, any>;
}

export interface ConfigField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'json' | 'code';
  required?: boolean;
  default?: any;
  options?: { value: string; label: string }[];
  description?: string;
}

export interface WorkflowNode {
  id: string;
  type: BlockType;
  position: { x: number; y: number };
  data: {
    label: string;
    config: Record<string, any>;
    description?: string;
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  animated?: boolean;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  sampleInput: any;
  expectedOutput?: any;
}

export interface Puzzle {
  id: string;
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category?: string;
  objective: string;
  story?: string;
  availableBlocks: BlockType[];
  sampleInput: any;
  expectedOutput: any;
  failureScenario: FailureScenario;
  completionCriteria: CompletionCriteria;
  initialWorkflow?: WorkflowDefinition;
  solutionWorkflow?: WorkflowDefinition;
  hint?: string;
  learningTakeaway?: string;
}

export interface FailureScenario {
  id: string;
  name: string;
  description: string;
  failureType: FailureType;
  triggerStepId: string;
  config: Record<string, any>;
  enabled: boolean;
}

export interface CompletionCriteria {
  mustComplete: boolean;
  mustHandleFailure: boolean;
  expectedOutputSchema?: any;
  minReliabilityScore?: number;
}

export interface StepExecution {
  stepId: string;
  stepType: BlockType;
  status: StepStatus;
  input: any;
  output: any;
  error?: string;
  validationResult?: ValidationResult;
  recoveryAction?: RecoveryAction;
  humanDecision?: HumanDecision;
  retryCount: number;
  startTime: number;
  endTime?: number;
  duration?: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface RecoveryAction {
  strategy: RecoveryStrategy;
  description: string;
  attemptNumber: number;
  success: boolean;
  fallbackOutput?: any;
}

export interface HumanDecision {
  action: 'approve' | 'edit' | 'reject';
  editedOutput?: any;
  reason?: string;
  timestamp: number;
}

export interface ExecutionTrace {
  workflowId: string;
  puzzleId: string;
  steps: StepExecution[];
  finalOutput: any;
  overallStatus: 'success' | 'failed' | 'safely-stopped' | 'paused-human';
  totalDuration: number;
  reliabilityScore: number;
  reliabilityFeedback: ReliabilityFeedback;
}

export interface ReliabilityFeedback {
  completedSuccessfully: boolean;
  outputValid: boolean;
  failureHandled: boolean;
  retryAttempts: number;
  fallbackActivated: boolean;
  humanApprovalUsed: boolean;
  unhandledErrors: string[];
  stoppedSafely: boolean;
  weaknesses: string[];
  strengths: string[];
  score: number;
}

export interface MockResponse {
  stepId: string;
  success: boolean;
  output: any;
  error?: string;
  delay?: number;
}

export interface PuzzleSeedData {
  puzzles: Puzzle[];
  mockResponses: Record<string, MockResponse[]>;
  blockDefinitions: BlockConfig[];
}