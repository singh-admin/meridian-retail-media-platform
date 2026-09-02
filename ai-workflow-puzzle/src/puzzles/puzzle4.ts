import { Puzzle } from '../types';

export const puzzle4: Puzzle = {
  id: 'puzzle-4-research-timeout',
  title: 'Survive the Research Timeout',
  difficulty: 'intermediate',
  category: 'Resilience & Retry / Fallback',
  objective: 'Survive external tool timeouts using retry with exponential backoff and a cached fallback data source.',
  story: 'Your automated financial research pipeline fetches real-time market trends via an external API. During market open, the tool experiences network timeouts. Build a resilient pipeline that retries 3 times before seamlessly falling back to cached snapshot data so the report never fails.',
  availableBlocks: ['input', 'retry', 'timeout', 'tool', 'fallback', 'ai-model', 'output'],
  sampleInput: {
    ticker: 'NVDA',
    market: 'NASDAQ',
    metrics: ['PE Ratio', 'Revenue Growth', 'Data Center YoY']
  },
  expectedOutput: {
    ticker: 'NVDA',
    market: 'NASDAQ',
    status: 'completed',
    source: 'cached-market-snapshot',
    summary: 'Strong data center demand offset by macro valuation metrics.'
  },
  failureScenario: {
    id: 'p4-failure',
    name: 'Tool API Timeout (504 Gateway Timeout)',
    description: 'External web research tool hangs and exceeds execution timeout limit.',
    failureType: 'timeout',
    triggerStepId: 'node-tool',
    config: {
      durationMs: 3000,
      failAttempts: 3
    },
    enabled: true
  },
  completionCriteria: {
    mustComplete: true,
    mustHandleFailure: true,
    minReliabilityScore: 85,
    expectedOutputSchema: {
      type: 'object',
      required: ['ticker', 'status', 'summary']
    }
  },
  hint: 'Place a Retry block before the Tool configured for 3 attempts. When retries fail, route the execution to a Fallback block that provides cached fallback data to the AI Model.',
  learningTakeaway: 'Third-party APIs are inherently flaky. Combining exponential retries with graceful degradation via stale-while-revalidate fallbacks ensures 99.99% uptime.',
  initialWorkflow: {
    id: 'p4-broken',
    name: 'Fragile Research Pipeline',
    description: 'Direct tool call that crashes instantly on external timeout.',
    sampleInput: {
      ticker: 'NVDA',
      market: 'NASDAQ'
    },
    nodes: [
      {
        id: 'node-input',
        type: 'input',
        position: { x: 80, y: 200 },
        data: { label: 'Research Request', config: {} }
      },
      {
        id: 'node-tool',
        type: 'tool',
        position: { x: 320, y: 200 },
        data: {
          label: 'Live Web Search Tool',
          config: {
            toolName: 'web-search',
            timeout: 2000
          }
        }
      },
      {
        id: 'node-ai',
        type: 'ai-model',
        position: { x: 560, y: 200 },
        data: {
          label: 'Synthesis LLM',
          config: {
            model: 'mock-gpt-4',
            prompt: 'Summarize market research: {{input}}'
          }
        }
      },
      {
        id: 'node-output',
        type: 'output',
        position: { x: 800, y: 200 },
        data: { label: 'Final Report', config: {} }
      }
    ],
    edges: [
      { id: 'e1', source: 'node-input', target: 'node-tool', animated: true },
      { id: 'e2', source: 'node-tool', target: 'node-ai', animated: true },
      { id: 'e3', source: 'node-ai', target: 'node-output', animated: true }
    ]
  },
  solutionWorkflow: {
    id: 'p4-solution',
    name: 'Fault-Tolerant Research Engine',
    description: 'Survives API timeouts using Retries and Cached Snapshot Fallback.',
    sampleInput: {
      ticker: 'NVDA',
      market: 'NASDAQ'
    },
    nodes: [
      {
        id: 'node-input',
        type: 'input',
        position: { x: 60, y: 200 },
        data: { label: 'Research Request', config: {} }
      },
      {
        id: 'node-retry',
        type: 'retry',
        position: { x: 250, y: 200 },
        data: {
          label: 'Exponential Retry',
          config: {
            maxAttempts: 3,
            delayMs: 800,
            backoffMultiplier: 2
          }
        }
      },
      {
        id: 'node-tool',
        type: 'tool',
        position: { x: 450, y: 150 },
        data: {
          label: 'Live Web Search Tool',
          config: {
            toolName: 'web-search',
            timeout: 2000
          }
        }
      },
      {
        id: 'node-fallback',
        type: 'fallback',
        position: { x: 450, y: 320 },
        data: {
          label: 'Cached Snapshot Fallback',
          config: {
            fallbackType: 'static-value',
            staticValue: {
              source: 'cached-market-snapshot',
              ticker: 'NVDA',
              summary: 'Cached snapshot data loaded due to live provider timeout.'
            }
          }
        }
      },
      {
        id: 'node-ai',
        type: 'ai-model',
        position: { x: 720, y: 200 },
        data: {
          label: 'Synthesis LLM',
          config: {
            model: 'mock-gpt-4',
            prompt: 'Synthesize research data: {{input}}'
          }
        }
      },
      {
        id: 'node-output',
        type: 'output',
        position: { x: 960, y: 200 },
        data: { label: 'Final Report', config: {} }
      }
    ],
    edges: [
      { id: 'e1', source: 'node-input', target: 'node-retry', animated: true },
      { id: 'e2', source: 'node-retry', target: 'node-tool', animated: true },
      { id: 'e3', source: 'node-retry', target: 'node-fallback', animated: true },
      { id: 'e4', source: 'node-tool', target: 'node-ai', animated: true },
      { id: 'e5', source: 'node-fallback', target: 'node-ai', animated: true },
      { id: 'e6', source: 'node-ai', target: 'node-output', animated: true }
    ]
  }
};
