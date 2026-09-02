import { Puzzle } from '../types';

export const puzzle5: Puzzle = {
  id: 'puzzle-5-approve-before-sending',
  title: 'Approve Before Sending',
  difficulty: 'intermediate',
  category: 'Human-in-the-Loop & Approval Gates',
  objective: 'Draft an external message but require a human to approve, edit, or reject it before triggering an irreversible email action.',
  story: 'An automated agent drafts apology emails and refund credits to churn-risk enterprise accounts. To prevent embarrassing AI phrasing or excessive financial concessions, implement an Approval Gate where a human supervisor must inspect and approve or edit the email before it is sent.',
  availableBlocks: ['input', 'ai-model', 'approval-gate', 'human-review', 'tool', 'output'],
  sampleInput: {
    customerId: 'CUST-883',
    customerName: 'Acme Corp',
    incident: '2-hour database outage during peak billing period',
    customerTier: 'Enterprise Platinum',
    suggestedCreditAmount: 500
  },
  expectedOutput: {
    emailSent: true,
    recipient: 'billing-lead@acmeworks.com',
    subject: 'Resolution and Credit Confirmation for Incident #INC-2026',
    finalApprovedCredit: 350,
    reviewedBy: 'Operations Manager',
    deliveryStatus: 'delivered'
  },
  failureScenario: {
    id: 'p5-failure',
    name: 'Unsupervised High-Risk Action',
    description: 'AI model generates an overly generous $500 credit draft that exceeds automated threshold without human sign-off.',
    failureType: 'human-rejection',
    triggerStepId: 'node-ai',
    config: {
      excessiveAmount: 500,
      requiresApproval: true
    },
    enabled: true
  },
  completionCriteria: {
    mustComplete: true,
    mustHandleFailure: true,
    minReliabilityScore: 85,
    expectedOutputSchema: {
      type: 'object',
      required: ['emailSent', 'deliveryStatus'],
      properties: {
        emailSent: { type: 'boolean' },
        deliveryStatus: { type: 'string' }
      }
    }
  },
  hint: 'Insert an Approval Gate or Human Review block between the AI drafting model and the Email Sender tool. This pauses execution so you can review and approve or adjust the drafted email in the interactive modal.',
  learningTakeaway: 'Irreversible real-world actions (sending emails, executing financial refunds, deleting database rows) should always be protected by Human-in-the-Loop (HITL) approval gates.',
  initialWorkflow: {
    id: 'p5-broken',
    name: 'Unchecked Email Dispatcher',
    description: 'Directly sends AI-drafted emails with no human oversight.',
    sampleInput: {
      customerId: 'CUST-883',
      incident: '2-hour database outage'
    },
    nodes: [
      {
        id: 'node-input',
        type: 'input',
        position: { x: 80, y: 200 },
        data: { label: 'Incident Details', config: {} }
      },
      {
        id: 'node-ai',
        type: 'ai-model',
        position: { x: 340, y: 200 },
        data: {
          label: 'Apology & Credit Drafter',
          config: {
            model: 'mock-gpt-4',
            outputFormat: 'json',
            prompt: 'Draft an apology email with financial credit for: {{input}}'
          }
        }
      },
      {
        id: 'node-tool',
        type: 'tool',
        position: { x: 600, y: 200 },
        data: {
          label: 'Email Sender Tool',
          config: {
            toolName: 'email-sender'
          }
        }
      },
      {
        id: 'node-output',
        type: 'output',
        position: { x: 840, y: 200 },
        data: { label: 'Dispatch Confirmation', config: {} }
      }
    ],
    edges: [
      { id: 'e1', source: 'node-input', target: 'node-ai', animated: true },
      { id: 'e2', source: 'node-ai', target: 'node-tool', animated: true },
      { id: 'e3', source: 'node-tool', target: 'node-output', animated: true }
    ]
  },
  solutionWorkflow: {
    id: 'p5-solution',
    name: 'Gated Communication Workflow',
    description: 'Guards email dispatch with mandatory human approval & edit capability.',
    sampleInput: {
      customerId: 'CUST-883',
      incident: '2-hour database outage'
    },
    nodes: [
      {
        id: 'node-input',
        type: 'input',
        position: { x: 60, y: 200 },
        data: { label: 'Incident Details', config: {} }
      },
      {
        id: 'node-ai',
        type: 'ai-model',
        position: { x: 280, y: 200 },
        data: {
          label: 'Apology & Credit Drafter',
          config: {
            model: 'mock-gpt-4',
            outputFormat: 'json',
            prompt: 'Draft an apology email with credit details'
          }
        }
      },
      {
        id: 'node-gate',
        type: 'approval-gate',
        position: { x: 500, y: 200 },
        data: {
          label: 'Manager Approval Gate',
          config: {
            gateCondition: '{{input}}.suggestedCreditAmount > 100',
            approvalMessage: 'High credit refund detected. Please inspect and approve the email draft before delivery.'
          }
        }
      },
      {
        id: 'node-tool',
        type: 'tool',
        position: { x: 740, y: 200 },
        data: {
          label: 'Email Sender Tool',
          config: {
            toolName: 'email-sender'
          }
        }
      },
      {
        id: 'node-output',
        type: 'output',
        position: { x: 960, y: 200 },
        data: { label: 'Dispatch Confirmation', config: {} }
      }
    ],
    edges: [
      { id: 'e1', source: 'node-input', target: 'node-ai', animated: true },
      { id: 'e2', source: 'node-ai', target: 'node-gate', animated: true },
      { id: 'e3', source: 'node-gate', target: 'node-tool', animated: true },
      { id: 'e4', source: 'node-tool', target: 'node-output', animated: true }
    ]
  }
};
