class PageTracker {
  constructor() {
    this.pageStats = new Map();
    this.transitions = new Map();
    this.totalOutgoing = new Map();
    this.previousPage = null;
  }

  recordAccess(page, currentTime) {
    if (this.previousPage !== null) {
      if (!this.transitions.has(this.previousPage)) {
        this.transitions.set(this.previousPage, new Map());
        this.totalOutgoing.set(this.previousPage, 0);
      }
      const transMap = this.transitions.get(this.previousPage);
      const currentCount = transMap.get(page) || 0;
      transMap.set(page, currentCount + 1);
      this.totalOutgoing.set(this.previousPage, this.totalOutgoing.get(this.previousPage) + 1);
    }

    if (!this.pageStats.has(page)) {
      this.pageStats.set(page, {
        frequency: 1,
        lastAccess: currentTime,
        meanInterval: 0,
        intervalCount: 0
      });
    } else {
      const stats = this.pageStats.get(page);
      const interval = currentTime - stats.lastAccess;
      
      const newIntervalCount = stats.intervalCount + 1;
      const newMean = stats.intervalCount === 0
        ? interval
        : ((stats.meanInterval * stats.intervalCount) + interval) / newIntervalCount;

      stats.frequency += 1;
      stats.lastAccess = currentTime;
      stats.meanInterval = newMean;
      stats.intervalCount = newIntervalCount;
    }

    this.previousPage = page;
  }

  getTransitionProbability(fromPage, toPage) {
    if (fromPage === null || !this.transitions.has(fromPage)) return 0;
    const transMap = this.transitions.get(fromPage);
    const count = transMap.get(toPage) || 0;
    const total = this.totalOutgoing.get(fromPage) || 1;
    return count / total;
  }

  getStats(page) {
    return this.pageStats.get(page) || {
      frequency: 0,
      lastAccess: 0,
      meanInterval: 0,
      intervalCount: 0
    };
  }

  calculateDetailedMemoryOverhead(cacheSize) {
    const uniquePagesCount = this.pageStats.size;

    const frequencyBytes = uniquePagesCount * 4;

    const recencyBytes = uniquePagesCount * 4;

    const intervalBytes = uniquePagesCount * 8;

    let totalEdges = 0;
    for (const [_, edgeMap] of this.transitions) {
      totalEdges += edgeMap.size;
    }
    const transitionBytes = (this.totalOutgoing.size * 4) + (totalEdges * 8) + 4;

    const predictionScoreBytes = Math.max(1, cacheSize) * 4;

    const totalBytes = frequencyBytes + recencyBytes + intervalBytes + transitionBytes + predictionScoreBytes;

    return {
      frequencyBytes,
      recencyBytes,
      intervalBytes,
      transitionBytes,
      predictionScoreBytes,
      totalBytes
    };
  }
}

module.exports = PageTracker;