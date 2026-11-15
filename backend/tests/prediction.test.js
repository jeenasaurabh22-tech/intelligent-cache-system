const assert = require('assert');
const { simulatePrediction, calculatePredictionScore, PageTracker } = require('../src/algorithms/prediction');
const { runAllAlgorithms } = require('../src/algorithms');

console.log("==================================================");
console.log("🧪 RUNNING PREDICTION ENGINE DETAILED METRICS TESTS");
console.log("==================================================\n");

let passed = 0;
let total = 0;

function runTest(name, fn) {
  total++;
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     ${err.message}`);
  }
}

runTest("PageTracker detailed memory overhead calculation matches theoretical specification", () => {
  const tracker = new PageTracker();
  tracker.recordAccess(1, 1);
  tracker.recordAccess(2, 2);
  tracker.recordAccess(3, 3);
  tracker.recordAccess(1, 4);
  tracker.recordAccess(2, 5);

  const overhead = tracker.calculateDetailedMemoryOverhead(3);
  
  assert.strictEqual(overhead.frequencyBytes, 3 * 4);
  assert.strictEqual(overhead.recencyBytes, 3 * 4);
  assert.strictEqual(overhead.intervalBytes, 3 * 8);
  
  assert.strictEqual(overhead.transitionBytes, 40);

  assert.strictEqual(overhead.predictionScoreBytes, 12);

  assert.strictEqual(overhead.totalBytes, 100);
});

runTest("simulatePrediction returns all 8 standardized performance metrics", () => {
  const ref = [7, 0, 1, 2, 0, 3, 0, 4, 2, 3];
  const res = simulatePrediction(3, ref);

  assert.strictEqual(res.algorithm, 'PREDICTION');
  assert.strictEqual(res.totalRequests, 10);
  assert.strictEqual(typeof res.hits, 'number');
  assert.strictEqual(typeof res.misses, 'number');
  assert.strictEqual(typeof res.hitRatio, 'number');
  assert.strictEqual(typeof res.missRatio, 'number');
  assert.strictEqual(typeof res.replacements, 'number');
  assert.strictEqual(typeof res.memoryOverheadBytes, 'number');
  assert.strictEqual(typeof res.memoryOverhead, 'string');
  assert.strictEqual(typeof res.memoryOverheadBreakdown, 'object');
  assert.ok(res.memoryOverheadBytes > 0);
  assert.strictEqual(res.hits + res.misses, 10);
});
runTest("Prediction score correctly combines all four weighted factors", () => {
  const tracker = new PageTracker();

  tracker.recordAccess(1, 1);
  tracker.recordAccess(2, 2);
  tracker.recordAccess(1, 3);

  const score = calculatePredictionScore(1, 2, 4, tracker);

  assert.strictEqual(score, 0.725);
});
runTest("PageTracker correctly calculates page transition probabilities", () => {
  const tracker = new PageTracker();

  tracker.recordAccess(1, 1);
  tracker.recordAccess(2, 2);
  tracker.recordAccess(1, 3);

  assert.strictEqual(tracker.getTransitionProbability(1, 2), 1);
  assert.strictEqual(tracker.getTransitionProbability(2, 1), 1);
  assert.strictEqual(tracker.getTransitionProbability(3, 1), 0);
});
console.log(`\n==================================================`);
console.log(`📊 PREDICTION TEST RESULTS: ${passed}/${total} Passed (${passed === total ? "ALL PASSED ✅" : "FAILURES ❌"})`);
console.log(`==================================================\n`);

if (passed !== total) process.exit(1);