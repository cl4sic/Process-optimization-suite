---
name: web-worker-runner
description: >-
  Use this skill when developing, debugging, or profiling the Web Worker
  optimization pipeline, message protocol, and real-time streaming in the web app.
---

# Web Worker Optimization Runner Skill

Use this skill when implementing or modifying the Web Worker that runs optimization algorithms in the background without freezing the React UI.

---

## 1. Web Worker Message Protocol

The communication between the React main thread and the Web Worker follows this typed protocol:

### Main Thread -> Worker (`WorkerRequest`)
```typescript
export interface RunOptimizationPayload {
  type: 'START_OPTIMIZATION';
  instance: ProblemInstance;
  algorithm: 'random' | 'local_best' | 'local_first' | 'sa' | 'ga';
  config: {
    iterations?: number;
    L?: number;
    alpha?: number;
    populationSize?: number;
    generations?: number;
    stallLimit?: number;
  };
}
```

### Worker -> Main Thread (`WorkerResponse`)
```typescript
// Emitted periodically to update convergence chart
export interface ProgressMessage {
  type: 'PROGRESS';
  currentIteration: number;
  maxIterations: number;
  currentMakespan: number;
  bestMakespan: number;
  bestOrder: number[];
}

// Emitted when optimization completes
export interface CompletedMessage {
  type: 'COMPLETED';
  bestOrder: number[];
  bestMakespan: number;
  executionTimeMs: number;
  schedule: MachineSchedule[];
}
```

---

## 2. Streaming Performance Guidelines

1. **Avoid Message Flooding:**
   - Do NOT send a `postMessage` on every single inner loop iteration (e.g., $O(n^2)$ neighbor evaluation).
   - Only emit `PROGRESS` after every temperature step in SA, or after each generation in GA, or every $K$ iterations (e.g., $K = 50$).
   - Throttle updates to at most once every ~25ms.
2. **Termination & Cleanup:**
   - The React hook `useOptimizationWorker` must terminate previous workers (`worker.terminate()`) if the user starts a new run or navigates away.
3. **Pure Functions:**
   - Keep the algorithms inside `src/core/algorithms/` completely pure and decoupled from DOM/window APIs so they can run seamlessly inside Node test runners and Web Workers.
