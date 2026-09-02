import { BlockConfig, BlockType } from '../types';

export const BLOCK_DEFINITIONS: Record<BlockType, BlockConfig> = {
  'input': {
    id: 'input',
    type: 'input',
    label: 'Input',
    description: 'Provides initial data to the workflow',
    icon: '📥',
    color: '#3B82F6',
    category: 'core',
    configSchema: [
      {
        key: 'inputData',
        label: 'Input Data (JSON)',
        type: 'json',
        required: true,
        default: {},
        description: 'Initial input data for the workflow'
      },
      {
        key: 'description',
        label: 'Description',
        type: 'text',
        default: 'Workflow input',
        description: 'Human-readable description of this input'
      }
    ],
    defaultConfig: {
      inputData: {},
      description: 'Workflow input'
    }
  },
  'ai-model': {
    id: 'ai-model',
    type: 'ai-model',
    label: 'AI Model',
    description: 'Calls an AI model with a prompt',
    icon: '🤖',
    color: '#8B5CF6',
    category: 'core',
    configSchema: [
      {
        key: 'prompt',
        label: 'Prompt Template',
        type: 'textarea',
        required: true,
        default: 'Process the following input: {{input}}',
        description: 'Prompt with {{input}} placeholder for previous step output'
      },
      {
        key: 'model',
        label: 'Model',
        type: 'select',
        required: true,
        default: 'mock-gpt-4',
        options: [
          { value: 'mock-gpt-4', label: 'Mock GPT-4 (Free)' },
          { value: 'mock-claude', label: 'Mock Claude (Free)' },
          { value: 'gpt-4', label: 'GPT-4 (Requires API Key)' },
          { value: 'claude-3', label: 'Claude 3 (Requires API Key)' }
        ],
        description: 'AI model to use'
      },
      {
        key: 'temperature',
        label: 'Temperature',
        type: 'number',
        default: 0.7,
        description: 'Creativity level (0-1)'
      },
      {
        key: 'maxTokens',
        label: 'Max Tokens',
        type: 'number',
        default: 1000,
        description: 'Maximum response length'
      },
      {
        key: 'outputFormat',
        label: 'Output Format',
        type: 'select',
        default: 'text',
        options: [
          { value: 'text', label: 'Plain Text' },
          { value: 'json', label: 'JSON' },
          { value: 'structured', label: 'Structured (with schema)' }
        ],
        description: 'Expected output format'
      },
      {
        key: 'schema',
        label: 'JSON Schema (for structured output)',
        type: 'json',
        default: {},
        description: 'Schema for structured output validation'
      },
      {
        key: 'systemPrompt',
        label: 'System Prompt',
        type: 'textarea',
        default: 'You are a helpful AI assistant.',
        description: 'System instructions for the model'
      }
    ],
    defaultConfig: {
      prompt: 'Process the following input: {{input}}',
      model: 'mock-gpt-4',
      temperature: 0.7,
      maxTokens: 1000,
      outputFormat: 'text',
      schema: {},
      systemPrompt: 'You are a helpful AI assistant.'
    }
  },
  'tool': {
    id: 'tool',
    type: 'tool',
    label: 'Tool / API',
    description: 'Calls an external tool or API',
    icon: '🔧',
    color: '#F59E0B',
    category: 'core',
    configSchema: [
      {
        key: 'toolName',
        label: 'Tool Name',
        type: 'select',
        required: true,
        default: 'web-search',
        options: [
          { value: 'web-search', label: 'Web Search (Mock)' },
          { value: 'calculator', label: 'Calculator (Mock)' },
          { value: 'weather-api', label: 'Weather API (Mock)' },
          { value: 'email-sender', label: 'Email Sender (Mock)' },
          { value: 'database-query', label: 'Database Query (Mock)' }
        ],
        description: 'Tool to execute'
      },
      {
        key: 'parameters',
        label: 'Parameters (JSON)',
        type: 'json',
        default: {},
        description: 'Tool parameters with {{input}} placeholder'
      },
      {
        key: 'timeout',
        label: 'Timeout (ms)',
        type: 'number',
        default: 5000,
        description: 'Maximum execution time'
      }
    ],
    defaultConfig: {
      toolName: 'web-search',
      parameters: {},
      timeout: 5000
    }
  },
  'retrieval': {
    id: 'retrieval',
    type: 'retrieval',
    label: 'Retrieval',
    description: 'Retrieves relevant information from a knowledge base',
    icon: '🔍',
    color: '#06B6D4',
    category: 'core',
    configSchema: [
      {
        key: 'query',
        label: 'Query Template',
        type: 'textarea',
        required: true,
        default: 'Find information about: {{input}}',
        description: 'Search query with {{input}} placeholder'
      },
      {
        key: 'knowledgeBase',
        label: 'Knowledge Base',
        type: 'select',
        required: true,
        default: 'company-docs',
        options: [
          { value: 'company-docs', label: 'Company Documents (Mock)' },
          { value: 'product-manuals', label: 'Product Manuals (Mock)' },
          { value: 'faq', label: 'FAQ Database (Mock)' },
          { value: 'codebase', label: 'Codebase (Mock)' }
        ],
        description: 'Knowledge base to search'
      },
      {
        key: 'topK',
        label: 'Top K Results',
        type: 'number',
        default: 3,
        description: 'Number of results to return'
      },
      {
        key: 'minScore',
        label: 'Minimum Relevance Score',
        type: 'number',
        default: 0.5,
        description: 'Minimum similarity score (0-1)'
      }
    ],
    defaultConfig: {
      query: 'Find information about: {{input}}',
      knowledgeBase: 'company-docs',
      topK: 3,
      minScore: 0.5
    }
  },
  'condition': {
    id: 'condition',
    type: 'condition',
    label: 'Condition',
    description: 'Routes workflow based on a condition',
    icon: '🔀',
    color: '#EC4899',
    category: 'core',
    configSchema: [
      {
        key: 'expression',
        label: 'Condition Expression',
        type: 'code',
        required: true,
        default: '{{input}}.confidence > 0.8',
        description: 'JavaScript expression evaluating to true/false. Use {{input}} for previous output'
      },
      {
        key: 'trueLabel',
        label: 'True Branch Label',
        type: 'text',
        default: 'Yes',
        description: 'Label for true branch'
      },
      {
        key: 'falseLabel',
        label: 'False Branch Label',
        type: 'text',
        default: 'No',
        description: 'Label for false branch'
      }
    ],
    defaultConfig: {
      expression: '{{input}}.confidence > 0.8',
      trueLabel: 'Yes',
      falseLabel: 'No'
    }
  },
  'transform': {
    id: 'transform',
    type: 'transform',
    label: 'Transform',
    description: 'Transforms data between steps',
    icon: '🔄',
    color: '#84CC16',
    category: 'core',
    configSchema: [
      {
        key: 'transformCode',
        label: 'Transform Code',
        type: 'code',
        required: true,
        default: 'return {{input}};',
        description: 'JavaScript code to transform input. Return the transformed output.'
      },
      {
        key: 'description',
        label: 'Description',
        type: 'text',
        default: 'Transform data',
        description: 'What this transform does'
      }
    ],
    defaultConfig: {
      transformCode: 'return {{input}};',
      description: 'Transform data'
    }
  },
  'output': {
    id: 'output',
    type: 'output',
    label: 'Output',
    description: 'Final workflow output',
    icon: '📤',
    color: '#6366F1',
    category: 'core',
    configSchema: [
      {
        key: 'outputTemplate',
        label: 'Output Template',
        type: 'json',
        default: { result: '{{input}}' },
        description: 'Template for final output with {{input}} placeholder'
      },
      {
        key: 'description',
        label: 'Description',
        type: 'text',
        default: 'Workflow output',
        description: 'Description of the output'
      }
    ],
    defaultConfig: {
      outputTemplate: { result: '{{input}}' },
      description: 'Workflow output'
    }
  },
  'validator': {
    id: 'validator',
    type: 'validator',
    label: 'Validator',
    description: 'Validates output against schema or rules',
    icon: '✅',
    color: '#22C55E',
    category: 'reliability',
    configSchema: [
      {
        key: 'validationType',
        label: 'Validation Type',
        type: 'select',
        required: true,
        default: 'json-schema',
        options: [
          { value: 'json-schema', label: 'JSON Schema' },
          { value: 'required-fields', label: 'Required Fields' },
          { value: 'custom', label: 'Custom Function' }
        ],
        description: 'Type of validation to perform'
      },
      {
        key: 'schema',
        label: 'JSON Schema',
        type: 'json',
        default: { type: 'object', properties: {}, required: [] },
        description: 'JSON Schema for validation (when type is json-schema)'
      },
      {
        key: 'requiredFields',
        label: 'Required Fields',
        type: 'textarea',
        default: '',
        description: 'Comma-separated list of required field paths (when type is required-fields)'
      },
      {
        key: 'customValidator',
        label: 'Custom Validator Code',
        type: 'code',
        default: 'return { valid: true, errors: [] };',
        description: 'JavaScript function returning { valid: boolean, errors: string[] }'
      },
      {
        key: 'onFailure',
        label: 'On Validation Failure',
        type: 'select',
        default: 'retry',
        options: [
          { value: 'retry', label: 'Retry Step' },
          { value: 'fallback', label: 'Use Fallback' },
          { value: 'human-review', label: 'Route to Human Review' },
          { value: 'safe-stop', label: 'Stop Safely' }
        ],
        description: 'Action to take when validation fails'
      },
      {
        key: 'maxRetries',
        label: 'Max Retries',
        type: 'number',
        default: 3,
        description: 'Maximum retry attempts before fallback'
      }
    ],
    defaultConfig: {
      validationType: 'json-schema',
      schema: { type: 'object', properties: {}, required: [] },
      requiredFields: '',
      customValidator: 'return { valid: true, errors: [] };',
      onFailure: 'retry',
      maxRetries: 3
    }
  },
  'retry': {
    id: 'retry',
    type: 'retry',
    label: 'Retry',
    description: 'Retries a step on failure',
    icon: '🔁',
    color: '#F97316',
    category: 'reliability',
    configSchema: [
      {
        key: 'maxAttempts',
        label: 'Max Attempts',
        type: 'number',
        required: true,
        default: 3,
        description: 'Maximum number of retry attempts'
      },
      {
        key: 'delayMs',
        label: 'Delay Between Retries (ms)',
        type: 'number',
        default: 1000,
        description: 'Delay before each retry'
      },
      {
        key: 'backoffMultiplier',
        label: 'Backoff Multiplier',
        type: 'number',
        default: 2,
        description: 'Exponential backoff multiplier'
      },
      {
        key: 'retryOn',
        label: 'Retry On',
        type: 'select',
        default: 'any-error',
        options: [
          { value: 'any-error', label: 'Any Error' },
          { value: 'timeout', label: 'Timeout Only' },
          { value: 'validation-error', label: 'Validation Error Only' },
          { value: 'network-error', label: 'Network Error Only' }
        ],
        description: 'Types of errors to retry'
      }
    ],
    defaultConfig: {
      maxAttempts: 3,
      delayMs: 1000,
      backoffMultiplier: 2,
      retryOn: 'any-error'
    }
  },
  'fallback': {
    id: 'fallback',
    type: 'fallback',
    label: 'Fallback',
    description: 'Provides alternative output on failure',
    icon: '🛡️',
    color: '#EF4444',
    category: 'reliability',
    configSchema: [
      {
        key: 'fallbackType',
        label: 'Fallback Type',
        type: 'select',
        required: true,
        default: 'static-value',
        options: [
          { value: 'static-value', label: 'Static Value' },
          { value: 'alternative-model', label: 'Alternative Model' },
          { value: 'safe-default', label: 'Safe Default' },
          { value: 'previous-step', label: 'Previous Step Output' }
        ],
        description: 'Type of fallback to use'
      },
      {
        key: 'staticValue',
        label: 'Static Fallback Value (JSON)',
        type: 'json',
        default: { error: 'Fallback activated', data: null },
        description: 'Static value to return (when type is static-value)'
      },
      {
        key: 'alternativeModel',
        label: 'Alternative Model',
        type: 'select',
        default: 'mock-claude',
        options: [
          { value: 'mock-claude', label: 'Mock Claude' },
          { value: 'mock-gpt-3.5', label: 'Mock GPT-3.5' },
          { value: 'template', label: 'Template Response' }
        ],
        description: 'Alternative model to use (when type is alternative-model)'
      },
      {
        key: 'templateResponse',
        label: 'Template Response',
        type: 'textarea',
        default: 'I apologize, but I encountered an issue. Here is a safe default response.',
        description: 'Template for fallback response'
      }
    ],
    defaultConfig: {
      fallbackType: 'static-value',
      staticValue: { error: 'Fallback activated', data: null },
      alternativeModel: 'mock-claude',
      templateResponse: 'I apologize, but I encountered an issue. Here is a safe default response.'
    }
  },
  'human-review': {
    id: 'human-review',
    type: 'human-review',
    label: 'Human Review',
    description: 'Pauses workflow for human approval',
    icon: '👤',
    color: '#EAB308',
    category: 'human-control',
    configSchema: [
      {
        key: 'reviewType',
        label: 'Review Type',
        type: 'select',
        required: true,
        default: 'approval',
        options: [
          { value: 'approval', label: 'Approve/Reject' },
          { value: 'edit', label: 'Edit Output' },
          { value: 'both', label: 'Approve or Edit' }
        ],
        description: 'Type of human review required'
      },
      {
        key: 'prompt',
        label: 'Review Prompt',
        type: 'textarea',
        required: true,
        default: 'Please review the following output and decide: {{input}}',
        description: 'Prompt shown to human reviewer with {{input}} placeholder'
      },
      {
        key: 'timeoutMinutes',
        label: 'Timeout (minutes)',
        type: 'number',
        default: 30,
        description: 'Minutes before auto-reject'
      },
      {
        key: 'requiredFields',
        label: 'Required Fields for Approval',
        type: 'textarea',
        default: '',
        description: 'Comma-separated fields that must be present for approval'
      }
    ],
    defaultConfig: {
      reviewType: 'approval',
      prompt: 'Please review the following output and decide: {{input}}',
      timeoutMinutes: 30,
      requiredFields: ''
    }
  },
  'approval-gate': {
    id: 'approval-gate',
    type: 'approval-gate',
    label: 'Approval Gate',
    description: 'Requires explicit approval before continuing',
    icon: '🚪',
    color: '#A855F7',
    category: 'human-control',
    configSchema: [
      {
        key: 'gateCondition',
        label: 'Gate Condition',
        type: 'code',
        required: true,
        default: '{{input}}.riskLevel === "high"',
        description: 'JavaScript expression. If true, approval is required.'
      },
      {
        key: 'approvalMessage',
        label: 'Approval Message',
        type: 'textarea',
        default: 'High-risk action detected. Please approve to continue.',
        description: 'Message shown when approval is required'
      },
      {
        key: 'approverRole',
        label: 'Required Approver Role',
        type: 'select',
        default: 'any',
        options: [
          { value: 'any', label: 'Any User' },
          { value: 'manager', label: 'Manager' },
          { value: 'admin', label: 'Admin' },
          { value: 'security', label: 'Security Team' }
        ],
        description: 'Role required for approval'
      }
    ],
    defaultConfig: {
      gateCondition: '{{input}}.riskLevel === "high"',
      approvalMessage: 'High-risk action detected. Please approve to continue.',
      approverRole: 'any'
    }
  },
  'confidence-check': {
    id: 'confidence-check',
    type: 'confidence-check',
    label: 'Confidence Check',
    description: 'Validates confidence threshold',
    icon: '📊',
    color: '#0EA5E9',
    category: 'human-control',
    configSchema: [
      {
        key: 'threshold',
        label: 'Confidence Threshold',
        type: 'number',
        required: true,
        default: 0.8,
        description: 'Minimum confidence score (0-1)'
      },
      {
        key: 'confidencePath',
        label: 'Confidence Field Path',
        type: 'text',
        default: 'confidence',
        description: 'Path to confidence field in input (e.g., confidence or result.confidence)'
      },
      {
        key: 'onLowConfidence',
        label: 'On Low Confidence',
        type: 'select',
        default: 'human-review',
        options: [
          { value: 'human-review', label: 'Human Review' },
          { value: 'retry', label: 'Retry' },
          { value: 'fallback', label: 'Fallback' },
          { value: 'safe-stop', label: 'Safe Stop' }
        ],
        description: 'Action when confidence is below threshold'
      }
    ],
    defaultConfig: {
      threshold: 0.8,
      confidencePath: 'confidence',
      onLowConfidence: 'human-review'
    }
  },
  'timeout': {
    id: 'timeout',
    type: 'timeout',
    label: 'Timeout',
    description: 'Adds timeout to a step',
    icon: '⏱️',
    color: '#F43F5E',
    category: 'reliability',
    configSchema: [
      {
        key: 'durationMs',
        label: 'Timeout Duration (ms)',
        type: 'number',
        required: true,
        default: 10000,
        description: 'Maximum time before timeout'
      },
      {
        key: 'onTimeout',
        label: 'On Timeout',
        type: 'select',
        default: 'retry',
        options: [
          { value: 'retry', label: 'Retry' },
          { value: 'fallback', label: 'Fallback' },
          { value: 'safe-stop', label: 'Safe Stop' }
        ],
        description: 'Action when timeout occurs'
      }
    ],
    defaultConfig: {
      durationMs: 10000,
      onTimeout: 'retry'
    }
  },
  'error-handler': {
    id: 'error-handler',
    type: 'error-handler',
    label: 'Error Handler',
    description: 'Catches and handles errors from previous steps',
    icon: '🛠️',
    color: '#DC2626',
    category: 'reliability',
    configSchema: [
      {
        key: 'handlerType',
        label: 'Handler Type',
        type: 'select',
        required: true,
        default: 'catch-all',
        options: [
          { value: 'catch-all', label: 'Catch All Errors' },
          { value: 'specific', label: 'Specific Error Types' }
        ],
        description: 'Type of error handling'
      },
      {
        key: 'errorTypes',
        label: 'Error Types to Catch',
        type: 'textarea',
        default: 'timeout,validation,network',
        description: 'Comma-separated error types (when type is specific)'
      },
      {
        key: 'recoveryAction',
        label: 'Recovery Action',
        type: 'select',
        default: 'fallback',
        options: [
          { value: 'fallback', label: 'Use Fallback' },
          { value: 'retry', label: 'Retry' },
          { value: 'safe-stop', label: 'Safe Stop' },
          { value: 'transform', label: 'Transform Error' }
        ],
        description: 'Action to take on caught error'
      },
      {
        key: 'transformCode',
        label: 'Error Transform Code',
        type: 'code',
        default: 'return { error: error.message, recovered: true };',
        description: 'Code to transform error (when action is transform). Use {{error}} for error object.'
      }
    ],
    defaultConfig: {
      handlerType: 'catch-all',
      errorTypes: 'timeout,validation,network',
      recoveryAction: 'fallback',
      transformCode: 'return { error: error.message, recovered: true };'
    }
  },
  'safe-stop': {
    id: 'safe-stop',
    type: 'safe-stop',
    label: 'Safe Stop',
    description: 'Stops workflow safely with clear error message',
    icon: '🛑',
    color: '#78716C',
    category: 'reliability',
    configSchema: [
      {
        key: 'message',
        label: 'Stop Message',
        type: 'textarea',
        required: true,
        default: 'Workflow stopped safely: {{error}}',
        description: 'Message to display when stopping'
      },
      {
        key: 'includeTrace',
        label: 'Include Execution Trace',
        type: 'boolean',
        default: true,
        description: 'Include trace in stop output'
      },
      {
        key: 'outputTemplate',
        label: 'Output Template',
        type: 'json',
        default: { success: false, stopped: true, message: '{{message}}', trace: '{{trace}}' },
        description: 'Template for final output'
      }
    ],
    defaultConfig: {
      message: 'Workflow stopped safely: {{error}}',
      includeTrace: true,
      outputTemplate: { success: false, stopped: true, message: '{{message}}', trace: '{{trace}}' }
    }
  }
};

export const BLOCK_CATEGORIES = {
  core: ['input', 'ai-model', 'tool', 'retrieval', 'condition', 'transform', 'output'] as BlockType[],
  reliability: ['validator', 'retry', 'fallback', 'timeout', 'error-handler', 'safe-stop'] as BlockType[],
  humanControl: ['human-review', 'approval-gate', 'confidence-check'] as BlockType[]
};

export function getBlockConfig(type: BlockType): BlockConfig {
  return BLOCK_DEFINITIONS[type];
}

export function getBlocksByCategory(category: 'core' | 'reliability' | 'human-control'): BlockConfig[] {
  const catKey = category === 'human-control' ? 'humanControl' : category;
  return (BLOCK_CATEGORIES[catKey as keyof typeof BLOCK_CATEGORIES] || []).map((type: BlockType) => BLOCK_DEFINITIONS[type]);
}