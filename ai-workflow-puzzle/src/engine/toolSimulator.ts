export interface ToolResult {
  success: boolean;
  data: any;
  error?: string;
  durationMs: number;
}

export class ToolSimulator {
  static async execute(
    toolName: string,
    params: any,
    timeoutMs: number = 5000,
    forceFailure: boolean = false
  ): Promise<ToolResult> {
    const startTime = Date.now();

    // If failure injection is requested or forced timeout
    if (forceFailure) {
      await new Promise((resolve) => setTimeout(resolve, Math.min(timeoutMs, 800)));
      return {
        success: false,
        data: null,
        error: `Tool "${toolName}" timed out after ${timeoutMs}ms (504 Gateway Timeout)`,
        durationMs: Date.now() - startTime
      };
    }

    // Realistic small network latency
    await new Promise((resolve) => setTimeout(resolve, 400));

    switch (toolName) {
      case 'web-search':
        return {
          success: true,
          data: {
            source: 'live-web-search',
            query: params.query || (typeof params === 'string' ? params : JSON.stringify(params)),
            results: [
              {
                title: 'Market Research Report 2026',
                snippet: 'Global technology growth remains robust with surging enterprise AI investments.',
                url: 'https://marketresearch.mock/2026-tech-trends'
              },
              {
                title: 'Financial Analysis & Earnings Data',
                snippet: 'Quarterly revenue exceeded consensus estimates by 8.4% driven by Cloud and AI segments.',
                url: 'https://financials.mock/q2-analysis'
              }
            ],
            timestamp: new Date().toISOString()
          },
          durationMs: Date.now() - startTime
        };

      case 'calculator':
        try {
          const expr = params.expression || (typeof params === 'string' ? params : '0');
          // Safe mathematical evaluation
          const sanitized = expr.replace(/[^0-9+\-*/(). ]/g, '');
          const calculated = Function(`"use strict"; return (${sanitized})`)();
          return {
            success: true,
            data: { expression: expr, result: calculated },
            durationMs: Date.now() - startTime
          };
        } catch (e: any) {
          return {
            success: false,
            data: null,
            error: `Calculator error: ${e.message}`,
            durationMs: Date.now() - startTime
          };
        }

      case 'weather-api':
        return {
          success: true,
          data: {
            location: params.city || 'San Francisco, CA',
            temperature: '72°F',
            condition: 'Clear Skies',
            humidity: '45%',
            wind: '8 mph'
          },
          durationMs: Date.now() - startTime
        };

      case 'email-sender':
        const recipient = params.recipient || params.to || 'customer@example.com';
        const subject = params.subject || 'Automated Update';
        const body = params.body || params.message || (typeof params === 'string' ? params : JSON.stringify(params));
        return {
          success: true,
          data: {
            emailSent: true,
            deliveryStatus: 'delivered',
            recipient,
            subject,
            dispatchedAt: new Date().toISOString(),
            messageId: `msg_${Math.random().toString(36).substring(2, 9)}`,
            body
          },
          durationMs: Date.now() - startTime
        };

      case 'database-query':
        return {
          success: true,
          data: {
            routedSuccessfully: true,
            ticketId: params.ticketId || 'TCK-9941',
            assignedDepartment: params.assignedDepartment || params.department || 'Technical Support',
            priority: params.priority || 'high',
            updatedAt: new Date().toISOString(),
            dbRecordId: `rec_${Math.floor(Math.random() * 90000) + 10000}`
          },
          durationMs: Date.now() - startTime
        };

      default:
        return {
          success: true,
          data: { message: `Tool ${toolName} executed successfully`, params },
          durationMs: Date.now() - startTime
        };
    }
  }
}
