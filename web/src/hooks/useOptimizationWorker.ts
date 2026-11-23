import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlgorithmConfig,
  AlgorithmType,
  ConvergencePoint,
  OptimizationResult,
  ProblemInstance,
  ProgressUpdate,
  WorkerInMessage,
  WorkerOutMessage,
} from '../core/types';

export function useOptimizationWorker() {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [progress, setProgress] = useState<ProgressUpdate | null>(null);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [convergenceData, setConvergenceData] = useState<ConvergencePoint[]>([]);

  const workerRef = useRef<Worker | null>(null);

  // Terminate worker on unmount
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  const cancelOptimization = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const startOptimization = useCallback(
    (instance: ProblemInstance, algorithm: AlgorithmType, config: AlgorithmConfig = {}): Promise<OptimizationResult> => {
      // Cancel any ongoing job
      if (workerRef.current) {
        workerRef.current.terminate();
      }

      setIsRunning(true);
      setError(null);
      setProgress(null);
      setResult(null);
      setConvergenceData([]);

      return new Promise<OptimizationResult>((resolve, reject) => {
        // Instantiate modern Vite Web Worker
        const worker = new Worker(new URL('../core/worker.ts', import.meta.url), {
          type: 'module',
        });
        workerRef.current = worker;

        worker.onmessage = (e: MessageEvent<WorkerOutMessage>) => {
          const msg = e.data;

          if (msg.type === 'PROGRESS') {
            setProgress(msg.progress);
            setConvergenceData(prev => [
              ...prev,
              { iteration: msg.progress.iteration, makespan: msg.progress.bestMakespan },
            ]);
          } else if (msg.type === 'COMPLETE') {
            setResult(msg.result);
            setConvergenceData(msg.result.convergenceHistory);
            setIsRunning(false);
            worker.terminate();
            workerRef.current = null;
            resolve(msg.result);
          } else if (msg.type === 'ERROR') {
            setError(msg.error);
            setIsRunning(false);
            worker.terminate();
            workerRef.current = null;
            reject(new Error(msg.error));
          }
        };

        worker.onerror = (err) => {
          const errString = err.message || 'Worker thread execution error';
          setError(errString);
          setIsRunning(false);
          worker.terminate();
          workerRef.current = null;
          reject(new Error(errString));
        };

        const payload: WorkerInMessage = {
          type: 'START',
          instance,
          algorithm,
          config,
        };

        worker.postMessage(payload);
      });
    },
    []
  );

  return {
    isRunning,
    progress,
    result,
    error,
    convergenceData,
    startOptimization,
    cancelOptimization,
  };
}
