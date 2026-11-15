const WEIGHTS = {
  TRANSITION: 0.40,
  RECENCY: 0.25,
  FREQUENCY: 0.20,
  INTERVAL: 0.15
};

function calculatePredictionScore(page, currentPage, currentTime, tracker) {
const stats = tracker.getStats(page);

// Cold-start handling: unseen pages have no prediction history.
if (stats.frequency === 0) {
  return 0;
}

const sTransition = tracker.getTransitionProbability(currentPage, page);

  const elapsedSinceAccess = Math.max(0, currentTime - stats.lastAccess);
  const sRecency = 1 / (1 + elapsedSinceAccess);

  const sFrequency = currentTime > 0 ? Math.min(1.0, stats.frequency / currentTime) : 0;

  let sInterval = 0;
  if (stats.intervalCount > 0 && stats.meanInterval > 0) {
    const intervalDiff = Math.abs(elapsedSinceAccess - stats.meanInterval);
    sInterval = Math.max(0, 1 - (intervalDiff / (stats.meanInterval + 1)));
  }

  const compositeScore = 
    (WEIGHTS.TRANSITION * sTransition) +
    (WEIGHTS.RECENCY * sRecency) +
    (WEIGHTS.FREQUENCY * sFrequency) +
    (WEIGHTS.INTERVAL * sInterval);

  return parseFloat(compositeScore.toFixed(4));
}

module.exports = {
  calculatePredictionScore,
  WEIGHTS
};