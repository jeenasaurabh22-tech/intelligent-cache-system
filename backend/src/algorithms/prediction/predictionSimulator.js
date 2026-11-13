const { validateAndNormalizeInput } = require('../validator');
const { formatBytes } = require('../memoryHelper');
const PageTracker = require('./pageTracker');
const { calculatePredictionScore } = require('./predictionEngine');

function simulatePrediction(cacheSize, referenceString) {
  const { validSize, pages, error } = validateAndNormalizeInput(cacheSize, referenceString);
  if (error) throw new Error(`[Prediction Error] ${error}`);

  const totalRequests = pages.length;

  if (totalRequests === 0) {
    return {
      algorithm: 'PREDICTION',
      totalRequests: 0,
      hits: 0,
      misses: 0,
      hitRatio: 0,
      missRatio: 0,
      replacements: 0,
      memoryOverheadBytes: validSize * 4 + 4,
      memoryOverhead: formatBytes(validSize * 4 + 4),
      memoryOverheadBreakdown: {
        frequencyBytes: 0,
        recencyBytes: 0,
        intervalBytes: 0,
        transitionBytes: 4,
        predictionScoreBytes: validSize * 4,
        totalBytes: validSize * 4 + 4
      },
      steps: []
    };
  }

  const tracker = new PageTracker();
  const cache = [];
  const steps = [];
  let hits = 0;
  let misses = 0;
  let replacements = 0;

  for (let i = 0; i < totalRequests; i++) {
    const page = pages[i];
    const currentTime = i + 1;
    let result = 'MISS';
    let evictedPage = null;

    const pageIndex = cache.indexOf(page);

    if (pageIndex !== -1) {
      hits++;
      result = 'HIT';
    } else {
      misses++;
      result = 'MISS';

      if (cache.length < validSize) {
        cache.push(page);
      } else {
        let lowestScore = Infinity;
        let victimIndex = 0;
        let oldestAccessTime = Infinity;

        for (let c = 0; c < cache.length; c++) {
          const candidatePage = cache[c];
          const score = calculatePredictionScore(candidatePage, page, currentTime, tracker);
          const candidateStats = tracker.getStats(candidatePage);

          if (score < lowestScore) {
            lowestScore = score;
            victimIndex = c;
            oldestAccessTime = candidateStats.lastAccess;
          } else if (score === lowestScore) {
            if (candidateStats.lastAccess < oldestAccessTime) {
              oldestAccessTime = candidateStats.lastAccess;
              victimIndex = c;
            }
          }
        }

        evictedPage = cache[victimIndex];
        cache[victimIndex] = page;
        replacements++;
      }
    }

    const predictions = cache.map(p => ({
      page: p,
      score: calculatePredictionScore(p, page, currentTime, tracker)
    }));

    tracker.recordAccess(page, currentTime);

    steps.push({
      request: page,
      cacheState: [...cache],
      result,
      evictedPage,
      predictions
    });
  }

  const hitRatio = parseFloat((hits / totalRequests).toFixed(4));
  const missRatio = parseFloat((misses / totalRequests).toFixed(4));
  
  const overheadDetail = tracker.calculateDetailedMemoryOverhead(validSize);
  const memoryOverheadBytes = overheadDetail.totalBytes;
  const memoryOverhead = formatBytes(memoryOverheadBytes);

  return {
    algorithm: 'PREDICTION',
    totalRequests,
    hits,
    misses,
    hitRatio,
    missRatio,
    replacements,
    memoryOverheadBytes,
    memoryOverhead,
    memoryOverheadBreakdown: overheadDetail,
    steps
  };
}

module.exports = {
  simulatePrediction
};