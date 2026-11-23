import { calculateMakespan } from '../evaluator';

/**
 * 2-Opt local search post-processor to polish a solution.
 * Matches C++ pulir_solucion(vector<int> s, int max_pasos = 20)
 */
export function polishSolution(
  solution: number[],
  times: number[][],
  maxSteps: number = 20
): number[] {
  const n = solution.length;
  const s = [...solution];
  let currentQuality = calculateMakespan(s, times);
  let steps = 0;
  let improvement = true;

  while (improvement && steps < maxSteps) {
    improvement = false;
    for (let i = 0; i < n - 1; i++) {
      for (let j = i + 1; j < n; j++) {
        // Swap
        const temp = s[i];
        s[i] = s[j];
        s[j] = temp;

        const newQuality = calculateMakespan(s, times);
        if (newQuality < currentQuality) {
          currentQuality = newQuality;
          improvement = true;
          break;
        } else {
          // Revert swap
          s[j] = s[i];
          s[i] = temp;
        }
      }
      if (improvement) break;
    }
    steps++;
  }

  return s;
}

/**
 * Helper to generate random permutation using Fisher-Yates shuffle.
 */
export function shuffleArray(array: number[]): number[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

/**
 * Generates a neighbor permutation by swapping two distinct random positions.
 * Matches C++ generar_vecino.
 */
export function generateNeighbor(order: number[]): number[] {
  const neighbor = [...order];
  const n = neighbor.length;
  if (n < 2) return neighbor;

  const i = Math.floor(Math.random() * n);
  let j = Math.floor(Math.random() * n);
  while (i === j) {
    j = Math.floor(Math.random() * n);
  }

  const temp = neighbor[i];
  neighbor[i] = neighbor[j];
  neighbor[j] = temp;
  return neighbor;
}
