import { calculateMakespan } from '../evaluator';
import { ConvergencePoint, ProgressUpdate } from '../types';
import { shuffleArray } from './polish';

/**
 * Local Search: Best Neighbor vs First Best Neighbor.
 * Matches C++ algoritmo_local_mejor and algoritmo_local_primer_mejor.
 */
export function runLocalSearch(
  numJobs: number,
  times: number[][],
  mode: 'best' | 'first' = 'best',
  onProgress?: (update: ProgressUpdate) => void
): {
  bestOrder: number[];
  bestMakespan: number;
  initialMakespan: number;
  convergenceHistory: ConvergencePoint[];
  iterationsCount: number;
} {
  const initial = Array.from({ length: numJobs }, (_, i) => i);
  let current = shuffleArray(initial);
  let currentMakespan = calculateMakespan(current, times);
  const initialMakespan = currentMakespan;

  const convergenceHistory: ConvergencePoint[] = [
    { iteration: 0, makespan: currentMakespan },
  ];

  let improvement = true;
  let iterationsCount = 0;

  while (improvement) {
    improvement = false;
    iterationsCount++;

    if (mode === 'first') {
      // First improving neighbor
      for (let i = 0; i < numJobs - 1; i++) {
        for (let j = i + 1; j < numJobs; j++) {
          const candidate = [...current];
          const temp = candidate[i];
          candidate[i] = candidate[j];
          candidate[j] = temp;

          const candidateMakespan = calculateMakespan(candidate, times);
          if (candidateMakespan < currentMakespan) {
            current = candidate;
            currentMakespan = candidateMakespan;
            improvement = true;
            break;
          }
        }
        if (improvement) break;
      }
    } else {
      // Best neighbor in full 2-opt neighborhood
      let bestNeighbor = current;
      let bestNeighborMakespan = currentMakespan;

      for (let i = 0; i < numJobs - 1; i++) {
        for (let j = i + 1; j < numJobs; j++) {
          const candidate = [...current];
          const temp = candidate[i];
          candidate[i] = candidate[j];
          candidate[j] = temp;

          const candidateMakespan = calculateMakespan(candidate, times);
          if (candidateMakespan < bestNeighborMakespan) {
            bestNeighbor = candidate;
            bestNeighborMakespan = candidateMakespan;
          }
        }
      }

      if (bestNeighborMakespan < currentMakespan) {
        current = bestNeighbor;
        currentMakespan = bestNeighborMakespan;
        improvement = true;
      }
    }

    convergenceHistory.push({ iteration: iterationsCount, makespan: currentMakespan });

    if (onProgress) {
      onProgress({
        iteration: iterationsCount,
        currentMakespan,
        bestMakespan: currentMakespan,
        bestOrder: [...current],
      });
    }
  }

  return {
    bestOrder: current,
    bestMakespan: currentMakespan,
    initialMakespan,
    convergenceHistory,
    iterationsCount,
  };
}
