import { ProblemInstance } from './types';

/**
 * Parses a Flow Shop instance file text in the standard Taillard / OR-Library format:
 * Line 1: <num_jobs> <num_machines>
 * Next N lines: <machine_0> <time_0> <machine_1> <time_1> ...
 */
export function parseInstance(content: string, name: string = 'Custom Instance'): ProblemInstance {
  const lines = content
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0 && !l.startsWith('#'));

  if (lines.length === 0) {
    throw new Error('Empty instance file.');
  }

  const headerParts = lines[0].split(/\s+/).map(Number);
  if (headerParts.length < 2 || isNaN(headerParts[0]) || isNaN(headerParts[1])) {
    throw new Error('Invalid instance header: expected "<num_jobs> <num_machines>"');
  }

  const numJobs = headerParts[0];
  const numMachines = headerParts[1];

  if (numJobs <= 0 || numMachines <= 0) {
    throw new Error('Number of jobs and machines must be positive integers.');
  }

  const times: number[][] = Array.from({ length: numJobs }, () =>
    new Array<number>(numMachines).fill(0)
  );

  let currentJob = 0;
  for (let i = 1; i < lines.length && currentJob < numJobs; i++) {
    const tokens = lines[i].split(/\s+/).map(Number);
    if (tokens.length < numMachines * 2) {
      // In some formats, times are simply space separated without machine index
      if (tokens.length >= numMachines) {
        for (let m = 0; m < numMachines; m++) {
          times[currentJob][m] = tokens[m];
        }
        currentJob++;
        continue;
      }
      continue;
    }

    for (let k = 0; k < tokens.length; k += 2) {
      const machineId = tokens[k];
      const duration = tokens[k + 1];
      if (machineId >= 0 && machineId < numMachines) {
        times[currentJob][machineId] = duration;
      }
    }
    currentJob++;
  }

  if (currentJob < numJobs) {
    throw new Error(`Incomplete instance: expected ${numJobs} jobs, but only found ${currentJob}.`);
  }

  return {
    id: `instance-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name,
    numJobs,
    numMachines,
    times,
  };
}

/**
 * Serializes a ProblemInstance back to standard .txt format.
 */
export function serializeInstance(instance: ProblemInstance): string {
  let output = `${instance.numJobs} ${instance.numMachines}\n`;
  for (let i = 0; i < instance.numJobs; i++) {
    const pairs: string[] = [];
    for (let m = 0; m < instance.numMachines; m++) {
      pairs.push(`${m} ${instance.times[i][m]}`);
    }
    output += pairs.join(' ') + '\n';
  }
  return output;
}
