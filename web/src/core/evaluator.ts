import { EvaluationResult, MachineSchedule, ScheduleBlock } from './types';

/**
 * Generates a consistent, visually pleasing HSL color for a given job.
 * Golden angle approximation ensures maximum distinction between adjacent job IDs.
 */
export function getJobColor(jobId: number): string {
  const hue = Math.round((jobId * 137.508) % 360);
  return `hsl(${hue}, 70%, 50%)`;
}

/**
 * Computes the Makespan (C_max) of a given job order permutation on the problem times.
 * Matches exact logic of C++ calcular_makespan.
 */
export function calculateMakespan(order: number[], times: number[][]): number {
  const numJobs = order.length;
  if (numJobs === 0) return 0;
  const numMachines = times[0].length;
  if (numMachines === 0) return 0;

  // Optimized 1D buffer representing completion times on machines for the current job
  const machineEnd = new Array<number>(numMachines).fill(0);

  // First job
  const firstJob = order[0];
  machineEnd[0] = times[firstJob][0];
  for (let m = 1; m < numMachines; m++) {
    machineEnd[m] = machineEnd[m - 1] + times[firstJob][m];
  }

  // Subsequent jobs
  for (let i = 1; i < numJobs; i++) {
    const job = order[i];
    machineEnd[0] += times[job][0];
    for (let m = 1; m < numMachines; m++) {
      const prev = machineEnd[m - 1] > machineEnd[m] ? machineEnd[m - 1] : machineEnd[m];
      machineEnd[m] = prev + times[job][m];
    }
  }

  return machineEnd[numMachines - 1];
}

/**
 * Evaluates the full schedule matrix and produces detailed MachineSchedule blocks
 * for rendering the interactive Gantt chart.
 */
export function evaluateSchedule(order: number[], times: number[][]): EvaluationResult {
  const numJobs = order.length;
  const numMachines = times[0]?.length || 0;

  if (numJobs === 0 || numMachines === 0) {
    return {
      makespan: 0,
      endMatrix: [],
      schedules: [],
    };
  }

  // endMatrix[i][m] = completion time of order[i] on machine m
  const endMatrix: number[][] = Array.from({ length: numJobs }, () =>
    new Array<number>(numMachines).fill(0)
  );

  // startMatrix[i][m] = start time of order[i] on machine m
  const startMatrix: number[][] = Array.from({ length: numJobs }, () =>
    new Array<number>(numMachines).fill(0)
  );

  // Compute timing
  for (let i = 0; i < numJobs; i++) {
    const job = order[i];
    for (let m = 0; m < numMachines; m++) {
      const fromPrevJob = i > 0 ? endMatrix[i - 1][m] : 0;
      const fromPrevMachine = m > 0 ? endMatrix[i][m - 1] : 0;
      const start = Math.max(fromPrevJob, fromPrevMachine);
      startMatrix[i][m] = start;
      endMatrix[i][m] = start + times[job][m];
    }
  }

  const makespan = endMatrix[numJobs - 1][numMachines - 1];

  // Build per-machine schedule blocks
  const schedules: MachineSchedule[] = [];
  for (let m = 0; m < numMachines; m++) {
    const blocks: ScheduleBlock[] = [];
    let prevEnd = 0;
    let busyTime = 0;

    for (let i = 0; i < numJobs; i++) {
      const jobId = order[i];
      const startTime = startMatrix[i][m];
      const endTime = endMatrix[i][m];
      const duration = times[jobId][m];
      const idleBefore = Math.max(0, startTime - prevEnd);

      blocks.push({
        jobId,
        machineId: m,
        startTime,
        endTime,
        duration,
        idleBefore,
        color: getJobColor(jobId),
      });

      busyTime += duration;
      prevEnd = endTime;
    }

    const totalTime = makespan;
    const idleTime = Math.max(0, totalTime - busyTime);
    const utilizationRate = totalTime > 0 ? Math.min(1, busyTime / totalTime) : 0;

    schedules.push({
      machineId: m,
      blocks,
      totalTime,
      idleTime,
      busyTime,
      utilizationRate,
    });
  }

  return {
    makespan,
    endMatrix,
    schedules,
  };
}
