import { ExecutionTrace, Puzzle, ReliabilityFeedback } from '../types';
import { ValidatorEngine } from './validatorEngine';

export interface EvaluationResult {
  feedback: ReliabilityFeedback;
  score: number;
  isPuzzleSolved: boolean;
  verdictMessage: string;
}

export class ReliabilityEvaluator {
  static evaluate(trace: ExecutionTrace, puzzle: Puzzle | null, failureScenarioEnabled: boolean): EvaluationResult {
    const steps = trace.steps || [];
    const finalStep = steps[steps.length - 1];
    const finalOutput = trace.finalOutput || finalStep?.output;

    const unhandledErrors: string[] = [];
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    let retryAttempts = 0;
    let fallbackActivated = false;
    let humanApprovalUsed = false;
    let stoppedSafely = false;
    let failureHandled = false;

    // Inspect each executed step
    for (const step of steps) {
      if (step.retryCount > 0) {
        retryAttempts += step.retryCount;
      }
      if (step.status === 'retrying' || (step.recoveryAction && step.recoveryAction.strategy === 'retry')) {
        strengths.push(`Utilized automated retry on ${step.stepType} step (${step.retryCount} attempts)`);
      }
      if (step.stepType === 'fallback' || (step.recoveryAction && step.recoveryAction.strategy === 'fallback')) {
        fallbackActivated = true;
        strengths.push(`Activated fallback recovery path for ${step.stepId}`);
      }
      if (step.stepType === 'human-review' || step.stepType === 'approval-gate' || step.humanDecision) {
        humanApprovalUsed = true;
        strengths.push(`Enforced Human-in-the-Loop review and recorded decision: ${step.humanDecision?.action || 'approved'}`);
      }
      if (step.status === 'safely-stopped') {
        stoppedSafely = true;
        strengths.push(`Workflow halted safely with structured explanation instead of crashing`);
      }
      if (step.status === 'failed' && !step.recoveryAction) {
        const subsequentlyRecovered = steps.some(s => s.status === 'recovered' || s.stepType === 'fallback' || s.stepType === 'error-handler' || s.status === 'safely-stopped');
        if (!subsequentlyRecovered) {
          unhandledErrors.push(`Step "${step.stepId}" (${step.stepType}) failed with error: ${step.error || 'Unknown error'}`);
        }
      }
      if (step.validationResult) {
        if (step.validationResult.valid) {
          strengths.push(`Output validation passed schema criteria`);
        } else {
          if (step.recoveryAction || steps.some(s => s.status === 'recovered' || s.stepType === 'fallback')) {
            strengths.push(`Caught schema invalidity and routed to recovery strategy`);
          } else {
            weaknesses.push(`Validation failure on "${step.stepId}" was not caught by any recovery block`);
          }
        }
      }
    }

    // Determine completion status
    const completedSuccessfully = trace.overallStatus === 'success' || (stoppedSafely && puzzle?.id === 'puzzle-2-knowledge-assistant');

    // Check output schema against puzzle completion criteria
    let outputValid = true;
    if (puzzle?.completionCriteria?.expectedOutputSchema) {
      const validation = ValidatorEngine.validate(finalOutput, {
        validationType: 'json-schema',
        schema: puzzle.completionCriteria.expectedOutputSchema
      });
      outputValid = validation.valid;
      if (!outputValid) {
        weaknesses.push(`Final output did not match expected schema: ${validation.errors.join('; ')}`);
      }
    }

    // Check failure scenario handling
    if (failureScenarioEnabled && puzzle?.failureScenario?.enabled) {
      const hasMitigation = fallbackActivated || retryAttempts > 0 || humanApprovalUsed || stoppedSafely || steps.some(s => s.status === 'recovered');

      if (hasMitigation && unhandledErrors.length === 0) {
        failureHandled = true;
        strengths.push(`Successfully handled injected failure: "${puzzle.failureScenario.name}"`);
      } else {
        failureHandled = false;
        weaknesses.push(`Injected failure "${puzzle.failureScenario.name}" caused workflow failure or was not mitigated`);
      }
    } else {
      failureHandled = true;
    }

    // Calculate score out of 100
    let score = 0;
    if (completedSuccessfully) score += 35;
    if (outputValid) score += 25;
    if (failureHandled) score += 25;
    if (humanApprovalUsed || fallbackActivated || retryAttempts > 0 || stoppedSafely || steps.some(s => s.status === 'recovered' || s.stepType === 'error-handler' || s.recoveryAction !== undefined)) score += 15;
    if (unhandledErrors.length > 0) score = Math.max(10, score - 30 * unhandledErrors.length);

    score = Math.min(100, Math.max(0, score));

    // Check if puzzle completion criteria are satisfied
    const minScore = puzzle?.completionCriteria?.minReliabilityScore || 80;
    let isPuzzleSolved = score >= minScore && outputValid && unhandledErrors.length === 0;

    if (puzzle?.completionCriteria?.mustHandleFailure && failureScenarioEnabled && !failureHandled) {
      isPuzzleSolved = false;
    }

    let verdictMessage = 'Workflow completed successfully!';
    if (isPuzzleSolved) {
      verdictMessage = '🎉 Puzzle Solved! Resilient workflow successfully validated.';
    } else if (unhandledErrors.length > 0) {
      verdictMessage = '⚠️ Workflow Failed: Unhandled errors detected during execution.';
    } else if (!outputValid) {
      verdictMessage = '⚠️ Output Invalid: Output format or required fields failed validation.';
    } else if (!failureHandled) {
      verdictMessage = '⚠️ Failure Not Handled: Workflow did not recover from simulated fault.';
    }

    // Deduplicate strengths and weaknesses
    const uniqueStrengths = Array.from(new Set(strengths));
    const uniqueWeaknesses = Array.from(new Set(weaknesses));

    const feedback: ReliabilityFeedback = {
      completedSuccessfully,
      outputValid,
      failureHandled,
      retryAttempts,
      fallbackActivated,
      humanApprovalUsed,
      unhandledErrors,
      stoppedSafely,
      weaknesses: uniqueWeaknesses,
      strengths: uniqueStrengths,
      score
    };

    return {
      feedback,
      score,
      isPuzzleSolved,
      verdictMessage
    };
  }
}
