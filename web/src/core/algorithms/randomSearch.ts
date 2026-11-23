import { calculateMakespan } from '../evaluator';
import { ConvergencePoint, ProgressUpdate } from '../types';
import { shuffleArray } from './polish';

/**
 * Pure Random Search Algorithm.
 * Matches C++ algoritmo_busqueda_aleatoria.
 */
export function runRandomSearch(
  numJobs: number,
  times: number[][],
  iterations: number = 2000,
  onProgress?: (update: ProgressUpdate) => void
): {
  bestOrder: number[];
  bestMakespan: number;
  initialMakespan: number;
  convergenceHistory: ConvergencePoint[];
} {
  const initial = Array.from({ length: numJobs }, (_, i) => i);
  let best = shuffleArray(initial);
  let bestMakespan = calculateMakespan(best, times);
  const initialMakespan = bestMakespan;

  const convergenceHistory: ConvergencePoint[] = [
    { iteration: 0, makespan: bestMakespan },
  ];

  const reportInterval = Math.max(1, Math.floor(iterations / 100));

  for (let iter = 1; iter <= iterations; iter++) {
    const candidate = shuffleArray(best);
    const candidateMakespan = calculateMakespan(candidate, times);

    if (candidateMakespan < bestMakespan) {
      bestMakespan = candidateMakespan;
      best = candidate;
    }

    if (iter % reportInterval === 0 || iter === iterations) {
      convergenceHistory.push({ iteration: iter, makespan: bestMakespan });
      if (onProgress) {
        onProgress({
          iteration: iter,
          maxIterations: iterations,
          currentMakespan: candidateMakespan,
          bestMakespan,
          bestOrder: [...best],
        });
      }
    }
  }

  return {
    bestOrder: best,
    bestMakespan,
    initialMakespan,
    convergenceHistory,
  };
}
