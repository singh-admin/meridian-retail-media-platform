import { Puzzle } from '../types';

export const puzzle3: Puzzle = {
  id: 'puzzle-3-ticket-router',
  title: 'Repair the Ticket Router',
  difficulty: 'intermediate',
  category: 'Classification & Human Escalation',
  objective: 'Classify and route customer support tickets while routing low-confidence or ambiguous cases to Human Review.',
  story: 'Enterprise customers are filing complex multi-part complaints. When the AI classifier has low confidence (e.g. mixed Billing and Auth issues), routing blindly causes escalations. Introduce a Confidence Gate and Human Review block to verify edge cases.',
  availableBlocks: ['input', 'ai-model', 'confidence-check', 'condition', 'human-review', 'tool', 'output'],
  sampleInput: {
    ticketId: 'TCK-9941',
    customer: 'Sarah Jenkins',
    tier: 'Enterprise VIP',
    message: 'My card was charged twice for the enterprise license, but the second invoice shows a cancelled status. Also my team cannot log in today.'
  },
  expectedOutput: {
    ticketId: 'TCK-9941',
    assignedDepartment: 'Billing & Account Services',
    priority: 'high',
    reviewedByHuman: true,
    routedSuccessfully: true
  },
  failureScenario: {
    id: 'p3-failure',
    name: 'Low-Confidence Ambiguous Ticket',
    description: 'AI model returns multi-intent classification with low confidence (0.48).',
    failureType: 'low-confidence',
    triggerStepId: 'node-ai',
    config: {
      predictedConfidence: 0.48,
      threshold: 0.8
    },
    enabled: true
  },
  completionCriteria: {
    mustComplete: true,
    mustHandleFailure: true,
    minReliabilityScore: 85,
    expectedOutputSchema: {
      type: 'object',
      required: ['ticketId', 'assignedDepartment', 'routedSuccessfully'],
      properties: {
        ticketId: { type: 'string' },
        assignedDepartment: { type: 'string' },
        routedSuccessfully: { type: 'boolean' }
      }
    }
  },
  hint: 'Place a Confidence Check block after the AI Model with a threshold of 0.8. Direct low-confidence outputs to a Human Review block where an agent can confirm the department before calling the Dispatch Tool.',
  learningTakeaway: 'High-accuracy agentic workflows use Confidence-Based Routing to selectively escalate only ambiguous cases to humans, achieving 10x throughput with human-level accuracy.',
  initialWorkflow: {
    id: 'p3-broken',
    name: 'Blind Ticket Dispatcher',
    description: 'Routes all tickets directly to queues without confidence checking.',
    sampleInput: {
      ticketId: 'TCK-9941',
      customer: 'Sarah Jenkins',
      message: 'Double charge and team locked out.'
    },
    nodes: [
      {
        id: 'node-input',
        type: 'input',
        position: { x: 80, y: 200 },
        data: { label: 'Ticket Input', config: {} }
      },
      {
        id: 'node-ai',
        type: 'ai-model',
        position: { x: 300, y: 200 },
        data: {
          label: 'Ticket Classifier',
          config: {
            model: 'mock-gpt-4',
            outputFormat: 'json',
            prompt: 'Classify ticket department, priority, and confidence for: {{input}}'
          }
        }
      },
      {
        id: 'node-tool',
        type: 'tool',
        position: { x: 550, y: 200 },
        data: {
          label: 'Queue Dispatcher',
          config: {
            toolName: 'database-query',
            parameters: { action: 'route_ticket' }
          }
        }
      },
      {
        id: 'node-output',
        type: 'output',
        position: { x: 800, y: 200 },
        data: { label: 'Routing Result', config: {} }
      }
    ],
    edges: [
      { id: 'e1', source: 'node-input', target: 'node-ai', animated: true },
      { id: 'e2', source: 'node-ai', target: 'node-tool', animated: true },
      { id: 'e3', source: 'node-tool', target: 'node-output', animated: true }
    ]
  },
  solutionWorkflow: {
    id: 'p3-solution',
    name: 'Resilient Ticket Router with Human Review',
    description: 'Routes high-confidence tickets automatically and escalates low-confidence tickets to human.',
    sampleInput: {
      ticketId: 'TCK-9941',
      customer: 'Sarah Jenkins',
      message: 'Double charge and team locked out.'
    },
    nodes: [
      {
        id: 'node-input',
        type: 'input',
        position: { x: 60, y: 200 },
        data: { label: 'Ticket Input', config: {} }
      },
      {
        id: 'node-ai',
        type: 'ai-model',
        position: { x: 260, y: 200 },
        data: {
          label: 'Ticket Classifier',
          config: {
            model: 'mock-gpt-4',
            outputFormat: 'json',
            prompt: 'Classify department, priority, and confidence score'
          }
        }
      },
      {
        id: 'node-conf',
        type: 'confidence-check',
        position: { x: 480, y: 200 },
        data: {
          label: 'Confidence Gate (> 0.8)',
          config: {
            threshold: 0.8,
            confidencePath: 'confidence',
            onLowConfidence: 'human-review'
          }
        }
      },
      {
        id: 'node-human',
        type: 'human-review',
        position: { x: 700, y: 320 },
        data: {
          label: 'Operator Review',
          config: {
            reviewType: 'both',
            prompt: 'Review ambiguous classification and confirm the destination department.'
          }
        }
      },
      {
        id: 'node-tool',
        type: 'tool',
        position: { x: 720, y: 140 },
        data: {
          label: 'Queue Dispatcher',
          config: {
            toolName: 'database-query'
          }
        }
      },
      {
        id: 'node-output',
        type: 'output',
        position: { x: 960, y: 200 },
        data: { label: 'Routing Result', config: {} }
      }
    ],
    edges: [
      { id: 'e1', source: 'node-input', target: 'node-ai', animated: true },
      { id: 'e2', source: 'node-ai', target: 'node-conf', animated: true },
      { id: 'e3', source: 'node-conf', target: 'node-tool', animated: true },
      { id: 'e4', source: 'node-conf', target: 'node-human', animated: true },
      { id: 'e5', source: 'node-human', target: 'node-tool', animated: true },
      { id: 'e6', source: 'node-tool', target: 'node-output', animated: true }
    ]
  }
};
