export interface ProblemInstance {
  id: string;
  name: string;
  numJobs: number;
  numMachines: number;
  /** times[jobId][machineId] = duration */
  times: number[][];
}

export interface ScheduleBlock {
  jobId: number;
  machineId: number;
  startTime: number;
  endTime: number;
  duration: number;
  idleBefore: number;
  color: string;
}

export interface MachineSchedule {
  machineId: number;
  blocks: ScheduleBlock[];
  totalTime: number;
  idleTime: number;
  busyTime: number;
  utilizationRate: number; // 0 to 1
}

export interface EvaluationResult {
  makespan: number;
  endMatrix: number[][];
  schedules: MachineSchedule[];
}

export type AlgorithmType =
  | 'random'
  | 'local_best'
  | 'local_first'
  | 'sa'
  | 'ga';

export interface AlgorithmConfig {
  // Random Search
  iterations?: number;

  // Simulated Annealing
  L?: number;
  alpha?: number;
  temp0Ratio?: number;
  tempFinal?: number;

  // Genetic Algorithm
  populationSize?: number;
  crossoverProb?: number;
  mutationProb?: number;
  maxGenerations?: number;
  stallLimit?: number;
  stopCriterion?: 'generations' | 'stall';

  // Solution polishing
  polishSteps?: number;
}

export interface ProgressUpdate {
  iteration: number;
  maxIterations?: number;
  currentMakespan: number;
  bestMakespan: number;
  bestOrder: number[];
  temperature?: number;
  generation?: number;
}

export interface ConvergencePoint {
  iteration: number;
  makespan: number;
}

export interface OptimizationResult {
  algorithm: AlgorithmType;
  algorithmName: string;
  bestOrder: number[];
  bestMakespan: number;
  initialMakespan: number;
  improvementPct: number;
  executionTimeMs: number;
  iterationsCount: number;
  convergenceHistory: ConvergencePoint[];
  evaluation: EvaluationResult;
}

export interface WorkerStartPayload {
  type: 'START';
  instance: ProblemInstance;
  algorithm: AlgorithmType;
  config: AlgorithmConfig;
}

export interface WorkerProgressPayload {
  type: 'PROGRESS';
  progress: ProgressUpdate;
}

export interface WorkerCompletePayload {
  type: 'COMPLETE';
  result: OptimizationResult;
}

export interface WorkerErrorPayload {
  type: 'ERROR';
  error: string;
}

export type WorkerInMessage = WorkerStartPayload;
export type WorkerOutMessage =
  | WorkerProgressPayload
  | WorkerCompletePayload
  | WorkerErrorPayload;
