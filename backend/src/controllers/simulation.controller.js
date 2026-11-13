const {
  SimulationModel,
  SimulationRequestModel,
  AlgorithmResultModel,
  CacheStateModel
} = require('../models');

const { runAllAlgorithms, validateAndNormalizeInput } = require('../algorithms');

class SimulationController {
  static async runSimulation(req, res, next) {
    try {
      const { cache_size, reference_string, algorithms, save_to_db = true } = req.body;

      const { validSize, pages, error } = validateAndNormalizeInput(cache_size, reference_string);
      if (error) {
        return res.status(400).json({ success: false, message: error });
      }

      if (pages.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'reference_string must contain at least one valid page number'
        });
      }

      const algoList = Array.isArray(algorithms) && algorithms.length > 0
        ? algorithms
        : ['FIFO', 'LRU', 'LFU', 'Optimal', 'PREDICTION'];

      const benchmark = runAllAlgorithms(validSize, pages, algoList);
      let savedSimulationId = null;

      if (save_to_db) {
        try {
          savedSimulationId = await SimulationModel.saveFullSimulation({
            cache_size: validSize,
            reference_string: pages.join(','),
            pages,
            details: benchmark.details
          });
        } catch (dbErr) {
          console.warn('[DB Save Warning]', dbErr.message);
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Simulation executed successfully',
        simulation_id: savedSimulationId,
        data: benchmark
      });
    } catch (error) {
      next(error);
    }
  }

  static async createSimulation(req, res, next) {
    try {
      const { cache_size, reference_string } = req.body;
      const { validSize, pages, error } = validateAndNormalizeInput(cache_size, reference_string);

      if (error) {
        return res.status(400).json({ success: false, message: error });
      }

      if (pages.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'reference_string must contain valid numeric page numbers'
        });
      }

      const simulation = await SimulationModel.create({
        cache_size: validSize,
        reference_string: pages.join(',')
      });

      await SimulationRequestModel.bulkCreate(simulation.id, pages);

      return res.status(201).json({
        success: true,
        message: 'Simulation created successfully with initialized requests',
        data: {
          id: simulation.id,
          cache_size: simulation.cache_size,
          reference_string: simulation.reference_string,
          total_requests: pages.length,
          created_at: simulation.created_at
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async saveRequests(req, res, next) {
    try {
      const simulationId = parseInt(req.params.id, 10);
      const { requests } = req.body;

      const simExists = await SimulationModel.findById(simulationId);
      if (!simExists) {
        return res.status(404).json({ success: false, message: 'Simulation not found' });
      }

      if (!requests || !Array.isArray(requests) || requests.length === 0) {
        return res.status(400).json({ success: false, message: 'requests array is required' });
      }

      const result = await SimulationRequestModel.bulkCreate(simulationId, requests);
      return res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async saveAlgorithmResults(req, res, next) {
    try {
      const simulationId = parseInt(req.params.id, 10);
      const simExists = await SimulationModel.findById(simulationId);
      if (!simExists) {
        return res.status(404).json({ success: false, message: 'Simulation not found' });
      }

      const { results, algorithm_name, hits, misses, hit_ratio, memory_overhead, execution_time } = req.body;

      if (results && Array.isArray(results)) {
        const saved = await AlgorithmResultModel.bulkCreate(simulationId, results);
        return res.status(201).json({ success: true, data: saved });
      }

      const singleResult = await AlgorithmResultModel.create({
        simulation_id: simulationId,
        algorithm_name,
        hits: parseInt(hits, 10) || 0,
        misses: parseInt(misses, 10) || 0,
        hit_ratio: parseFloat(hit_ratio) || 0.0,
        memory_overhead: memory_overhead || '0 KB',
        execution_time: parseFloat(execution_time) || 0.0
      });

      return res.status(201).json({ success: true, data: singleResult });
    } catch (error) {
      next(error);
    }
  }

  static async saveCacheStates(req, res, next) {
    try {
      const simulationId = parseInt(req.params.id, 10);
      const simExists = await SimulationModel.findById(simulationId);
      if (!simExists) {
        return res.status(404).json({ success: false, message: 'Simulation not found' });
      }

      const { algorithm_name, states } = req.body;
      const result = await CacheStateModel.bulkCreate(simulationId, algorithm_name, states);
      return res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getSimulationHistory(req, res, next) {
    try {
      const { limit = 50, offset = 0 } = req.query;
      const simulations = await SimulationModel.findAll({ limit, offset });
      return res.status(200).json({ success: true, count: simulations.length, data: simulations });
    } catch (error) {
      next(error);
    }
  }

  static async getSimulationDetails(req, res, next) {
    try {
      const simulationId = parseInt(req.params.id, 10);
      const simulation = await SimulationModel.findFullDetailsById(simulationId);

      if (!simulation) {
        return res.status(404).json({ success: false, message: `Simulation ${simulationId} not found` });
      }

      return res.status(200).json({ success: true, data: simulation });
    } catch (error) {
      next(error);
    }
  }

  static async getCacheStates(req, res, next) {
    try {
      const simulationId = parseInt(req.params.id, 10);
      const { algorithm } = req.query;
      const states = await CacheStateModel.findBySimulationId(simulationId, algorithm);
      return res.status(200).json({ success: true, count: states.length, data: states });
    } catch (error) {
      next(error);
    }
  }

  static async deleteSimulation(req, res, next) {
    try {
      const simulationId = parseInt(req.params.id, 10);
      const deleted = await SimulationModel.deleteById(simulationId);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Simulation not found' });
      }
      return res.status(200).json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = SimulationController;