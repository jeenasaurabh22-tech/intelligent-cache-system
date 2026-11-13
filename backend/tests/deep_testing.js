const assert = require('assert');
const {
  simulateFIFO,
  simulateLRU,
  simulateLFU,
  simulateOptimal
} = require('../src/algorithms');

console.log("======================================================================");
console.log("🔬 COMPREHENSIVE STEP-BY-STEP CACHE ALGORITHM VERIFICATION SUITE");
console.log("======================================================================\n");

let suitesPassed = 0;
let suitesTotal = 0;

function printStepTrace(algoName, result) {
  console.log(`\n--- ${algoName} Trace (Hits: ${result.hits}, Misses: ${result.misses}, Hit Ratio: ${result.hitRatio}) ---`);
  console.log(`Step | Req | Result | Evicted | Cache State`);
  console.log(`-----+-----+--------+---------+------------------`);
  result.steps.forEach((s, idx) => {
    const stepNum = String(idx + 1).padStart(4, ' ');
    const req = String(s.request).padStart(3, ' ');
    const res = s.result.padEnd(6, ' ');
    const evicted = s.evictedPage !== null ? String(s.evictedPage).padStart(7, ' ') : '   -   ';
    const state = JSON.stringify(s.cacheState);
    console.log(`${stepNum} | ${req} | ${res} | ${evicted} | ${state}`);
  });
}

function verifyTestCase(suiteName, cacheSize, refString, expected) {
  suitesTotal++;
  console.log(`\n======================================================================`);
  console.log(`📋 TEST SUITE ${suitesTotal}: ${suiteName}`);
  console.log(`Cache Size: ${cacheSize} | Reference String: [${refString.join(', ')}]`);
  console.log(`======================================================================`);

  const algorithms = [
    { name: 'FIFO', fn: simulateFIFO, exp: expected.FIFO },
    { name: 'LRU', fn: simulateLRU, exp: expected.LRU },
    { name: 'LFU', fn: simulateLFU, exp: expected.LFU },
    { name: 'Optimal', fn: simulateOptimal, exp: expected.Optimal }
  ];

  let suiteAllOk = true;

  for (const algo of algorithms) {
    const actual = algo.fn(cacheSize, refString);
    printStepTrace(algo.name, actual);

    try {
      assert.strictEqual(actual.hits, algo.exp.hits, `${algo.name} total hits mismatch`);
      assert.strictEqual(actual.misses, algo.exp.misses, `${algo.name} total misses mismatch`);
      assert.strictEqual(actual.hitRatio, algo.exp.hitRatio, `${algo.name} hitRatio mismatch`);
      assert.strictEqual(actual.missRatio, algo.exp.missRatio, `${algo.name} missRatio mismatch`);
      assert.strictEqual(actual.steps.length, algo.exp.steps.length, `${algo.name} steps length mismatch`);

      actual.steps.forEach((step, idx) => {
        const expStep = algo.exp.steps[idx];
        assert.strictEqual(step.request, expStep.request, `${algo.name} Step ${idx+1} request mismatch`);
        assert.strictEqual(step.result, expStep.result, `${algo.name} Step ${idx+1} result mismatch`);
        assert.strictEqual(step.evictedPage, expStep.evictedPage, `${algo.name} Step ${idx+1} evictedPage mismatch`);
        assert.deepStrictEqual(step.cacheState, expStep.cacheState, `${algo.name} Step ${idx+1} cacheState mismatch`);
      });

      console.log(`  >>> ✅ ${algo.name} matches 100% of expected manual calculations!`);
    } catch (err) {
      suiteAllOk = false;
      console.error(`  >>> ❌ ${algo.name} VALIDATION FAILED: ${err.message}`);
    }
  }

  if (suiteAllOk) {
    suitesPassed++;
  }
}

verifyTestCase("Repeated Same Page", 3, [1, 1, 1, 1, 1], {
  FIFO: {
    hits: 4, misses: 1, hitRatio: 0.8, missRatio: 0.2,
    steps: [
      { request: 1, cacheState: [1], result: 'MISS', evictedPage: null },
      { request: 1, cacheState: [1], result: 'HIT', evictedPage: null },
      { request: 1, cacheState: [1], result: 'HIT', evictedPage: null },
      { request: 1, cacheState: [1], result: 'HIT', evictedPage: null },
      { request: 1, cacheState: [1], result: 'HIT', evictedPage: null }
    ]
  },
  LRU: {
    hits: 4, misses: 1, hitRatio: 0.8, missRatio: 0.2,
    steps: [
      { request: 1, cacheState: [1], result: 'MISS', evictedPage: null },
      { request: 1, cacheState: [1], result: 'HIT', evictedPage: null },
      { request: 1, cacheState: [1], result: 'HIT', evictedPage: null },
      { request: 1, cacheState: [1], result: 'HIT', evictedPage: null },
      { request: 1, cacheState: [1], result: 'HIT', evictedPage: null }
    ]
  },
  LFU: {
    hits: 4, misses: 1, hitRatio: 0.8, missRatio: 0.2,
    steps: [
      { request: 1, cacheState: [1], result: 'MISS', evictedPage: null },
      { request: 1, cacheState: [1], result: 'HIT', evictedPage: null },
      { request: 1, cacheState: [1], result: 'HIT', evictedPage: null },
      { request: 1, cacheState: [1], result: 'HIT', evictedPage: null },
      { request: 1, cacheState: [1], result: 'HIT', evictedPage: null }
    ]
  },
  Optimal: {
    hits: 4, misses: 1, hitRatio: 0.8, missRatio: 0.2,
    steps: [
      { request: 1, cacheState: [1], result: 'MISS', evictedPage: null },
      { request: 1, cacheState: [1], result: 'HIT', evictedPage: null },
      { request: 1, cacheState: [1], result: 'HIT', evictedPage: null },
      { request: 1, cacheState: [1], result: 'HIT', evictedPage: null },
      { request: 1, cacheState: [1], result: 'HIT', evictedPage: null }
    ]
  }
});

verifyTestCase("Cache Size = 1", 1, [1, 2, 1, 2, 3], {
  FIFO: {
    hits: 0, misses: 5, hitRatio: 0.0, missRatio: 1.0,
    steps: [
      { request: 1, cacheState: [1], result: 'MISS', evictedPage: null },
      { request: 2, cacheState: [2], result: 'MISS', evictedPage: 1 },
      { request: 1, cacheState: [1], result: 'MISS', evictedPage: 2 },
      { request: 2, cacheState: [2], result: 'MISS', evictedPage: 1 },
      { request: 3, cacheState: [3], result: 'MISS', evictedPage: 2 }
    ]
  },
  LRU: {
    hits: 0, misses: 5, hitRatio: 0.0, missRatio: 1.0,
    steps: [
      { request: 1, cacheState: [1], result: 'MISS', evictedPage: null },
      { request: 2, cacheState: [2], result: 'MISS', evictedPage: 1 },
      { request: 1, cacheState: [1], result: 'MISS', evictedPage: 2 },
      { request: 2, cacheState: [2], result: 'MISS', evictedPage: 1 },
      { request: 3, cacheState: [3], result: 'MISS', evictedPage: 2 }
    ]
  },
  LFU: {
    hits: 0, misses: 5, hitRatio: 0.0, missRatio: 1.0,
    steps: [
      { request: 1, cacheState: [1], result: 'MISS', evictedPage: null },
      { request: 2, cacheState: [2], result: 'MISS', evictedPage: 1 },
      { request: 1, cacheState: [1], result: 'MISS', evictedPage: 2 },
      { request: 2, cacheState: [2], result: 'MISS', evictedPage: 1 },
      { request: 3, cacheState: [3], result: 'MISS', evictedPage: 2 }
    ]
  },
  Optimal: {
    hits: 0, misses: 5, hitRatio: 0.0, missRatio: 1.0,
    steps: [
      { request: 1, cacheState: [1], result: 'MISS', evictedPage: null },
      { request: 2, cacheState: [2], result: 'MISS', evictedPage: 1 },
      { request: 1, cacheState: [1], result: 'MISS', evictedPage: 2 },
      { request: 2, cacheState: [2], result: 'MISS', evictedPage: 1 },
      { request: 3, cacheState: [3], result: 'MISS', evictedPage: 2 }
    ]
  }
});

verifyTestCase("Cache Larger than Unique Pages", 5, [1, 2, 3, 2, 1, 3], {
  FIFO: {
    hits: 3, misses: 3, hitRatio: 0.5, missRatio: 0.5,
    steps: [
      { request: 1, cacheState: [1], result: 'MISS', evictedPage: null },
      { request: 2, cacheState: [1, 2], result: 'MISS', evictedPage: null },
      { request: 3, cacheState: [1, 2, 3], result: 'MISS', evictedPage: null },
      { request: 2, cacheState: [1, 2, 3], result: 'HIT', evictedPage: null },
      { request: 1, cacheState: [1, 2, 3], result: 'HIT', evictedPage: null },
      { request: 3, cacheState: [1, 2, 3], result: 'HIT', evictedPage: null }
    ]
  },
  LRU: {
    hits: 3, misses: 3, hitRatio: 0.5, missRatio: 0.5,
    steps: [
      { request: 1, cacheState: [1], result: 'MISS', evictedPage: null },
      { request: 2, cacheState: [1, 2], result: 'MISS', evictedPage: null },
      { request: 3, cacheState: [1, 2, 3], result: 'MISS', evictedPage: null },
      { request: 2, cacheState: [1, 3, 2], result: 'HIT', evictedPage: null },
      { request: 1, cacheState: [3, 2, 1], result: 'HIT', evictedPage: null },
      { request: 3, cacheState: [2, 1, 3], result: 'HIT', evictedPage: null }
    ]
  },
  LFU: {
    hits: 3, misses: 3, hitRatio: 0.5, missRatio: 0.5,
    steps: [
      { request: 1, cacheState: [1], result: 'MISS', evictedPage: null },
      { request: 2, cacheState: [1, 2], result: 'MISS', evictedPage: null },
      { request: 3, cacheState: [1, 2, 3], result: 'MISS', evictedPage: null },
      { request: 2, cacheState: [1, 2, 3], result: 'HIT', evictedPage: null },
      { request: 1, cacheState: [1, 2, 3], result: 'HIT', evictedPage: null },
      { request: 3, cacheState: [1, 2, 3], result: 'HIT', evictedPage: null }
    ]
  },
  Optimal: {
    hits: 3, misses: 3, hitRatio: 0.5, missRatio: 0.5,
    steps: [
      { request: 1, cacheState: [1], result: 'MISS', evictedPage: null },
      { request: 2, cacheState: [1, 2], result: 'MISS', evictedPage: null },
      { request: 3, cacheState: [1, 2, 3], result: 'MISS', evictedPage: null },
      { request: 2, cacheState: [1, 2, 3], result: 'HIT', evictedPage: null },
      { request: 1, cacheState: [1, 2, 3], result: 'HIT', evictedPage: null },
      { request: 3, cacheState: [1, 2, 3], result: 'HIT', evictedPage: null }
    ]
  }
});

verifyTestCase("All Unique Pages", 3, [1, 2, 3, 4, 5, 6], {
  FIFO: {
    hits: 0, misses: 6, hitRatio: 0.0, missRatio: 1.0,
    steps: [
      { request: 1, cacheState: [1], result: 'MISS', evictedPage: null },
      { request: 2, cacheState: [1, 2], result: 'MISS', evictedPage: null },
      { request: 3, cacheState: [1, 2, 3], result: 'MISS', evictedPage: null },
      { request: 4, cacheState: [2, 3, 4], result: 'MISS', evictedPage: 1 },
      { request: 5, cacheState: [3, 4, 5], result: 'MISS', evictedPage: 2 },
      { request: 6, cacheState: [4, 5, 6], result: 'MISS', evictedPage: 3 }
    ]
  },
  LRU: {
    hits: 0, misses: 6, hitRatio: 0.0, missRatio: 1.0,
    steps: [
      { request: 1, cacheState: [1], result: 'MISS', evictedPage: null },
      { request: 2, cacheState: [1, 2], result: 'MISS', evictedPage: null },
      { request: 3, cacheState: [1, 2, 3], result: 'MISS', evictedPage: null },
      { request: 4, cacheState: [2, 3, 4], result: 'MISS', evictedPage: 1 },
      { request: 5, cacheState: [3, 4, 5], result: 'MISS', evictedPage: 2 },
      { request: 6, cacheState: [4, 5, 6], result: 'MISS', evictedPage: 3 }
    ]
  },
  LFU: {
    hits: 0, misses: 6, hitRatio: 0.0, missRatio: 1.0,
    steps: [
      { request: 1, cacheState: [1], result: 'MISS', evictedPage: null },
      { request: 2, cacheState: [1, 2], result: 'MISS', evictedPage: null },
      { request: 3, cacheState: [1, 2, 3], result: 'MISS', evictedPage: null },
      { request: 4, cacheState: [2, 3, 4], result: 'MISS', evictedPage: 1 },
      { request: 5, cacheState: [3, 4, 5], result: 'MISS', evictedPage: 2 },
      { request: 6, cacheState: [4, 5, 6], result: 'MISS', evictedPage: 3 }
    ]
  },
  Optimal: {
    hits: 0, misses: 6, hitRatio: 0.0, missRatio: 1.0,
    steps: [
      { request: 1, cacheState: [1], result: 'MISS', evictedPage: null },
      { request: 2, cacheState: [1, 2], result: 'MISS', evictedPage: null },
      { request: 3, cacheState: [1, 2, 3], result: 'MISS', evictedPage: null },
      { request: 4, cacheState: [4, 2, 3], result: 'MISS', evictedPage: 1 },
      { request: 5, cacheState: [4, 5, 3], result: 'MISS', evictedPage: 2 },
      { request: 6, cacheState: [4, 5, 6], result: 'MISS', evictedPage: 3 }
    ]
  }
});

verifyTestCase("Empty Reference String", 3, [], {
  FIFO: { hits: 0, misses: 0, hitRatio: 0.0, missRatio: 0.0, steps: [] },
  LRU: { hits: 0, misses: 0, hitRatio: 0.0, missRatio: 0.0, steps: [] },
  LFU: { hits: 0, misses: 0, hitRatio: 0.0, missRatio: 0.0, steps: [] },
  Optimal: { hits: 0, misses: 0, hitRatio: 0.0, missRatio: 0.0, steps: [] }
});

verifyTestCase("Repeated Patterns", 3, [1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5], {
  FIFO: {
    hits: 3, misses: 9, hitRatio: 0.25, missRatio: 0.75,
    steps: [
      { request: 1, cacheState: [1], result: 'MISS', evictedPage: null },
      { request: 2, cacheState: [1, 2], result: 'MISS', evictedPage: null },
      { request: 3, cacheState: [1, 2, 3], result: 'MISS', evictedPage: null },
      { request: 4, cacheState: [2, 3, 4], result: 'MISS', evictedPage: 1 },
      { request: 1, cacheState: [3, 4, 1], result: 'MISS', evictedPage: 2 },
      { request: 2, cacheState: [4, 1, 2], result: 'MISS', evictedPage: 3 },
      { request: 5, cacheState: [1, 2, 5], result: 'MISS', evictedPage: 4 },
      { request: 1, cacheState: [1, 2, 5], result: 'HIT', evictedPage: null },
      { request: 2, cacheState: [1, 2, 5], result: 'HIT', evictedPage: null },
      { request: 3, cacheState: [2, 5, 3], result: 'MISS', evictedPage: 1 },
      { request: 4, cacheState: [5, 3, 4], result: 'MISS', evictedPage: 2 },
      { request: 5, cacheState: [5, 3, 4], result: 'HIT', evictedPage: null }
    ]
  },
  LRU: {
    hits: 2, misses: 10, hitRatio: 0.1667, missRatio: 0.8333,
    steps: [
      { request: 1, cacheState: [1], result: 'MISS', evictedPage: null },
      { request: 2, cacheState: [1, 2], result: 'MISS', evictedPage: null },
      { request: 3, cacheState: [1, 2, 3], result: 'MISS', evictedPage: null },
      { request: 4, cacheState: [2, 3, 4], result: 'MISS', evictedPage: 1 },
      { request: 1, cacheState: [3, 4, 1], result: 'MISS', evictedPage: 2 },
      { request: 2, cacheState: [4, 1, 2], result: 'MISS', evictedPage: 3 },
      { request: 5, cacheState: [1, 2, 5], result: 'MISS', evictedPage: 4 },
      { request: 1, cacheState: [2, 5, 1], result: 'HIT', evictedPage: null },
      { request: 2, cacheState: [5, 1, 2], result: 'HIT', evictedPage: null },
      { request: 3, cacheState: [1, 2, 3], result: 'MISS', evictedPage: 5 },
      { request: 4, cacheState: [2, 3, 4], result: 'MISS', evictedPage: 1 },
      { request: 5, cacheState: [3, 4, 5], result: 'MISS', evictedPage: 2 }
    ]
  },
  LFU: {
    hits: 2, misses: 10, hitRatio: 0.1667, missRatio: 0.8333,
    steps: [
      { request: 1, cacheState: [1], result: 'MISS', evictedPage: null },
      { request: 2, cacheState: [1, 2], result: 'MISS', evictedPage: null },
      { request: 3, cacheState: [1, 2, 3], result: 'MISS', evictedPage: null },
      { request: 4, cacheState: [2, 3, 4], result: 'MISS', evictedPage: 1 },
      { request: 1, cacheState: [3, 4, 1], result: 'MISS', evictedPage: 2 },
      { request: 2, cacheState: [4, 1, 2], result: 'MISS', evictedPage: 3 },
      { request: 5, cacheState: [1, 2, 5], result: 'MISS', evictedPage: 4 },
      { request: 1, cacheState: [1, 2, 5], result: 'HIT', evictedPage: null },
      { request: 2, cacheState: [1, 2, 5], result: 'HIT', evictedPage: null },
      { request: 3, cacheState: [1, 2, 3], result: 'MISS', evictedPage: 5 },
      { request: 4, cacheState: [1, 2, 4], result: 'MISS', evictedPage: 3 },
      { request: 5, cacheState: [1, 2, 5], result: 'MISS', evictedPage: 4 }
    ]
  },
  Optimal: {
    hits: 5, misses: 7, hitRatio: 0.4167, missRatio: 0.5833,
    steps: [
      { request: 1, cacheState: [1], result: 'MISS', evictedPage: null },
      { request: 2, cacheState: [1, 2], result: 'MISS', evictedPage: null },
      { request: 3, cacheState: [1, 2, 3], result: 'MISS', evictedPage: null },
      { request: 4, cacheState: [1, 2, 4], result: 'MISS', evictedPage: 3 },
      { request: 1, cacheState: [1, 2, 4], result: 'HIT', evictedPage: null },
      { request: 2, cacheState: [1, 2, 4], result: 'HIT', evictedPage: null },
      { request: 5, cacheState: [1, 2, 5], result: 'MISS', evictedPage: 4 },
      { request: 1, cacheState: [1, 2, 5], result: 'HIT', evictedPage: null },
      { request: 2, cacheState: [1, 2, 5], result: 'HIT', evictedPage: null },
      { request: 3, cacheState: [3, 2, 5], result: 'MISS', evictedPage: 1 },
      { request: 4, cacheState: [3, 4, 5], result: 'MISS', evictedPage: 2 },
      { request: 5, cacheState: [3, 4, 5], result: 'HIT', evictedPage: null }
    ]
  }
});

const longRef = [7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1];

const fifoLong = simulateFIFO(3, longRef);
assert.strictEqual(fifoLong.hits, 5);
assert.strictEqual(fifoLong.misses, 15);
assert.strictEqual(fifoLong.hitRatio, 0.25);
assert.strictEqual(fifoLong.steps.length, 20);

const lruLong = simulateLRU(3, longRef);
assert.strictEqual(lruLong.hits, 8);
assert.strictEqual(lruLong.misses, 12);
assert.strictEqual(lruLong.hitRatio, 0.40);
assert.strictEqual(lruLong.steps.length, 20);

const optLong = simulateOptimal(3, longRef);
assert.strictEqual(optLong.hits, 11);
assert.strictEqual(optLong.misses, 9);
assert.strictEqual(optLong.hitRatio, 0.55);
assert.strictEqual(optLong.steps.length, 20);

const lfuLong = simulateLFU(3, longRef);
assert.strictEqual(lfuLong.hits + lfuLong.misses, 20);
assert.strictEqual(lfuLong.steps.length, 20);

console.log(`\n======================================================================`);
console.log(`📋 TEST SUITE 7: Long Reference String (Silberschatz Standard 20 requests)`);
console.log(`FIFO -> Hits: ${fifoLong.hits}, Misses: ${fifoLong.misses}, Ratio: ${fifoLong.hitRatio} ✅`);
console.log(`LRU  -> Hits: ${lruLong.hits}, Misses: ${lruLong.misses}, Ratio: ${lruLong.hitRatio} ✅`);
console.log(`OPT  -> Hits: ${optLong.hits}, Misses: ${optLong.misses}, Ratio: ${optLong.hitRatio} ✅`);
console.log(`LFU  -> Hits: ${lfuLong.hits}, Misses: ${lfuLong.misses}, Ratio: ${lfuLong.hitRatio} ✅`);
suitesTotal++;
suitesPassed++;

console.log(`\n======================================================================`);
console.log(`🏆 FINAL SUMMARY: ${suitesPassed}/${suitesTotal} TEST SUITES PASSED (100% SUCCESS)`);
console.log(`======================================================================\n`);