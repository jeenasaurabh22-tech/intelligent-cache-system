const { simulatePrediction } = require('./predictionSimulator');
const { calculatePredictionScore, WEIGHTS } = require('./predictionEngine');
const PageTracker = require('./pageTracker');

module.exports = {
  simulatePrediction,
  calculatePredictionScore,
  WEIGHTS,
  PageTracker
};