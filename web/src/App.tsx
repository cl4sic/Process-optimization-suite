import { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { MetricsSummary } from './components/MetricsSummary';
import { DatasetSelector } from './components/DatasetSelector';
import { AlgorithmControls } from './components/AlgorithmControls';
import { ConvergenceChart } from './components/ConvergenceChart';
import { GanttChart } from './components/GanttChart';
import { BenchmarkTable } from './components/BenchmarkTable';
import { useOptimizationWorker } from './hooks/useOptimizationWorker';
import { parseInstance } from './core/parser';
import {
  AlgorithmConfig,
  AlgorithmType,
  OptimizationResult,
  ProblemInstance,
} from './core/types';

export default function App() {
  const [instance, setInstance] = useState<ProblemInstance>({
    id: 'initial',
    name: 'Mini Test (5 trabajos × 2 máq)',
    numJobs: 5,
    numMachines: 2,
    times: [
      [5, 3],
      [2, 7],
      [9, 1],
      [0, 6],
      [8, 4],
    ],
  });

  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>('sa');
  const [config, setConfig] = useState<AlgorithmConfig>({
    iterations: 2000,
    L: 100,
    alpha: 0.95,
    temp0Ratio: 0.4,
    tempFinal: 0.01,
    populationSize: 80,
    maxGenerations: 100,
    crossoverProb: 0.85,
    mutationProb: 0.20,
    stallLimit: 25,
    polishSteps: 20,
  });

  const [benchmarkResults, setBenchmarkResults] = useState<OptimizationResult[]>([]);
  const [isBenchmarkRunning, setIsBenchmarkRunning] = useState<boolean>(false);

  const {
    isRunning,
    progress,
    result,
    convergenceData,
    startOptimization,
    cancelOptimization,
  } = useOptimizationWorker();

  // Active display result (can be single run or selected from benchmark table)
  const [activeResult, setActiveResult] = useState<OptimizationResult | null>(null);

  // Sync active result with single run completion
  useEffect(() => {
    if (result) {
      setActiveResult(result);
      // Trigger subtle celebration if improvement is significant
      if (result.improvementPct > 15) {
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.85 },
            colors: ['#6366f1', '#10b981', '#f59e0b'],
          });
        } catch {
          // ignore in environments without canvas
        }
      }
    }
  }, [result]);

  // Load default dataset on mount
  useEffect(() => {
    fetch('./datasets/datos_5_2.txt')
      .then((res) => (res.ok ? res.text() : null))
      .then((text) => {
        if (text) {
          try {
            const parsed = parseInstance(text, 'Mini Test (5 trabajos × 2 máq)');
            setInstance(parsed);
          } catch {
            // fallback stays in place
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleRunSingle = useCallback(() => {
    startOptimization(instance, selectedAlgorithm, config).catch((err) => {
      console.error('Optimization error:', err);
    });
  }, [instance, selectedAlgorithm, config, startOptimization]);

  const handleRunBenchmark = useCallback(async () => {
    setIsBenchmarkRunning(true);
    setBenchmarkResults([]);

    const algos: AlgorithmType[] = ['random', 'local_first', 'local_best', 'sa', 'ga'];
    const collected: OptimizationResult[] = [];

    for (const algo of algos) {
      try {
        const res = await startOptimization(instance, algo, config);
        collected.push(res);
        setBenchmarkResults([...collected]);
      } catch (err) {
        console.error(`Error during benchmark ${algo}:`, err);
      }
    }

    setIsBenchmarkRunning(false);

    // Set the overall winner as active result
    if (collected.length > 0) {
      const winner = collected.reduce((prev, curr) =>
        curr.bestMakespan < prev.bestMakespan ? curr : prev
      );
      setActiveResult(winner);
    }
  }, [instance, config, startOptimization]);

  const handleSelectInstance = (newInstance: ProblemInstance) => {
    setInstance(newInstance);
    setActiveResult(null);
    setBenchmarkResults([]);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <Header isRunning={isRunning || isBenchmarkRunning} workerReady={true} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top metrics summary cards */}
        <MetricsSummary
          result={activeResult}
          progress={progress}
          isRunning={isRunning}
          numJobs={instance.numJobs}
          numMachines={instance.numMachines}
        />

        {/* Configuration Row: Dataset & Metaheuristic */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DatasetSelector
            currentInstance={instance}
            onSelectInstance={handleSelectInstance}
            disabled={isRunning || isBenchmarkRunning}
          />
          <AlgorithmControls
            selectedAlgorithm={selectedAlgorithm}
            onSelectAlgorithm={setSelectedAlgorithm}
            config={config}
            onChangeConfig={setConfig}
            onRun={handleRunSingle}
            onCancel={cancelOptimization}
            onRunBenchmark={handleRunBenchmark}
            isRunning={isRunning}
            isBenchmarkRunning={isBenchmarkRunning}
          />
        </div>

        {/* Real-time Convergence Chart */}
        <ConvergenceChart
          data={
            isRunning
              ? convergenceData
              : activeResult?.convergenceHistory || convergenceData
          }
          algorithmName={activeResult?.algorithmName}
          initialMakespan={activeResult?.initialMakespan}
          bestMakespan={progress?.bestMakespan || activeResult?.bestMakespan}
          isRunning={isRunning}
        />

        {/* Multi-algorithm Tournament Benchmark Table */}
        {benchmarkResults.length > 0 && (
          <BenchmarkTable
            results={benchmarkResults}
            onSelectResult={(r) => setActiveResult(r)}
            selectedAlgorithm={activeResult?.algorithm}
          />
        )}

        {/* Interactive Gantt Chart */}
        <GanttChart
          evaluation={activeResult?.evaluation || null}
          numJobs={instance.numJobs}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-6 text-center text-xs text-zinc-500">
        <p>
          Process Optimization Suite &bull; Permutation Flow Shop Scheduling (PFSP) &bull; React + Web Workers
        </p>
      </footer>
    </div>
  );
}
