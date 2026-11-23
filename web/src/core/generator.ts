import { ProblemInstance } from './types';

/**
 * Generates a synthetic Permutation Flow Shop instance with random processing times.
 * Equivalent to generador_datos.cpp.
 */
export function generateRandomInstance(
  numJobs: number,
  numMachines: number,
  minTime: number = 1,
  maxTime: number = 99,
  name?: string
): ProblemInstance {
  const times: number[][] = [];

  for (let i = 0; i < numJobs; i++) {
    const jobTimes: number[] = [];
    for (let m = 0; m < numMachines; m++) {
      const duration = Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;
      jobTimes.push(duration);
    }
    times.push(jobTimes);
  }

  return {
    id: `synthetic-${numJobs}x${numMachines}-${Date.now()}`,
    name: name || `Synthetic ${numJobs} Jobs × ${numMachines} Machines`,
    numJobs,
    numMachines,
    times,
  };
}
