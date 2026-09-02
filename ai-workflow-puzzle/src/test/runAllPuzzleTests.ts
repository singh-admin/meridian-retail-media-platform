import { ALL_PUZZLES } from '../puzzles';
import { WorkflowEngine } from '../engine/workflowEngine';
import { ValidatorEngine } from '../engine/validatorEngine';
import { ToolSimulator } from '../engine/toolSimulator';
import { RetrievalSimulator } from '../engine/retrievalSimulator';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 AI WORKFLOW PUZZLE BUILDER - AUTOMATED TEST SUITE');
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, message: string) {
    totalTests++;
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passedTests++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      if (typeof process !== 'undefined') {
        process.exitCode = 1;
      }
    }
  }

  // Unit Test: ValidatorEngine
  console.log('--- 1. Testing Validator Engine ---');
  const validData = { summary: 'Met', decisions: [], actionItems: [{ task: 'T1', owner: 'Alice' }] };
  const invalidData = { summary: 'Met', actionItems: [{ task: 'T1', owner: null }] };

  const validRes = ValidatorEngine.validate(validData, {
    validationType: 'required-fields',
    requiredFields: 'summary,actionItems'
  });
  assert(validRes.valid === true, 'ValidatorEngine approves valid required fields');

  const invalidRes = ValidatorEngine.validate(invalidData, {
    validationType: 'json-schema',
    schema: {
      type: 'object',
      required: ['summary', 'decisions'],
      properties: { summary: { type: 'string' }, decisions: { type: 'array' } }
    }
  });
  assert(invalidRes.valid === false, 'ValidatorEngine rejects missing schema properties');

  // Unit Test: ToolSimulator
  console.log('\n--- 2. Testing Tool Simulator ---');
  const toolWeb = await ToolSimulator.execute('web-search', { query: 'AI trends' });
  assert(toolWeb.success === true && toolWeb.data.results.length > 0, 'ToolSimulator executes web-search');

  const toolEmail = await ToolSimulator.execute('email-sender', { to: 'lead@test.com', body: 'Apology' });
  assert(toolEmail.success === true && toolEmail.data.deliveryStatus === 'delivered', 'ToolSimulator dispatches email');

  const toolTimeout = await ToolSimulator.execute('web-search', { query: 'test' }, 1000, true);
  assert(toolTimeout.success === false && Boolean(toolTimeout.error?.includes('timed out')), 'ToolSimulator handles forced timeout');

  // Unit Test: RetrievalSimulator
  console.log('\n--- 3. Testing Retrieval Simulator ---');
  const ragSuccess = await RetrievalSimulator.search('ergonomic chair reimbursement', 'company-docs');
  assert(ragSuccess.hasEvidence === true && (ragSuccess.maxScore ?? 0) >= 0.5, 'RetrievalSimulator retrieves matching documents');

  const ragEmpty = await RetrievalSimulator.search('unrelated quantum physics', 'company-docs', 3, 0.5, true);
  assert(ragEmpty.hasEvidence === false && ragEmpty.documents.length === 0, 'RetrievalSimulator handles empty retrieval');

  // Integration Test: All 8 Puzzles
  console.log('\n--- 4. Testing All 8 Pre-Seeded Puzzles ---');

  for (let i = 0; i < ALL_PUZZLES.length; i++) {
    const puzzle = ALL_PUZZLES[i];
    console.log(`\n🧩 Testing Puzzle ${i + 1}: "${puzzle.title}" (${puzzle.difficulty.toUpperCase()})`);

    const engine = new WorkflowEngine();

    // Step A: Run Broken Workflow with Injected Failure
    if (puzzle.initialWorkflow) {
      console.log(`   Testing Broken Starting Workflow with Failure Injection...`);
      const { evalResult: brokenEval } = await engine.runWorkflow(
        puzzle.initialWorkflow.nodes,
        puzzle.initialWorkflow.edges,
        puzzle.sampleInput,
        puzzle,
        true // Failure enabled
      );

      // Broken workflow should fail or have low score / unhandled failure
      const detectedVulnerability =
        !brokenEval.isPuzzleSolved ||
        brokenEval.feedback.unhandledErrors.length > 0 ||
        !brokenEval.feedback.failureHandled ||
        !brokenEval.feedback.outputValid;

      assert(detectedVulnerability, `Broken workflow correctly fails or detects fault (Score: ${brokenEval.score}%)`);
    }

    // Step B: Run Resilient Solution Workflow with Injected Failure
    if (puzzle.solutionWorkflow) {
      console.log(`   Testing Resilient Solution Workflow with Failure Injection...`);
      const { evalResult: solEval } = await engine.runWorkflow(
        puzzle.solutionWorkflow.nodes,
        puzzle.solutionWorkflow.edges,
        puzzle.sampleInput,
        puzzle,
        true, // Failure enabled
        {
          onHumanReviewRequired: (ctx) => {
            // Auto-approve or edit during test
            ctx.resolve({
              action: 'approve',
              reason: 'Automated test approval',
              timestamp: Date.now()
            });
          }
        }
      );

      assert(solEval.isPuzzleSolved === true, `Solution workflow handles failure and solves puzzle (Score: ${solEval.score}%)`);
      assert(solEval.feedback.failureHandled === true, `Injected failure scenario mitigated`);
      assert(solEval.feedback.unhandledErrors.length === 0, `Zero unhandled errors in solution`);
    }
  }

  console.log('\n====================================================');
  console.log(`📊 TEST RESULTS: ${passedTests}/${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('====================================================');
}

runTests().catch((err) => {
  console.error('Test suite runner crashed:', err);
  if (typeof process !== 'undefined') {
    process.exit(1);
  }
});
