const { checkDbConnection } = require('../config/db');

const getHealthStatus = async (req, res) => {
  const dbStatus = await checkDbConnection();

  const healthData = {
    status: 'online',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: {
      type: 'MySQL',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'cache_prediction_db',
      connected: dbStatus.connected,
      details: dbStatus.message
    },
    system: {
      name: 'Intelligent Cache Prediction and Replacement System API',
      version: '1.0.0'
    }
  };

  return res.status(200).json(healthData);
};

module.exports = {
  getHealthStatus
};