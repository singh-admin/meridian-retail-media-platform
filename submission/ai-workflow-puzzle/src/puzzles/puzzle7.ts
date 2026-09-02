import { Puzzle } from '../types';

export const puzzle7: Puzzle = {
  id: 'puzzle-7-activate-fallback',
  title: 'Activate the Fallback',
  difficulty: 'advanced',
  category: 'Multi-Model Redundancy & Cascade Failover',
  objective: 'Retry a failed primary AI model call and seamlessly fail over to an alternative secondary model during major provider outages.',
  story: 'Your primary AI provider (GPT-4) suffers an unexpected 503 Outage / 429 Rate Limit spike during critical production trading hours. Implement an automated retry and secondary model fallback mechanism (Mock Claude 3) so users never experience service downtime.',
  availableBlocks: ['input', 'retry', 'ai-model', 'fallback', 'output'],
  sampleInput: {
    prompt: 'Analyze global renewable energy trends in 2026 and highlight the top 3 supply chain risks.',
    urgency: 'critical',
    clientTier: 'Enterprise'
  },
  expectedOutput: {
    status: 'completed',
    providerUsed: 'mock-claude',
    fallbackTriggered: true,
    analysis: 'Renewable energy growth is driven by utility solar and grid battery adoption. Top 3 risks: grid interconnection queues, rare-earth mineral processing bottlenecks, and geopolitical tariffs.'
  },
  failureScenario: {
    id: 'p7-failure',
    name: 'Primary Model Outage (503 Service Unavailable)',
    description: 'Primary GPT-4 API endpoint returns consecutive 503 Service Unavailable / Rate Limit errors.',
    failureType: 'network-error',
    triggerStepId: 'node-ai-primary',
    config: {
      status: 503,
      errorMsg: 'Upstream OpenAI API Rate Limit Exceeded (429 / 503 Service Unavailable)'
    },
    enabled: true
  },
  completionCriteria: {
    mustComplete: true,
    mustHandleFailure: true,
    minReliabilityScore: 90,
    expectedOutputSchema: {
      type: 'object',
      required: ['status', 'fallbackTriggered', 'analysis']
    }
  },
  hint: 'Configure a Retry block on the primary AI Model for 2 attempts. When retries fail, connect to a Fallback block set to Alternative Model (Mock Claude) to guarantee delivery.',
  learningTakeaway: 'Production AI architectures must avoid single-vendor lock-in. Cascade failover to a secondary model or deterministic template prevents catastrophic user-facing outages.',
  initialWorkflow: {
    id: 'p7-broken',
    name: 'Single Provider AI Call',
    description: 'Relies entirely on single AI model with zero failover.',
    sampleInput: {
      prompt: 'Analyze renewable energy supply chain risks'
    },
    nodes: [
      {
        id: 'node-input',
        type: 'input',
        position: { x: 80, y: 200 },
        data: { label: 'Analysis Request', config: {} }
      },
      {
        id: 'node-ai-primary',
        type: 'ai-model',
        position: { x: 380, y: 200 },
        data: {
          label: 'Primary Model (GPT-4)',
          config: {
            model: 'mock-gpt-4',
            prompt: 'Provide in-depth market analysis: {{input}}'
          }
        }
      },
      {
        id: 'node-output',
        type: 'output',
        position: { x: 680, y: 200 },
        data: { label: 'Market Insights', config: {} }
      }
    ],
    edges: [
      { id: 'e1', source: 'node-input', target: 'node-ai-primary', animated: true },
      { id: 'e2', source: 'node-ai-primary', target: 'node-output', animated: true }
    ]
  },
  solutionWorkflow: {
    id: 'p7-solution',
    name: 'Multi-Model Failover Circuit',
    description: 'Retries primary provider before auto-switching to secondary Claude 3 model.',
    sampleInput: {
      prompt: 'Analyze renewable energy supply chain risks'
    },
    nodes: [
      {
        id: 'node-input',
        type: 'input',
        position: { x: 60, y: 200 },
        data: { label: 'Analysis Request', config: {} }
      },
      {
        id: 'node-retry',
        type: 'retry',
        position: { x: 260, y: 200 },
        data: {
          label: 'Primary Model Retry',
          config: {
            maxAttempts: 2,
            delayMs: 600
          }
        }
      },
      {
        id: 'node-ai-primary',
        type: 'ai-model',
        position: { x: 480, y: 140 },
        data: {
          label: 'Primary Model (GPT-4)',
          config: {
            model: 'mock-gpt-4',
            prompt: 'Provide in-depth market analysis: {{input}}'
          }
        }
      },
      {
        id: 'node-fallback',
        type: 'fallback',
        position: { x: 480, y: 320 },
        data: {
          label: 'Model Failover (Claude 3)',
          config: {
            fallbackType: 'alternative-model',
            alternativeModel: 'mock-claude'
          }
        }
      },
      {
        id: 'node-output',
        type: 'output',
        position: { x: 780, y: 200 },
        data: { label: 'Market Insights', config: {} }
      }
    ],
    edges: [
      { id: 'e1', source: 'node-input', target: 'node-retry', animated: true },
      { id: 'e2', source: 'node-retry', target: 'node-ai-primary', animated: true },
      { id: 'e3', source: 'node-retry', target: 'node-fallback', animated: true },
      { id: 'e4', source: 'node-ai-primary', target: 'node-output', animated: true },
      { id: 'e5', source: 'node-fallback', target: 'node-output', animated: true }
    ]
  }
};
