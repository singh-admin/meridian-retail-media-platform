import { FailureScenario } from '../types';

export interface AIModelRequest {
  model: string;
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  outputFormat?: 'text' | 'json' | 'structured';
  schema?: any;
  inputData?: any;
  puzzleId?: string;
  failureScenario?: FailureScenario;
  failureEnabled?: boolean;
}

export interface AIModelResponse {
  success: boolean;
  text: string;
  data: any;
  error?: string;
  model: string;
  latencyMs: number;
  tokensUsed: number;
  confidence?: number;
}

export class MockProviders {
  /**
   * Main dispatch method for AI model execution
   */
  static async execute(req: AIModelRequest): Promise<AIModelResponse> {
    const startTime = Date.now();

    // Check if live API key is available in localStorage
    const liveApiKey = typeof window !== 'undefined' && typeof localStorage !== 'undefined' ? localStorage.getItem('puzzle_live_api_key') : null;
    const liveProvider = typeof window !== 'undefined' && typeof localStorage !== 'undefined' ? (localStorage.getItem('puzzle_live_provider') || 'openai') : 'openai';

    if (liveApiKey && !req.model.startsWith('mock-')) {
      try {
        return await this.callLiveAPI(req, liveApiKey, liveProvider);
      } catch (err: any) {
        console.warn('Live API call failed, falling back to mock provider:', err);
      }
    }

    // Default simulated inference delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Handle failure simulation if active for this step
    if (req.failureEnabled && req.failureScenario) {
      const scenario = req.failureScenario;

      if (scenario.failureType === 'network-error') {
        return {
          success: false,
          text: '',
          data: null,
          error: scenario.config.errorMsg || 'HTTP 503: Service Unavailable (Provider rate limit reached)',
          model: req.model,
          latencyMs: Date.now() - startTime,
          tokensUsed: 0
        };
      }

      if (scenario.failureType === 'timeout') {
        await new Promise((resolve) => setTimeout(resolve, 600));
        return {
          success: false,
          text: '',
          data: null,
          error: 'AI Model invocation timed out after 5000ms',
          model: req.model,
          latencyMs: Date.now() - startTime,
          tokensUsed: 0
        };
      }

      if (scenario.failureType === 'missing-field') {
        // Return malformed meeting summarizer output missing owner field
        const badOutput = {
          summary: 'Meeting to align on Q3 launch timeline and key milestones.',
          decisions: ['Launch beta on Oct 1st'],
          actionItems: [
            { task: 'Prepare database migrations by Friday', owner: 'Bob' },
            { task: 'Finalize mockups before Wednesday', owner: 'Charlie' },
            { task: 'Send the customer survey', owner: null } // MISSING / NULL OWNER
          ]
        };
        return {
          success: true,
          text: JSON.stringify(badOutput, null, 2),
          data: badOutput,
          model: req.model,
          latencyMs: Date.now() - startTime,
          tokensUsed: 240
        };
      }

      if (scenario.failureType === 'schema-validation') {
        // Return invoice with math mismatch and missing currency
        const badInvoice = {
          invoiceNumber: 'INV-2026-881',
          vendor: 'CloudScale Systems Inc.',
          subtotal: 1500.00,
          tax: 150.00,
          total: 1400.00, // Arithmetic hallucination (1400 != 1650)
          currency: undefined, // Missing currency
          isValidated: false
        };
        return {
          success: true,
          text: JSON.stringify(badInvoice, null, 2),
          data: badInvoice,
          model: req.model,
          latencyMs: Date.now() - startTime,
          tokensUsed: 310
        };
      }

      if (scenario.failureType === 'low-confidence') {
        const lowConfResult = {
          ticketId: req.inputData?.ticketId || 'TCK-9941',
          assignedDepartment: 'Uncertain: Billing or IT Support',
          confidence: 0.48, // Low confidence
          suggestedDepartments: ['Billing', 'Technical Support'],
          priority: 'high',
          reasoning: 'Customer reported both double billing invoice and team login authentication lockouts.'
        };
        return {
          success: true,
          text: JSON.stringify(lowConfResult, null, 2),
          data: lowConfResult,
          confidence: 0.48,
          model: req.model,
          latencyMs: Date.now() - startTime,
          tokensUsed: 190
        };
      }

      if (scenario.failureType === 'human-rejection') {
        const draftEmail = {
          recipient: 'billing-lead@acmeworks.com',
          subject: 'Resolution and Credit Confirmation for Incident #INC-2026',
          suggestedCreditAmount: 500,
          requiresApproval: true,
          body: 'Dear Acme Corp,\n\nWe apologize for the 2-hour database outage. As a gesture of goodwill, we have applied an unapproved $500 statement credit to your account.',
          riskLevel: 'high'
        };
        return {
          success: true,
          text: JSON.stringify(draftEmail, null, 2),
          data: draftEmail,
          model: req.model,
          latencyMs: Date.now() - startTime,
          tokensUsed: 220
        };
      }
    }

    // Standard high-quality mock responses based on puzzle / context
    return this.generateStandardMock(req, startTime);
  }

  private static generateStandardMock(req: AIModelRequest, startTime: number): AIModelResponse {
    const prompt = (req.prompt || '').toLowerCase();
    const input = req.inputData;

    // 1. Meeting Summarizer
    if (req.puzzleId === 'puzzle-1-meeting-summarizer' || prompt.includes('meeting') || prompt.includes('actionitem')) {
      const normalMeeting = {
        summary: 'Meeting to align on Q3 launch timeline and key milestones.',
        decisions: ['Launch beta on Oct 1st'],
        actionItems: [
          { task: 'Prepare database migrations by Friday', owner: 'Bob', status: 'pending' },
          { task: 'Finalize mockups before Wednesday', owner: 'Charlie', status: 'pending' },
          { task: 'Send the customer survey', owner: 'Alice (PM)', status: 'pending' }
        ]
      };
      return {
        success: true,
        text: JSON.stringify(normalMeeting, null, 2),
        data: normalMeeting,
        model: req.model,
        latencyMs: Date.now() - startTime,
        tokensUsed: 215
      };
    }

    // 2. Knowledge Assistant Grounded Answer
    if (req.puzzleId === 'puzzle-2-knowledge-assistant' || prompt.includes('context') || prompt.includes('grounded')) {
      const groundedResp = {
        verified: true,
        answer: 'Under the company WFH equipment policy, employees can receive up to a $500 stipend for monitors, mice, and keyboards. Ergonomic chairs are eligible up to $300 with manager approval. Standing desks are not reimbursed under standard policy.',
        citedDocuments: ['Work From Home Equipment Reimbursement Policy'],
        confidence: 0.94
      };
      return {
        success: true,
        text: JSON.stringify(groundedResp, null, 2),
        data: groundedResp,
        confidence: 0.94,
        model: req.model,
        latencyMs: Date.now() - startTime,
        tokensUsed: 280
      };
    }

    // 3. Ticket Classifier
    if (req.puzzleId === 'puzzle-3-ticket-router' || prompt.includes('ticket') || prompt.includes('classify')) {
      const ticketResp = {
        ticketId: input?.ticketId || 'TCK-9941',
        assignedDepartment: 'Billing & Account Services',
        confidence: 0.92,
        priority: 'high',
        sentiment: 'frustrated',
        requiresFollowup: true
      };
      return {
        success: true,
        text: JSON.stringify(ticketResp, null, 2),
        data: ticketResp,
        confidence: 0.92,
        model: req.model,
        latencyMs: Date.now() - startTime,
        tokensUsed: 145
      };
    }

    // 4. Resumed Mission (Puzzle 8)
    if (req.puzzleId === 'puzzle-8-resume-interrupted' || prompt.includes('mission') || prompt.includes('scientific')) {
      const missionResp = {
        missionId: input?.missionId || 'MISSION-TITAN-9',
        ingestedCount: input?.ingestedCount || 42,
        entitiesExtracted: ['Hydrothermal Vent Alpha', 'Cold Seep Beta-4', 'Sulfur Microbiome 16S'],
        synthesisReport: 'Deep-sea exploration verified high biological activity near active hydrothermal chimneys.',
        resumedFromCheckpoint: true,
        workflowStatus: 'recovered'
      };
      return {
        success: true,
        text: JSON.stringify(missionResp, null, 2),
        data: missionResp,
        model: req.model,
        latencyMs: Date.now() - startTime,
        tokensUsed: 340
      };
    }

    // 5. Research Synthesis (Puzzle 4)
    if (req.puzzleId === 'puzzle-4-research-timeout' || prompt.includes('market') || prompt.includes('financial')) {
      const researchResp = {
        ticker: input?.ticker || 'NVDA',
        market: input?.market || 'NASDAQ',
        status: 'completed',
        summary: 'Strong data center demand and accelerated compute adoption continue to drive revenue momentum.',
        keyMetrics: { growthRate: '+122% YoY', outlook: 'positive' }
      };
      return {
        success: true,
        text: JSON.stringify(researchResp, null, 2),
        data: researchResp,
        model: req.model,
        latencyMs: Date.now() - startTime,
        tokensUsed: 260
      };
    }

    // 6. Email Drafter (Puzzle 5)
    if (req.puzzleId === 'puzzle-5-approve-before-sending' || prompt.includes('apology') || prompt.includes('credit')) {
      const emailResp = {
        recipient: 'billing-lead@acmeworks.com',
        subject: 'Resolution and Credit Confirmation for Incident #INC-2026',
        suggestedCreditAmount: 350,
        riskLevel: 'medium',
        body: 'Dear Acme Corp Team,\n\nWe apologize for the service disruption earlier today. We have resolved the database connection issue and credited $350 toward your upcoming renewal.\n\nBest regards,\nOperations Support Team'
      };
      return {
        success: true,
        text: JSON.stringify(emailResp, null, 2),
        data: emailResp,
        model: req.model,
        latencyMs: Date.now() - startTime,
        tokensUsed: 195
      };
    }

    // 7. Data Extractor (OCR Invoice - Puzzle 6)
    if (req.puzzleId === 'puzzle-6-validate-data-extractor' || prompt.includes('invoice') || prompt.includes('ocr')) {
      const invoiceResp = {
        invoiceNumber: 'INV-2026-881',
        vendor: 'CloudScale Systems Inc.',
        currency: 'USD',
        subtotal: 1500.00,
        tax: 150.00,
        total: 1650.00,
        itemCount: 2,
        isValidated: true
      };
      return {
        success: true,
        text: JSON.stringify(invoiceResp, null, 2),
        data: invoiceResp,
        model: req.model,
        latencyMs: Date.now() - startTime,
        tokensUsed: 290
      };
    }

    // 8. Multi-Model Failover (Claude fallback - Puzzle 7)
    if (req.model === 'mock-claude' || req.puzzleId === 'puzzle-7-activate-fallback') {
      const claudeResp = {
        status: 'completed',
        providerUsed: 'mock-claude',
        fallbackTriggered: true,
        analysis: 'Renewable energy growth is driven by utility solar and grid battery adoption. Top 3 risks: grid interconnection queues, rare-earth mineral processing bottlenecks, and geopolitical tariffs.'
      };
      return {
        success: true,
        text: JSON.stringify(claudeResp, null, 2),
        data: claudeResp,
        model: 'mock-claude',
        latencyMs: Date.now() - startTime,
        tokensUsed: 310
      };
    }

    // Generic fallback output
    const generic = {
      processed: true,
      result: `Processed output from ${req.model}`,
      inputSummary: typeof input === 'object' ? Object.keys(input || {}) : String(input)
    };

    return {
      success: true,
      text: JSON.stringify(generic, null, 2),
      data: generic,
      model: req.model,
      latencyMs: Date.now() - startTime,
      tokensUsed: 120
    };
  }

  private static async callLiveAPI(req: AIModelRequest, apiKey: string, provider: string): Promise<AIModelResponse> {
    const startTime = Date.now();
    if (provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: req.systemPrompt || 'You are a helpful assistant.' },
            { role: 'user', content: req.prompt }
          ],
          temperature: req.temperature || 0.7
        })
      });
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || '';
      let parsedData: any = content;
      try {
        parsedData = JSON.parse(content);
      } catch {
        parsedData = { text: content };
      }

      return {
        success: true,
        text: content,
        data: parsedData,
        model: 'gpt-4o-mini',
        latencyMs: Date.now() - startTime,
        tokensUsed: data.usage?.total_tokens || 150
      };
    }
    throw new Error(`Provider ${provider} not implemented for live call`);
  }
}
