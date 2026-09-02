import { Puzzle } from '../types';

export const puzzle1: Puzzle = {
  id: 'puzzle-1-meeting-summarizer',
  title: 'Fix the Meeting Summarizer',
  difficulty: 'beginner',
  category: 'Schema Validation & Output Repair',
  objective: 'Build a workflow that turns raw meeting notes into structured action items with assigned owners, handling missing owners and malformed AI output.',
  story: 'The executive team relies on your AI meeting summarizer. However, the model sometimes outputs incomplete JSON where action item owners are missing. Add validation and fallback/repair to ensure no action item is lost.',
  availableBlocks: ['input', 'ai-model', 'validator', 'transform', 'fallback', 'output'],
  sampleInput: {
    meetingTitle: 'Q3 Product Strategy Sync',
    date: '2026-09-02',
    attendees: ['Alice (PM)', 'Bob (Eng Lead)', 'Charlie (Design Lead)'],
    rawTranscript: 'Alice: Let us launch the beta on Oct 1st. Bob will prepare database migrations by Friday. Charlie needs to finalize mockups before Wednesday. Someone also needs to send the customer survey.'
  },
  expectedOutput: {
    summary: 'Meeting to align on Q3 launch timeline and key milestones.',
    decisions: ['Launch beta on Oct 1st'],
    actionItems: [
      { task: 'Prepare database migrations by Friday', owner: 'Bob', status: 'pending' },
      { task: 'Finalize mockups before Wednesday', owner: 'Charlie', status: 'pending' },
      { task: 'Send the customer survey', owner: 'Unassigned / PM Alice', status: 'pending' }
    ]
  },
  failureScenario: {
    id: 'p1-failure',
    name: 'Malformed Output & Missing Owner',
    description: 'AI model returns action items where an owner is missing (null) and fails the strict schema.',
    failureType: 'missing-field',
    triggerStepId: 'node-ai',
    config: {
      field: 'owner',
      missingInIndex: 2
    },
    enabled: true
  },
  completionCriteria: {
    mustComplete: true,
    mustHandleFailure: true,
    minReliabilityScore: 80,
    expectedOutputSchema: {
      type: 'object',
      required: ['summary', 'decisions', 'actionItems'],
      properties: {
        summary: { type: 'string' },
        decisions: { type: 'array' },
        actionItems: {
          type: 'array',
          items: {
            type: 'object',
            required: ['task', 'owner']
          }
        }
      }
    }
  },
  hint: 'Place a Validator block after the AI Model to check that every action item has an "owner". Connect the validation failure to a Transform or Fallback block that provides default owners.',
  learningTakeaway: 'LLMs can generate ungrounded or incomplete JSON. A downstream schema validator ensures your application never breaks due to missing keys.',
  initialWorkflow: {
    id: 'p1-broken',
    name: 'Broken Meeting Summarizer',
    description: 'Direct pipeline without validation or error handling.',
    sampleInput: {
      meetingTitle: 'Q3 Product Strategy Sync',
      rawTranscript: 'Alice: Launch Oct 1st. Bob prepares migrations. Charlie finishes UI. Someone sends survey.'
    },
    nodes: [
      {
        id: 'node-input',
        type: 'input',
        position: { x: 100, y: 200 },
        data: {
          label: 'Meeting Input',
          config: {
            description: 'Raw meeting transcript'
          }
        }
      },
      {
        id: 'node-ai',
        type: 'ai-model',
        position: { x: 380, y: 200 },
        data: {
          label: 'Summarizer LLM',
          config: {
            model: 'mock-gpt-4',
            outputFormat: 'json',
            prompt: 'Extract summary, decisions, and actionItems with task and owner from: {{input}}'
          }
        }
      },
      {
        id: 'node-output',
        type: 'output',
        position: { x: 680, y: 200 },
        data: {
          label: 'Structured Output',
          config: {
            description: 'Final summarized notes'
          }
        }
      }
    ],
    edges: [
      { id: 'e1', source: 'node-input', target: 'node-ai', animated: true },
      { id: 'e2', source: 'node-ai', target: 'node-output', animated: true }
    ]
  },
  solutionWorkflow: {
    id: 'p1-solution',
    name: 'Resilient Meeting Summarizer',
    description: 'Validated pipeline with fallback repair for missing owners.',
    sampleInput: {
      meetingTitle: 'Q3 Product Strategy Sync',
      rawTranscript: 'Alice: Launch Oct 1st. Bob prepares migrations. Charlie finishes UI. Someone sends survey.'
    },
    nodes: [
      {
        id: 'node-input',
        type: 'input',
        position: { x: 80, y: 200 },
        data: { label: 'Meeting Input', config: {} }
      },
      {
        id: 'node-ai',
        type: 'ai-model',
        position: { x: 300, y: 200 },
        data: {
          label: 'Summarizer LLM',
          config: {
            model: 'mock-gpt-4',
            outputFormat: 'json',
            prompt: 'Extract summary, decisions, and actionItems from: {{input}}'
          }
        }
      },
      {
        id: 'node-val',
        type: 'validator',
        position: { x: 540, y: 200 },
        data: {
          label: 'Action Item Validator',
          config: {
            validationType: 'required-fields',
            requiredFields: 'summary,decisions,actionItems',
            onFailure: 'fallback'
          }
        }
      },
      {
        id: 'node-fallback',
        type: 'fallback',
        position: { x: 760, y: 320 },
        data: {
          label: 'Default Owner Fallback',
          config: {
            fallbackType: 'safe-default',
            templateResponse: 'Assign missing owners to Meeting Facilitator (Alice)'
          }
        }
      },
      {
        id: 'node-output',
        type: 'output',
        position: { x: 980, y: 200 },
        data: { label: 'Verified Output', config: {} }
      }
    ],
    edges: [
      { id: 'e1', source: 'node-input', target: 'node-ai', animated: true },
      { id: 'e2', source: 'node-ai', target: 'node-val', animated: true },
      { id: 'e3', source: 'node-val', target: 'node-output', animated: true },
      { id: 'e4', source: 'node-val', target: 'node-fallback', animated: true },
      { id: 'e5', source: 'node-fallback', target: 'node-output', animated: true }
    ]
  }
};
