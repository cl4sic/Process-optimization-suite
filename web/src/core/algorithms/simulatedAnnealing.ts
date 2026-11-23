import { calculateMakespan } from '../evaluator';
import { ConvergencePoint, ProgressUpdate } from '../types';
import { generateNeighbor, polishSolution, shuffleArray } from './polish';

/**
 * Simulated Annealing with geometric cooling and local polish.
 * Matches C++ algoritmo_sa.
 */
export function runSimulatedAnnealing(
  numJobs: number,
  times: number[][],
  options: {
    L?: number;
    alpha?: number;
    temp0Ratio?: number;
    tempFinal?: number;
    polishSteps?: number;
  } = {},
  onProgress?: (update: ProgressUpdate) => void
): {
  bestOrder: number[];
  bestMakespan: number;
  initialMakespan: number;
  convergenceHistory: ConvergencePoint[];
  iterationsCount: number;
} {
  const L = options.L ?? 100;
  const alpha = options.alpha ?? 0.95;
  const temp0Ratio = options.temp0Ratio ?? 0.4;
  const tempFinal = options.tempFinal ?? 0.01;
  const polishSteps = options.polishSteps ?? 20;

  const initial = Array.from({ length: numJobs }, (_, i) => i);
  let current = shuffleArray(initial);
  let currentQuality = calculateMakespan(current, times);
  const initialMakespan = currentQuality;

  let best = [...current];
  let bestQuality = currentQuality;

  const temp0 = currentQuality * temp0Ratio;
  let currentTemp = temp0;

  const convergenceHistory: ConvergencePoint[] = [
    { iteration: 0, makespan: bestQuality },
  ];

  let totalIterations = 0;
  let tempStep = 0;

  while (currentTemp > tempFinal) {
    tempStep++;
    for (let step = 0; step < L; step++) {
      totalIterations++;
      const neighbor = generateNeighbor(current);
      const neighborQuality = calculateMakespan(neighbor, times);
      const delta = neighborQuality - currentQuality;

      if (delta < 0) {
        current = neighbor;
        currentQuality = neighborQuality;
        if (currentQuality < bestQuality) {
          bestQuality = currentQuality;
          best = [...current];
        }
      } else {
        const threshold = Math.exp(-delta / currentTemp);
        const r = Math.random();
        if (r < threshold) {
          current = neighbor;
          currentQuality = neighborQuality;
        }
      }
    }

    currentTemp *= alpha;

    convergenceHistory.push({
      iteration: totalIterations,
      makespan: bestQuality,
    });

    if (onProgress) {
      onProgress({
        iteration: totalIterations,
        currentMakespan: currentQuality,
        bestMakespan: bestQuality,
        bestOrder: [...best],
        temperature: currentTemp,
      });
    }
  }

  // Final Polish
  if (polishSteps > 0) {
    best = polishSolution(best, times, polishSteps);
    bestQuality = calculateMakespan(best, times);
    convergenceHistory.push({
      iteration: totalIterations + 1,
      makespan: bestQuality,
    });
  }

  return {
    bestOrder: best,
    bestMakespan: bestQuality,
    initialMakespan,
    convergenceHistory,
    iterationsCount: totalIterations,
  };
}
