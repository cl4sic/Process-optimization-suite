import { runOptimization } from './algorithms';
import {
  ProgressUpdate,
  WorkerInMessage,
  WorkerOutMessage,
} from './types';

// Handle incoming messages from the React UI thread
self.addEventListener('message', (event: MessageEvent<WorkerInMessage>) => {
  const data = event.data;

  if (data.type === 'START') {
    const { instance, algorithm, config } = data;

    let lastReportTime = 0;
    const REPORT_THROTTLE_MS = 35; // ~30fps progress throttle to keep UI ultra responsive

    try {
      const result = runOptimization(instance, algorithm, config, (progress: ProgressUpdate) => {
        const now = performance.now();
        if (now - lastReportTime >= REPORT_THROTTLE_MS || progress.iteration === 0) {
          lastReportTime = now;
          const progressMsg: WorkerOutMessage = {
            type: 'PROGRESS',
            progress,
          };
          self.postMessage(progressMsg);
        }
      });

      const completeMsg: WorkerOutMessage = {
        type: 'COMPLETE',
        result,
      };
      self.postMessage(completeMsg);
    } catch (err: unknown) {
      const errorMsg: WorkerOutMessage = {
        type: 'ERROR',
        error: err instanceof Error ? err.message : String(err),
      };
      self.postMessage(errorMsg);
    }
  }
});
