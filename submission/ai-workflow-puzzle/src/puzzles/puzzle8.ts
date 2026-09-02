import { Puzzle } from '../types';

export const puzzle8: Puzzle = {
  id: 'puzzle-8-resume-interrupted',
  title: 'Resume the Interrupted Mission',
  difficulty: 'advanced',
  category: 'State Persistence & Checkpoint Resumption',
  objective: 'Continue a multi-step workflow from its last successful checkpoint step after an unexpected interruption, without repeating completed work.',
  story: 'A long-running AI research pipeline performs: (1) Data Ingestion -> (2) Entity Extraction -> (3) Synthesis -> (4) PDF Compilation. A memory spike causes a crash at Step 3 (Synthesis). Implement an Error Handler / Fallback strategy that restores intermediate state from the last checkpoint and resumes execution seamlessly.',
  availableBlocks: ['input', 'transform', 'ai-model', 'error-handler', 'fallback', 'output'],
  sampleInput: {
    missionId: 'MISSION-TITAN-9',
    datasetUrl: 'https://datasets.internal/deep-sea-expedition.json',
    targetEntities: ['hydrothermal vents', 'methane seeps', 'microbiome DNA']
  },
  expectedOutput: {
    missionId: 'MISSION-TITAN-9',
    ingestedCount: 42,
    entitiesExtracted: ['Hydrothermal Vent Alpha', 'Cold Seep Beta-4', 'Sulfur Microbiome 16S'],
    synthesisReport: 'Deep-sea exploration verified high biological activity near active hydrothermal chimneys.',
    resumedFromCheckpoint: true,
    workflowStatus: 'recovered'
  },
  failureScenario: {
    id: 'p8-failure',
    name: 'Worker Crash / Memory Outage at Step 3',
    description: 'Server process crashes during document synthesis due to simulated out-of-memory error.',
    failureType: 'tool-failure',
    triggerStepId: 'node-synthesis',
    config: {
      crashStep: 'Synthesis',
      interruptionCode: 'SIGTERM_OOM_KILL'
    },
    enabled: true
  },
  completionCriteria: {
    mustComplete: true,
    mustHandleFailure: true,
    minReliabilityScore: 90,
    expectedOutputSchema: {
      type: 'object',
      required: ['missionId', 'entitiesExtracted', 'resumedFromCheckpoint'],
      properties: {
        missionId: { type: 'string' },
        resumedFromCheckpoint: { type: 'boolean' }
      }
    }
  },
  hint: 'Place an Error Handler or Fallback block attached to the Synthesis step. Configure it with "previous-step" / "Resume from last successful step" to recover state and complete the mission.',
  learningTakeaway: 'Long-running multi-agent missions must checkpoint state after each stage. Idempotent resumption prevents wasted compute and guarantees mission delivery.',
  initialWorkflow: {
    id: 'p8-broken',
    name: 'Uncheckpointed Agent Pipeline',
    description: 'Linear pipeline that crashes completely when mid-stage synthesis fails.',
    sampleInput: {
      missionId: 'MISSION-TITAN-9'
    },
    nodes: [
      {
        id: 'node-input',
        type: 'input',
        position: { x: 60, y: 200 },
        data: { label: 'Mission Specs', config: {} }
      },
      {
        id: 'node-ingest',
        type: 'transform',
        position: { x: 260, y: 200 },
        data: {
          label: 'Data Ingestion Stage',
          config: {
            transformCode: 'return { ...input, ingestedCount: 42, rawDocs: ["doc1", "doc2"] };'
          }
        }
      },
      {
        id: 'node-extract',
        type: 'ai-model',
        position: { x: 480, y: 200 },
        data: {
          label: 'Entity Extractor LLM',
          config: {
            model: 'mock-gpt-4',
            prompt: 'Extract key scientific entities: {{input}}'
          }
        }
      },
      {
        id: 'node-synthesis',
        type: 'ai-model',
        position: { x: 700, y: 200 },
        data: {
          label: 'Synthesis LLM (Fragile)',
          config: {
            model: 'mock-gpt-4',
            prompt: 'Synthesize full report: {{input}}'
          }
        }
      },
      {
        id: 'node-output',
        type: 'output',
        position: { x: 940, y: 200 },
        data: { label: 'Mission Report', config: {} }
      }
    ],
    edges: [
      { id: 'e1', source: 'node-input', target: 'node-ingest', animated: true },
      { id: 'e2', source: 'node-ingest', target: 'node-extract', animated: true },
      { id: 'e3', source: 'node-extract', target: 'node-synthesis', animated: true },
      { id: 'e4', source: 'node-synthesis', target: 'node-output', animated: true }
    ]
  },
  solutionWorkflow: {
    id: 'p8-solution',
    name: 'Checkpoint-Resilient Mission Pipeline',
    description: 'Recovers state from last checkpoint when synthesis is interrupted.',
    sampleInput: {
      missionId: 'MISSION-TITAN-9'
    },
    nodes: [
      {
        id: 'node-input',
        type: 'input',
        position: { x: 60, y: 200 },
        data: { label: 'Mission Specs', config: {} }
      },
      {
        id: 'node-ingest',
        type: 'transform',
        position: { x: 240, y: 200 },
        data: {
          label: 'Data Ingestion Stage',
          config: {
            transformCode: 'return { ...input, ingestedCount: 42, rawDocs: ["doc1", "doc2"] };'
          }
        }
      },
      {
        id: 'node-extract',
        type: 'ai-model',
        position: { x: 440, y: 200 },
        data: {
          label: 'Entity Extractor LLM',
          config: {
            model: 'mock-gpt-4',
            prompt: 'Extract key scientific entities: {{input}}'
          }
        }
      },
      {
        id: 'node-synthesis',
        type: 'ai-model',
        position: { x: 660, y: 140 },
        data: {
          label: 'Synthesis LLM',
          config: {
            model: 'mock-gpt-4',
            prompt: 'Synthesize full report: {{input}}'
          }
        }
      },
      {
        id: 'node-error-handler',
        type: 'error-handler',
        position: { x: 660, y: 320 },
        data: {
          label: 'Checkpoint Resumption Handler',
          config: {
            handlerType: 'catch-all',
            recoveryAction: 'fallback'
          }
        }
      },
      {
        id: 'node-output',
        type: 'output',
        position: { x: 920, y: 200 },
        data: { label: 'Mission Report', config: {} }
      }
    ],
    edges: [
      { id: 'e1', source: 'node-input', target: 'node-ingest', animated: true },
      { id: 'e2', source: 'node-ingest', target: 'node-extract', animated: true },
      { id: 'e3', source: 'node-extract', target: 'node-synthesis', animated: true },
      { id: 'e4', source: 'node-extract', target: 'node-error-handler', animated: true },
      { id: 'e5', source: 'node-synthesis', target: 'node-output', animated: true },
      { id: 'e6', source: 'node-error-handler', target: 'node-output', animated: true }
    ]
  }
};
