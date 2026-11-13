const assert = require('assert');
const {
  simulateFIFO,
  simulateLRU,
  simulateLFU,
  simulateOptimal,
  runAllAlgorithms
} = require('../src/algorithms');

console.log("==================================================");
console.log("🧪 RUNNING CACHE METRICS & PERFORMANCE UNIT TESTS");
console.log("==================================================\n");

let total = 0;
let passed = 0;

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

const silberschatzRef = [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1];

runTest("FIFO returns all 8 performance metrics correctly", () => {
  const res = simulateFIFO(3, silberschatzRef);
  assert.strictEqual(res.algorithm, "FIFO");
  assert.strictEqual(res.totalRequests, 20);
  assert.strictEqual(res.hits, 5);
  assert.strictEqual(res.misses, 15);
  assert.strictEqual(res.hitRatio, 0.25);
  assert.strictEqual(res.missRatio, 0.75);
  assert.strictEqual(res.replacements, 12);
  assert.strictEqual(res.memoryOverheadBytes, 3 * 4 + 8);
  assert.strictEqual(res.memoryOverhead, "20 Bytes");
});

runTest("LRU returns all 8 performance metrics correctly", () => {
  const res = simulateLRU(3, silberschatzRef);
  assert.strictEqual(res.algorithm, "LRU");
  assert.strictEqual(res.totalRequests, 20);
  assert.strictEqual(res.hits, 8);
  assert.strictEqual(res.misses, 12);
  assert.strictEqual(res.hitRatio, 0.40);
  assert.strictEqual(res.missRatio, 0.60);
  assert.strictEqual(res.replacements, 9);
  assert.strictEqual(res.memoryOverheadBytes, 3 * 8);
  assert.strictEqual(res.memoryOverhead, "24 Bytes");
});

runTest("LFU returns all 8 performance metrics correctly", () => {
  const res = simulateLFU(3, silberschatzRef);
  assert.strictEqual(res.algorithm, "LFU");
  assert.strictEqual(res.totalRequests, 20);
  assert.strictEqual(res.hits + res.misses, 20);
  assert.strictEqual(res.replacements, res.misses - 3);
  assert.strictEqual(res.memoryOverheadBytes, 3 * 8);
  assert.strictEqual(res.memoryOverhead, "24 Bytes");
});

runTest("Optimal returns all 8 performance metrics correctly", () => {
  const res = simulateOptimal(3, silberschatzRef);
  assert.strictEqual(res.algorithm, "Optimal");
  assert.strictEqual(res.totalRequests, 20);
  assert.strictEqual(res.hits, 11);
  assert.strictEqual(res.misses, 9);
  assert.strictEqual(res.hitRatio, 0.55);
  assert.strictEqual(res.missRatio, 0.45);
  assert.strictEqual(res.replacements, 6);
  assert.strictEqual(res.memoryOverheadBytes, (3 + 20) * 4);
  assert.strictEqual(res.memoryOverhead, "92 Bytes");
});

runTest("Master benchmark runner executes and sorts all 5 algorithms with execution time", () => {
  const benchmark = runAllAlgorithms(3, silberschatzRef);
  assert.strictEqual(benchmark.comparison.length, 5);
  assert.strictEqual(benchmark.totalRequests, 20);

  benchmark.comparison.forEach(item => {
    assert.strictEqual(typeof item.algorithm, "string");
    assert.strictEqual(typeof item.totalRequests, "number");
    assert.strictEqual(typeof item.hits, "number");
    assert.strictEqual(typeof item.misses, "number");
    assert.strictEqual(typeof item.hitRatio, "number");
    assert.strictEqual(typeof item.missRatio, "number");
    assert.strictEqual(typeof item.replacements, "number");
    assert.strictEqual(typeof item.executionTimeMs, "number");
    assert.strictEqual(typeof item.memoryOverheadBytes, "number");
    assert.strictEqual(typeof item.memoryOverhead, "string");
  });
});

console.log(`\n==================================================`);
console.log(`📊 TEST RESULTS: ${passed}/${total} Passed (${passed === total ? "ALL PASSED ✅" : "FAILURES ❌"})`);
console.log(`==================================================\n`);

if (passed !== total) process.exit(1);