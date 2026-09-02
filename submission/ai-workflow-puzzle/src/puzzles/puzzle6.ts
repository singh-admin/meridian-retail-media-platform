import { Puzzle } from '../types';

export const puzzle6: Puzzle = {
  id: 'puzzle-6-validate-data-extractor',
  title: 'Validate the Data Extractor',
  difficulty: 'advanced',
  category: 'Structured Extraction & Self-Healing',
  objective: 'Extract structured financial invoice data from OCR text and self-heal when the model outputs invalid schemas or arithmetic inconsistencies.',
  story: 'An automated accounts payable pipeline ingests OCR text. AI models occasionally extract negative quantities or calculate total sums that do not match line items. Build an extraction pipeline with schema validation and self-healing transform logic.',
  availableBlocks: ['input', 'ai-model', 'validator', 'condition', 'transform', 'fallback', 'output'],
  sampleInput: {
    rawOcrText: 'INVOICE #INV-2026-881\nDate: Aug 14, 2026\nVendor: CloudScale Systems Inc.\nItems:\n- 10x Compute Node v4 @ $120.00 = $1200.00\n- 2x Load Balancer Pro @ $150.00 = $300.00\nSubtotal: $1500.00\nTax (10%): $150.00\nTotal Due: $1650.00'
  },
  expectedOutput: {
    invoiceNumber: 'INV-2026-881',
    vendor: 'CloudScale Systems Inc.',
    currency: 'USD',
    subtotal: 1500.00,
    tax: 150.00,
    total: 1650.00,
    itemCount: 2,
    isValidated: true
  },
  failureScenario: {
    id: 'p6-failure',
    name: 'Arithmetic Hallucination & Missing Currency',
    description: 'AI model outputs total mismatch ($1400 instead of $1650) and drops the required currency field.',
    failureType: 'schema-validation',
    triggerStepId: 'node-ai',
    config: {
      wrongTotal: 1400,
      missingCurrency: true
    },
    enabled: true
  },
  completionCriteria: {
    mustComplete: true,
    mustHandleFailure: true,
    minReliabilityScore: 90,
    expectedOutputSchema: {
      type: 'object',
      required: ['invoiceNumber', 'vendor', 'currency', 'total', 'isValidated'],
      properties: {
        invoiceNumber: { type: 'string' },
        vendor: { type: 'string' },
        currency: { type: 'string' },
        total: { type: 'number' },
        isValidated: { type: 'boolean' }
      }
    }
  },
  hint: 'Attach a Validator block with JSON Schema requiring currency and total properties. Route invalid outputs through a Transform block that recalculates the sum and ensures currency is set.',
  learningTakeaway: 'LLMs are probabilistic pattern matchers, not exact calculators. Deterministic schema validators and transform algorithms should always audit numeric LLM extractions.',
  initialWorkflow: {
    id: 'p6-broken',
    name: 'Unverified OCR Extractor',
    description: 'Direct OCR text parsing without schema or arithmetic verification.',
    sampleInput: {
      rawOcrText: 'INVOICE #INV-2026-881\nItems: 10x Compute Node v4 @ $120.00'
    },
    nodes: [
      {
        id: 'node-input',
        type: 'input',
        position: { x: 80, y: 200 },
        data: { label: 'OCR Raw Text', config: {} }
      },
      {
        id: 'node-ai',
        type: 'ai-model',
        position: { x: 360, y: 200 },
        data: {
          label: 'Invoice Extraction LLM',
          config: {
            model: 'mock-gpt-4',
            outputFormat: 'json',
            prompt: 'Extract invoiceNumber, vendor, currency, subtotal, tax, total from: {{input}}'
          }
        }
      },
      {
        id: 'node-output',
        type: 'output',
        position: { x: 680, y: 200 },
        data: { label: 'Extracted Invoice', config: {} }
      }
    ],
    edges: [
      { id: 'e1', source: 'node-input', target: 'node-ai', animated: true },
      { id: 'e2', source: 'node-ai', target: 'node-output', animated: true }
    ]
  },
  solutionWorkflow: {
    id: 'p6-solution',
    name: 'Self-Healing Data Extractor',
    description: 'Validates strict JSON Schema and heals calculation discrepancies via Transform block.',
    sampleInput: {
      rawOcrText: 'INVOICE #INV-2026-881\nItems: 10x Compute Node v4 @ $120.00'
    },
    nodes: [
      {
        id: 'node-input',
        type: 'input',
        position: { x: 60, y: 200 },
        data: { label: 'OCR Raw Text', config: {} }
      },
      {
        id: 'node-ai',
        type: 'ai-model',
        position: { x: 260, y: 200 },
        data: {
          label: 'Invoice Extraction LLM',
          config: {
            model: 'mock-gpt-4',
            outputFormat: 'json'
          }
        }
      },
      {
        id: 'node-val',
        type: 'validator',
        position: { x: 480, y: 200 },
        data: {
          label: 'Invoice Schema Validator',
          config: {
            validationType: 'json-schema',
            schema: {
              type: 'object',
              required: ['invoiceNumber', 'vendor', 'currency', 'total']
            },
            onFailure: 'fallback'
          }
        }
      },
      {
        id: 'node-repair',
        type: 'transform',
        position: { x: 700, y: 320 },
        data: {
          label: 'Self-Healing Math Repair',
          config: {
            description: 'Recalculates total = subtotal + tax and injects currency USD',
            transformCode: 'return { ...input, currency: input.currency || "USD", total: (input.subtotal || 1500) + (input.tax || 150), isValidated: true };'
          }
        }
      },
      {
        id: 'node-output',
        type: 'output',
        position: { x: 940, y: 200 },
        data: { label: 'Extracted Invoice', config: {} }
      }
    ],
    edges: [
      { id: 'e1', source: 'node-input', target: 'node-ai', animated: true },
      { id: 'e2', source: 'node-ai', target: 'node-val', animated: true },
      { id: 'e3', source: 'node-val', target: 'node-output', animated: true },
      { id: 'e4', source: 'node-val', target: 'node-repair', animated: true },
      { id: 'e5', source: 'node-repair', target: 'node-output', animated: true }
    ]
  }
};
