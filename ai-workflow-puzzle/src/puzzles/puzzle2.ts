import { Puzzle } from '../types';

export const puzzle2: Puzzle = {
  id: 'puzzle-2-knowledge-assistant',
  title: 'Ground the Knowledge Assistant',
  difficulty: 'beginner',
  category: 'RAG & Evidence Grounding',
  objective: 'Build a workflow that retrieves verified documents and refuses to answer when evidence is missing, preventing hallucinations.',
  story: 'An ungrounded customer support bot was fabricating return policies and promising free refunds. Ground the bot with a Retrieval block and a Confidence Check / Condition to ensure it stops safely or provides a fallback message when no relevant documentation is found.',
  availableBlocks: ['input', 'retrieval', 'confidence-check', 'condition', 'ai-model', 'safe-stop', 'fallback', 'output'],
  sampleInput: {
    userQuery: 'What is the exact company policy on reimbursement for home office ergonomic standing desks?',
    userId: 'emp-4821',
    department: 'Engineering'
  },
  expectedOutput: {
    verified: false,
    message: 'Verified policy not found in knowledge base. Please consult HR directly at hr@company.internal.'
  },
  failureScenario: {
    id: 'p2-failure',
    name: 'Missing Knowledge Base Evidence',
    description: 'Knowledge base query returns zero matching documents (similarity score: 0.12).',
    failureType: 'empty-retrieval',
    triggerStepId: 'node-retrieval',
    config: {
      minScore: 0.7,
      returnedDocuments: []
    },
    enabled: true
  },
  completionCriteria: {
    mustComplete: true,
    mustHandleFailure: true,
    minReliabilityScore: 85,
    expectedOutputSchema: {
      type: 'object',
      properties: {
        verified: { type: 'boolean' },
        message: { type: 'string' }
      }
    }
  },
  hint: 'Add a Retrieval block connected to the Input. Then attach a Confidence Check or Condition block (checking score >= 0.7) that routes to a Safe Stop or Fallback when no evidence is found.',
  learningTakeaway: 'RAG pipelines must enforce strict grounding checks. Never feed an empty retrieval context into an LLM expecting it to know what it does not know.',
  initialWorkflow: {
    id: 'p2-broken',
    name: 'Ungrounded Assistant',
    description: 'Queries AI directly without grounding in company knowledge base.',
    sampleInput: {
      userQuery: 'What is the reimbursement policy for standing desks?'
    },
    nodes: [
      {
        id: 'node-input',
        type: 'input',
        position: { x: 100, y: 200 },
        data: { label: 'User Query', config: { description: 'Employee question' } }
      },
      {
        id: 'node-ai',
        type: 'ai-model',
        position: { x: 380, y: 200 },
        data: {
          label: 'Ungrounded LLM',
          config: {
            model: 'mock-gpt-4',
            prompt: 'Answer the question confidently: {{input}}'
          }
        }
      },
      {
        id: 'node-output',
        type: 'output',
        position: { x: 680, y: 200 },
        data: { label: 'Bot Response', config: {} }
      }
    ],
    edges: [
      { id: 'e1', source: 'node-input', target: 'node-ai', animated: true },
      { id: 'e2', source: 'node-ai', target: 'node-output', animated: true }
    ]
  },
  solutionWorkflow: {
    id: 'p2-solution',
    name: 'Grounded Assistant with Safe Fallback',
    description: 'Retrieves knowledge first, checks relevance, and halts safely if unverified.',
    sampleInput: {
      userQuery: 'What is the reimbursement policy for standing desks?'
    },
    nodes: [
      {
        id: 'node-input',
        type: 'input',
        position: { x: 80, y: 200 },
        data: { label: 'User Query', config: {} }
      },
      {
        id: 'node-retrieval',
        type: 'retrieval',
        position: { x: 280, y: 200 },
        data: {
          label: 'Company Docs RAG',
          config: {
            knowledgeBase: 'company-docs',
            topK: 3,
            minScore: 0.7
          }
        }
      },
      {
        id: 'node-conf',
        type: 'confidence-check',
        position: { x: 500, y: 200 },
        data: {
          label: 'Evidence Grounding Gate',
          config: {
            threshold: 0.7,
            confidencePath: 'maxScore',
            onLowConfidence: 'safe-stop'
          }
        }
      },
      {
        id: 'node-safe-stop',
        type: 'safe-stop',
        position: { x: 740, y: 320 },
        data: {
          label: 'Refusal Safe Stop',
          config: {
            message: 'Verified policy not found in knowledge base. Please consult HR directly at hr@company.internal.'
          }
        }
      },
      {
        id: 'node-ai',
        type: 'ai-model',
        position: { x: 740, y: 150 },
        data: {
          label: 'Grounded Answer Generator',
          config: {
            model: 'mock-gpt-4',
            prompt: 'Based ONLY on context: {{input.context}}, answer query: {{input.query}}'
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
      { id: 'e1', source: 'node-input', target: 'node-retrieval', animated: true },
      { id: 'e2', source: 'node-retrieval', target: 'node-conf', animated: true },
      { id: 'e3', source: 'node-conf', target: 'node-ai', animated: true },
      { id: 'e4', source: 'node-conf', target: 'node-safe-stop', animated: true },
      { id: 'e5', source: 'node-ai', target: 'node-output', animated: true },
      { id: 'e6', source: 'node-safe-stop', target: 'node-output', animated: true }
    ]
  }
};
