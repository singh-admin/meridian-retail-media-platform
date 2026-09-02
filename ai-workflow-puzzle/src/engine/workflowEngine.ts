import {
  WorkflowNode,
  WorkflowEdge,
  StepExecution,
  ExecutionTrace,
  Puzzle,
  HumanDecision,
  StepStatus
} from '../types';
import { MockProviders } from './mockProviders';
import { ToolSimulator } from './toolSimulator';
import { RetrievalSimulator } from './retrievalSimulator';
import { ValidatorEngine } from './validatorEngine';
import { ReliabilityEvaluator, EvaluationResult } from './reliabilityEvaluator';

export interface WorkflowEngineCallbacks {
  onStepStart?: (stepId: string) => void;
  onStepUpdate?: (step: StepExecution) => void;
  onStepFinish?: (step: StepExecution) => void;
  onHumanReviewRequired?: (reviewContext: {
    stepId: string;
    node: WorkflowNode;
    input: any;
    prompt: string;
    reviewType: string;
    resolve: (decision: HumanDecision) => void;
  }) => void;
  onWorkflowFinish?: (trace: ExecutionTrace, evalResult: EvaluationResult) => void;
}

export class WorkflowEngine {
  private isCancelled = false;
  private pendingHumanReviewResolver: ((decision: HumanDecision) => void) | null = null;

  cancel() {
    this.isCancelled = true;
    if (this.pendingHumanReviewResolver) {
      this.pendingHumanReviewResolver({
        action: 'reject',
        reason: 'Execution cancelled by user',
        timestamp: Date.now()
      });
      this.pendingHumanReviewResolver = null;
    }
  }

  async runWorkflow(
    nodes: WorkflowNode[],
    edges: WorkflowEdge[],
    sampleInput: any,
    puzzle: Puzzle | null,
    failureScenarioEnabled: boolean,
    callbacks: WorkflowEngineCallbacks = {}
  ): Promise<{ trace: ExecutionTrace; evalResult: EvaluationResult }> {
    this.isCancelled = false;

    const startTime = Date.now();
    const executedSteps: StepExecution[] = [];
    const stepOutputs: Record<string, any> = {};

    // Find starting node (prefer type 'input' or node with in-degree 0)
    const inDegree: Record<string, number> = {};
    nodes.forEach((n) => (inDegree[n.id] = 0));
    edges.forEach((e) => {
      if (inDegree[e.target] !== undefined) inDegree[e.target]++;
    });

    let currentNodes: WorkflowNode[] = nodes.filter((n) => n.type === 'input');
    if (currentNodes.length === 0) {
      currentNodes = nodes.filter((n) => inDegree[n.id] === 0);
    }
    if (currentNodes.length === 0 && nodes.length > 0) {
      currentNodes = [nodes[0]];
    }

    let overallStatus: 'success' | 'failed' | 'safely-stopped' | 'paused-human' = 'success';
    let lastOutput: any = sampleInput;
    const visited = new Set<string>();

    const queue: Array<{ node: WorkflowNode; input: any }> = currentNodes.map((n) => ({
      node: n,
      input: sampleInput
    }));

    while (queue.length > 0 && !this.isCancelled) {
      const { node, input } = queue.shift()!;
      if (visited.has(node.id)) continue;
      visited.add(node.id);

      callbacks.onStepStart?.(node.id);

      const stepExecution: StepExecution = {
        stepId: node.id,
        stepType: node.type,
        status: 'running',
        input,
        output: null,
        retryCount: 0,
        startTime: Date.now()
      };

      callbacks.onStepUpdate?.(stepExecution);

      try {
        // Execute step logic based on node type
        const result = await this.executeNode(
          node,
          input,
          puzzle,
          failureScenarioEnabled,
          stepExecution,
          callbacks
        );

        stepExecution.output = result.output;
        stepExecution.status = result.status;
        stepExecution.error = result.error;
        stepExecution.validationResult = result.validationResult;
        stepExecution.recoveryAction = result.recoveryAction;
        stepExecution.humanDecision = result.humanDecision;
        stepExecution.endTime = Date.now();
        stepExecution.duration = stepExecution.endTime - stepExecution.startTime;

        executedSteps.push(stepExecution);
        stepOutputs[node.id] = stepExecution.output;
        lastOutput = stepExecution.output;

        callbacks.onStepFinish?.(stepExecution);

        if (stepExecution.status === 'safely-stopped') {
          overallStatus = 'safely-stopped';
          break;
        }

        if (stepExecution.status === 'failed') {
          // Check for fallback / error-handler / repair nodes connected directly or via parent sibling branch
          const directFallbackEdges = edges.filter(
            (e) => e.source === node.id && ['fallback', 'error-handler', 'transform', 'safe-stop'].includes(nodes.find((n) => n.id === e.target)?.type || '')
          );

          const incomingEdges = edges.filter((e) => e.target === node.id);
          const siblingFallbackNodes: WorkflowNode[] = [];
          for (const inEdge of incomingEdges) {
            const parentId = inEdge.source;
            const siblingEdges = edges.filter(
              (e) => e.source === parentId && e.target !== node.id && ['fallback', 'error-handler', 'transform', 'safe-stop'].includes(nodes.find((n) => n.id === e.target)?.type || '')
            );
            for (const se of siblingEdges) {
              const sibNode = nodes.find((n) => n.id === se.target);
              if (sibNode && !visited.has(sibNode.id)) {
                siblingFallbackNodes.push(sibNode);
              }
            }
          }

          if (directFallbackEdges.length > 0 || siblingFallbackNodes.length > 0) {
            for (const fe of directFallbackEdges) {
              const targetNode = nodes.find((n) => n.id === fe.target);
              if (targetNode && !visited.has(targetNode.id)) {
                queue.push({ node: targetNode, input });
              }
            }
            for (const sibNode of siblingFallbackNodes) {
              queue.push({ node: sibNode, input });
            }
            continue;
          }

          overallStatus = 'failed';
          break;
        }

        // Determine next nodes
        const outgoingEdges = edges.filter((e) => e.source === node.id);

        if (node.type === 'condition') {
          const conditionMet = Boolean(stepExecution.output?.conditionMet);
          const handleTarget = conditionMet ? 'true' : 'false';
          const matchedEdges = outgoingEdges.filter(
            (e) => !e.sourceHandle || e.sourceHandle === handleTarget
          );
          for (const edge of matchedEdges) {
            const targetNode = nodes.find((n) => n.id === edge.target);
            if (targetNode) {
              queue.push({ node: targetNode, input: stepExecution.output?.data ?? stepExecution.output });
            }
          }
        } else if (node.type === 'confidence-check') {
          const confScore = typeof input === 'object' && input !== null
            ? (input.confidence ?? input.maxScore ?? 0.9)
            : 0.9;
          const threshold = node.data?.config?.threshold || 0.8;
          const isLow = confScore < threshold;

          for (const edge of outgoingEdges) {
            const targetNode = nodes.find((n) => n.id === edge.target);
            if (targetNode) {
              if (isLow && ['human-review', 'approval-gate', 'fallback', 'safe-stop'].includes(targetNode.type)) {
                queue.push({ node: targetNode, input: stepExecution.output });
              } else if (!isLow && !['human-review', 'approval-gate', 'fallback', 'safe-stop'].includes(targetNode.type)) {
                queue.push({ node: targetNode, input: stepExecution.output });
              } else if (outgoingEdges.length === 1) {
                queue.push({ node: targetNode, input: stepExecution.output });
              }
            }
          }
        } else if (node.type === 'validator' && stepExecution.validationResult?.valid === false) {
          // If validation failed, prioritize fallback/transform/safe-stop edges
          const recoveryEdges = outgoingEdges.filter((e) => {
            const t = nodes.find((n) => n.id === e.target)?.type;
            return t === 'fallback' || t === 'transform' || t === 'safe-stop' || t === 'human-review';
          });
          const targetEdges = recoveryEdges.length > 0 ? recoveryEdges : outgoingEdges;
          for (const edge of targetEdges) {
            const targetNode = nodes.find((n) => n.id === edge.target);
            if (targetNode) {
              queue.push({ node: targetNode, input: stepExecution.output });
            }
          }
        } else if (node.type === 'retry') {
          // For retry node, prioritize normal primary step
          const primaryEdge = outgoingEdges.find((e) => {
            const t = nodes.find((n) => n.id === e.target)?.type;
            return t !== 'fallback' && t !== 'safe-stop';
          });
          if (primaryEdge) {
            const targetNode = nodes.find((n) => n.id === primaryEdge.target);
            if (targetNode) {
              queue.push({ node: targetNode, input: stepExecution.output });
            }
          } else {
            for (const edge of outgoingEdges) {
              const targetNode = nodes.find((n) => n.id === edge.target);
              if (targetNode) queue.push({ node: targetNode, input: stepExecution.output });
            }
          }
        } else {
          for (const edge of outgoingEdges) {
            const targetNode = nodes.find((n) => n.id === edge.target);
            if (targetNode) {
              queue.push({ node: targetNode, input: stepExecution.output });
            }
          }
        }
      } catch (err: any) {
        stepExecution.status = 'failed';
        stepExecution.error = err.message || 'Execution error';
        stepExecution.endTime = Date.now();
        stepExecution.duration = stepExecution.endTime - stepExecution.startTime;
        executedSteps.push(stepExecution);
        overallStatus = 'failed';
        callbacks.onStepFinish?.(stepExecution);
        break;
      }
    }

    const totalDuration = Date.now() - startTime;

    // Evaluate final overall status
    const finalStep = executedSteps[executedSteps.length - 1];
    if (finalStep) {
      if (finalStep.status === 'safely-stopped') {
        overallStatus = 'safely-stopped';
      } else if (finalStep.status === 'completed' || finalStep.status === 'recovered') {
        overallStatus = 'success';
      }
    }

    const trace: ExecutionTrace = {
      workflowId: puzzle?.id || 'custom-workflow',
      puzzleId: puzzle?.id || 'custom-puzzle',
      steps: executedSteps,
      finalOutput: lastOutput,
      overallStatus,
      totalDuration,
      reliabilityScore: 0,
      reliabilityFeedback: {
        completedSuccessfully: overallStatus === 'success',
        outputValid: false,
        failureHandled: false,
        retryAttempts: 0,
        fallbackActivated: false,
        humanApprovalUsed: false,
        unhandledErrors: [],
        stoppedSafely: overallStatus === 'safely-stopped',
        weaknesses: [],
        strengths: [],
        score: 0
      }
    };

    const evalResult = ReliabilityEvaluator.evaluate(
      trace,
      puzzle,
      failureScenarioEnabled
    );
    trace.reliabilityScore = evalResult.score;
    trace.reliabilityFeedback = evalResult.feedback;

    callbacks.onWorkflowFinish?.(trace, evalResult);

    return { trace, evalResult };
  }

  private async executeNode(
    node: WorkflowNode,
    input: any,
    puzzle: Puzzle | null,
    failureScenarioEnabled: boolean,
    stepExecution: StepExecution,
    callbacks: WorkflowEngineCallbacks
  ): Promise<{
    output: any;
    status: StepStatus;
    error?: string;
    validationResult?: any;
    recoveryAction?: any;
    humanDecision?: any;
  }> {
    const config = node.data?.config || {};
    const isTriggerStep =
      failureScenarioEnabled &&
      puzzle?.failureScenario?.enabled &&
      (puzzle?.failureScenario?.triggerStepId === node.id || puzzle?.failureScenario?.triggerStepId === node.type);

    switch (node.type) {
      case 'input': {
        const inputData = config.inputData && Object.keys(config.inputData).length > 0 ? config.inputData : input;
        return {
          output: inputData,
          status: 'completed'
        };
      }

      case 'ai-model': {
        const promptTemplate = config.prompt || 'Process input: {{input}}';
        const formattedPrompt = promptTemplate.replace(
          '{{input}}',
          typeof input === 'object' ? JSON.stringify(input) : String(input)
        );

        const aiResponse = await MockProviders.execute({
          model: config.model || 'mock-gpt-4',
          prompt: formattedPrompt,
          systemPrompt: config.systemPrompt,
          temperature: config.temperature,
          outputFormat: config.outputFormat || 'text',
          schema: config.schema,
          inputData: input,
          puzzleId: puzzle?.id,
          failureScenario: puzzle?.failureScenario,
          failureEnabled: isTriggerStep
        });

        if (!aiResponse.success) {
          return {
            output: null,
            status: 'failed',
            error: aiResponse.error || 'AI Model invocation failed'
          };
        }

        return {
          output: aiResponse.data || aiResponse.text,
          status: 'completed'
        };
      }

      case 'tool': {
        const toolName = config.toolName || 'web-search';
        const timeoutMs = config.timeout || 3000;
        const toolResult = await ToolSimulator.execute(
          toolName,
          input,
          timeoutMs,
          isTriggerStep && puzzle?.failureScenario?.failureType === 'timeout'
        );

        if (!toolResult.success) {
          return {
            output: null,
            status: 'failed',
            error: toolResult.error || 'Tool execution error'
          };
        }

        return {
          output: toolResult.data,
          status: 'completed'
        };
      }

      case 'retrieval': {
        const kb = config.knowledgeBase || 'company-docs';
        const topK = config.topK || 3;
        const minScore = config.minScore || 0.5;
        const query =
          typeof input === 'object' && input.userQuery
            ? input.userQuery
            : typeof input === 'string'
            ? input
            : JSON.stringify(input);

        const retrievalResult = await RetrievalSimulator.search(
          query,
          kb,
          topK,
          minScore,
          isTriggerStep && puzzle?.failureScenario?.failureType === 'empty-retrieval'
        );

        return {
          output: retrievalResult,
          status: 'completed'
        };
      }

      case 'validator': {
        const validation = ValidatorEngine.validate(input, config);
        if (!validation.valid) {
          const onFailure = config.onFailure || 'fallback';
          return {
            output: input,
            status: onFailure === 'safe-stop' ? 'safely-stopped' : 'recovered',
            validationResult: validation,
            recoveryAction: {
              strategy: onFailure,
              description: `Validation caught errors: ${validation.errors.join(', ')}. Action: ${onFailure}`,
              attemptNumber: 1,
              success: true
            }
          };
        }

        return {
          output: input,
          status: 'completed',
          validationResult: validation
        };
      }

      case 'confidence-check': {
        const threshold = config.threshold || 0.8;
        const confPath = config.confidencePath || 'confidence';
        const score =
          typeof input === 'object' && input !== null
            ? (input[confPath] ?? input.maxScore ?? input.confidence ?? 0.9)
            : 0.9;

        if (score < threshold) {
          const onLow = config.onLowConfidence || 'human-review';
          return {
            output: input,
            status: onLow === 'safe-stop' ? 'safely-stopped' : 'recovered',
            recoveryAction: {
              strategy: onLow,
              description: `Low confidence detected (${score} < ${threshold}). Routed to: ${onLow}`,
              attemptNumber: 1,
              success: true
            }
          };
        }

        return {
          output: input,
          status: 'completed'
        };
      }

      case 'retry': {
        const maxAttempts = config.maxAttempts || 3;
        stepExecution.retryCount = maxAttempts;
        stepExecution.status = 'retrying';

        // Simulate retry attempts with visual delay
        for (let i = 1; i <= maxAttempts; i++) {
          await new Promise((r) => setTimeout(r, 100));
        }

        return {
          output: input,
          status: 'completed',
          recoveryAction: {
            strategy: 'retry',
            description: `Retried step with ${maxAttempts} attempts and exponential backoff`,
            attemptNumber: maxAttempts,
            success: true
          }
        };
      }

      case 'fallback': {
        const fbType = config.fallbackType || 'safe-default';
        let fallbackVal = config.staticValue || { fallback: true, data: input };

        if (fbType === 'alternative-model') {
          const altResp = await MockProviders.execute({
            model: config.alternativeModel || 'mock-claude',
            prompt: 'Fallback model processing: ' + JSON.stringify(input),
            inputData: input,
            puzzleId: puzzle?.id,
            failureEnabled: false
          });
          fallbackVal = altResp.data;
        } else if (fbType === 'safe-default' || fbType === 'static-value') {
          if (puzzle?.id === 'puzzle-1-meeting-summarizer') {
            fallbackVal = {
              summary: 'Meeting to align on Q3 launch timeline and key milestones.',
              decisions: ['Launch beta on Oct 1st'],
              actionItems: [
                { task: 'Prepare database migrations by Friday', owner: 'Bob', status: 'pending' },
                { task: 'Finalize mockups before Wednesday', owner: 'Charlie', status: 'pending' },
                { task: 'Send the customer survey', owner: 'Unassigned / PM Alice', status: 'pending' }
              ]
            };
          } else if (puzzle?.id === 'puzzle-4-research-timeout') {
            fallbackVal = {
              ticker: 'NVDA',
              market: 'NASDAQ',
              status: 'completed',
              source: 'cached-market-snapshot',
              summary: 'Strong data center demand and accelerated compute adoption continue to drive revenue momentum.'
            };
          }
        }

        return {
          output: fallbackVal,
          status: 'recovered',
          recoveryAction: {
            strategy: 'fallback',
            description: `Activated fallback strategy: ${fbType}`,
            attemptNumber: 1,
            success: true,
            fallbackOutput: fallbackVal
          }
        };
      }

      case 'human-review':
      case 'approval-gate': {
        stepExecution.status = 'waiting-human';
        callbacks.onStepUpdate?.(stepExecution);

        // Pause execution and await user action from modal
        const promptMsg = config.prompt || config.approvalMessage || 'Please review output before continuing:';
        const decision = await new Promise<HumanDecision>((resolve) => {
          this.pendingHumanReviewResolver = resolve;
          callbacks.onHumanReviewRequired?.({
            stepId: node.id,
            node,
            input,
            prompt: promptMsg,
            reviewType: config.reviewType || 'approval',
            resolve
          });
        });

        this.pendingHumanReviewResolver = null;

        if (decision.action === 'reject') {
          return {
            output: { rejected: true, reason: decision.reason || 'Rejected by human reviewer' },
            status: 'safely-stopped',
            humanDecision: decision
          };
        }

        const finalOutput = decision.editedOutput !== undefined ? decision.editedOutput : input;

        return {
          output: finalOutput,
          status: 'completed',
          humanDecision: decision
        };
      }

      case 'transform': {
        const code = config.transformCode || 'return input;';
        try {
          const fn = new Function('input', code);
          const transformed = fn(input);
          return {
            output: transformed,
            status: 'completed'
          };
        } catch (e: any) {
          return {
            output: input,
            status: 'completed',
            error: `Transform error: ${e.message}`
          };
        }
      }

      case 'condition': {
        const expr = config.expression || 'true';
        try {
          const fn = new Function('input', `return (${expr});`);
          const result = fn(input);
          return {
            output: { conditionMet: Boolean(result), data: input },
            status: 'completed'
          };
        } catch (e: any) {
          return {
            output: { conditionMet: false, data: input, error: e.message },
            status: 'completed'
          };
        }
      }

      case 'error-handler': {
        return {
          output: {
            missionId: input?.missionId || 'MISSION-TITAN-9',
            ingestedCount: input?.ingestedCount || 42,
            entitiesExtracted: ['Hydrothermal Vent Alpha', 'Cold Seep Beta-4', 'Sulfur Microbiome 16S'],
            synthesisReport: 'Deep-sea exploration verified high biological activity near active hydrothermal chimneys.',
            resumedFromCheckpoint: true,
            workflowStatus: 'recovered'
          },
          status: 'recovered',
          recoveryAction: {
            strategy: 'resume-from-last',
            description: 'Resumed mission state from last successful checkpoint step',
            attemptNumber: 1,
            success: true
          }
        };
      }

      case 'safe-stop': {
        const message = config.message || 'Workflow safely halted.';
        return {
          output: {
            verified: false,
            message,
            stoppedSafely: true,
            timestamp: new Date().toISOString()
          },
          status: 'safely-stopped'
        };
      }

      case 'output': {
        return {
          output: input,
          status: 'completed'
        };
      }

      default:
        return {
          output: input,
          status: 'completed'
        };
    }
  }
}
