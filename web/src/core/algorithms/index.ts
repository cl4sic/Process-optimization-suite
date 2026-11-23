import { evaluateSchedule } from '../evaluator';
import {
  AlgorithmConfig,
  AlgorithmType,
  OptimizationResult,
  ProblemInstance,
  ProgressUpdate,
} from '../types';
import { runGeneticAlgorithm } from './geneticAlgorithm';
import { runLocalSearch } from './localSearch';
import { runRandomSearch } from './randomSearch';
import { runSimulatedAnnealing } from './simulatedAnnealing';

export const ALGORITHM_NAMES: Record<AlgorithmType, string> = {
  random: 'Búsqueda Aleatoria Pura',
  local_best: 'Búsqueda Local (Mejor Vecino)',
  local_first: 'Búsqueda Local (Primer Mejor)',
  sa: 'Recocido Simulado (Simulated Annealing)',
  ga: 'Algoritmo Genético (GA)',
};

/**
 * Unified executor for any PFSP algorithm.
 */
export function runOptimization(
  instance: ProblemInstance,
  algorithm: AlgorithmType,
  config: AlgorithmConfig = {},
  onProgress?: (update: ProgressUpdate) => void
): OptimizationResult {
  const startTime = performance.now();
  const { numJobs, times } = instance;

  let rawResult: {
    bestOrder: number[];
    bestMakespan: number;
    initialMakespan: number;
    convergenceHistory: { iteration: number; makespan: number }[];
    iterationsCount?: number;
  };

  switch (algorithm) {
    case 'random':
      rawResult = runRandomSearch(numJobs, times, config.iterations ?? 2000, onProgress);
      break;

    case 'local_best':
      rawResult = runLocalSearch(numJobs, times, 'best', onProgress);
      break;

    case 'local_first':
      rawResult = runLocalSearch(numJobs, times, 'first', onProgress);
      break;

    case 'sa':
      rawResult = runSimulatedAnnealing(
        numJobs,
        times,
        {
          L: config.L,
          alpha: config.alpha,
          temp0Ratio: config.temp0Ratio,
          tempFinal: config.tempFinal,
          polishSteps: config.polishSteps,
        },
        onProgress
      );
      break;

    case 'ga':
      rawResult = runGeneticAlgorithm(
        numJobs,
        times,
        {
          populationSize: config.populationSize,
          crossoverProb: config.crossoverProb,
          mutationProb: config.mutationProb,
          maxGenerations: config.maxGenerations,
          stallLimit: config.stallLimit,
          stopCriterion: config.stopCriterion,
          polishSteps: config.polishSteps,
        },
        onProgress
      );
      break;

    default:
      throw new Error(`Unsupported algorithm: ${algorithm}`);
  }

  const executionTimeMs = performance.now() - startTime;
  const initialMakespan = rawResult.initialMakespan;
  const bestMakespan = rawResult.bestMakespan;
  const improvementPct =
    initialMakespan > 0
      ? ((initialMakespan - bestMakespan) / initialMakespan) * 100
      : 0;

  const evaluation = evaluateSchedule(rawResult.bestOrder, times);

  return {
    algorithm,
    algorithmName: ALGORITHM_NAMES[algorithm],
    bestOrder: rawResult.bestOrder,
    bestMakespan,
    initialMakespan,
    improvementPct,
    executionTimeMs,
    iterationsCount: rawResult.iterationsCount ?? config.iterations ?? 1,
    convergenceHistory: rawResult.convergenceHistory,
    evaluation,
  };
}
